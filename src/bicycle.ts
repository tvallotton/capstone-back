
import { PrismaClient, User } from "@prisma/client";
import { Router } from "express";
import { user } from "./user/middleware";
export const router = Router();


const prisma = new PrismaClient();

/** 
 * @swagger
 * /bicycle:
 *      get: 
 *          description: returns the queried bicycle models.
 *          parameters: 
 *              - $ref: '#/components/parameters/take'
 *              - $ref: '#/components/parameters/skip'
 *              - $ref: '#/components/parameters/x-access-token'
 *          responses:
 *              '200':
 *                  description: the user is staff
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.get("/", user({ staffOnly: true }), async (req, res) => {
    const { take, skip, } = req.query;
    const query = await prisma.bicycle.findMany({
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
    });
    res.json(query);
});


/**
 * @swagger
 * /bicycle: 
 *      post: 
 *          consumes: 
 *              - application/json
 *          questBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema: 
 *                        type: object
 *                        properties: 
 *                            qrCode:
 *                                type: string
 *                            status: 
 *                                type: string
 *                            model: 
 *                                type: string
 *                            image: 
 *                                type: string
 *                        required: 
 *                            - qrCode
 *                            - status  
 *                            - model 
 *          responses: 
 *              '201': 
 *                  description: creates the bicycle
 */
router.post("/", user({ staffOnly: true }), async (req, res) => {
    let { qrCode, status, model } = req.body;
    if (!qrCode && !status && !model) {
        return res.status(400);
    }
    let created = await prisma.bicycle.create({
        data: {
            qrCode, status, model
        }
    });
    res.status(201).json(created);
});





export default router; 