import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function createBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { roomId } = req.body;

    try {
        const id = await bookingService.createBooking(Number(roomId), userId);

        return res.status(httpStatus.OK).send(roomId);
    } catch (e) {
        if (e.name === 'NotFoundError')
            return res.sendStatus(httpStatus.NOT_FOUND);
        if (e.name === 'CannotGetRoomError')
            return res.sendStatus(httpStatus.FORBIDDEN);
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
};