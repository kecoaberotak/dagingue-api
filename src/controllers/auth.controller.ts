import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthDTO } from "../dto/auth.dto";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async signUp(req: Request, res: Response) {
    try {
      const dto = plainToInstance(AuthDTO, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({
          message: "Validasi gagal",
          errors: errors.map((err) => err.constraints),
        });
      }

      const result = await this.authService.signUp(dto);
      return res.status(201).json(result);
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

  async signIn(req: Request, res: Response) {
    try {
      const dto = plainToInstance(AuthDTO, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({
          message: "Validasi gagal",
          errors: errors.map((err) => err.constraints),
        });
      }

      const result = await this.authService.signIn(dto);
      return res.status(200).json(result);
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

  async signOut(req: Request, res: Response) {
    try {
      const result = await this.authService.signOut();
      return res.status(200).json(result);
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
