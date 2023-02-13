import { Booking } from "@prisma/client";
import { prisma } from "@/config";

export async function createBooking(roomId: number, userId: number): Promise<Booking> {
    return prisma.booking.create({
        data: {
            roomId: roomId,
            userId: userId
        }
    });
};