import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import jwt from 'jsonwebtoken';

const router = Router();

// Route de connexion
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).send('Identifiant et/ou mot de passe requis');
    return;
  }

  try {
    const result = await query('SELECT id, username, password, role FROM users WHERE username = $1', [username]);

    if (result.length === 0) {
      res.status(404).send('Identifiant et/ou mot de passe incorrecte');
      return;
    }

    const user = result[0];

    if (user.password !== password) {
      res.status(401).send('Identifiant et/ou mot de passe incorrecte');
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    res.status(200).send({
      message: 'Connexion réussie',
      token,
    });
  } catch (err) {
    console.error('Erreur lors de la connexion', err);
    res.status(500).send('Erreur lors de la connexion');
  }
});

export default router;
