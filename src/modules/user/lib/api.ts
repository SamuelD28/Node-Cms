import { User } from './model';
import { Url } from './url';
import { CrudApi } from '../../database/lib/mongo/api';
import { Request, Response } from 'express';

export default new class Api extends CrudApi {
    constructor() {
        super(User);
        this.Login = this.Login.bind(this);
        this.Logout = this.Logout.bind(this);

        this.AddBehavior("/login", "POST", false, this.Login);
        this.AddBehavior("/logout", "GET", true, this.Logout);
        this.AddBehavior("/:id", "GET", true);
        this.AddBehavior("/:id", "PUT", true);
        this.AddBehavior("/:id", "DELETE", true);
        this.AddBehavior("/", "GETALL", true);
        this.AddBehavior("/", "POST", false);



        this.AddBehavior("/generateLink/:email", "POST", false, this.generateLink);
    }

    public generateLink(req: Request, res: Response) {

        let urlToEmail: string = "";
        let emailParameter: string = req.params.email || "";

        //Parse the received email in the url

        //Find a corresponding user

        User.findOne({ email: emailParameter })
            .then((user) => {
                if (user !== null) {
                    let userId = user.id;
                    let tempUrl: string = `http://${process.env.IP}/user/reset/${userId}`;
                    Url.create(tempUrl)
                        .then((url) => {
                            urlToEmail = url.Url;
                        });
                }
            })
            .catch((err) => {
                this.SendResponse(res,
                    {
                        status: 503,
                        data: null,
                        message: "No user correspond"
                    })
                console.log(err);
            });

        //Generate an rsa key

        //Send the link via email

        if (urlToEmail !== "") {
            //Send email
        }
    }

    public Login(req: Request, res: Response) {
        let password: string = (req.body.password !== undefined) ? req.body.password : "";
        let email: string = (req.body.email !== undefined) ? req.body.email : "";

        User.findOne({ email: email })
            .then((user) => {
                if (user) {
                    user.PasswordMatch(password, (match: boolean) => {
                        if (match) {
                            user.SaveToken();
                            res.cookie(<string>process.env.DOMAIN, user.token);
                            this.SendResponse(res,
                                {
                                    status: 200,
                                    data: user
                                });
                        } else {
                            throw new Error("Password doesn't match");
                        }
                    });
                }
                else {
                    throw new Error("No email found");
                }
            })
            .catch((err: Error) => {
                this.SendResponse(res,
                    {
                        status: 404,
                        data: null,
                        error: {
                            type: err.name,
                            message: err.message,
                            parameters: "User"
                        }
                    })
            });
    }

    public Logout(req: Request, res: Response) {
        let user = req.body.user;
        User.findOne({ email: user.email })
            .then((user) => {
                if (!user) {
                    throw new Error("No user found");
                } else {
                    user.RemoveToken();
                    res.clearCookie(<string>process.env.DOMAIN);
                    this.SendResponse(res,
                        {
                            status: 200,
                            message: "Successfully logout user " + user.email,
                            data: user
                        });
                }
            })
            .catch((err: Error) => {
                this.SendResponse(res,
                    {
                        status: 404,
                        data: null,
                        error: {
                            type: err.name,
                            message: err.message,
                            parameters: "User"
                        }
                    });
            });
    }
}
