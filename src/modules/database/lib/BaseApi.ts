import Express, { Request, Response, Router, RequestHandler } from 'express';
import { IBehaviorHandler } from './IBehaviorHandler';
import { IRequestResponse } from './IRequestResponse';
import { Auth } from '../../user';

export abstract class BaseApi {
    protected Behaviors: { [index: string]: IBehaviorHandler } = {};
    protected Routing: Router = Express.Router();

    constructor() {
        this.Init();
    }

    private Init(): void {
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

    public GetRoutes(): Router {
        return this.Routing;
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

    public abstract GetAll(req: Request, res: Response): void;
    public abstract Get(req: Request, res: Response): void;
    public abstract Post(req: Request, res: Response): void;
    public abstract Put(req: Request, res: Response): void;
    public abstract Delete(req: Request, res: Response): void;
}
