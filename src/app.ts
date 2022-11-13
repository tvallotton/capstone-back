import express from "express";
import dotenv from "dotenv";
import user from "./user/routes";
import docs from "./docs";
import bicycle from "./bicycle";
import submission from "./submission";
import bicycleModel from "./bicycle-model";
import booking from "./booking";
import cors from "cors";
import bicycleHistory from "./bicycle-history";
import userHistory from "./user-history";
import exitForm from "./exit-form";
dotenv.config();

const PORT = process.env["PORT"] || 5001;
const app = express();


// middleware for parsing json objects
app.use(cors());
app.use("/", express.json());
app.use("/user/", user);
app.use("/user/history", userHistory);
app.use("/bicycle", bicycle);
app.use("/submission", submission);
app.use("/bicycle-model", bicycleModel);
app.use("/bicycle/history", bicycleHistory);
app.use("/booking", booking);
app.use("/exit-form", exitForm);
app.use("/", docs);

app.listen(PORT, () => {
    console.log(`visit http://localhost:${PORT}/`);
});

