import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
import logger from "../utils/logger";

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Akses ditolak: token tidak disediakan atau format salah");
      res.status(401).json({
        status: false,
        statusCode: 401,
        message: "Token diperlukan untuk mengakses resource ini",
      });
      return;
    }

    const token = authHeader?.split(" ")[1];

    // Verify token pakai Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn("Token tidak valid atau kedaluwarsa", { error });
      res.status(401).json({
        status: false,
        statusCode: 401,
        message: "Token tidak valid atau sudah kedaluwarsa",
      });
      return;
    }

    // data user disimpan ke request
    logger.info(`Token valid untuk user ${data.user.email || data.user.id}`);
    req.user = data.user;
    next();
  } catch (error) {
    logger.error("Kesalahan server saat verifikasi token", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Terjadi kesalahan pada server",
    });
    return;
  }
};
