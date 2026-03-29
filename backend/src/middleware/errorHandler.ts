import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: err.message || '伺服器發生錯誤',
  });
};
