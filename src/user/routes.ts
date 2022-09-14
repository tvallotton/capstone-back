import { PrismaClient, User } from "@prisma/client";
import { json, NextFunction, Router } from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { JWT_SECRET, user, Request } from "./middleware";

const prisma = new PrismaClient();
const router = Router();

/**
 * @swagger
 * /user:
 *      get: 
 *          description: returns the queried user models.
 *          parameters: 
 *            - $ref: '#/components/parameters/take'
 *            - $ref: '#/components/parameters/skip'
 *          responses:
 *              '200':
 *                  description: A successful response
 *                  content: 
 *                      application/json:
 *                          schema: 
 *                              type: array
 *                              items:  
 *                                $ref: '#/components/schemas/User'
 *                  
 */
router.get("/", async (req, res) => {
    let skip = Number(req.query.skip) || undefined;
    let take = Number(req.query.take) || undefined;

    let posts = await prisma.user.findMany({
        skip,
        take,
        select: PUBLIC_FIELDS,
        orderBy: {
            createdAt: "desc"
        }
    });
    res.json(posts);
});

/** 
 * @swagger
 * /user/me: 
 *      get:
 *          description: returns the current authenticated user if any.
 *          parameters: 
 *              - $ref: '#/components/parameters/x-access-token-optional' 
 *          responses:
 *              '200':
 *                  description: the authenticated user or null
 *                  content: 
 *                      application/json: 
 *                          schema: 
 *                              $ref: '#/components/schemas/User'
 * 
 */
router.get("/me", user({ optional: true }), async (req: Request, res: any) => {
    const user = req.user as any;
    delete user?.password;
    res.json(user || null);
});

/**
 * @swagger
 * /user/{id}:
 *      get: 
 *        description: Returns the queried user by their id
 *        parameters: 
 *          - $ref: '#/components/parameters/userId' 
 *        responses: 
 *          '200': 
 *              $ref: '#/components/responses/UserResponse'
 *          '404': 
 *              $ref: '#/components/responses/NotFound'
 */
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findFirst({
        where: { id: Number(id) }
    });
    if (user === null) {
        return res.status(404).json(NOT_FOUND);
    }
    delete (user as any).password;
    res.json(user);
});

/**
 * @swagger
 * /user:
 *     post: 
 *      description: Creates a new user.
 *      consumes: 
 *          - application/json
 *      requestBody:
 *          required: true
 *          content: 
 *              application/json: 
 *                  schema: 
 *                      $ref: '#/components/schemas/Credentials'            
 *      responses: 
 *          '201': 
 *              $ref: '#/components/responses/UserResponse'
 *          '500': 
 *              description: Internal server error. Likely the user is already signed up. 
 */
router.post("/", async (req, res) => {
    try {
        const user: User = req.body;
        user.password = await argon2.hash(user.password);
        const created = await prisma.user.create({
            data: user
        });
        delete (created as any).password;
        res.status(201).json(created);
    } catch (e) {
        console.log(e);
        res.status(500);
        res.json(UNKOWN_ERROR);
    }
});

