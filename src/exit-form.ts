import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const _prisma = new PrismaClient();
const router = Router();



export default router; 