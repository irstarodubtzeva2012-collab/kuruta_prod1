import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as url from 'url';

/**
 * SSRF Protection Middleware
 * Блокирует запросы к внутренним IP-адресам
 */
@Injectable()
export class SsrfProtectionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SsrfProtectionMiddleware.name);

  // Запрещённые IP-диапазоны (RFC 1918, link-local, loopback)
  private readonly blockedRanges = [
    /^127\./,           // Loopback
    /^10\./,            // Private Class A
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private Class B
    /^192\.168\./,      // Private Class C
    /^169\.254\./,      // Link-local
    /^0\./,             // Current network
    /^::1$/,            // IPv6 loopback
    /^fc00:/,           // IPv6 unique local
    /^fe80:/,           // IPv6 link-local
  ];

  use(req: Request, res: Response, next: NextFunction) {
    // Проверяем URL-параметры на наличие внутренних адресов
    const queryParams = [req.query.url, req.query.redirect, req.query.callback, req.query.next];
    
    for (const param of queryParams) {
      if (typeof param === 'string' && param) {
        try {
          const parsedUrl = new url.URL(param);
          const hostname = parsedUrl.hostname;

          // Проверяем hostname на соответствие запрещённым диапазонам
          for (const range of this.blockedRanges) {
            if (range.test(hostname)) {
              this.logger.warn(`SSRF attempt blocked: ${param} from ${req.ip}`);
              return res.status(403).json({
                statusCode: 403,
                error: 'Forbidden',
                message: 'Access to internal resources is not allowed',
              });
            }
          }

          // Проверяем на localhost variants
          const localhostVariants = ['localhost', '0.0.0.0', '127.0.0.1', '::1', '0:0:0:0:0:0:0:1'];
          if (localhostVariants.includes(hostname.toLowerCase())) {
            this.logger.warn(`SSRF attempt blocked (localhost): ${param} from ${req.ip}`);
            return res.status(403).json({
              statusCode: 403,
              error: 'Forbidden',
              message: 'Access to internal resources is not allowed',
            });
          }
        } catch (error) {
          // Если URL невалидный, игнорируем
        }
      }
    }

    next();
  }
}
