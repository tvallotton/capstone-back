import swaggerJsdoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
import { Router } from "express";
const router = Router();

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Sibico API ",
            version: "0.1.0",
            description:
                "Backend API for Sibico mobile and web application.",
            contact: {
                name: "Sibico",
            },
            servers: ["http://localhost:5000"]
        },

    },
    apis: ["**/*.ts"],
};

const swaggerOptions = {
    customCss: '.try-out__btn { visibility: hidden; }',
    swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true
    }
};

const specs = swaggerJsdoc(options);

router.use("/", serve, setup(specs, swaggerOptions));

export default router; 