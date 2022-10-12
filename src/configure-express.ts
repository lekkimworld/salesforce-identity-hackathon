import express, { Application } from "express";
import session, {SessionOptions} from "express-session";
import path from "path";
import { v4 as uuid } from "uuid";
import Handlebars from "handlebars";
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
    let port = 8080;
    if (process.env.PORT) {
        console.log(`PORT environment variable detected`);
        port = Number.parseInt(process.env.PORT);
    }
    app.listen(port);
    console.log(`Listening on port ${port}`);
    return app;
}
