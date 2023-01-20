# Salesforce Identity Hackathon #
This is a very basic single page application for a Salesforce Identity Hackathon.

## Configuration ##
Create a `.env` file with the following keys:
* CLIENT_ID
* CLIENT_SECRET
* MYDOMAIN
* REDIRECT_URI (defaults to `http://localhost:8080`)
* COUNTER_EXP (set to a number of requests to process before sending 401, defaults to Number.MAX_VALUE)
* EXP_ID (optional, Salesforce Experience ID, should start with `expid_` i.e. `expid_foobar`)
* HEADLESS_SERVERSIDE (if set client should delegate headless auth to serverside)
* HEADLESS_USERNAME (default value for username field on client)
* HEADLESS_PASSWORD (default value for password field on client)


## Running with node.js ##
```
npm install
npm run start
```

## Running with Docker ##
```
docker run --rm -it -p 8080:8080 --env-file ./.env lekkim/salesforce-identity-hackathon:oidc-pkce
```
