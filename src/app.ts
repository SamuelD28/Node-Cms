/**
 *
 *
 * @author : Samuel Dube
 */

// -- Imports --//
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { UserApi } from './modules/user';

// -- Initialisation -- //
const app = express();
dotenv.config();
mongoose.Promise = Promise;
mongoose.connect(
    <string>process.env.DATABASE,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: true
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