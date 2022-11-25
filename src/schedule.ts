import { Booking, PrismaClient, Schedule, Submission } from "@prisma/client";
import { Router } from "express";
import errors from "./errors";
import { user } from "./user/middleware";


const max = (a: number, b: number) => a > b ? a : b;

export const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /schedule:
 *      get: 
 *          description: returns the schedule
 *          responses:
 *              '200':
 *                  description: A successful response
 *                  content: 
 *                      application/json:
 *                          schema:
 *                              type: array
 */
router.get("/", async (req, res) => {
    const query = await prisma.schedule.findFirst();
    const array = query || Array(6).fill(Array(8).fill(false));
    res.json({ status: "success", array });
});
/**
 * @swagger
 * /schedule:
 *      put: 
 *          parameters: 
 *              - $ref: "#/components/parameters/x-access-token"
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json:
 *                    schema:  
 *                       $ref: "#/components/schemas/Schedule"
 *                   
 *          responses:
 *              '200':
 *                  content:
 *                       application/json:
 */
router.put("/", user({ adminsOnly: true }), async (req, res) => {
    try {
        const array = [];
        for (let i = 0; i < 6; i++) {
            const row = [];
            for (let j = 0; i < 8; i++) {
                row.push(Boolean(req.body[i][j]));
            }
            array.push(row);
        }
        await prisma.schedule.upsert({
            create: { array },
            update: { array },
            where: {}
        });
        res.json({ status: "success" });
    } catch (e) {
        console.log(e);
        res.json(errors.EXPECTED_MATRIX);
    }
});

/**
 * @swagger
 * /schedule/return/{bookingId}: 
 *      get: 
 *          description: returns the avaliable dates for a booking
 *          parameters: 
 *              - in: path
 *                name: bookingId
 *                schema: 
 *                  type: integer
 *          responses: 
 *              '200':
 *                  $ref: "#/components/responses/Dates"
 */
router.get("/return/:bookingId", async (req, res) => {
    const { bookingId } = req.params;
    const schedule = await prisma.schedule.findFirst();
    if (!schedule) {
        return res.status(503).json(errors.OUT_OF_SERVICE);
    }
    const booking = await prisma.booking.findFirst({ where: { id: Number(bookingId) } });
    if (!booking) {
        return res.status(404).json(errors.BOOKING_NOT_FOUND);
    }
    if (booking.end) {
        return res.status(400).json(errors.BOOKING_ALREADY_TERMINATED);
    }
    const dates = forBooking(booking, schedule);
    res.json({ status: "success", dates });
});


router.get("/pickup/:submissionId", async (req, res) => {
    const { submissionId } = req.params;
    const schedule = await prisma.schedule.findFirst();
    if (!schedule) {
        return res.status(503).json(errors.OUT_OF_SERVICE);
    }
    const submission = await prisma.submission.findFirst({ where: { id: Number(submissionId) } });
    if (!submission) {
        return res.status(404).json(errors.SUBMISSION_NOT_FOUND);
    }
    const dates = forSubmission(submission, schedule);
    res.json({ status: "success", dates });
});

const twoWeeks = 1000 * 60 ** 2 * 24 * 15;

function forSubmission(submission: Submission, schedule: Schedule) {
    const now = new Date();
    const end = Number(now) + twoWeeks;
    return matches(schedule, new Date(), new Date(end));
}

function forBooking(booking: Booking, schedule: Schedule) {
    const duration = booking.duration * 1000 * 60 ** 2 * 24 * 30;
    const now = Number(new Date());
    const bookingStart = Number(booking.start);
    const end = max(now + twoWeeks, bookingStart + duration);
    const start = end - twoWeeks;

    return matches(schedule, new Date(start), new Date(end));
}


function matches(schedule: Schedule, start: Date, end: Date) {
    const array = schedule.array as boolean[][];
    const matches = [];
    for (normalize(start); start < end; increment(start)) {
        const day = array[start.getDay()] || Array(8).fill(false);
        console.log("day", day);
        console.log("block", block(start));
        if (day[block(start)]) {
            matches.push(new Date(start));
        }
    }
    return matches;
}


function block(date: Date): number {
    switch (date.getHours()) {
    case 8: return 0;
    case 10: return 1;
    case 11: return 2;
    case 14: return 3;
    case 15: return 5;
    case 17: return 6;
    case 18: return 7;
    default: return 8;
    }
}

function normalize(date: Date) {
    date.setSeconds(0);
    date.setMilliseconds(0);
    const m = date.getMinutes();
    const h = date.getHours();
    const t = h + m / 60;

    if (t < 10) {
        date.setHours(8);
        date.setMinutes(30);
    } else if (t < 11.5) {
        date.setHours(10);
        date.setMinutes(0);
    } else if (t < 14) {
        date.setHours(11);
        date.setMinutes(30);
    } else if (t < 15.5) {
        date.setHours(14);
        date.setMinutes(0);
    } else if (t < 17) {
        date.setHours(15);
        date.setMinutes(30);
    } else if (t < 18.5) {
        date.setHours(17);
        date.setMinutes(0);
    } else if (t < 20) {
        date.setHours(18);
        date.setMilliseconds(30);
    } else {
        date.setHours(20);
        date.setMinutes(0);
    }
}

function increment(date: Date) {
    if (date.getHours() == 11) {
        date.setHours(14);
        date.setMinutes(0);
    } else if (date.getHours() >= 20) {
        date.setTime(Number(date) + 12.5 * 60 ** 2 * 1000);
        if (date.getDay() == 0) {
            date.setTime(Number(date) + 24 * 60 ** 2 * 1000);
        }
    } else {
        date.setTime(Number(date) + 1.5 * 60 ** 2 * 1000);
    }
}

export default router;

