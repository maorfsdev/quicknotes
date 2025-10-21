import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as os from 'os';

@Injectable()
export class UpstreamHeaderMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Add upstream instance information to response headers
    const hostname = os.hostname();
    const pid = process.pid;
    const instance = `${hostname}-${pid}`;
    
    res.setHeader('X-Upstream-Instance', instance);
    res.setHeader('X-Server-Hostname', hostname);
    res.setHeader('X-Process-ID', pid.toString());
    
    next();
  }
}
