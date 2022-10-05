import { PrismaClient, User } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { JWT_SECRET, user, Request } from "./middleware";
import errors from "../errors";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
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
 *            - $ref: '#/components/parameters/x-access-token-optional' 
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
router.get("/", user({ staffOnly: true }), async (req, res) => {
    const skip = Number(req.query.skip) || undefined;
    const take = Number(req.query.take) || undefined;

    const posts = await prisma.user.findMany({
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
 *                  $ref: '#/components/responses/User'
 * 
 */
router.get("/me", user(), async (req: Request, res: any) => {
    const user = req.user;
    delete (user as any)?.password;
    res.json({ status: "success", user });
});

/**
 * @swagger
 * /user/{id}:
 *      get: 
 *        description: Returns the queried user by their id
 *        parameters: 
 *          - $ref: '#/components/parameters/userId' 
 *          - $ref: '#/components/parameters/x-access-token' 
 *        responses: 
 *          '200': 
 *              $ref: '#/components/responses/User'
 *          '404': 
 *              $ref: '#/components/responses/NotFound'
 *          '401': 
 *              $ref: '#/components/responses/Unauthorized'
 *          '403': 
 *              $ref: '#/components/responses/Forbidden'
 */
router.get("/:id", user({ staffOnly: true }), async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findFirst({
        where: { id: Number(id) }
    });
    if (user === null) {
        return res.status(404).json(errors.USER_NOT_FOUND);
    }
    delete (user as any).password;
    res.json({ status: "success", user });
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
 *                      $ref: '#/components/schemas/UserInput'            
 *      responses: 
 *          '201': 
 *              $ref: '#/components/responses/User'
 *          '500': 
 *              description: Internal server error. Likely the user is already signed up. 
 */
router.post("/", async (req, res) => {
    try {
        const user: User = req.body;
        user.password = await argon2.hash(user.password);
        user.email = user.email.toLowerCase();
        if (!user.email.match(/^\S+@\S+\.\S+$/)) {
            res.status(400);
            res.json(errors.INVALID_EMAIL);
            return;
        }
        const created = await prisma.user.create({
            data: user
        });
        delete (created as any).password;
        res.status(201).json({ status: "success", user: created });
    } catch (e) {
        const err = e as PrismaClientKnownRequestError;
        if (err.code == "P2002") {
            res.status(400);
            res.json(errors.USER_ALREADY_EXISTS);
            return;
        }
        res.status(500);
        res.json(errors.UNKOWN_ERROR);
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
 *                      $ref: '#/components/schemas/UserInput'               
 *      responses: 
 *          '200': 
 *              description: Responds with the `"x-access-token"`.
 *              content: 
 *                  application/json: 
 *                      schema:
 *                          $ref: '#/components/schemas/Token'
 *          '401': 
 *              description: Invalid credentials.
 *              content: 
 *                  application/json: 
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          
 */
router.post("/login", async (req, res) => {
    let { email, password } = req.body;
    if (typeof (email) != "string" || typeof (password) != "string") {
        res.status(400)
            .json(errors.BAD_REQUEST);
        return;
    }
    email = email.toLowerCase();
    const user = await prisma.user.findFirst({ where: { email } });
    if (user === null) {
        res.status(401);
        return res.json(errors.UNREGISTERED_USER);
    }
    const isCorrect = await argon2.verify(user.password, password);
    if (!isCorrect) {
        return res.status(401)
            .json(errors.INCORRECT_PASSWORD);
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "48h" });
    res.setHeader("x-access-token", token);
    res.json({ status: "success", "x-access-token": token, });
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
 *              $ref: '#/components/responses/User'
 *          '404': 
 *              $ref: '#/components/responses/NotFound'
 *          '401': 
 *              $ref: '#/components/responses/Unauthorized'
 */

router.patch("/", user(), async (req: Request, res) => {
    // if you are staff or you are editting your own profile
    if (req.user?.isStaff || req.user?.id == req.body.id) {
        const password = req.body.password ? argon2.hash(req.body.password) : undefined;
        const updated = await prisma.user.update({
            where: {
                id: req.body.id,
            },
            data: { password, ...req.body }
        });
        delete (updated as any).password;
        res.json(updated);
    } else {
        res.status(403).json(errors.UNAUTHORIZED);
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
 *              $ref: '#/components/responses/User'
 *          '404': 
 *              $ref: '#/components/responses/NotFound'
 *          '401': 
 *              $ref: '#/components/responses/Unauthorized'
 *          '403': 
 *              $ref: '#/components/responses/Forbidden'
 */
router.delete("/:id", user({ staffOnly: true }), async (req: Request, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.delete({
            where: {
                id: Number(id),
            }
        });
        delete (user as any).password;

        res.json({ status: "success", user });
    } catch (e) {
        res.status(404).json(errors.USER_NOT_FOUND);
    }
});

router.use((err: Error, req: any, res: any, next: any) => {
    res.status(500).json(errors.UNAUTHORIZED);
});



const PUBLIC_FIELDS = {
    "id": true,
    "email": true,
    "isAdmin": true,
    "isStaff": true,
    "createdAt": true,
    "name": true,
    "LastName": true,
    "adress": true,
    "city": true,
    "BornDate": true,
    "occuppancy": true,
    "submissions": true,
    "bookings": true,
};

export default router; 