/**
 * @swagger
 * /user/login:
 *     post: 
 *      description: Logs in to user account
 *      consumes: 
 *          - application/json
 *      requestBody:
 *          required: true
 *          content: 
 *              application/json: 
 *                  schema: 
 *                      $ref: '#/components/schemas/Credentials'               
 *      responses: 
 *          '200': 
 *              description: Responds with the `"x-access-token"`.
 *              content: 
 *                  application/json: 
 *                      schema:
 *                          $ref: '#/components/schemas/TokenResponse'
 *          '401': 
 *              description: Invalid credentials.
 *              content: 
 *                  application/json: 
 *                      schema:
 *                          $ref: '#/components/schemas/ErrorResponse'
 *          
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (typeof (email) != "string" || typeof (password) != "string") {
        res.status(400)
            .json(BAD_REQUEST);
        return;
    }
    const user = await prisma.user.findFirst({ where: { email } });
    if (user === null) {
        res.status(401);
        return res.json(UNREGISTERED_USER);
    }
    const isCorrect = await argon2.verify(user.password, password);
    if (!isCorrect) {
        return res.status(401)
            .json(INCORRECT_PASSWORD);
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.setHeader("x-access-token", token);
    res.send({ "x-access-token": token, ...SUCCESS });
});


/**
 * @swagger
 * /user/:
 *     patch: 
 *      description: Updates user information.
 *      parameters: 
 *          - $ref: '#/components/parameters/x-access-token' 
 *      consumes: 
 *          - application/json
 *      requestBody:
 *          required: true
 *          content: 
 *              application/json: 
 *                  schema: 
 *                      $ref: '#/components/schemas/UserInput'
 *      responses: 
 *          '200': 
 *              $ref: '#/components/responses/UserResponse'
 *          '404': 
 *              $ref: '#/components/responses/NotFound'
 *          '401': 
 *              $ref: '#/components/responses/Unauthorized'
 */

router.patch("/", user(), async (req: Request, res) => {
    // if you are staff or you are editting your own profile

    if (req.user?.isStaff || req.user?.id == req.body.id) {

        const password = req.body.password ? argon2.hash(req.body.password) : undefined;

        let updated = await prisma.user.update({
            where: {
                id: req.body.id,
            },
            data: { password, ...req.body }
        });
        delete (updated as any).password;
        res.json(updated);
    } else {
        res.status(403).json(UNAUTHORIZED);
    }
});


/**
 * @swagger
 * /user/{id}:
 *     delete: 
 *      description: Deletes the user. Only staff members can delete users. 
 *      parameters: 
 *        - $ref: '#/components/parameters/userId' 
 *        - $ref: '#/components/parameters/x-access-token' 
 *      responses: 
 *          '200': 
 *              $ref: '#/components/responses/UserResponse'
 *          '404': 
 *              $ref: '#/components/responses/NotFound'
 *          '401': 
 *              $ref: '#/components/responses/Unauthorized'
 *          '403': 
 *              $ref: '#/components/responses/Forbidden'
 */
router.delete("/:id", user({ staffOnly: true }), async (req: Request, res) => {
    let { id } = req.params;
    try {
        let user = await prisma.user.delete({
            where: {
                id: Number(id),
            }
        });
        delete (user as any).password;

        res.json(user);
    } catch (e) {
        res.json(404).json(NOT_FOUND);
    }
});

router.use((err: Error, req: any, res: any, next: any) => {
    res.status(500).json(UNAUTHORIZED);
});


const SUCCESS = {
    "status": "success",
};

const UNREGISTERED_USER = {
    "status": "error",
    "es": "El correo electrónico no está registrado.",
    "en": "The email is not registered."
};

const UNAUTHENTICATED = {
    "status": "error",
    "en": "You are not logged in.",
    "es": "No has ingresado sessión.",
};

const INCORRECT_PASSWORD = {
    "status": "error",
    "es": "La contraseña o usuario son incorrectos.",
    "en": "The user or password are incorrect.",
};
const UNKOWN_ERROR = {
    "status": "error",
    "es": "Ocurrió un error creando el usuario.",
    "en": "An error occurred creating the user"
};
const NOT_FOUND = {
    "status": "error",
    "es": "El usuario no fue encontrado.",
    "en": "The user was not found",
};
const UNAUTHORIZED = {
    "status": "error",
    "es": "No tienes permiso para acceder a este recurso",
    "en": "You are not allowed to access this resource",
};
const PUBLIC_FIELDS = {
    "id": true,
    "email": true,
    "isAdmin": true,
    "isStaff": true,
    "createdAt": true,
};
const BAD_REQUEST = {
    "en": "Bad request",
    "es": "Bad request",
    "status": "error"
};

export default router; 
