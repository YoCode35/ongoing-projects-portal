// src/routes/users.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware';
import { query } from '../config/database';

const router = Router();

// Route pour récupérer tous les utilisateurs (accessible uniquement à l'admin)
router.get('/', authenticateToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await query('SELECT id, username, role FROM users');
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
