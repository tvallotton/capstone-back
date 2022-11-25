import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { Request, user } from "./user/middleware";
import errors from "./errors";

const router = Router();
const prisma = new PrismaClient();

/** 
 * @swagger
 * /bicycle/history/{id}:
 *      get: 
 *          description: Returns the history of the queried bicycle. 
 *          parameters: 
 *              - $ref: "#/components/parameters/take"
 *              - $ref: "#/components/parameters/skip"
 *              - $ref: "#/components/parameters/bicycleId"
 *              - $ref: "#/components/parameters/x-access-token"
 *          responses:
 *              "200":
 *                  description: Returns the history of the queried bicycle as an array.
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
 *                                          $ref: "#/components/schemas/BicycleHistory"
 *              "401": 
 *                  $ref: "#/components/responses/Unauthorized"
 *              "403":
 *                   $ref: "#/components/responses/Forbidden"
 *              "404":
 *                   $ref: "#/components/responses/NotFound"
 */
router.get("/:bicycleId", user({ staffOnly: true }), async (req, res) => {
    const { take, skip } = req.query;
    const { bicycleId } = req.params;
    const history = await prisma.bicycleHistory.findMany({
        include: {
            bicycle: true,
            user: true,
        },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        where: { bicycleId: Number(bicycleId) }
    });
    res.json({ history, status: "success" });
});

/**
 * @swagger
 * /bicycle/history: 
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
 *                        $ref: "#/components/schemas/BicycleHistoryInput"
 *          responses: 
 *              "201": 
 *                  $ref: "#/components/responses/BicycleHistory"
 *              "400": 
 *                  $ref: "#/components/responses/BadRequest"
 *              "401": 
 *                 $ref: "#/components/responses/Unauthorized"
 *              "403":
 *                 $ref: "#/components/responses/Forbidden"
 */
router.post("/", user({ staffOnly: true }), async (req: Request, res) => {
    const { bicycleId, description } = req.body;
    const userId = Number(req.user?.id);
    if (!bicycleId && !description) {
        return res.status(400).json(errors.BAD_REQUEST);
    }
    try {
        const bicycleHistory = await prisma.bicycleHistory.create({
            data: { bicycleId, description, userId }
        });
        res.status(201).json({ "status": "success", bicycleHistory });
    } catch (e) {
        res.status(400).json(errors.BAD_REQUEST);
    }
});

/**
 * @swagger
 * /bicycle/history/{id}: 
 *      delete: 
 *          parameters: 
 *              - $ref: "#/components/parameters/bicycleHistoryId"
 *              - $ref: "#/components/parameters/x-access-token"
 *          responses: 
 *              "200": 
 *                  $ref: "#/components/responses/BicycleHistory"
 *              "404": 
 *                  $ref: "#/components/responses/NotFound"
 */
router.delete("/:id", user({ staffOnly: true }), async (req, res) => {
    const { id } = req.params;
    try {
        const history = await prisma.bicycleHistory.delete({
            where: {
                id: Number(id) || undefined
            },
            include: {
                bicycle: true,
            }
        });
        res.json({ status: "success", history });
    } catch (e) {
        res.status(404).json(errors.NOT_FOUND);
    }
});
export default router; 