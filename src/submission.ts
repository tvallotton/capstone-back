import { PrismaClient, User } from "@prisma/client";
import { Router } from "express";
import { user, Request } from "./user/middleware";
import errors from "./errors";
import { json } from "stream/consumers";
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
    const query = await prisma.submission.findMany({
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
    });
    res.json(query);
});


/** 
 * @swagger
 * /submission:
 *      post: 
 *          description: creates a new submission
 *          responses:
 *              '200':
 *                  $ref: '#/components/responses/Submission'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 */
router.post("/", user(), async (req: Request, res) => {
    const userId = req.user?.id as number;
    const name = req.body.model as string;
    let model = await prisma.bicycleModel.findUnique({ where: { name } });
    try {
        let created = await prisma.submission.create({
            data: {
                userId,
                bicycleModelId: model?.id as number,
            }
        });
        res.json(created);
    }
    catch (_e) {
        res.json(errors.BAD_REQUEST);
    }
});

export default router; 