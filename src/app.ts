import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import cors from "cors";
import { query } from "./database";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Définition du type pour le payload JWT
interface CustomJwtPayload extends JwtPayload {
  userId: number;
  role: string;
}

// Middleware de vérification du token JWT
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Récupère le token de l'en-tête Authorization
  const token = req.header("Authorization")?.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    res.status(401).json({ message: "Utilisateur non authentifié" });
    return;
  }

  // Débogage : afficher le token
  console.log("Token reçu:", token);

  // Vérifie et décode le token
  jwt.verify(token, "your_jwt_secret", (err, decoded) => {
    if (err) {
      console.error("Erreur lors de la vérification du token:", err);
      res.status(403).json({ message: "Token invalide" });
      return;
    }

    // Décode le token et récupère l'utilisateur
    const user = decoded as CustomJwtPayload;
    req.user = user;

    // Débogage : afficher l'utilisateur et son rôle
    console.log("Utilisateur authentifié:", user);

    next();
  });
};


// Middleware pour vérifier le rôle d'admin
const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user;

  // Débogage : afficher le rôle de l'utilisateur
  console.log("Rôle de l'utilisateur:", user?.role);

  if (user?.role !== 'admin') {
    res.status(403).json({ message: "Accès interdit, seuls les administrateurs peuvent accéder à cette route." });
    return;
  }

  next();
};

// Route pour récupérer tous les utilisateurs (accessible uniquement à l'admin)
app.get("/users", authenticateToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await query("SELECT id, username, role FROM users");
    res.json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route de connexion
app.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).send("Username et password sont requis");
    return;
  }

  try {
    const result = await query("SELECT id, username, password, role FROM users WHERE username = $1", [username]);

    if (result.length === 0) {
      res.status(404).send("Utilisateur non trouvé");
      return;
    }

    const user = result[0];

    if (user.password !== password) {
      res.status(401).send("Mot de passe incorrect");
      return;
    }

    // Création du token à ce moment
    const token = jwt.sign({ userId: user.id, role: user.role }, "your_jwt_secret", { expiresIn: "1h" });

    res.status(200).send({
      message: "Connexion réussie",
      token,
    });
  } catch (err) {
    console.error("Erreur lors de la connexion", err);
    res.status(500).send("Erreur lors de la connexion");
  }
});

// Route pour récupérer tous les clients et leurs projets (accessible uniquement à l'admin)
app.get('/admin/clients', authenticateToken, isAdmin, async (req: Request, res: Response): Promise<void> => {
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

// Route de profil, accessible à tous les utilisateurs authentifiés
app.get('/dashboard', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;  // Récupère le rôle de l'utilisateur

  if (!userId) {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
    return;
  }

  console.log('Rôle de l\'utilisateur dans la route dashboard:', userRole);  // Log du rôle ici

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

// Lancer le serveur sur le port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});
