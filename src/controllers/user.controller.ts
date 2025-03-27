import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({
        status: true,
        statusCode: 201,
        message: "User created successfully",
        user,
      });
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

  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getUsers();
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success get all users",
        users,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          status: false,
          statusCode: 500,
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

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await UserService.getUserById(Number(req.params.id));
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success get user by id",
        user,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          status: false,
          statusCode: 404,
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

  static async updateUser(req: Request, res: Response) {
    try {
      const user = await UserService.updateUser(Number(req.params.id), req.body);
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "User updated successfully",
        user,
      });
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

  static async deleteUser(req: Request, res: Response) {
    try {
      await UserService.deleteUser(Number(req.params.id));
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "User deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          status: false,
          statusCode: 404,
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
