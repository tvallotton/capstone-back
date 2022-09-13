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
    res.json([{ "asd": 10 }]); 
    // res.json(posts);
});

/** 
 * @swagger
 * /user/me: 
 *      get:
 *          description: returns the current authenticated user if any.
 *          parameters: 
 *              -   in: header
 *                  name: "x-access-token"
 *                  description: Authentication access token.
 *                  required: true
 *                  schema:
 *                      type: string
 */
router.get("/me", user({ optional: true }), async (req: Request, res: any) => {
    let user = req.user as any;
    delete user?.password;
    res.json(req.user || null);
});

router.get("/:id", async (req, res) => {
    let { id } = req.params;
    let user = await prisma.user.findFirst({
        where: { id: Number(id) }
    });
    if (user === null) {
        return res.json(NOT_FOUND);
    }
    delete (user as any).password;
    res.json(user);
});

router.post("", async (req, res) => {
    try {
        let user: User = req.body;
        user.password = await argon2.hash(user.password);
        let created = await prisma.user.create({
            data: user
        });
        delete (created as any).password;
        res.json(created);
    } catch (e) {
        console.log(e);
        res.status(500);
        res.json(UNKOWN_ERROR);
    }
});

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
    res.send(SUCCESS);
});

router.patch("/", user(), async (req: Request, res) => {
    if (req.user != null) {
        let updated = await prisma.user.update({
            where: {
                id: req.user.id,
            },
            data: user
        });
        delete (updated as any).password;
        res.json(updated);
    }
});

router.delete("/", user(), async (req: Request, res) => {
    await prisma.user.delete({
        where: {
            id: Number(req.user?.id),
        }
    });
    res.json(SUCCESS);
});

router.use((err: Error, req: any, res: any, next: any) => {
    res.status(500).json({
        error: "Error interno del servidor",
        status: "error",
    });
});


const SUCCESS = {
    "status": "success",
};

const UNREGISTERED_USER = {
    "status": "error",
    "error": "El correo electrónico no está registrado.",
};

const INCORRECT_PASSWORD = {
    "status": "error",
    "error": "La contraseña o usuario son incorrectos.",
};
const UNKOWN_ERROR = {
    "status": "error",
    "error": "Ocurrió un error creando el usuario.",
};
const NOT_FOUND = {
    "status": "error",
    "error": "El usuario no fue encontrado.",
};
const PUBLIC_FIELDS = {
    "email": true,
    "isAdmin": true,
    "isStaff": true,
    "createdAt": true,
};
const BAD_REQUEST = {
    "error": "bad request",
    "status": "error"
};

export default router; 
