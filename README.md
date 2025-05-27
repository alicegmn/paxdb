# Chas Challenge 2025

# PAX

## Team: Kusten är klar - Chas Challenge 2025

![Pax image](PAX_Kusten_är_klar_PG2.png)

PAX är ett automatiserat rumsbokningssystem som förenklar vardagen på kontoret. Via en mobilapp kan medarbetare boka, se och hantera sina rumsbokningar, medan administratörer får full kontroll via en webbaserad dashboard. Systemet använder sensorer för att upptäcka närvaro i rummen och kan automatiskt boka eller avboka rum baserat på faktisk användning. PAX sparar tid och resurser, ökar tillgängligheten av rum och bidrar till ett smartare och mer hållbart kontorsflöde.

## Getting Started

## Backend
Our backend is now hosted on PaxDB:
Base URL: https://paxdb.vercel.app


## Frontend
To run the frontend locally:

1. Clone the repo

2. Go to dashboard folder
- cd dashboard

3. Install dependencies:
- npm install

3. Start the frontend server:
- npm run dev
  
4. Access it at:
http://localhost:5173

5. Log in with "email": "admin@pax.com" + "password": "admin123"

6. Now you have access the admin dashboard

---

## Authentication

The app uses JSON web tokens to authenticate users

Passwords are hashed using bcryptjs using 10 salt rounds before storing them in the PostgreSQL database.

After successful registration or login a JWT token is issued with the users id, username and role.

The token is signed with a secret key (JWT_secret) and has 1 hour expiration time

To access protected endpoints such as `/users`, you need to log in and obtain a Bearer Token.

### Login via Postman
POST `https://paxdb.vercel.app/auth/login`
#### Headers:
`Content-Type: application/json`

#### Body (JSON)
```json
    {
  "email": "admin@pax.com",
  "password": "admin123"
}

```
#### Response:
```json
   {
  "token": "your_jwt_token_here"
}
```
#### Use Bearer Token
For subsequent requests to protected endpoints, include the token in the Authorization header:
`Authorization: Bearer your_jwt_token_here`

## Project info

### [FMWx24 (Frontend repo)](https://github.com/Kusten-ar-klar-Chas-Challenge-2025/pax/tree/main/pax-mobile)
### [SUVx24 (IoT repo)](https://github.com/Kusten-ar-klar-Chas-Challenge-2025/pax/tree/main/Iot)
### [FJSx24 (Backend repo)](https://github.com/alicegmn/paxdb)

### [Backend/API deployad URL](https://paxdb.vercel.app/)

### [Front-end EAS (Expo Application Services) Android](https://expo.dev/artifacts/eas/qwP19Wj2vpnJuYwJq1Vrcj.apk)
### [Front-end EAS (Expo Application Services) Ios](https://expo.dev/artifacts/eas/atmUj6ae1mTqANcXLNi1Z1.tar.gz)


### Gruppmedlemmar:

**SUVX24:** Jennifer Gott, Sabina Stawbrink, Oscar Asserlund, Erik Dahl, Johan Modin  
**FMWX24:** Hannah Bärlin, Hanna Kindholm, Tova Hansen  
**FJSX24:** Alice Eriksson, Phithai Lai, Dennis Granheimer, Rhiannon Brönnimann
