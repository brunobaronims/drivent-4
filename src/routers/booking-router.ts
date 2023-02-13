import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import {
    createBooking,
    getBooking,
    updateBooking
} from "@/controllers/booking-controller";

const bookingRouter = Router();

bookingRouter
    .all('/*', authenticateToken)
    .get('/', getBooking)
    .post('/', createBooking)
    .put('/:bookingId', updateBooking);

export { bookingRouter };