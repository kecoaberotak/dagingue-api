import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthDTO } from "../dto/auth.dto";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import logger from "../utils/logger";

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
    logger.info("AuthController: signUp - request received");
    try {
      const dto = plainToInstance(AuthDTO, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        logger.warn("AuthController: signUp - validation failed", {
          errors: errors.map((err) => err.constraints),
        });

        res.status(400).json({
          message: "Validasi gagal",
          errors: errors.map((err) => err.constraints),
        });
        return;
      }

      const result = await this.authService.signUp(dto);

      logger.info("AuthController: signUp - user created", { email: dto.email });

      res.status(201).json({ status: true, statusCode: 201, result });
    } catch (error) {
      logger.error("AuthController: signUp - error", { error });
      res.status(error instanceof Error ? 400 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 400 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    logger.info("AuthController: signIn - request received");

    try {
      const dto = plainToInstance(AuthDTO, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        logger.warn("AuthController: signIn - validation failed", {
          errors: errors.map((err) => err.constraints),
        });

        res.status(400).json({
          message: "Validasi gagal",
          errors: errors.map((err) => err.constraints),
        });
        return;
      }

      const result = await this.authService.signIn(dto);

      logger.info("AuthController: signIn - user signed in", { email: dto.email });

      res.status(200).json({ status: true, statusCode: 200, result });
    } catch (error) {
      logger.error("AuthController: signIn - error", { error });
      res.status(error instanceof Error ? 400 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 400 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }

  async signOut(req: Request, res: Response): Promise<void> {
    logger.info("AuthController: signOut - request received");

    try {
      const result = await this.authService.signOut();
      logger.info("AuthController: signOut - success");
      res.status(200).json({ status: true, statusCode: 200, result });
    } catch (error) {
      logger.error("AuthController: signOut - error", { error });
      res.status(error instanceof Error ? 400 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 400 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }
}
