import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthDTO } from "../dto/auth.dto";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();

    // Bind metode agar tetap dalam konteks instance class
    this.signUp = this.signUp.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToInstance(AuthDTO, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          message: "Validasi gagal",
          errors: errors.map((err) => err.constraints),
        });
      }

      const result = await this.authService.signUp(dto);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: "An unknown error occurred",
        });
      }
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToInstance(AuthDTO, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          message: "Validasi gagal",
          errors: errors.map((err) => err.constraints),
        });
      }

      const result = await this.authService.signIn(dto);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: "An unknown error occurred",
        });
      }
    }
  }

  async signOut(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authService.signOut();
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: error.message,
        });
      } else {
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: "An unknown error occurred",
        });
      }
    }
  }
}
