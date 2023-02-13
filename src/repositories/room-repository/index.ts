import { prisma } from "@/config";

async function findRoomById(roomId: number) {
    return prisma.room.findFirst({
        where: {
            id: roomId
        },
        include: {
            Booking: true
        }
    });
}

const roomRepository = {
    findRoomById
};

export default roomRepository;