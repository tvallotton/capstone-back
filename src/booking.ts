
import { BicycleModel, Booking, PrismaClient, User } from "@prisma/client";
import { Router } from "express";
import { user } from "./user/middleware";
import assert from "assert";
import errors from "./errors";
import { json } from "stream/consumers";

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
 *          responses:
 *              '200':
 *                  $ref: '#/components/responses/Bicycle'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.get("/", user({ staffOnly: true }), async (req, res) => {
    const { take, skip } = req.query;
    const model = await prisma.booking.findMany({
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
    });
    res.json(model);
});



/** 
 * @swagger
 * /booking/{id}:
 *      get: 
 *          description: Public endpoing. Returns the queried booking. 
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
            where: { id: Number(id) }
        });
        res.json(booking);
    } catch (_) {
        res.status(404).json(errors.NOT_FOUND);
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
 *                        $ref: '#/components/schemas/Booking'
 *          responses: 
 *              '200': 
 *                  $ref: '#/components/responses/Booking'
 *              '400': 
 *                  $ref: '#/components/responses/BadRequest'
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
        res.json(booking);
    } catch (e) {
        console.log(e);
    }
});

router.post("/terminate", async (req, res) => {
    const { qrCode } = req.body;
    try {
        const booking = await prisma.booking.updateMany({
            where: {
                bicycle: {
                    qrCode
                },
                end: null
            },
            data: {
                end: new Date()
            }
        });
        res.json({ "status": "success", booking });
    } catch (e) {
        res.status(400).json(errors.NOT_FOUND);
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
 *              - $ref: '#/components/parameters/x-access-token'
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema: 
 *                        $ref: '#/components/schemas/Booking'
 *          responses: 
 *              '200': 
 *                  $ref: '#/components/responses/Booking'
 *              '400': 
 *                  $ref: '#/components/responses/BadRequest'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.delete("/hard", user({ adminsOnly: true }), async (req, res) => {

});


export default router; 