import express, { Application } from "express";
import {createHash, pseudoRandomBytes} from "crypto";
import base64url from "base64url";
import constants from "./constants";

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
        "client_id": constants.CLIENT_ID,
        "redirect_uri": constants.REDIRECT_URI,
        "mydomain": constants.MYDOMAIN,
        "exp_id": constants.EXP_ID,
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