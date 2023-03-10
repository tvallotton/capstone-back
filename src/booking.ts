import { Booking, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { user, Request, PUBLIC_FIELDS } from "./user/middleware";
import { distance, meanOfTransport } from "./kpi";
import errors from "./errors";
import moment from "moment-timezone";


const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /booking: 
 *      get: 
 *          description: Private endpoint. Returns the queried bookings. 
 *          parameters: 
 *              - $ref: '#/components/parameters/take'
 *              - $ref: '#/components/parameters/skip'
 *              - $ref: '#/components/parameters/x-access-token'
 *              - in: query
 *                name: activeOnly
 *                schema: 
 *                  type: boolean
 *                required: false
 *          responses:
 *              '200':
 *                  description: A successful response
 *                  content: 
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties: 
 *                                  status: 
 *                                      type: string
 *                                  booking:
 *                                      type: array
 *                                      items: 
 *                                        $ref: '#/components/schemas/Booking'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.get("/", user({ adminsOnly: true }), async (req, res) => {
    const { take, skip, activeOnly } = req.query;
    const bookings = await prisma.booking.findMany({
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        where: {
            end: activeOnly === "true" ? null : undefined
        },
        include: {
            user: { select: PUBLIC_FIELDS },
            bicycle: { include: { model: true, } },
        },
    });
    res.json({ bookings, status: "success" });
});

/**
 * @swagger
 * /booking/mine: 
 *      get: 
 *          description: Public endpoint. Returns the queried bookings that belong to a user
 *          parameters: 
 *              - $ref: '#/components/parameters/take'
 *              - $ref: '#/components/parameters/skip'
 *              - $ref: '#/components/parameters/x-access-token'
 *              - in: query
 *                name: activeOnly
 *                schema: 
 *                  type: boolean
 *                required: false
 *          responses:
 *              '200':
 *                  description: A successful response
 *                  content: 
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties: 
 *                                  status: 
 *                                      type: string
 *                                  booking:
 *                                      type: array
 *                                      items: 
 *                                        $ref: '#/components/schemas/Booking'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 */
router.get("/mine", user(), async (req: Request, res) => {
    const { take, skip, activeOnly } = req.query;

    try {
        const bookings = await prisma.booking.findMany({
            skip: Number(skip) || undefined,
            take: Number(take) || undefined,
            where: {
                userId: Number(req.user?.id),
                end: activeOnly === "true" ? null : undefined,
            },
            include: {
                user: { select: PUBLIC_FIELDS },
                bicycle: { include: { model: true, } },
            }
        });
        res.json({ status: "success", bookings });
    } catch (e) {
        res.status(404).json(errors.NOT_FOUND);
    }
});

/** 
 * @swagger
 * /booking/{id}:
 *      get: 
 *          description: Public endpoint. Returns the queried booking. 
 *          parameters: 
 *              - $ref: '#/components/parameters/bookingId'
 *          responses:
 *              '200':
 *                  $ref: '#/components/responses/Booking'
 *              '404': 
 *                  $ref: '#/components/responses/NotFound'
 */
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: Number(id) },
            include: {
                user: { select: PUBLIC_FIELDS },
                bicycle: { include: { model: true, } },
            }
        });
        res.json({ status: "success", booking });
    } catch (_) {
        res.status(404).json(errors.NOT_FOUND);
    }
});



/** 
 * @swagger
 * /booking/qr-code/{qrCode}:
 *      get: 
 *          description: Public endpoint. Returns the queried booking. 
 *          parameters: 
 *              - in: path
 *                name: qrCode
 *                schema: 
 *                  type: string             
 *          responses:
 *              '200':
 *                  $ref: '#/components/responses/Booking'
 *              '404': 
 *                  $ref: '#/components/responses/NotFound'
 */
router.get("/qr-code/:qrCode", async (req, res) => {
    const { qrCode } = req.params;
    try {
        const bookings = await prisma.booking.findMany({
            where: {
                bicycle: { qrCode },
                end: {
                    not: null
                }
            },
            include: {
                user: { select: PUBLIC_FIELDS },
                bicycle: { include: { model: true, } },
            }
        });
        const booking = bookings[0];
        if (booking) {
            res.json({ status: "success", booking });
        } else {
            res.status(404).json(errors.BICYCLE_NOT_FOUND);
        }
    } catch (_) {
        res.status(500).json(errors.UNKOWN_ERROR);
    }
});

