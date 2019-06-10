import { Document, Model } from 'mongoose';
import { Request, Response } from 'express';
import { BaseApi } from '../BaseApi';

/**
 * @description Abstract class that implements basic crud
 * operation on a given document.
 *
 * @constructor Constructor needs the document model to implement the fonctionality
 *
 * @author Samuel Dube
 */
export class MongoApi extends BaseApi {
    protected Document: Model<Document, {}>;

    /**
     * @description Constructor used to create
     * a new crud api for a specified document
     *
     * @param document Document to apply the crud api
     * @param routes Routes to add to the api
     * @param publicKeys Optionnal. Public keys of the document. Default set everything to public
     */
    constructor(document: Model<Document, {}>) {
        super();
        this.Document = document;
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
}