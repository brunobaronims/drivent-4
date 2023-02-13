import { prisma } from '@/config';

async function createBooking(roomId: number, userId: number) {
    return prisma.booking.create({
        data: {
            roomId: roomId,
            userId: userId
        },
    });
};

const bookingRepository = {
    createBooking
};

export default bookingRepository;