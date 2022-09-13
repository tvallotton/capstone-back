
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
 *                  description: returned when the user is properly authorized.
 *                  content:
 *                       application/json
 *              '401': 
 *                  description: returned when a user who is not staff attempts to access the enpoint
 *                  content:
 *                       application/json
 *                  
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






export default router; 