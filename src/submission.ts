import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { user, Request, missingData } from "./user/middleware";
import errors from "./errors";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
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
 *                  description: A successful response
 *                  content: 
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties: 
 *                                  status: 
 *                                      type: string
 *                                  submission:
 *                                      type: array
 *                                      items: 
 *                                        $ref: '#/components/schemas/Submission'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.get("/", user({ staffOnly: true }), async (req, res) => {
    const { take, skip, } = req.query;
    const submissions = await prisma.submission.findMany({
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        include: {
            user: true,
            model: true,
        }
    });
    res.json({ submissions, status: "success" });
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
    try {
        const submission = await prisma.submission.findUnique({
            where: {
                userId: req.user?.id
            },
            include: {
                user: true,
                model: true,
            }
        });

        if (submission) {
            res.json({ status: "success", submission });
        } else {
            res.status(404).json(errors.NOT_FOUND);
        }
    } catch (e) {
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
 *                        $ref: '#/components/schemas/SubmissionInput'
 *          responses:
 *              '201':
 *                  $ref: '#/components/responses/Submission'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                description: 'The user have already borrowed a bicycle'
 */
router.post("/", user(), async (req: Request, res) => {
    const userId = req.user?.id as number;
    const { bicycleModelId } = req.body;
    try {
        // check the user hasn't already booked a bicycle
        const booking = await prisma.booking.findFirst({
            where: {
                userId, end: { equals: null }
            }
        });
        if (booking) {
            res.status(403);
            res.json(errors.USER_ALREADY_BORROWS);
            return;
        }

        if (req.user && missingData(req.user)) {
            res.status(400);
            res.json(errors.INCOMPLETE_USER_INFO);
            return;
        }

        const submission = await prisma.submission.create({
            data: {
                userId,
                bicycleModelId,
            }
        });
        res.status(201).json({ status: "success", submission });
    }
    catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
            if (e.code == "P2002") {
                res.status(400).json(errors.USER_ALREADY_SUBMITTED);
                return;
            }
        }
        res.status(500).json(errors.UNKOWN_ERROR);
    }
});


/**
 * @swagger
 * /submission/upgrade:
 *      post: 
 *          description: 
 *          parameters: 
 *              - $ref: '#/components/parameters/x-access-token'
 *          consumes:
 *              - application/json
 *          requestBody:
 *              required: true
 *              content: 
 *                  application/json: 
 *                      schema: 
 *                          $ref: '#/components/schemas/UpgradeInput'
 *          responses:
 *              '201':
 *                  $ref: '#/components/responses/Booking'
 *              '401':
 *                  $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                  description: 'The bivyvle is already leat'
 *              '404':
 *                  description: 'The bicycle, the user or the submission is not found'
 * 
 */
router.post("/upgrade", user({ staffOnly: true }), async (req: Request, res) => {
    const { qrCode, userId, lights, ulock, reflector, duration } = req.body;
    try {
        const bicycle = await prisma.bicycle.findFirst({
            where: { qrCode }, include: {
                bookings: { where: { end: null } }
            }
        });
        if (!bicycle) {
            res.status(404);
            res.json(errors.BICYCLE_NOT_FOUND);
            return;
        }
        // check the bicycle is not already borrowed
        if (bicycle.bookings.length != 0) {
            res.status(403);
            res.json(errors.BICYCLE_ALREADY_LENT);
            return;
        }

        const submission = await prisma.submission.deleteMany({ where: { userId } });
        if (submission.count == 0) {
            res.status(404);
            res.json(errors.SUBMISSION_NOT_FOUND);
            return;
        }

        const booking = await prisma.booking.create({
            data: {
                ulock,
                lights,
                reflector,
                duration,
                userId: userId,
                bicycleId: bicycle?.id,
            }
        });
        res.json({ status: "success", booking });
        return;
    }
    catch (e) {

        res.status(500);
        res.json(errors.UNKOWN_ERROR);
        return;
    }
});

/**
 * @swagger
 * /submission: 
 *      patch: 
 *          parameters: 
 *              - $ref: '#/components/parameters/x-access-token'
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema: 
 *                        $ref: '#/components/schemas/SubmissionInput'
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
 *              - $ref: '#/components/parameters/x-access-token'
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
    const id = Number(req.params.id);
    try {
        if (req.user?.isAdmin) {
            const submission = await prisma.submission.deleteMany({
                where: { id },
            });
            return res.json({ status: "success", submission });
        }
        const submission = await prisma.submission.deleteMany({
            where: { id, userId: req.user?.id }
        });
        res.json({ status: "success", submission });

    } catch (e) {
        res.status(404).json(errors.NOT_FOUND);
    }
});
export default router; 