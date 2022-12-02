import {config as readEnvironment} from "dotenv";
readEnvironment();
import configureExpress from "./configure-express";
import configureAnonymousRoutes from "./configure-routes-anonymous";
import configureAuthenticatedRoutes from "./configure-routes-authenticated";
import fetch from "node-fetch";
import constants from "./constants";

// counter
let counter = 0;

// show config
console.log(`CLIENT_ID=${constants.CLIENT_ID}`);
console.log(`CLIENT_SECRET=${constants.CLIENT_SECRET?.substring(0, 10)}...`);
console.log(`REDIRECT_URI=${constants.REDIRECT_URI}`);
console.log(`MYDOMAIN=${constants.MYDOMAIN}`);
console.log(`COUNTER_EXP=${constants.COUNTER_EXP}`);
console.log(`EXP_ID=${constants.EXP_ID}`);

const main = async () => {
    // create app and configure
    const app = configureExpress();

    // add anonymous routes
    configureAnonymousRoutes(app);

    // ensure auth
    app.use(async (req, res, next) => {
        // increment counter
        counter++;

        // ensure bearer token
        const authheader = req.headers.authorization;
        if (!authheader || authheader.indexOf("Bearer ") !== 0) return res.status(401).end();
        if (counter > constants.COUNTER_EXP) {
            counter = 0;
            console.log(`Counter reset (max: ${constants.COUNTER_EXP}) - returning 401`);
            return res.status(401).end();
        }
        // get and validate access token
        const access_token = authheader.substring(7);
        const respIntrospection = await fetch(`${constants.MYDOMAIN}/services/oauth2/introspect`, {
            method: "post",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                accept: "application/json",
            },
            body: `token=${access_token}&token_type_hint=access_token&client_id=${constants.CLIENT_ID}&client_secret=${constants.CLIENT_SECRET}`,
        });
        const introspectResult = await respIntrospection.json();
        const now = Date.now() / 1000;
        if (introspectResult.error || introspectResult.nbf > now || introspectResult.exp < now) return res.status(401).end(); 
        console.log(`Introspected token for ${introspectResult.username} - token expires at ${new Date(introspectResult.exp * 1000).toISOString()}`);
        next();
    })

    // add authenticated routes
    configureAuthenticatedRoutes(app);

}
main();
