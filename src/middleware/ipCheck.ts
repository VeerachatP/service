import { Request, Response, NextFunction } from 'express';

export const ipCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress;
  
  if (!ip) {
    return res.status(400).json({
      success: false,
      error: 'Could not determine IP address'
    });
  }

  req.ip = ip;
  next();
}; 