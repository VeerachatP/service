import { Request, Response, NextFunction } from 'express';

export const ipCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress;
  
  if (!clientIp) {
    return res.status(400).json({
      success: false,
      error: 'Could not determine IP address'
    });
  }

  // Use Object.defineProperty to set ip
  Object.defineProperty(req, 'ip', {
    value: clientIp,
    writable: true,
    configurable: true
  });

  next();
}; 