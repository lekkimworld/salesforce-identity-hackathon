export default {
    REDIRECT_URI: process.env.REDIRECT_URI || "http://localhost:8080",
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    MYDOMAIN: process.env.MYDOMAIN,
    COUNTER_EXP: process.env.COUNTER_EXP ? Number.parseInt(process.env.COUNTER_EXP) : Number.MAX_VALUE,
    PORT: process.env.PORT ? Number.parseInt(process.env.PORT) : 8080
};