import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import errors from "./errors";
import { user, Request } from "./user/middleware";

const prisma = new PrismaClient();
const router = Router();

/**
 * @swagger
 * /exit-form: 
 *      get: 
 *          parameters: 
 *              - $ref: '#/components/parameters/x-access-token'
 *              - in: query
 *                name: id
 *                schema: 
 *                     type: integer
 *              - in: query
 *                name: userId
 *                schema: 
 *                     type: integer
 *              - in: query
 *                name: bookingId
 *                schema: 
 *                     type: integer
 *          responses: 
 *              '200': 
 *                  $ref: '#/components/responses/ExitForm'
 */
router.get("/", user({ staffOnly: true }), async (req, res) => {
    const { id, userId, bookingId } = req.query;
    const exitForm = await prisma.exitForm.findFirst({
        where: {
            id: Number(id) || undefined,
            booking: {
                id: Number(bookingId) || undefined,
                userId: Number(userId) || undefined,
            }
        }
    });
    if (!(id || userId || bookingId)) {
        res.status(500).json(errors.MISSING_ID);
    } else if (exitForm) {
        res.json({ status: "success", exitForm });
    } else {
        res.status(404).json(errors.NOT_FOUND);
    }
});



const requiredFields = [
    "bicycleReview",
    "bicycleModelReview",
    "accessoryReview",
    "suggestions",
    "parkingSpot",
];

/**
 * @swagger
 * /exit-form/:
 *      put: 
 *          parameters: 
 *              - $ref: "#/components/parameters/x-access-token"
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema: 
 *                        $ref: "#/components/schemas/ExitFormInput"
 *          
 */
router.put("/", user(), async (req: Request, res) => {
    const userId = Number(req.user?.id);
    const data = req.body;

    for (const field of requiredFields) {
        if (data[field]) {
            return res.json({
                status: "success",
                en: `missing required field "${field}"`,
                es: `falta parametro obligatorio "${field}"`,
            });
        }
    }

    let exitForm = await prisma.exitForm.findFirst({
        where: { booking: { userId } }
    });
    if (exitForm) {
        await prisma.exitForm.updateMany({
            where: { bookingId: Number(data.bookingId) },
            data,
        });
        return res.json({ status: "success", exitForm: { ...exitForm, ...data } });
    }

    const booking = await prisma.booking.findFirst({
        where: { userId }
    });

    if (!booking) {
        return res.status(404).json(errors.BOOKING_NOT_FOUND);
    }

    exitForm = await prisma.exitForm.create({
        data: { ...data, bookingId: booking.id }
    });

    res.json({ status: "success", exitForm, });

});

export default router; 