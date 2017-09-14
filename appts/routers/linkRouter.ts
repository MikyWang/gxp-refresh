import { Entry } from '../Entry';
import * as express from 'express';
import { NextFunction, Request, Response, Router } from '~express/lib/express';

export class LinkRouter {
    protected router = express.Router();
    protected link: string;

    constructor() {
        this.link = '/';
        this.initPath();
    }

    protected initPath(): any {
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.render('index', {
                title: "gxp环境重置",
                configs: Entry.entry.gxpIPs,
                navbarIndex: "1"
            });
        });
    }

    protected addAllowOrigin(res: Response) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("X-Powered-By", ' 3.2.1')
        res.header("Content-Type", "application/json;charset=utf-8");
    }
}
