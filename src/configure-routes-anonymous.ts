import express, { Application } from "express";
import {createHash, pseudoRandomBytes} from "crypto";
import base64url from "base64url";
import constants from "./constants";
import {json} from "body-parser";

const buildRenderContext = (data? : any) : any => {
    const std = {
        app: {
            title: process.env.APP_TITLE || "Salesforce Identity Hackathon"
        },
        headless: {
            username: constants.HEADLESS.USERNAME,
            password: constants.HEADLESS.PASSWORD
        }
    }
    if (!data) return std;
    return Object.assign(std, data);
}

type LoginDetails = {
    headless_serverside: boolean;
    client_id: string;
    redirect_uri: string;
    mydomain: string;
    exp_id: string|undefined;
    code_challenge: string;
    code_verifier: string;
}

const getLoginDetails = () : LoginDetails => {
    const code_verifier = base64url(pseudoRandomBytes(32));
    const code_challenge = base64url(createHash("sha256").update(code_verifier).digest());
    return {
        headless_serverside: constants.HEADLESS.SERVERSIDE,
        client_id: constants.CLIENT_ID,
        redirect_uri: constants.REDIRECT_URI,
        mydomain: constants.MYDOMAIN,
        exp_id: constants.EXP_ID,
        code_challenge,
        code_verifier,
    };
}

const router = express.Router();
router.use(json());
router.get("/logindetails", (_req, res) => {
    res.type("json");
    if (constants.HEADLESS.SERVERSIDE) {
        res.send({
            "headless_serverside": true,
            "mydomain": constants.MYDOMAIN,
            "client_id": constants.CLIENT_ID
        });
    } else {
        res.send(getLoginDetails());
    }
});

router.post("/login", async (req, res) => {
    if (!constants.HEADLESS.SERVERSIDE) return res.status(500).send(`Do your own login - headless login not configured for serverside support`);

    // get body
    const body = req.body;
    console.log(
        `Attempting to perform headless login with username <${body.username}> and password <${body.password.substring(
            0,
            5
        )}...>`
    );

    // get login details
    const logindetails = getLoginDetails();

    // build payload and get authcode
    const authcode_payload = `response_type=code_credentials&redirect_uri=${logindetails.redirect_uri}&client_id=${logindetails.client_id}&code_challenge=${logindetails.code_challenge}&username=${body.username}&password=${body.password}&scope=openid%20forgot_password%20refresh_token`;
    let resp = await fetch(`${logindetails.mydomain}/services/oauth2/authorize`, {
        method: "post",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            "Auth-Request-Type": "Named-User",
        },
        redirect: "manual",
        body: authcode_payload,
    });
    const location = resp.headers.get("location");
    const code = (() => {
        let query = new URL(location!).search;
        if (query.startsWith("?")) query = query.substring(1);
        return query.split("&").reduce((prev: string|undefined, part) => {
            if (prev) return prev;
            if (part.startsWith("code=")) return decodeURIComponent(part.substring(5));
            return undefined;
        }, undefined);
    })();

    // exchange for access_token data
    const token_payload = `code=${code}&grant_type=authorization_code&redirect_uri=${logindetails.redirect_uri}&client_id=${logindetails.client_id}&code_verifier=${logindetails.code_verifier}`;
    resp = await fetch(`${logindetails.mydomain}/services/oauth2/token`, {
        method: "post",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
        },
        body: token_payload,
    });
    const token_body = await resp.json();

    // return
    res.type("json");
    res.send(token_body);

});

export default (app : Application) => {
    app.get("/", (req, res) => {
        return res.render("root", buildRenderContext());
    })
    app.use("/api", router);
}