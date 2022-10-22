import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { user } from "./user/middleware";
import errors from "./errors";
export const router = Router();


const prisma = new PrismaClient();

/** 
 * @swagger
 * /bicycle:
 *      get: 
 *          description: returns the queried bicycles.
 *          parameters: 
 *              - $ref: '#/components/parameters/take'
 *              - $ref: '#/components/parameters/skip'
 *              - $ref: '#/components/parameters/x-access-token'
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
 *                                  bicycles:
 *                                      type: array
 *                                      items: 
 *                                        $ref: '#/components/schemas/Bicycle'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.get("/", user({ staffOnly: true }), async (req, res) => {
    const { take, skip, } = req.query;
    const bicycles = await prisma.bicycle.findMany({
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
            id: "asc",
        },
        include: {
            model: true,
            bookings: {
                where: {
                    end: null
                },
                include: {
                    user: true
                }
            },
            history: true
        }
    });
    for (const row of bicycles) {
        const bike = row as any;
        if (bike.bookings.length == 1) {
            bike.status = "ARRENDADA";
        }
        bike.booking = bike.bookings;
        delete bike.bookings;
    }
    res.json({ bicycles, status: "success" });
});


/** 
 * @swagger
 * /bicycle/{id}:
 *      get: 
 *          description: returns the queried bicycle.
 *          parameters: 
 *              - $ref: '#/components/parameters/bicycleId'
 *              - $ref: '#/components/parameters/x-access-token'
 *          responses:
 *              '200':
 *                 $ref: '#/components/responses/Bicycle'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.get("/:id", user({ staffOnly: true }), async (req, res) => {
    const { id } = req.params;
    try {
        const query = await prisma.bicycle.findUnique({
            where: { id: Number(id) },
            include: {
                model: true
            }
        });
        res.json(query || errors.BICYCLE_NOT_FOUND);
    } catch (e) {
        res.json(errors.BICYCLE_NOT_FOUND);
    }
});


/**
 * @swagger
 * /bicycle: 
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
 *                        $ref: '#/components/schemas/BicycleInput'
 *          responses: 
 *              '201': 
 *                  $ref: '#/components/responses/Bicycle'
 *              '400': 
 *                  $ref: '#/components/responses/BadRequest'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.post("/", user({ staffOnly: true }), async (req, res) => {
    const { qrCode, status, modelId } = req.body;
    if (!qrCode && !status && !modelId) {
        return res.status(400);
    }
    try {

        const bicycle = await prisma.bicycle.create({
            data: {
                qrCode, status, modelId
            }
        });
        res.status(201).json({ "status": "success", bicycle });
    } catch (e) {
        res.status(400).json(errors.BAD_REQUEST);
    }
});



/**
 * @swagger
 * /bicycle: 
 *      patch: 
 *          consumes: 
 *              - application/json
 *          questBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema: 
 *                        $ref: '#/components/schemas/BicycleInput'
 *          responses: 
 *              '200': 
 *                  $ref: '#/components/responses/Bicycle'
 *              '400': 
 *                  $ref: '#/components/responses/BadRequest'
 *              '404': 
 *                  $ref: '#/components/responses/NotFound'
 */
router.patch("/", user({ staffOnly: true }), async (req, res) => {
    const { id, qrCode, status, modelId } = req.body;
    if (!(id && qrCode && status && modelId)) {
        return res.status(400);
    }
    try {
        const bicycle = await prisma.bicycle.update({
            where: { id },
            data: {
                qrCode, status, modelId
            }
        });
        res.json({ status: "success", bicycle });
    } catch (e) {
        res.status(404).json(errors.BICYCLE_NOT_FOUND);
    }
});


/**
 * @swagger
 * /bicycle/{id}: 
 *      delete: 
 *          parameters: 
 *              - $ref: '#/components/parameters/bicycleId'
 *          responses: 
 *              '200': 
 *                  $ref: '#/components/responses/Bicycle'
 *              '404': 
 *                  $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", user({ staffOnly: true }), async (req, res) => {
    const { id, } = req.params;
    try {
        const bicycle = await prisma.bicycle.delete({
            where: { id: Number(id) },
        });
        res.json({ "status": "success", bicycle });
    } catch (e) {
        res.status(404).json(errors.BICYCLE_NOT_FOUND);
    }
});

export default router; 