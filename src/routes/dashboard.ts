// src/routes/dashboard.ts
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import { query } from '../config/database';

const router = Router();

// Route de profil, accessible à tous les utilisateurs authentifiés
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
    return;
  }

  console.log('Rôle de l\'utilisateur dans la route dashboard:', userRole);

  try {
    const userResult = await query('SELECT username, role FROM users WHERE id = $1', [userId]);
    const user = userResult[0];

    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    const projectsResult = await query('SELECT id, name, description FROM projects WHERE user_id = $1', [userId]);
    const projects = projectsResult;

    res.json({ ...user, projects });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
