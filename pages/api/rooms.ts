import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../libs/dbConnect";
import Room from "../../models/Room";

export default async function  handler(req:NextApiRequest, res:NextApiResponse) {
    const {method}=req;
    await dbConnect();
    switch(method){
        case "GET":
            try {
                //we find rooms with status of waiting. aggregate finds a single room randomly and returns it
                const rooms=await Room.aggregate([
                    {$match: {status:"waiting"}},
                    {$sample: {size: 1}},
                ])
                //once a room is found we change its status to chatting
                if(rooms.length>0){
                    const roomId=rooms[0]._id;
                    await Room.findByIdAndUpdate(roomId,{
                        status:"chatting",
                    });
                }
                res.status(200).json(rooms)
            } catch (error) {
                res.status(400).json((error as any).message)
            }
            break;
        case "POST":
            //for a new user or if all rooms are busy chatting then a new room is created
            const room=await Room.create({status:"waiting"});
            res.status(200).json(room);
            break;
        default:
            res.status(400).json({message: `no method for this endpoint`})

    }
}