import roomRepository from "@/repositories/room-repository";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { cannotGetRoomError, notFoundError } from "@/errors";

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

    return booking.id;
}

const bookingService = {
    createBooking
};

export default bookingService;