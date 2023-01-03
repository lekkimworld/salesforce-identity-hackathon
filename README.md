# Salesforce Identity Hackathon #
This is a very basic single page application for a Salesforce Identity Hackathon. 

**Please note:** This repo has branches for a version of the app where the user authenticates using the PKCE flow without using any library (`oidc-pkce`) and a branch where a library is used (`oidc-pkce-library`). The `oidc-pkce` branch also supports translations and shows of using the Experience ID for advanced features. There are a number of videos supporting the app at https://youtube.com/playlist?list=PLz8RqWXvEsBpnGg58P3y7ljEPmYURV8Yb.

## Running with node.js ##
```
npm install
npm run start
```

## Running with Docker ##
```
docker run --rm -it -p 8080:8080 lekkim/salesforce-identity-hackathon:no-identity
```
