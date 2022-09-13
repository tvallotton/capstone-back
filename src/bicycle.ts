
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
 *              application/json
 *          parameters: 
 *              - in: body
 *                name: qrCode
 *                required: true
 *                schema: 
 *                  type: string
 *              - in: body
 *                name: status
 *                required: true
 *                schema: 
 *                  type: sting
 *              - in: body
 *                name: model
 *                required: true
 *                schema: 
 *                  type: sting
 */
router.post("/", user({ staffOnly: true }), async (req, res) => {
    let { qrCode, status, model } = req.body;

});





export default router; 