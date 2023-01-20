const EXP_ID = (() => {
    const id = process.env.EXP_ID;
    if (!id) return undefined;
    if (id.indexOf("expid_") === 0) return id;
    return `expid_${process.env.EXP_ID}`;
})();

export default {
    REDIRECT_URI: (process.env.REDIRECT_URI || "http://localhost:8080") as string,
    CLIENT_ID: process.env.CLIENT_ID as string,
    CLIENT_SECRET: process.env.CLIENT_SECRET as string,
    HEADLESS: {
        SERVERSIDE: process.env.HEADLESS_SERVERSIDE ? true : false,
        USERNAME: process.env.HEADLESS_USERNAME as string|undefined,
        PASSWORD: process.env.HEADLESS_PASSWORD as string|undefined
    },
    MYDOMAIN:
        (process.env.MYDOMAIN?.indexOf("https://") === 0 ? process.env.MYDOMAIN : `https://${process.env.MYDOMAIN}`) as string,
    COUNTER_EXP: process.env.COUNTER_EXP ? Number.parseInt(process.env.COUNTER_EXP) : Number.MAX_VALUE,
    PORT: process.env.PORT ? Number.parseInt(process.env.PORT) : 8080,
    EXP_ID,
};