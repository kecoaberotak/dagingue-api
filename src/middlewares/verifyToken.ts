import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader); // debug
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        status: false,
        statusCode: 401,
        message: "Token diperlukan untuk mengakses resource ini",
      });
    }

    const token = authHeader?.split(" ")[1];

    // Verify token pakai Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        status: false,
        statusCode: 401,
        message: "Token tidak valid atau sudah kedaluwarsa",
      });
    }

    // data user disimpan ke request
    req.user = data.user;
    next();
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan pada server",
    });
  }
};
