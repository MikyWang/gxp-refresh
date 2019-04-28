import { LinkRouter } from "./linkRouter";
import { NextFunction, Request, Response } from '~express/lib/express';

export class ESBRouter extends LinkRouter {

    constructor() {
        super();
        this.link = '/esb';
    }

    initPath(): any {
        this.router.get('/cupsdata', (req: Request, resp: Response, next: NextFunction) => {
            resp.render('cupsdata', {
                title: "ESB标准文档生成",
                navbarIndex: "3",
            });
        });
    }
}