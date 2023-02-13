import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { createBooking } from "@/controllers/booking-controller";

const bookingRouter = Router();

bookingRouter
    .all('/*', authenticateToken)
    .post('/', createBooking);

export { bookingRouter };