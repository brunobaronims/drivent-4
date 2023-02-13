import { prisma } from "@/config";
import { Booking } from "@prisma/client";
import roomRepository from "@/repositories/room-repository";
import bookingRepository from "@/repositories/booking-repository";

const bookingsService = {
    createBooking: async (
        roomId: number,
        userId: number
    ) => {
        const room = await roomRepository.findRoomById(roomId);
        console.log(room);

        //return bookingRepository.createBooking(userId, roomId);
    }
};

export default bookingsService;