import supertest from 'supertest';
import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';

import app, { init } from 'app';
import { cleanDb, generateValidToken } from '../helpers';
import {
    createEnrollmentWithAddress,
    createHotel,
    createPayment,
    createRoomWithHotelId,
    createTicket,
    createTicketTypeRemote,
    createTicketTypeWithHotel,
    createUser,
    createBooking
} from '../factories';
import { TicketStatus } from '@prisma/client';

beforeAll(async () => {
    await init();
    await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
    it("should respond with status 401 if no token is given", async () => {
        const body = { roomId: 1 };
        const response = await server.post("/booking").send(body);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();
        const body = { roomId: 1 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
        const body = { roomId: 1 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 if user does not own booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with status 200 and booking data', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const room = await createRoomWithHotelId(createdHotel.id);

            await createBooking(room.id, user.id);

            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual({
                id: expect.any(Number),
                Room: {
                    ...room,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                }
            })
        });
    });
});

describe('POST /booking', () => {
    it("should respond with status 401 if no token is given", async () => {
        const body = { roomId: 1 };
        const response = await server.post("/booking").send(body);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();
        const body = { roomId: 1 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
        const body = { roomId: 1 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it('should respond with status 403 when ticket is not paid', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const body = { roomId: 1 };

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it("should respond with status 403 when user ticket is remote ", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const body = { roomId: 1 };

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it("should respond with status 404 when user has no enrollment ", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const body = { roomId: 1 };

            const ticketType = await createTicketTypeWithHotel();

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it('should respond with 404 if invalid roomId', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const room = await createRoomWithHotelId(createdHotel.id);
            const body = { roomId: 0 };

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it('should respond with 403 if room is at capacity', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const room = await createRoomWithHotelId(createdHotel.id);
            const body = { roomId: room.id };
            await createBooking(room.id, user.id);
            await createBooking(room.id, user.id);
            await createBooking(room.id, user.id);


            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it('should respond with 200 and bookingId', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const room = await createRoomWithHotelId(createdHotel.id);


            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

            const { body } = await server.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.OK);
            expect(body).toEqual({
                id: response.body.id,
                Room: {
                    ...room,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                }
            });
        });
    });
});

describe('PUT /booking/:bookingId', () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.post("/booking/1").send({ roomId: 1 });

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.post("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 403 if user does not own booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const createdHotel = await createHotel();
            const room = await createRoomWithHotelId(createdHotel.id);

            const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
            expect(response.status).toBe(httpStatus.FORBIDDEN);
        });


        it('should respond with 404 if invalid roomId', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const oldRoom = await createRoomWithHotelId(createdHotel.id);

            const { id } = await createBooking(oldRoom.id, user.id);

            const response = await server.put(`/booking/${id}`).set('Authorization', `Bearer ${token}`).send({ roomId: 0 });
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with status 403 if room is fully booked', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const oldRoom = await createRoomWithHotelId(createdHotel.id);
            const newRoom = await createRoomWithHotelId(createdHotel.id);

            const { id } = await createBooking(oldRoom.id, user.id);

            await createBooking(newRoom.id, user.id);
            await createBooking(newRoom.id, user.id);
            await createBooking(newRoom.id, user.id);

            const response = await server.put(`/booking/${id}`).set('Authorization', `Bearer ${token}`).send({ roomId: newRoom.id });
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it('should respond with status 200 and booking id', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const oldRoom = await createRoomWithHotelId(createdHotel.id);
            const newRoom = await createRoomWithHotelId(createdHotel.id);

            const { id } = await createBooking(oldRoom.id, user.id);

            const response = await server.put(`/booking/${id}`).set('Authorization', `Bearer ${token}`).send({ roomId: newRoom.id });

            const { body } = await server.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.OK);
            expect(body).toEqual({
                id: response.body.id,
                Room: {
                    ...newRoom,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                }
            });
        });
    });
});