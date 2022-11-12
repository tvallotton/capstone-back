import { Booking, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { user, Request } from "./user/middleware";
import errors from "./errors";

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
router.get("/", user({ staffOnly: true }), async (req, res) => {
    const { take, skip, activeOnly } = req.query;
    const bookings = await prisma.booking.findMany({
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        where: {
            end: activeOnly === "true" ? null : undefined
        },
        include: {
            user: true,
            bicycle: true,
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
                user: true,
                bicycle: true,
            }
        });
        res.json({ status: "success", bookings });
    } catch (_) {
        res.status(404).json(errors.NOT_FOUND);
    }
});

/** 
 * @swagger
 * /booking/{id}:
 *      get: 
 *          description: Public t. Returns the queried booking. 
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
                user: true,
                bicycle: true,
            }
        });
        res.json({ status: "success", booking });
    } catch (_) {
        res.status(404).json(errors.NOT_FOUND);
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
router.post("/", user({ staffOnly: true }), async (req, res) => {
    const data: Booking = req.body;
    try {
        const booking = await prisma.booking.create({
            data,
        });
        res.status(201).json({ status: "success", booking });
    } catch (e) {
        console.log(e);
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
router.patch("/", user({ staffOnly: true }), async (req, res) => {
    const { id } = req.body;
    const data: Booking = req.body;
    try {
        const booking = await prisma.booking.update({
            where: { id },
            data,
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
 *          description: This enpoint can be used with either a qrCode or a booking id.
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
    const { qrCode, id } = req.body;
    try {
        if (qrCode) {
            const { count } = await prisma.booking.updateMany({
                where: {
                    bicycle: {
                        qrCode
                    },
                    end: null
                },
                data: {
                    end: new Date()
                },

            });
            if (count) {
                res.json({ "status": "success" });
            } else {
                res.status(404).json(errors.NOT_FOUND);
            }
        } else if (id) {
            const booking = await prisma.booking.update({
                where: { id },
                data: {
                    end: new Date()
                }
            });
            res.json({ "status": "success", booking });
        }
    } catch (e) {
        res.status(404).json(errors.NOT_FOUND);
    }
});

/**
 * @swagger
 * /booking: 
 *      delete:
 *          description: > 
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
router.delete("/:id", user({ staffOnly: true }), async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await prisma.booking.delete({
            where: {
                id: Number(id) || undefined
            }
        });
        res.json({ status: "success", booking });
    } catch (e) {
        res.status(404).json(errors.NOT_FOUND);
    }
});

export default router; 