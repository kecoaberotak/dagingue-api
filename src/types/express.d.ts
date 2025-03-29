import { Request } from "express";

declare module "express" {
  interface Request {
    user?: any; // Bisa diganti `user?: { id: string; email: string }` sesuai kebutuhan
  }
}
