import express, { Application } from "express";
import {v4 as uuid} from "uuid";

const router = express.Router();
router.get("/userinfo", (_req, res) => {
    res.type("json");
    res.send({
        "uuid": uuid()
    });
});

export default (app: Application) => {
    app.use("/api", router);
};
