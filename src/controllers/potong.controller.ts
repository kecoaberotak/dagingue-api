import { Response, Request } from "express";
import { uploadImage } from "../utils/uploadImage";
import { deleteImage } from "../utils/deleteImage";
import { PotongService } from "../services/potong.service";
import logger from "../utils/logger";

export class PotongController {
  static async getAll(req: Request, res: Response) {
    try {
      logger.info("GET /potong - getAll triggered");
      const data = await PotongService.getAllPotong();
      res.status(200).json({
        status: 200,
        statusCode: 200,
        message: "Success get all potong",
        data,
      });
      return;
    } catch (error) {
      logger.error("GET /potong - Error: %s", error instanceof Error ? error.message : error);
      res.status(500).json({
        status: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    logger.info(`GET /potong/${id} - Get potong by ID`);

    try {
      const data = await PotongService.getPotongById(id);
      logger.info(`Success get potong by ID: ${id}`);
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success get potong by ID",
        data,
      });
      return;
    } catch (error) {
      logger.error(`Error get potong by ID ${id}: %s`, error instanceof Error ? error.message : "Unknown error");
      res.status(error instanceof Error ? 404 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 404 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }

  static async create(req: Request, res: Response) {
    logger.info("POST /potong - Create new potong");
    try {
      const { nama, berat } = req.body;

      // Validasi input
      if (!nama || !berat) {
        logger.warn("Validation failed: Missing fields");
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Nama, dan berat wajib diisi",
        });
        return;
      }

      const trimmedNama = nama?.trim();
      const trimmedBerat = berat?.trim();

      if (trimmedNama === "" || trimmedBerat === "") {
        logger.warn("Validation failed: Nama/Berat kosong");
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Nama dan Berat tidak boleh kosong",
        });
        return;
      }

      // upload image
      const file = req.file;

      if (!file) {
        logger.warn("No image uploaded");
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Gambar wajib diunggah",
        });
        return;
      }

      const result = await uploadImage(file, "potong");
      if (result.error) {
        logger.error(`Upload image failed: ${result.error}`);
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: `Gagal mengunggah gambar ke server: ${result.error}`,
        });
        return;
      }

      // simpan ke database
      const newPotong = await PotongService.createPotong({
        nama,
        berat,
        gambar: result.publicUrl!,
      });

      logger.info("Success create potong");
      res.status(201).json({
        status: true,
        statusCode: 201,
        message: "Potong berhasil ditambahkan",
        newPotong,
      });
      return;
    } catch (error) {
      logger.error("Error create potong: %s", error instanceof Error ? error.message : "Unknown error");
      res.status(error instanceof Error ? 400 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 400 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    logger.info(`PUT /potong/${id} - Update potong`);

    try {
      const { nama, berat } = req.body;
      const file = req.file;

      // Ambil data lama dari database
      const oldPotong = await PotongService.getPotongById(id);
      if (!oldPotong) {
        logger.warn(`Potong not found for update: ${id}`);
        res.status(404).json({
          status: false,
          statusCode: 404,
          message: "Potong tidak ditemukan",
        });
        return;
      }

      const trimmedNama = nama !== undefined ? nama.trim() : undefined;
      const trimmedBerat = berat !== undefined ? berat.trim() : undefined;

      if (trimmedNama !== undefined && trimmedNama === "") {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Nama tidak boleh kosong",
        });
        return;
      }

      if (trimmedBerat !== undefined && trimmedBerat === "") {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Berat tidak boleh kosong",
        });
        return;
      }

      // cek apakah ada gambar baru
      let newGambar = oldPotong.gambar;
      if (file) {
        if (oldPotong.gambar) {
          const deleteResult = await deleteImage(oldPotong.gambar);
          if (!deleteResult.status) {
            logger.error(`Failed to delete old image: ${deleteResult.message}`);
            res.status(500).json({
              status: false,
              statusCode: 500,
              message: `Gagal menghapus gambar dari storage: ${deleteResult.message}`,
            });
            return;
          }
        }

        // simpan gambar baru ke Supabase storage
        const result = await uploadImage(file, "potong");

        if (result.error) {
          logger.error(`Failed to upload new image: ${result.error}`);
          res.status(500).json({
            status: false,
            statusCode: 500,
            message: `Gagal mengunggah gambar ke server: ${result.error}`,
          });
          return;
        }

        // Url gambar baru
        newGambar = result.publicUrl;
      }

      // Update database
      const updatePotong = await PotongService.updatePotong(id, {
        nama: nama?.trim() || oldPotong.nama,
        berat: berat?.trim() || oldPotong.berat,
        gambar: newGambar,
      });

      logger.info(`Success update potong: ${id}`);
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success update potong",
        updatePotong,
      });
      return;
    } catch (error) {
      logger.error(`Error update potong ${id}: %s`, error instanceof Error ? error.message : "Unknown error");
      res.status(error instanceof Error ? 400 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 400 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    logger.info(`DELETE /potong/${id} - Delete potong`);

    try {
      // Get Potong
      const potong = await PotongService.getPotongById(id);
      if (!potong) {
        logger.warn(`Potong not found for delete: ${id}`);
        res.status(404).json({
          status: false,
          statusCode: 404,
          message: "Potong tidak ditemukan",
        });
        return;
      }

      // Hapus gambar dari storage
      const imageUrl = potong.gambar;

      const result = await deleteImage(imageUrl);
      if (!result.status) {
        logger.error(`Failed to delete image: ${result.message}`);
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: `Gagal menghapus gambar dari storage: ${result.message}`,
        });
        return;
      }

      // Hapus dari database
      const message = await PotongService.deletePotong(id);
      logger.info(`Success delete potong: ${id}`);
      res.status(200).json({
        status: true,
        statusCode: 200,
        message,
      });
      return;
    } catch (error) {
      logger.error(`Error delete potong ${id}: %s`, error instanceof Error ? error.message : "Unknown error");
      res.status(error instanceof Error ? 404 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 404 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }
}
