import { PrismaClient, User } from "@prisma/client";
import { Router } from "express";
import { user } from "./user/middleware";
import errors from "./errors";
export const router = Router();


const prisma = new PrismaClient();



/** 
 * @swagger
 * /submission:
 *      get: 
 *          description: returns the queried submission models.
 *          parameters: 
 *              - $ref: '#/components/parameters/take'
 *              - $ref: '#/components/parameters/skip'
 *              - $ref: '#/components/parameters/x-access-token'
 *          responses:
 *              '200':
 *                  $ref: '#/components/responses/Submission'
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
