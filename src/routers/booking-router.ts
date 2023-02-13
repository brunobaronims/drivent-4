import { Router } from "express";
import { 
    authenticateToken,
     validateBody,
     validateParams
     } from "@/middlewares";
import {
    createBooking,
    getBooking,
    updateBooking
} from "@/controllers/booking-controller";
import { postBookingSchema, updateBookingParamSchema } from "@/schemas/bookings-schemas";

const bookingRouter = Router();

bookingRouter
    .all('/*', authenticateToken)
    .get('/', getBooking)
    .post('/', validateBody(postBookingSchema), createBooking)
    .put('/:bookingId', validateBody(postBookingSchema), validateParams(updateBookingParamSchema), updateBooking);

export { bookingRouter };