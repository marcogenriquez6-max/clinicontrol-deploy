import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

/**
 * SecurityMiddleware — Aplica cabeceras de seguridad hardening.
 * Se ejecuta en app.use() antes de cualquier ruta.
 */
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Helmet con configuración hardening (no el default completo para evitar conflictos)
    helmet({
      // Evitar TypeError con el CSP default si no hay reportTo
      contentSecurityPolicy: false,
      // Otras cabeceras críticas
      crossOriginOpenerPolicy: false,
      crossOriginEmbedderPolicy: false,
    })(req, res, next);
  }
}
