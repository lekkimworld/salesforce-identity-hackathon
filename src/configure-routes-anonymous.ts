import express, { Application } from "express";
import { v4 as uuid } from "uuid";
import {createHash, pseudoRandomBytes} from "crypto";
import base64url from "base64url";

const buildRenderContext = (data? : any) : any => {
    const std = {
        app: {
            title: process.env.APP_TITLE || "Salesforce Identity Hackathon"
        }
    }
    if (!data) return std;
    return Object.assign(std, data);
}

const router = express.Router();
router.get("/logindetails", (_req, res) => {
    const code_verifier = base64url(pseudoRandomBytes(32));
    const code_challenge = base64url(createHash("sha256").update(code_verifier).digest());
    res.type("json");
    res.send({
        "client_id": process.env.CLIENT_ID,
        "redirect_uri": process.env.REDIRECT_URI,
        "mydomain": process.env.MYDOMAIN,
        code_challenge,
        code_verifier
    })
});

export default (app : Application) => {
    app.get("/", (req, res) => {
        return res.render("root", buildRenderContext());
    })
    app.use("/api", router);
}