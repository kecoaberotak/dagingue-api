import { Request, Response } from "express";
import { BumbuService } from "../services/bumbu.service";

export class BumbuController {
  static async getAll(req: Request, res: Response) {
    try {
      const data = await BumbuService.getAllBumbu();
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success get all bumbu",
        data,
      });
      return;
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: error.message,
        });
        return;
      } else {
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: "An unknown error occurred",
        });
        return;
      }
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await BumbuService.getBumbuById(Number(id));
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success get bumbu by ID",
        data,
      });
      return;
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          status: false,
          statusCode: 404,
          message: error.message,
        });
        return;
      } else {
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: "An unknown error occurred",
        });
        return;
      }
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = await BumbuService.createBumbu(req.body);
      res.status(201).json({
        status: true,
        statusCode: 201,
        message: "Success create bumbu",
        data,
      });
      return;
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: error.message,
        });
        return;
      } else {
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: "An unknown error occurred",
        });
        return;
      }
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await BumbuService.updateBumbu(Number(id), req.body);
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success create bumbu",
        data,
      });
      return;
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: error.message,
        });
        return;
      } else {
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: "An unknown error occurred",
        });
        return;
      }
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const message = await BumbuService.deleteBumbu(Number(id));
      res.status(200).json({
        status: true,
        statusCode: 200,
        message,
      });
      return;
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          status: false,
          statusCode: 404,
          message: error.message,
        });
        return;
      } else {
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: "An unknown error occurred",
        });
        return;
      }
    }
  }
}
