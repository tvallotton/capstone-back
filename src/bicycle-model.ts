
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
    const unbooked = await prisma.bicycle.groupBy({
        by: ["modelId"],
        _count: {
            modelId: true,
        },
        where: {
            bookings: {
                every: {
                    end: {
                        not: null
                    }
                }

            }
        }
    });
    const submitted = await prisma.submission.groupBy({
        by: ["bicycleModelId"],
        _count: {
            bicycleModelId: true,
        }
    });

    unbooked.map(model => );

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
    console.log("id: ", id);
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
        console.log(e);
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
router.post("/", user({ staffOnly: true }), async (req, res) => {
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
router.patch("/", user({ staffOnly: true }), async (req, res) => {
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
router.delete("/:id", user({ staffOnly: true }), async (req, res) => {
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