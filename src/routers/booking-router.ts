import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { createBooking, updateBooking } from "@/controllers/booking-controller";

const bookingRouter = Router();

bookingRouter
    .all('/*', authenticateToken)
    .post('/', createBooking)
    .put('/:bookingId', updateBooking);

export { bookingRouter };