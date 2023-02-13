import joi from 'joi';

type PostBookingParams = {
    roomId: number
};

export const postBookingSchema = joi.object<PostBookingParams>({
    roomId: joi.number().required().min(1)
});

type UpdateBookingRouteParam = {
    bookingId: number
};

export const updateBookingParamSchema = joi.object<UpdateBookingRouteParam>({
    bookingId: joi.number().required().min(1)
});