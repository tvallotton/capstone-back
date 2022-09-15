import express from "express";
import dotenv from "dotenv";
import user from "./user/routes";
import docs from "./docs";
import bicycle from "./bicycle";
import submission from "./submission";
import bicycleModel from "./bicycle-model";
import booking from "./booking";
dotenv.config();

const PORT = process.env["PORT"] || 5000;
const app = express();


// middleware for parsing json objects
app.use("/", express.json());
app.use("/user/", user);
app.use("/bicycle", bicycle);
app.use("/submission", submission);
app.use("/bicycle-model", bicycleModel);
app.use("/booking", booking);
app.use("/", docs);


app.listen(PORT, () => {
    console.log(`visit http://localhost:${PORT}/`);
});