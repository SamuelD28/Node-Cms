import { IRouterMatcher, RequestHandler, Router } from 'express';
export interface IBehaviorHandler {
    RouterMatcher: IRouterMatcher<Router>;
    RequestHandler: RequestHandler;
}
