
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
 *              - in: query
 *                name: take
 *                required: false
 *                schema: 
 *                  type: integer
 *                description: the number of elements to return. 
 *              - in: query
 *                name: skip
 *                required: false
 *                schema: 
 *                  type: integer
 *                description: the number of elements to skip before tarting to collect the result set.
 *              - in: header
 *                name: "x-access-token"
 *                description: Authentication access token.
 *                required: true
 *                schema:
 *                  type: string
 *          responses:
 *              '200':
 *                  description: the user is staff
 *              '401': 
 *                  description: the user is not logged in. 
 *              '403': 
 *                  description: the user doesn't have permission to access the resource. 
 *
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