import { Booking, PrismaClient, Schedule, Submission } from "@prisma/client";
import assert from "assert";
import { Router } from "express";
import errors from "./errors";
import { Request, user } from "./user/middleware";
import moment from "moment-timezone";

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
    const schedule = query?.array || Array(6).fill(Array(8).fill(false));
    res.json({ status: "success", schedule });
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
 *                          schema: 
 *                              $ref: "#/components/schemas/Schedule"
 */
router.put("/", user({ adminsOnly: true }), async (req, res) => {
    try {
        const array = [];
        console.log(req.body);
        for (let i = 0; i < 6; i++) {
            const row = [];
            for (let j = 0; j < 8; j++) {
                console.log(`[i, j] = ${[i, j]}`);
                row.push(Boolean(req.body[i][j]));
            }
            array.push(row);
        }
        const { array: schedule } = await prisma.schedule.upsert({
            create: { array },
            update: { array },
            where: {
                id: "Singleton",
            }
        });
        res.json({ status: "success", schedule });
    } catch (e) {
        console.log(e);
        res.json(errors.EXPECTED_MATRIX);
    }
});


/**
 * @swagger
 * /schedule/available: 
 *      get: 
 *          description: returns the avaliable dates for a booking
 *          parameters:   
 *              - $ref: "#/components/parameters/x-access-token"
 *          responses: 
 *              '200':
 *                  $ref: "#/components/responses/Dates"
 */
router.get("/available", user(), async (req: Request, res) => {
    const user = req.user;
    assert(user);


    const schedule = await prisma.schedule.findFirst();
    if (!schedule) {
        return res.status(503).json(errors.OUT_OF_SERVICE);
    }

    if (user.submission) {
        const dates = forSubmission(user.submission, schedule);
        return res.json({ status: "success", dates });
    }
    else if (user.booking) {
        const dates = forBooking(user.booking, schedule);
        return res.json({ status: "success", dates });
    } else {
        res.status(400).json(errors.SUBMISSION_NOT_FOUND);
    }
});


/**
 * @swagger
 * /schedule/date: 
 *      put: 
 *          description: returns the avaliable dates for a booking
 *          parameters:   
 *              - $ref: "#/components/parameters/x-access-token"
 *          consumes: 
 *              - application/json
 *          requestBody:
 *            required: true
 *            content: 
 *                application/json:
 *                    schema:  
 *                       type: object
 *                       properties: 
 *                          date: 
 *                              type: string
 *          responses: 
 *              '200':
 *                  description: Returns the history of the queried bicycle as an array.
 *                  content:
 *                      application/json: 
 *                          schema: 
 *                              type: object
 *                              properties: 
 *                                  status: string
 */
router.put("/date", user(), async (req: Request, res) => {
    const user = req.user;
    assert(user);
    const { date } = req.body;

    if (user.submission) {
        await prisma.submission.update({
            data: {
                pickupSchedule: date,
            },
            where: {
                id: user.submission.id,
            }
        });
        res.json({ status: "success", date });
    } else if (user.booking) {
        await prisma.booking.update({
            data: {
                returnSchedule: date,
            },
            where: {
                id: user.booking.id,
            }
        });
        res.json({ status: "success", date });
    } else {
        res.status(404).json(errors.SUBMISSION_NOT_FOUND);
    }
});

const windowPeriod = 1000 * 60 ** 2 * 24 * 7 * 3;

function forSubmission(submission: Submission, schedule: Schedule) {
    const now = new Date();
    const end = Number(now) + windowPeriod;
    return matches(schedule, moment(), moment(end));
}

function forBooking(booking: Booking, schedule: Schedule) {
    const duration = booking.duration * 1000 * 60 ** 2 * 24 * 30;
    const now = Number(new Date());
    const bookingStart = Number(booking.start);
    const end = max(now + windowPeriod, bookingStart + duration);
    const start = end - windowPeriod;
    return matches(schedule, moment(start), moment(end));
}


function matches(schedule: Schedule, start: moment.Moment, end: moment.Moment) {
    const array = schedule.array as boolean[][];
    const matches = [];
    for (normalize(start); start < end; increment(start)) {
        const day = array[start.day() - 1];
        if (day[block(start)]) {
            matches.push(start.format());
        }
    }
    return matches;
}


function block(date: moment.Moment): number {
    switch (date.hours()) {
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

function normalize(date: moment.Moment) {
    date.tz("America/Santiago");
    date.second(0).millisecond(0);

    const m = date.minutes();
    const h = date.hours();
    const t = h + m / 60;

    if (t < 10) {
        date.hours(8);
        date.minutes(30);
    } else if (t < 11.5) {
        date.hours(10);
        date.minutes(0);
    } else if (t < 14) {
        date.hours(11);
        date = date.minutes(30);
    } else if (t < 15.5) {
        date.hours(14);
        date.minutes(0);
    } else if (t < 17) {
        date.hours(15);
        date.minutes(30);
    } else if (t < 18.5) {
        date.hours(17);
        date.minutes(0);
    } else if (t < 20) {
        date.hours(18);
        date.minutes(30);
    } else {
        date.hours(20);
        date.minutes(0);
    }
    return date;
}

function increment(date: moment.Moment) {
    if (date.hour() == 11) {
        date.hours(14);
        date.minutes(0);

    } else if (date.hour() >= 20) {
        date.add(12.5 * 60 ** 2 * 1000);
        if (date.day() == 0) {
            date.add(+ 24 * 60 ** 2 * 1000);
        }
    } else {
        date.add(1.5 * 60 ** 2 * 1000);
    }
}

export default router;

