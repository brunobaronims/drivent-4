import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    
    try {
        const booking = await bookingService.getBooking(userId);

        return res.status(httpStatus.OK).send(booking);
    } catch (e) {
        if (e.name === 'NotFoundError')
            return res.sendStatus(httpStatus.NOT_FOUND);
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
};

export async function createBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { roomId } = req.body;

    try {
        const bookingId = await bookingService.createBooking(Number(roomId), userId);

        return res.status(httpStatus.OK).send(bookingId);
    } catch (e) {
        if (e.name === 'NotFoundError')
            return res.sendStatus(httpStatus.NOT_FOUND);
        if (e.name === 'CannotGetRoomError')
            return res.sendStatus(httpStatus.FORBIDDEN);
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
};

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
    const { roomId } = req.body;
    const { bookingId: oldBookingId } = req.params;

    try {
        const bookingId = await bookingService.updateBooking(Number(roomId), Number(oldBookingId));

        return res.status(httpStatus.OK).send(bookingId);
    } catch (e) {
        if (e.name === 'NotFoundError')
            return res.sendStatus(httpStatus.NOT_FOUND);
        if (e.name === 'CannotGetRoomError')
            return res.sendStatus(httpStatus.FORBIDDEN);
        return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    }
};