import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
  userId: number;
  role: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
    return;
  }

  console.log('Token reçu:', token);

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      console.error('Erreur lors de la vérification du token:', err);
      res.status(403).json({ message: 'Token invalide' });
      return;
    }

    const user = decoded as CustomJwtPayload;
    req.user = user;

    console.log('Utilisateur authentifié:', user);

    next();
  });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user;

  console.log('Rôle de l\'utilisateur:', user?.role);

  if (user?.role !== 'admin') {
    res.status(403).json({ message: 'Accès interdit, seuls les administrateurs peuvent accéder à cette route.' });
    return;
  }

  next();
};
