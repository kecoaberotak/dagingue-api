import { Request, Response } from "express";
import { uploadImage } from "../utils/uploadImage";
import { deleteImage } from "../utils/deleteImage";
import { BumbuService } from "../services/bumbu.service";
import logger from "../utils/logger";

export class BumbuController {
  static async getAll(req: Request, res: Response) {
    try {
      logger.info("GET /bumbu - getAll triggered");
      const data = await BumbuService.getAllBumbu();
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success get all bumbu",
        data,
      });
      return;
    } catch (error) {
      logger.error("GET /bumbu - Error: %s", error instanceof Error ? error.message : error);
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
    logger.info(`GET /bumbu/${id} - Get bumbu by ID`);

    try {
      const data = await BumbuService.getBumbuById(id);
      logger.info(`Success get bumbu by ID: ${id}`);
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success get bumbu by ID",
        data,
      });
      return;
    } catch (error) {
      logger.error(`Error get bumbu by ID ${id}: %s`, error instanceof Error ? error.message : "Unknown error");
      res.status(error instanceof Error ? 404 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 404 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }

  static async create(req: Request, res: Response) {
    logger.info("POST /bumbu - Create new bumbu");
    try {
      const { nama, deskripsi, harga } = req.body;

      // Validasi input
      if (!nama || !deskripsi || !harga) {
        logger.warn("Validation failed: Missing fields");
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Nama, deskripsi, dan harga wajib diisi",
        });
        return;
      }

      const trimmedNama = nama?.trim();
      const trimmedDeskripsi = deskripsi?.trim();

      if (trimmedNama === "" || trimmedDeskripsi === "") {
        logger.warn("Validation failed: Nama/Deskripsi kosong");
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Nama dan Deskripsi tidak boleh kosong",
        });
        return;
      }

      if (!/^\d+$/.test(harga)) {
        logger.warn("Validation failed: Harga bukan angka bulat");
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Harga harus berupa angka bulat tanpa desimal",
        });
        return;
      }

      // Validasi harga harus angka
      const parsedHarga = parseFloat(harga);
      if (isNaN(parsedHarga)) {
        logger.warn("Validation failed: Harga NaN");
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Harga harus berupa angka",
        });
        return;
      }

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

      // upload image
      const result = await uploadImage(file, "bumbu");

      if (result.error) {
        logger.error(`Upload image failed: ${result.error}`);
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: `Gagal mengunggah gambar ke server: ${result.error}`,
        });
        return;
      }

      // simpan data ke database
      const newBumbu = await BumbuService.createBumbu({
        nama,
        deskripsi,
        harga: parsedHarga,
        gambar: result.publicUrl!,
      });

      logger.info("Success create bumbu");
      res.status(201).json({
        status: true,
        statusCode: 201,
        message: "Bumbu berhasil ditambahkan",
        newBumbu,
      });
      return;
    } catch (error) {
      logger.error("Error create bumbu: %s", error instanceof Error ? error.message : "Unknown error");
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
    logger.info(`PUT /bumbu/${id} - Update bumbu`);

    try {
      const { nama, deskripsi, harga } = req.body;
      const file = req.file;

      // Ambil data lama dari database
      const oldBumbu = await BumbuService.getBumbuById(id);
      if (!oldBumbu) {
        logger.warn(`Bumbu not found for update: ${id}`);
        res.status(404).json({
          status: false,
          statusCode: 404,
          message: "Bumbu tidak ditemukan",
        });
        return;
      }

      const trimmedNama = nama !== undefined ? nama.trim() : undefined;
      const trimmedDeskripsi = deskripsi !== undefined ? deskripsi.trim() : undefined;

      if (trimmedNama !== undefined && trimmedNama === "") {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Nama tidak boleh kosong",
        });
        return;
      }

      if (trimmedDeskripsi !== undefined && trimmedDeskripsi === "") {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Deskripsi tidak boleh kosong",
        });
        return;
      }

      // Validasi harga agar tetap angka bulat
      let parsedHarga = oldBumbu.harga; // Default pakai harga lama

      if (harga !== undefined) {
        // Pastikan input hanya angka bulat (tanpa huruf, spasi, atau titik)
        if (!/^\d+$/.test(harga)) {
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Harga tidak valid, harus angka bulat tanpa karakter tambahan",
          });
          return;
        }

        const parsed = parseInt(harga, 10);
        if (isNaN(parsed) || parsed < 0) {
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Harga tidak valid",
          });
          return;
        }

        parsedHarga = parsed;
      }

      // Cek apakah ada gambar baru
      let newGambar = oldBumbu.gambar; // Default: pakai gambar lama
      if (file) {
        // Hapus gambar lama dari Supabase Storage (jika ada)
        if (oldBumbu.gambar) {
          const deleteResult = await deleteImage(oldBumbu.gambar);
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

        // Simpan gambar baru ke Supabase Storage
        const result = await uploadImage(file, "bumbu");

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

      // Update data baru di database
      const updatedBumbu = await BumbuService.updateBumbu(id, {
        nama: nama?.trim() || oldBumbu.nama,
        deskripsi: deskripsi?.trim() || oldBumbu.deskripsi,
        harga: parsedHarga,
        gambar: newGambar,
      });

      logger.info(`Success update bumbu: ${id}`);
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success update bumbu",
        updatedBumbu,
      });
      return;
    } catch (error) {
      logger.error(`Error update bumbu ${id}: %s`, error instanceof Error ? error.message : "Unknown error");
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
    logger.info(`DELETE /bumbu/${id} - Delete bumbu`);

    try {
      // Ambil data bumbu
      const bumbu = await BumbuService.getBumbuById(id);
      if (!bumbu) {
        logger.warn(`Bumbu not found for delete: ${id}`);
        res.status(404).json({
          status: false,
          statusCode: 404,
          message: "Bumbu tidak ditemukan",
        });
        return;
      }

      // Hapus gambar dari storage
      const imageUrl = bumbu.gambar;

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
      const message = await BumbuService.deleteBumbu(id);
      logger.info(`Success delete bumbu: ${id}`);
      res.status(200).json({
        status: true,
        statusCode: 200,
        message,
      });
      return;
    } catch (error) {
      logger.error(`Error delete bumbu ${id}: %s`, error instanceof Error ? error.message : "Unknown error");
      res.status(error instanceof Error ? 404 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 404 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }
}
