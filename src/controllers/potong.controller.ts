import { Response, Request } from "express";
import { uploadImage } from "../utils/uploadImage";
import { deleteImage } from "../utils/deleteImage";
import { PotongService } from "../services/potong.service";

export class PotongController {
  static async getAll(req: Request, res: Response) {
    try {
      const data = await PotongService.getAllPotong();
      res.status(200).json({
        status: 200,
        statusCode: 200,
        message: "Success get all potong",
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
      const data = await PotongService.getPotongById(id);
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success get potong by ID",
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
      const { nama, berat } = req.body;

      // Validasi input
      if (!nama || !berat) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Nama, dan berat wajib diisi",
        });
        return;
      }

      const trimmedNama = nama?.trim();
      const trimmedBerat = berat?.trim();

      if (trimmedNama === "") {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Nama tidak boleh kosong",
        });
        return;
      }

      if (trimmedBerat === "") {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Berat tidak boleh kosong",
        });
        return;
      }

      // upload image
      const file = req.file;

      if (!file) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Gambar wajib diunggah",
        });
        return;
      }

      const result = await uploadImage(file, "potong");
      if (result.error) {
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

      res.status(201).json({
        status: true,
        statusCode: 201,
        message: "Potong berhasil ditambahkan",
        newPotong,
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
      const { nama, berat } = req.body;
      const file = req.file;

      // Ambil data lama dari database
      const oldPotong = await PotongService.getPotongById(id);
      if (!oldPotong) {
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

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success update potong",
        updatePotong,
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

      // Get Potong
      const potong = await PotongService.getPotongById(id);
      if (!potong) {
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
        res.status(500).json({
          status: false,
          statusCode: 500,
          message: `Gagal menghapus gambar dari storage: ${result.message}`,
        });
        return;
      }

      // Hapus dari database
      const message = await PotongService.deletePotong(id);
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
