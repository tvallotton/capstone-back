import { PrismaClient } from "@prisma/client";

import { Router } from "express";
import errors from "./errors";

const prisma = new PrismaClient();
const router = Router();

/**
 * @swagger
 * /exit-form: 
 *      get: 
 *          parameters: 
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
router.get("/", async (req, res) => {
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
    "bookingId",
];

/**
 * @swagger
 * /exit-form/:
 *      put: 
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
router.put("/", async (req, res) => {
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

    const exitForm = await prisma.exitForm.findFirst({
        where: { bookingId: data.bookingId }
    });
    if (!exitForm) {
        const exitForm = await prisma.exitForm.create({
            data,
        });
        res.json({ status: "success", exitForm, });
    } else {
        await prisma.exitForm.updateMany({
            where: { bookingId: Number(data.bookingId) },
            data,
        });
        res.json({ status: "success", exitForm: { ...exitForm, ...data } });
    }
});

export default router; 