import roomRepository from "@/repositories/room-repository";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { cannotGetRoomError, notFoundError } from "@/errors";
import { exclude } from "@/utils/prisma-utils";

async function getBooking(userId: number) {
    const booking = await bookingRepository.findBookingByUserId(userId);
    if (!booking)
        throw notFoundError();
    
    return exclude(booking, 'createdAt', 'updatedAt', 'userId', 'roomId');
}

async function createBooking(roomId: number, userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw notFoundError();
    }

    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw cannotGetRoomError();
    }

    const room = await roomRepository.findRoomById(roomId);
    if (!room)
        throw notFoundError();

    if (room.Booking.length >= room.capacity)
        throw cannotGetRoomError();

    const booking = await bookingRepository.createBooking(roomId, userId);

    return exclude(booking, 'createdAt', 'updatedAt', 'userId', 'roomId');
};

async function updateBooking(roomId: number, bookingId: number) {
    const oldBooking = await bookingRepository.findBookingById(bookingId);
    if (!oldBooking || !bookingId)
        throw cannotGetRoomError();

    const newRoom = await roomRepository.findRoomById(roomId);
    if (!newRoom)
        throw notFoundError();

    if (newRoom.Booking.length >= newRoom.capacity)
        throw cannotGetRoomError();

    const newBooking = await bookingRepository.updateBooking(roomId, bookingId);

    return exclude(newBooking, 'createdAt', 'updatedAt', 'userId', 'roomId');
}

const bookingService = {
    createBooking,
    updateBooking,
    getBooking
};

export default bookingService;