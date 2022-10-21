import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { user } from "./user/middleware";
import errors from "./errors";

const router = Router();
const prisma = new PrismaClient();


/** 
 * @swagger
 * /user/history/{id}:
 *      get: 
 *          description: Returns the history of the queried user. 
 *          parameters: 
 *              - $ref: "#/components/parameters/take"
 *              - $ref: "#/components/parameters/skip"
 *              - $ref: "#/components/parameters/userId"
 *              - $ref: "#/components/parameters/x-access-token"
 *          responses:
 *              "200":
 *                  description: Returns the history of the queried user as an array.
 *                  content:
 *                      application/json: 
 *                          schema: 
 *                              type: object
 *                              properties: 
 *                                  status: 
 *                                      type: string
 *                                  history: 
 *                                      type: array
 *                                      items: 
 *                                          $ref: "#/components/schemas/UserHistory"
 *              "401": 
 *                  $ref: "#/components/responses/Unauthorized"
 *              "403":
 *                   $ref: "#/components/responses/Forbidden"
 *              "404":
 *                   $ref: "#/components/responses/NotFound"
 */
router.get("/:userId", user({ staffOnly: true }), async (req, res) => {
    const { take, skip } = req.query;
    const { userId } = req.params;
    const history = await prisma.userHistory.findMany({
        include: {
            user: true
        },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        where: { userId: Number(userId) }

    });
    res.json({ history, status: "success" });
});

/**
 * @swagger
 * /user/history: 
 *      post:
 *          parameters: 
 *              - $ref: "#/components/parameters/x-access-token"
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema: 
 *                        $ref: "#/components/schemas/UserHistoryInput"
 *          responses: 
 *              "201": 
 *                  $ref: "#/components/responses/UserHistory"
 *              "400": 
 *                  $ref: "#/components/responses/BadRequest"
 *              "401": 
 *                 $ref: "#/components/responses/Unauthorized"
 *              "403":
 *                 $ref: "#/components/responses/Forbidden"
 */
router.post("/", user({ staffOnly: true }), async (req, res) => {
    const { userId, description } = req.body;
    if (!userId && !description) {
        return res.status(400);
    }
    try {
        const userHistory = await prisma.userHistory.create({
            data: { userId, description }
        });
        res.status(201).json({ "status": "success", userHistory });
    } catch (e) {
        res.status(400).json(errors.BAD_REQUEST);
    }
});




/**
 * @swagger
 * /user/history/{id}: 
 *      delete: 
 *          parameters: 
 *              - $ref: "#/components/parameters/userHistoryId"
 *              - $ref: "#/components/parameters/x-access-token"
 *          responses: 
 *              "200": 
 *                  $ref: "#/components/responses/UserHistory"
 *              "404": 
 *                  $ref: "#/components/responses/NotFound"
 */
router.delete("/:id", user({ staffOnly: true }), async (req, res) => {
    const { id } = req.params;
    try {
        const history = await prisma.userHistory.delete({
            where: {
                id: Number(id) || undefined
            },
            include: {
                user: true
            }
        });
        res.json({ status: "success", history });
    } catch (e) {
        res.status(404).json(errors.NOT_FOUND);
    }
});

export default router; 