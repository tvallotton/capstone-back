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
 *          responses: 
 *              '200': 
 *                  content:
 *                     application/json:
 *                       $ref: '#/components/schemas/ExitForm'
 */
router.get("/", user({ adminsOnly: true }), async (req, res) => {
    const exitForms = await prisma.exitForm.findMany();
    res.json({ status: "success", exitForms });
});

/**
 * @swagger
 * /exit-form/mine: 
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
router.get("/mine", user(), async (req: Request, res) => {
    const userId = req.user?.id;
    const exitForm = await prisma.exitForm.findFirst({
        where: {
            booking: {
                userId: Number(userId),
            }
        }
    });
    if (exitForm) {
        res.json({ status: "success", exitForm });
    } else {
        res.status(404).json(errors.NOT_FOUND);
    }
});


const spanishFields = {
    bicycleReview: "¿Cómo evalúas la bicicleta que recibiste?",
    bicycleModelReview: "¿Cómo evalúas el modelo de bicicleta que recibiste?",
    accessoryReview: "¿Cómo evalúas los accesorios que recibiste? ",
    suggestions: "Sugerencias",
    parkingSpot: "¿En qué cicletero/s sueles estacionar?",
};
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
        if (data[field] === undefined) {
            return res.json({
                status: "error",
                en: `missing required field "${field}"`,
                es: `Por favor responda la sección "${spanishFields[field as "suggestions"]}"`,
            });
        }
    }

    let exitForm = await prisma.exitForm.findFirst({
        where: { booking: { userId } }
    });
    if (exitForm) {
        await prisma.exitForm.updateMany({
            where: { booking: { userId, end: null } },
            data,
        });
        return res.json({ status: "success", exitForm: { ...exitForm, ...data } });
    }

    const booking = await prisma.booking.findFirst({
        where: { userId, end: null }
    });

    if (!booking?.id) {
        return res.status(404).json(errors.BOOKING_NOT_FOUND);
    }
    exitForm = await prisma.exitForm.create({
        data: { ...data, bookingId: booking.id }
    });

    res.json({ status: "success", exitForm, });

});

export default router; 