# Salesforce Identity Hackathon #
This is a very basic single page application for a Salesforce Identity Hackathon.

## Configuration ##
Create a `.env` file with the following keys:
* CLIENT_ID
* CLIENT_SECRET
* MYDOMAIN
* REDIRECT_URI (defaults to `http://localhost:8080`)
* COUNTER_EXP (set to a number of requests to process before sending 401, defaults to Number.MAX_VALUE)


## Running with node.js ##
```
npm install
npm run start
```

## Running with Docker ##
```
docker run --rm -it -p 8080:8080 lekkim/salesforce-identity-hackathon:pkce-flow
```
