import { postBookingSchema, updateBookingParamSchema } from "../../src/schemas/bookings-schemas";
import faker from "@faker-js/faker";

describe('postBookingSchema', () => {
    it('should return error if roomId is not given', async () => {
        const input = {
            roomId: 1
        };
        delete input.roomId;

        const { error } = postBookingSchema.validate(input);
        expect(error).toBeDefined();
    });

    it('should return error if roomId is not a number', async () => {
        const input = {
            roomId: faker.name.findName()
        };

        const { error } = postBookingSchema.validate(input);
        expect(error).toBeDefined();
    });

    it('should return error if roomId is not a positive number', async () => {
        const input = {
            roomId: faker.datatype.number({ max: 0 })
        };

        const { error } = postBookingSchema.validate(input);
        expect(error).toBeDefined();
    });
});

describe('updateBookingParamSchema', () => {
    it('should return error if bookingId is not given', async () => {
        const input = {
            roomId: 1
        };
        delete input.roomId;

        const { error } = updateBookingParamSchema.validate(input);
        expect(error).toBeDefined();
    });

    it('should return error if bookingId is not a number', async () => {
        const input = {
            roomId: faker.name.findName()
        };

        const { error } = updateBookingParamSchema.validate(input);
        expect(error).toBeDefined();
    });

    it('should return error if bookingId is not a positive number', async () => {
        const input = {
            roomId: faker.datatype.number({max: 0})
        };

        const { error } = updateBookingParamSchema.validate(input);
        expect(error).toBeDefined();
    });
});