import { Request, Response, RequestHandler, Router } from 'express';
import Express from 'express';
import Auth from '../../user/lib/auth';
import mongodb from 'mongodb';
import { IBehaviorHandler } from './interface/IBehaviorHandler';
import { IRequestResponse } from './interface/IRequestResponse';

/**
 * @description Abstract class that implements basic crud
 * operation on a given document.
 *
 * @constructor Constructor needs the document model to implement the fonctionality
 *
 * @author Samuel Dube
 * @author Samuel Colassin
 */
export abstract class CrudApi {
    protected Collection: string;
    protected Routing: Router = Express.Router();
    protected Behaviors: { [index: string]: IBehaviorHandler };

    /**
     * @description Constructor used to create
     * a new crud api for a specified document
     *
     * @param document Document to apply the crud api
     * @param routes Routes to add to the api
     * @param publicKeys Optionnal. Public keys of the document. Default set everything to public
     */
    constructor(collection: string) {
        this.Collection = collection;

        // Basic handlers for api
        this.Post = this.Post.bind(this);
        this.Get = this.Get.bind(this);
        this.Put = this.Put.bind(this);
        this.Delete = this.Delete.bind(this);
        this.GetAll = this.GetAll.bind(this);

        this.AddBehavior = this.AddBehavior.bind(this);
        this.SendResponse = this.SendResponse.bind(this);
        this.Behaviors = {
            "POST": {
                RouterMatcher: this.Routing.post.bind(this.Routing),
                RequestHandler: this.Post
            },
            "GET": {
                RouterMatcher: this.Routing.get.bind(this.Routing),
                RequestHandler: this.Get
            },
            "PUT": {
                RouterMatcher: this.Routing.put.bind(this.Routing),
                RequestHandler: this.Put
            },
            "DELETE": {
                RouterMatcher: this.Routing.delete.bind(this.Routing),
                RequestHandler: this.Delete
            },
            "GETALL": {
                RouterMatcher: this.Routing.get.bind(this.Routing),
                RequestHandler: this.GetAll
            }
        }
    }

    /**
     * @description Method that add a new behavior to the child api
     *
     * @param route Route use to access the new behavior
     * @param requestType Type of the request to access the new bahavior
     * @param secured Secured behavior
     * @param handler Optionnal handler for the behavior
     */
    protected AddBehavior(route: string,
        requestType: string,
        secured: boolean,
        handler?: RequestHandler) {

        let routerMatcher = this.Behaviors[requestType.toUpperCase()].RouterMatcher;
        let requestHandler = (handler) ? handler : this.Behaviors[requestType].RequestHandler;

        if (secured) {
            routerMatcher(route, Auth, requestHandler);
        } else {
            routerMatcher(route, requestHandler);
        }
    }

    /**
     * @description Get the routes generated for this api.
     *
     * @returns Express Router
     */
    public GetRoutes(): Router {
        return this.Routing;
    }

    /**
     * @description Method use to create a get request that
     * retrieves every model from the database and return it
     * to the caller.
     *
     * @param req Request object send by the client
     * @param res Response object sent by the server
     */
    public GetAll(req: Request, res: Response)
        : void {

        let collection = mongodb.connect()

        this.Document.find()
            .then((documents) => {
                if (!documents) {
                    throw new Error("No Document found");
                }
                this.SendResponse(res,
                    {
                        status: 200,
                        data: document
                    });
            })
            .catch((err) => {
                res.json(err);
            });
    }

    /**
    * @description Get the model from the database and return it
    * to the caller.
    *
    * @param req Request object containing the wallet to retrieve
    * @param res Response object use to send the information back to the caller
    */
    public Get(req: Request, res: Response)
        : void {
        this.Document.findById(req.params.id)
            .then((document) => {
                if (!document) {
                    throw new Error("No Document found");
                }
                this.SendResponse(res,
                    {
                        status: 200,
                        data: document
                    });
            })
            .catch((err) => {
                res.json(err);
            });
    }

    /**
     * @description Post a new model in the database using information
     * from the request object
     *
     * @param req Request object containing the information about the new wallet
     * @param res Response object use to send back information to the caller
     */
    public Post(req: Request, res: Response)
        : void {
        this.Document.create(req.body)
            .then((document) => {
                if (!document) {
                    throw new Error("No Document found");
                }
                this.SendResponse(res,
                    {
                        status: 200,
                        data: document
                    });
            })
            .catch((err: Error) => {
                this.SendResponse(res,
                    {
                        status: 404,
                        data: null,
                        error: {
                            type: err.name,
                            message: err.message,
                            parameters: "no parameters"
                        }
                    });
            });
    };

    /**
     * @description Put new information on an existing model inside
     * the database
     *
     * @param req Request object containing the new information about the wallet
     * @param res Response object use to send back information to the caller
     */
    public Put(req: Request, res: Response)
        : void {
        this.Document.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .then((document) => {
                if (!document) {
                    throw new Error("No Document found");
                }
                this.SendResponse(res,
                    {
                        status: 200,
                        data: document
                    });
            })
            .catch((err) => {
                this.SendResponse(res,
                    {
                        status: 404,
                        data: null,
                        error: {
                            type: err.name,
                            message: err.message,
                            parameters: "no parameters"
                        }
                    });
            });
    }

    /**
     * @description Delete a model in the database with the information contain
     * inside the request object.
     *
     * @param req Request object containing information about the model to delete
     * @param res Response object to send back information to the caller.
     */
    public Delete(req: Request, res: Response)
        : void {
        this.Document.findByIdAndDelete(req.params.id)
            .then((document) => {
                if (!document) {
                    throw new Error("No Document found");
                }
                this.SendResponse(res,
                    {
                        status: 200,
                        data: document
                    });
            })
            .catch((err) => {
                this.SendResponse(res,
                    {
                        status: 404,
                        data: null,
                        error: {
                            type: err.name,
                            message: err.message,
                            parameters: "no parameters"
                        }
                    });
            });
    }

    /**
     * @description Method used to generate a response by the server in the form of
     * a json document.
     *
     * @param res Response object use to send the response
     * @param response Response data that will be sent to the caller
     */
    public SendResponse(res: Response, response: IRequestResponse) {
        res.status(response.status).json({
            status: response.status,
            data: response.data,
            message: response.message || "",
            error: response.error || ""
        });
    }
}