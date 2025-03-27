import { AuthService } from "../services/auth.service";
import { Request, Response } from "express";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async signIn(req: Request, res: Response) {
    // Panggil authService.signIn
  }

  async signUp(req: Request, res: Response) {
    // Panggil authService.signUp
  }

  async signOut(req: Request, res: Response) {
    // Panggil authService.signOut
  }
}
