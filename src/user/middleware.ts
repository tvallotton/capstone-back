import { Booking, PrismaClient, Submission, User, UserHistory } from "@prisma/client";
import express, { Response, NextFunction, } from "express";
import jwt from "jsonwebtoken";
import process from "process";

export const JWT_SECRET = process.env["JWT_SECRET"] as string;

if (!JWT_SECRET) {
    throw "No JWT_SECRET set.";
}

const prisma = new PrismaClient();

export type Request = express.Request & { user?: User & { booking: Booking; submission?: Submission; history: UserHistory[]; }; };

interface Options {
    /**
     * If optional then the middleware won't respond with an error
     * in case the user isn't authenticated. This way the handler 
     * can manage those cases. It defaults to false. 
     */
    optional?: boolean;
    /**
     * It is used to respond with a forbidden status for 
     * admin only content. It defaults to false. 
     */
    adminsOnly?: boolean;

    /**
     * It is used to respond with a forbitten status for
     * staff only content. It defaults to false. 
     */
    staffOnly?: boolean;
}
/**
 * This is authentication middleware, it can be used to 
 * fetch the user from the database automatically. By default 
 * this middlware will respond with an error if the user
 * is not logged in. This can be customized by setting optional to `true`. 
 * @param options - used to customize the behavior of the middleware. 
 * @returns {undefined}
 * @example
 * This is how you would use it for an admin panel
 * ```ts
 * import { user, Request } from "../user/middleware";
 * router.get("/admin-panel", user({adminsOnly: true}), (req: Request, res) => {
 *     // ... // 
 * }); 
 * ```
 */
export function user(options?: Options) {
    return async function middleware(req: Request, res: Response, next: NextFunction) {
        const token = req.headers["x-access-token"];
        if (typeof (token) === "string") {
            try {
                req.user = await fetchUser(token);
                if (!req.user?.isAdmin && options?.adminsOnly) {
                    return forbidden(res);
                } else if (!(req.user?.isStaff || req.user?.isAdmin) && options?.staffOnly) {
                    return forbidden(res);
                } else {
                    return next();
                }
            } catch (e) {
                return expired(res, next, options);
            }
        }
        return unauthenticated(res, next, options);
    };
}

async function fetchUser(token: string) {
    const { id } = jwt.verify(token, JWT_SECRET, {}) as { id: number; };
    const user = await prisma.user.findFirst({
        where: { id },
        include: { bookings: true, submissions: true, history: true }
    });
    if (!user) {
        return undefined;
    }
    const { bookings, submissions, ...user2 } = user;
    const booking = bookings.filter(booking => !booking.end)[0];
    const submission = submissions[0];
    return { ...user2, booking, submission };
}
// returns forbidden if admins or users only.
function forbidden(res: Response) {
    res.status(403)
        .json({
            status: "error",
            es: "No tiene permiso para acceder a este recurso.",
            en: "You are not allowed to access this resource."
        });

}

function expired(res: Response, next: NextFunction, options?: Options) {
    if (options?.optional) {
        next();
    } else {
        res.status(401)
            .json({
                status: "error",
                es: "Su sesión ha expirado",
                en: "Your session has expired."
            });
    }
}

function unauthenticated(res: Response, next: NextFunction, options?: Options,) {
    if (options?.optional) {
        next();
    } else {
        res.status(401)
            .json({
                status: "error",
                es: "Tienes que ingresar sesión para acceder a este recurso.",
                en: "You must log in to access this resource."
            });
    }
}

export function missingData(user: User) {
    const keys: Array<keyof User> = [
        "email",
        "name",
        "lastName",
        "address",
        "city",
        "occupancy",
        "unidadAcademica",
    ];
    const missing = [];
    for (const key of keys) {
        const value = user[key];
        if (value == "") {
            missing.push(key);
        }
    }
    // if (user.rut == "" && user.passport == "") {
    //     missing.push("rut");
    // }

    if (missing.length != 0) {
        return {
            "status": "error",
            "en": `Missing the following user data: ${missing.join(", ")}.`,
            "es": `Faltan los siguientes datos de usuario: ${missing.join(", ")}.`,
        };
    }


}

export const PUBLIC_FIELDS = {
    "id": true,
    "email": true,
    "isAdmin": true,
    "isStaff": true,
    "createdAt": true,
    "name": true,
    "lastName": true,
    "address": true,
    "city": true,
    "birthday": true,
    "occupancy": true,
    "unidadAcademica": true,
    "submissions": true,
    "bookings": true,
    "signature": true,
};