import { Request, Response } from "express";
import { BumbuService } from "../services/bumbu.service";
import { supabase } from "../config/supabase";

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
      const data = await BumbuService.getBumbuById(id);
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
      const { nama, deskripsi, harga } = req.body;

      // Validasi input
      if (!nama || !deskripsi || !harga) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Nama, deskripsi, dan harga wajib diisi",
        });
        return;
      }

      if (!/^\d+$/.test(harga)) {
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
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Harga harus berupa angka",
        });
        return;
      }

      const file = req.file;

      if (!file) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Gambar wajib diunggah",
        });
        return;
      }

      // Validasi ekstensi file
      const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
      const fileExtension = file.originalname.split(".").pop()?.toLowerCase();

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Format file tidak valid. Hanya diperbolehkan jpg, jpeg, png, webp",
        });
        return;
      }

      // simpan file gambar ke Supabase Storage
      const filename = `bumbu/${Date.now()}-${file.originalname}`;
      const { error: uploadError } = await supabase.storage.from("dagingue-api").upload(filename, file.buffer, { contentType: file.mimetype });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // dapatkan url gambar
      const { data } = supabase.storage.from("dagingue-api").getPublicUrl(filename);

      // simpan data ke database
      const newBumbu = await BumbuService.createBumbu({
        nama,
        deskripsi,
        harga: parsedHarga,
        gambar: data.publicUrl,
      });

      res.status(201).json({
        status: true,
        statusCode: 201,
        message: "Bumbu berhasil ditambahkan",
        newBumbu,
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
      const data = await BumbuService.updateBumbu(id, req.body);
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
      const message = await BumbuService.deleteBumbu(id);
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
