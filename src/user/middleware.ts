import { PrismaClient, User } from "@prisma/client";
import express, { RequestHandler, Response, NextFunction, } from "express";
import jwt from "jsonwebtoken";
import { nextTick } from "process";

export const JWT_SECRET: string = "kXcssP7EyRHap1LNPAb9L2msigD1NT84vtC8TKItF9SI4YlXAbgfuJ5RPvkkIcKK";

const prisma = new PrismaClient();

export type Request = express.Request & { user?: User; };

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
        let token = req.headers["x-access-token"];
        if (typeof (token) === "string") {
            try {
                req.user = await fetchUser(token);
                if (!req.user?.isAdmin) {
                    return forbidden(res, next, options);
                }
                return next();
            } catch (e) {
                return expired(res, next, options);
            }
        }
        return unauthenticated(res, next, options);
    };
}

async function fetchUser(token: string) {
    let { email } = jwt.verify(token, JWT_SECRET, {}) as any;
    let user = await prisma.user.findFirst({
        where: { email }
    });
    return user || undefined;
}
// returns forbidden if admins or users only.
function forbidden(res: Response, next: NextFunction, options?: Options) {
    if (!options?.adminsOnly && !options?.staffOnly) {
        next();
    } else {
        res.status(403)
            .json({
                status: "error",
                error: "No tiene permiso para acceder a este recurso."
            });
    }
}

function expired(res: Response, next: NextFunction, options?: Options) {
    if (options?.optional) {
        next();
    } else {
        res.status(401)
            .json({
                status: "error",
                error: "Su sesión ha expirado"
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
                error: "Tienes que ingresar sesión para acceder a este recurso."
            });
    }
}

