/**
 *
 *
 * @author : Samuel Dube
 */

// -- Imports --//
import express from "express";
import dotenv from "dotenv";
import mongo, { MongoClient } from 'mongodb';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { UserApi } from './modules/user';

// -- Initialisation -- //
const app = express();
dotenv.config();

const client = new MongoClient(
    <string>process.env.DATABASE_URL,
    { useNewUrlParser: true }
);

client.connect((err) => {
    if (err) {
        throw (err.message);
    }
    client.db(<string>process.env.DATABASE_NAME);
    client.close();
});

// -- Middleware -- //
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// -- Routing --//
app.use("/user", UserApi.GetRoutes());

// -- Listener -- //
app.listen(8888, "localhost", (error: string) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Starting server on port 8888");
    }
});