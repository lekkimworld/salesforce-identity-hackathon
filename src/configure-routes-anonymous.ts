import { Application } from "express";

const buildRenderContext = (headline: string, data? : any) : any => {
    const std = {
        app: {
            title: process.env.APP_TITLE || "Salesforce Identity Hackathon"
        },
        headline
    }
    if (!data) return std;
    return Object.assign(std, data);
}

export default (app : Application) => {
    app.get("/", (req, res) => {
        return res.render("root", buildRenderContext("Welcome!"));
    })
}