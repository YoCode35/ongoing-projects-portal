import { JwtPayload } from "jsonwebtoken";

console.log("Fichier express.d.ts chargé");

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { userId: number; role: string };
    }
  }
}
