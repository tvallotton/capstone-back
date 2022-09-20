import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { user, Request } from "./user/middleware";
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
    const query = await prisma.submission.findMany({
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
    });
    res.json(query);
});


/** 
 * @swagger
 * /submission/mine:
 *      get: 
 *          description: returns the submitted form for the current user.
 *          parameters: 
 *              - $ref: '#/components/parameters/x-access-token'
 *          responses:
 *              '200':
 *                  $ref: '#/components/responses/Submission'
 *              '404': 
 *                 $ref: '#/components/responses/NotFound'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 */
router.get("/mine", user(), async (req: Request, res) => {
    const submission = await prisma.submission.findUnique({
        where: {
            userId: req.user?.id
        }
    });

    if (submission) {
        res.json({ status: "success", submission });
    } else {
        res.status(404).json(errors.NOT_FOUND);
    }
});

/** 
 * @swagger
 * /submission:
 *      post: 
 *          description: creates a new submission
 *          parameters: 
 *              - $ref: '#/components/parameters/x-access-token'
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema: 
 *                        $ref: '#/components/schemas/Submission'
 *          responses:
 *              '201':
 *                  $ref: '#/components/responses/Submission'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 */
router.post("/", user(), async (req: Request, res) => {
    const userId = req.user?.id as number;
    const { bicycleModelId } = req.body;
    try {
        const submission = await prisma.submission.create({
            data: {
                userId,
                bicycleModelId,
            }
        });
        res.status(201).json({ status: "success", submission });
    }
    catch (e) {
        console.log(e);
        res.status(400).json(errors.BAD_REQUEST);
    }
});


/**
 * @swagger
 * /submission: 
 *      patch: 
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema: 
 *                        $ref: '#/components/schemas/Submission'
 *          responses: 
 *              '200': 
 *                  $ref: '#/components/responses/Submission'
 *              '400': 
 *                  $ref: '#/components/responses/BadRequest'
 *              '404': 
 *                  $ref: '#/components/responses/NotFound'
 * 
 */
router.patch("/", user({ staffOnly: true }), async (req: Request, res) => {
    const { id, bicycleModelId } = req.body;
    try {
        const submission = await prisma.submission.update({
            where: { id },
            data: {
                bicycleModelId,
            },
            include: {
                model: true,
            }
        });
        res.json({ status: "success", submission });
    } catch (e) {
        res.status(404).json(errors.NOT_FOUND);
    }
});

/** 
 * @swagger
 * /submission/{id}:
 *      delete: 
 *          description: deletes a submission from and returns it. 
 *          parameters: 
 *              - in: path
 *                name: id
 *                schema: 
 *                  type: integer
 *                required: true
 *          responses:
 *              '200':
 *                  $ref: '#/components/responses/Submission'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.delete("/:id", user(), async (req: Request, res) => {
    const { id } = req.body;
    const userId = req.user?.isStaff ? undefined : req.user?.id;
    try {
        const submission = await prisma.submission.delete({
            where: { id, userId },
        });
        res.json({ status: "success", submission });
    } catch (e) {
        res.status(404).json(errors.NOT_FOUND);
    }
});
export default router; 