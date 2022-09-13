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
 *          responses:
 *              '200':
 *                  description: A successful response
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
 *                - in: header
 *                  name: "x-access-token"
 *                  description: Authentication access token.
 *                  required: false
 *                  schema:
 *                      type: string
 *          responses:
 *              '200':
 *                  description: the authenticated user or null
 */
router.get("/me", user({ optional: true }), async (req: Request, res: any) => {
    let user = req.user as any;
    delete user?.password;
    res.json(req.user || null);
});

/**
 * @swagger
 * /user/{id}:
 *      get: 
 *        description: Returns the queried user by their id
 *        parameters: 
 *          - in: path
 *            name: id
 *            schema:
 *            type: integer
 *            required: true
 *            description: Numeric id of the user to fetch
 *        responses: 
 *            '200': 
 *               description: The queried user. 
 *            '404': 
 *               description: The user was not found.
 */
router.get("/:id", async (req, res) => {
    let { id } = req.params;
    let user = await prisma.user.findFirst({
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
 *                      type: object
 *                      properties: 
 *                          email:
 *                              type: string
 *                          password: 
 *                              type: string
 *                      required: 
 *                          - email
 *                          - password                
 *      responses: 
 *          '201': 
 *              description: A new user is created. 
 *          '500': 
 *              description: Internal server error. Likely the user is already signed up. 
 */
router.post("/", async (req, res) => {
    try {
        let user: User = req.body;
        user.password = await argon2.hash(user.password);
        let created = await prisma.user.create({
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
 *                      type: object
 *                      properties: 
 *                          email:
 *                              type: string
 *                          password: 
 *                              type: string
 *                      required: 
 *                          - email
 *                          - password                
 *      responses: 
 *          '200': 
 *              description: Responds with the `"x-access-token"`.
 *          '401': 
 *              description: Invalid credentials.
 */
router.post("/login", async (req, res) => {
    let { email, password } = req.body;
    if (typeof (email) != "string" || typeof (password) != "string") {
        res.status(400)
            .json(BAD_REQUEST);
        return;
    }
    let user = await prisma.user.findFirst({ where: { email } });
    if (user === null) {
        res.status(401);
        return res.json(UNREGISTERED_USER);
    }
    let isCorrect = await argon2.verify(user.password, password);
    if (!isCorrect) {
        return res.status(401)
            .json(INCORRECT_PASSWORD);
    }
    let token = jwt.sign({ email }, JWT_SECRET);
    res.setHeader("x-access-token", token);
    res.send({ "x-access-token": token, ...SUCCESS });
});


/**
 * @swagger
 * /user/:
 *     patch: 
 *      description: Updates user information.
 *      parameters: 
 *        - in: header
 *          name: "x-access-token"
 *          description: Authentication access token.
 *          required: true
 *          schema:
 *            type: string
 *      consumes: 
 *          - application/json
 *      requestBody:
 *          required: true
 *          content: 
 *              application/json: 
 *                  schema: 
 *                      type: object
 *                      properties: 
 *                          id: 
 *                              type: integer
 *                          email:
 *                              type: string
 *                          password: 
 *                              type: string
 *                      required: 
 *                          - id
 *                          - email
 *                          - password                
 *      responses: 
 *          '200': 
 *              description: responds with the new user fields.
 */

router.patch("/", user(), async (req: Request, res) => {
    // if you are staff or you are editting your own profile

    if (req.user?.isStaff || req.user?.id == req.body.id) {
        let updated = await prisma.user.update({
            where: {
                id: req.body.id,
            },
            data: req.body
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
 *        - in: header
 *          name: "x-access-token"
 *          description: Authentication access token.
 *          required: true
 *          schema:
 *            type: string
 *        - in: path
 *          name: id
 *          description: User id.
 *          required: true
 *          schema: 
 *              type: integer  
 *      responses: 
 *          '200': 
 *              description: {"status": "success"}
 */
router.delete("/:id", user({ staffOnly: true }), async (req: Request, res) => {
    let { id } = req.params;
    await prisma.user.delete({
        where: {
            id: Number(id),
        }
    });
    res.json(SUCCESS);
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
