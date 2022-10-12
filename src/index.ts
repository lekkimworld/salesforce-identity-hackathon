import {config as readEnvironment} from "dotenv";
readEnvironment();
import configureExpress from "./configure-express";
import configureAnonymousRoutes from "./configure-routes-anonymous";

const main = async () => {
    // create app and configure
    const app = configureExpress();

    // add anonymous routes
    configureAnonymousRoutes(app);

}
main();
