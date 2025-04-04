import { Request, Response } from "express";
import { uploadImage } from "../utils/uploadImage";
import { deleteImage } from "../utils/deleteImage";
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

      const trimmedNama = nama?.trim();
      const trimmedDeskripsi = deskripsi?.trim();

      if (trimmedNama === "") {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Nama tidak boleh kosong",
        });
        return;
      }

      if (trimmedDeskripsi === "") {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Deskripsi tidak boleh kosong",
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

      // upload image
      const result = await uploadImage(file, "bumbu");

      if (result.error) {
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
      const { nama, deskripsi, harga } = req.body;
      const file = req.file;

      // Ambil data lama dari database
      const oldBumbu = await BumbuService.getBumbuById(id);
      if (!oldBumbu) {
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

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success update bumbu",
        updatedBumbu,
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

      // Ambil data bumbu
      const bumbu = await BumbuService.getBumbuById(id);
      if (!bumbu) {
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
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: `Gagal menghapus gambar dari storage: ${result.message}`,
        });
        return;
      }

      // Hapus dari database
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
