import User from './model';
import { Request, NextFunction, Response } from 'express';

export default function Auth(req: Request, res: Response, next: NextFunction) {
    let cookie: any = req.cookies[(<string>process.env.DOMAIN)];

    if (cookie === null || cookie === undefined) {
        res.status(500).json({ success: false, error: "No cookie" });
    } else {

        // User.FindByToken(cookie, (err: string | null, user: IUser | null) => {
        //     if (err) {
        //         res.status(504).json({ success: false, error: err });
        //     } else {
        //         req.body.user = user;
        //         next();
        //     }
        // });
    }
}

