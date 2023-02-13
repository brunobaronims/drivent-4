import { prisma } from '@/config';

async function createBooking(roomId: number, userId: number) {
    return prisma.booking.create({
        data: {
            roomId: roomId,
            userId: userId
        },
    });
};

async function updateBooking(roomId: number, bookingId: number) {
    return prisma.booking.update({
        where: {
            id: bookingId
        },
        data: {
            roomId: roomId
        }
    })
};

async function findBookingById(bookingId: number) {
    return prisma.booking.findFirst({
        where: {
            id: bookingId
        },
        include: {
            Room: true
        }
    })
};

async function findBookingByUserId(userId: number) {
    return prisma.booking.findFirst({
        where: {
            userId: userId
        },
        include: {
            Room: true
        }
    });
};

const bookingRepository = {
    createBooking,
    updateBooking,
    findBookingById,
    findBookingByUserId
};

export default bookingRepository;