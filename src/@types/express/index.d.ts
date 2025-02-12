import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
    userId: number;
    role: string;
}

declare module "express-serve-static-core" {
    interface Request {
        user?: CustomJwtPayload;
    }
}
