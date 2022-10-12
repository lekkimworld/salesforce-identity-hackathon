import express from "express";
import session from "express-session";
import path from "path";
import { v4 as uuid } from "uuid";
import constants from "./constants";
import {engine} from "express-handlebars";

export default () => {
    const app = express();
    app.use(express.static(path.join(__dirname, "..", "public")));
    app.use(
        session({
            secret: process.env.SESSION_SECRET || uuid(),
            saveUninitialized: true,
            resave: true
        })
    );
    // add handlebars
    app.engine("handlebars", engine({ defaultLayout: "main" }));
    app.set("view engine", "handlebars");

    // listen
    app.listen(constants.PORT);
    console.log(`Listening on port ${constants.PORT}`);
    return app;
}