/**
 * @swagger
 * /booking: 
 *      post:
 *          parameters: 
 *              - $ref: '#/components/parameters/x-access-token'
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema: 
 *                        $ref: '#/components/schemas/BookingInput'
 *          responses: 
 *              '201': 
 *                  $ref: '#/components/responses/Booking'
 *              '400': 
 *                  $ref: '#/components/responses/BadRequest'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.post("/", user({ adminsOnly: true }), async (req, res) => {
    const data: Booking = req.body;
    try {
        const booking = await prisma.booking.create({
            data,
            include: {
                user: { select: PUBLIC_FIELDS },
                bicycle: { include: { model: true, } },
            }
        });
        res.status(201).json({ status: "success", booking });
    } catch (e) {
        res.status(400).json(errors.BAD_REQUEST);
    }
});

/**
 * @swagger
 * /booking: 
 *      patch:
 *          parameters: 
 *              - $ref: '#/components/parameters/x-access-token'
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema: 
 *                        $ref: '#/components/schemas/BookingInput'
 *          responses: 
 *              '200': 
 *                  $ref: '#/components/responses/Booking'
 *              '404': 
 *                  $ref: '#/components/responses/NotFound'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.patch("/", user({ adminsOnly: true }), async (req, res) => {
    const { id } = req.body;
    const data: Booking = req.body;
    try {
        const booking = await prisma.booking.update({
            where: { id },
            data,
            include: {
                user: { select: PUBLIC_FIELDS },
                bicycle: { include: { model: true, } },
            }
        });
        res.json({ status: "success", booking });
    } catch (e) {
        res.status(404).json(errors.NOT_FOUND);
    }
});

/**
 * @swagger
 * /booking/terminate: 
 *      post:
 *          description: This enpoint can be used with either a qrCode or a bicycle id.
 *          parameters: 
 *              - $ref: '#/components/parameters/x-access-token'
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema:
 *                      type: object
 *                      properties: 
 *                        qrCode: 
 *                          type: string
 *                        id: 
 *                          type: integer
 *                          description: The id of the booking
 *                      required: 
 *          responses: 
 *              '200': 
 *                  $ref: '#/components/responses/Booking'
 *              '404': 
 *                  $ref: '#/components/responses/NotFound'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.post("/terminate", async (req, res) => {
    const { qrCode } = req.body;
    const booking = await prisma.booking.findFirst({
        where: { bicycle: { qrCode }, end: null },
        include: { exitForm: true, user: true }
    });
    if (booking == null) {
        const terminated = await prisma.booking.findFirst({ where: { bicycle: { qrCode } } });
        if (terminated) {
            return res.status(400).json(errors.BOOKING_ALREADY_TERMINATED);
        }
        return res.status(404).json(errors.NOT_FOUND);
    }
    if (!booking.exitForm) {
        return res.status(400).json(errors.MISSING_EXIT_FORM);
    }

    const elapsed = moment(booking.start).diff(moment());
    const mOT = meanOfTransport(booking.user.meansOfTransport);
    const d = distance(booking.user.city);
    const trips = booking.user.tripsPerWeek || 0;
    const carbonFootprint = d * mOT * trips * elapsed / 1000 / 60 ** 2 / 24 / 7;
    const { count } = await prisma.booking.updateMany({
        where: { id: booking.id },
        data: {
            end: new Date(),
            carbonFootprint,
        },
    });
    if (count) {
        return res.json({ "status": "success" });
    } else {
        return res.status(500).json(errors.UNKOWN_ERROR);
    }
});

/**
 * @swagger
 * /booking: 
 *      delete:
 *          description: 
 *              Private endpoint, admins only. 
 *              This should be used for bookings that never occured 
 *              and want to be removed from the record. 
 *              It should not be used to terminate a booking, use /terminate instead. 
 *          parameters: 
 *              - in: path
 *                name: id
 *                schema: 
 *                  type: integer
 *                required: true
 * 
 *          responses: 
 *              '200': 
 *                  $ref: '#/components/responses/Booking'
 *              '404': 
 *                  $ref: '#/components/responses/NotFound'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.delete("/:id", user({ adminsOnly: true }), async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.exitForm.deleteMany({
            where: { bookingId: Number(id), }
        });
        const booking = await prisma.booking.delete({
            where: {
                id: Number(id) || undefined
            }
        });
        res.json({ status: "success", booking });
    } catch (e) {
        console.log(e);
        res.status(404).json(errors.NOT_FOUND);
    }
});

export default router; 