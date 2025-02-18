import { Router, Request, Response } from 'express';
import { authenticateToken, isAdmin } from '../middlewares/authMiddleware';
import { query } from '../config/database';

const router = Router();

// Route pour récupérer tous les clients et leurs projets (accessible uniquement à l'admin)
router.get('/', authenticateToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const clientsResult = await query('SELECT id, username FROM users');
    const clients = await Promise.all(clientsResult.map(async (client: any) => {
      const projectsResult = await query('SELECT id, name, description FROM projects WHERE user_id = $1', [client.id]);
      return { ...client, projects: projectsResult };
    }));

    res.json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients et de leurs projets:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
