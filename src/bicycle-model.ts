
import { BicycleModel, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { user } from "./user/middleware";
import errors from "./errors";

const router = Router();
const prisma = new PrismaClient();


/** 
 * @swagger
 * /bicycle-model:
 *      get: 
 *          description: Public endpoint. Returns the queried bicycle models. 
 *          parameters: 
 *              - $ref: '#/components/parameters/take'
 *              - $ref: '#/components/parameters/skip'
 *          responses:
 *              '200':
 *                   description: Returns the bicycle models as an array.
 *                   content:
 *                     application/json:
 *                       schema:
 *                          type: object
 *                          properties: 
 *                              status: 
 *                                  type: string
 *                              models:
 *                                  type: array
 *                                  items: 
 *                                    $ref: "#/components/schemas/BicycleModel"
 */
router.get("/", async (req, res) => {
    const { take, skip } = req.query;
    const models = await prisma.bicycleModel.findMany({
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
    });
    res.json({ models, status: "success" });
});

/** 
 * @swagger
 * /bicycle-model/available:
 *      get: 
 *          description: Public endpoint. Returns the bicicle models which are available to book.
 *          responses:
 *              '200':
 *                   description: Returns the bicycle models as an array.
 *                   content:
 *                     application/json:
 *                       schema:
 *                          type: object
 *                          properties: 
 *                              status: 
 *                                  type: string
 *                              models:
 *                                  type: array
 *                                  items: 
 *                                    $ref: "#/components/schemas/BicycleModel"
 */
router.get("/available", async (req, res) => {
    const stockPerModel = await prisma.bicycle.groupBy({
        by: ["modelId"],
        _count: {
            id: true,
        }
    });
    const submissionsPerModel = await prisma.submission.groupBy({
        by: ["bicycleModelId"],
        _count: { id: true }
    });
    const bookingsPerModel = await prisma.bicycle.groupBy({
        by: ["modelId"],
        where: {
            bookings: {
                some: {
                    end: { equals: null }
                }
            }
        },
        _count: { id: true }
    });
    // We subtract the ones that were submitted. 
    for (const remove of submissionsPerModel) {
        for (const model of stockPerModel) {
            model._count.id -= remove._count.id;
        }
    }
    // And we subtract the ones that are already booked. 
    for (const remove of bookingsPerModel) {
        for (const model of stockPerModel) {
            model._count.id -= remove._count.id;
        }
    }
    const avaliable = stockPerModel
        .filter((model) => model._count.id > 0)
        .map((model) => model.modelId);

    const models = await prisma.bicycleModel.findMany({
        where: {
            id: {
                in: avaliable
            }
        }
    });

    res.json({ models, status: "success" });
});


/**
 * @swagger
 * /bicycle-model/{id}: 
 *      get: 
 *          description: Returns the queried bicycle model.
 *          parameters: 
 *              - in: path
 *                name: id
 *                schema: 
 *                  type: number
 *                required: true
 *          responses:
 *              '200': 
 *                  $ref: '#/components/responses/BicycleModel'
 *              '404':
 *                  $ref: '#/components/responses/NotFound'
 *              '400': 
 *                  $ref: '#/components/responses/BadRequest'
 */
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const model = await prisma.bicycleModel.findUnique({
            where: { id: Number(id) }
        });
        if (model) {
            res.json({ status: "success", model });
        }
        else {
            res.status(404).json(errors.NOT_FOUND);
        }
    } catch (e) {
        res.status(400).json(errors.BAD_REQUEST);
    }
});

/**
 * @swagger
 * /bicycle-model/: 
 *      post:
 *          parameters: 
 *              - $ref: '#/components/parameters/x-access-token'
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json: 
 *                    schema: 
 *                        $ref: '#/components/schemas/BicycleModelInput'
 *          responses: 
 *              '201': 
 *                  $ref: '#/components/responses/BicycleModel'
 *              '400': 
 *                  $ref: '#/components/responses/BadRequest'
 *              '401': 
 *                 $ref: '#/components/responses/Unauthorized'
 *              '403':
 *                 $ref: '#/components/responses/Forbidden'
 */
router.post("/", user({ adminsOnly: true }), async (req, res) => {
    const { name, image, description } = req.body;
    try {
        const model = await prisma.bicycleModel.create({
            data: { name, image, description }
        });
        res.status(201).json({
            status: "success", model
        });
    } catch (e) {
        res.status(400).json(errors.BAD_REQUEST);
    }
});


/**
 * @swagger
 * /bicycle-model: 
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
 *                        $ref: '#/components/schemas/BicycleModel'
 *          responses: 
 *              '200': 
 *                  $ref: '#/components/responses/BicycleModel'
 *              '400': 
 *                  $ref: '#/components/responses/BadRequest'
 */
router.patch("/", user({ adminsOnly: true }), async (req, res) => {
    const inputModel: BicycleModel = req.body;
    const id = Number(inputModel.id);
    try {
        const model = await prisma.bicycleModel.update({
            where: {
                id,
            },
            data: inputModel
        });
        res.json({ status: "success", model });

    } catch (e) {
        res.status(400).json(errors.BAD_REQUEST);
    }
});

/**
 * @swagger
 * /bicycle-model/{id}: 
 *      delete: 
 *          parameters: 
 *              - $ref: '#/components/parameters/bicycleModelId'
 *              - $ref: '#/components/parameters/x-access-token'
 *          responses: 
 *              '200': 
 *                  $ref: '#/components/responses/BicycleModel'
 *              '404': 
 *                  $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", user({ adminsOnly: true }), async (req, res) => {
    const { id } = req.params;
    try {
        const model = await prisma.bicycleModel.delete({
            where: {
                id: Number(id) || undefined
            }
        });
        res.json({ status: "success", model });
    } catch (e) {
        res.status(404).json(errors.NOT_FOUND);
    }

});


export default router; 