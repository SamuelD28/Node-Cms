/**
 * @description NodeCms used to create new website
 * @version 0.1
 * @author Samuel Dube
 */

// -- Imports --//
import express from "express";
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { UserApi } from './modules/user';
import { MongoDatabase } from './modules/database/';

// -- Initialisation -- //
dotenv.config();
const app = express();
const database = new MongoDatabase(<string>process.env.DATABASE_URL, "nodecms");

// -- Middleware -- //
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// -- Listener -- //
app.listen(8888, "localhost", (error: string) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Starting server on port 8888");
    }
});