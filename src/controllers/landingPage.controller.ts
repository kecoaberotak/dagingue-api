import { Response, Request } from "express";
import { uploadImage, uploadMultipleImage } from "../utils/uploadImage";
import { deleteImage, deleteMultipleImage } from "../utils/deleteImage";
import { LandingPageService } from "../services/landingPage.service";

export class LandingPageController {
  static async getAll(req: Request, res: Response) {
    try {
      const data = await LandingPageService.getAllData();
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success get all data",
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

  static async getByKey(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const data = await LandingPageService.getDataByKey(key);
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: `Succes get data for: ${key}`,
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
      const { data } = req.body;

      if (!Array.isArray(data) || data.length === 0) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Data must be an array with at least one item",
        });
        return;
      }

      const processedData = [];

      const validKeys = ["logo_image", "hero_image", "img_1", "img_2", "banner_product", "banner_footer", "about_us", "social_whatsapp", "social_instagram", "social_shopee"];

      for (const item of data) {
        const { key, value } = item;

        // pengecekan key dan value
        if (!key || value === undefined) {
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Setiap item harus memiliki 'key' dan 'value'",
          });
          return;
        }

        if (!validKeys.includes(key)) {
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: `Key '${key}' tidak valid`,
          });
          return;
        }

        const existingData = await LandingPageService.getDataByKey(key);
        if (existingData) {
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: `Key '${key}' already exists`,
          });
          return;
        }

        let processedValue = value;

        if (req.files && (req.files as any)[key]) {
          const uploadedImages = await uploadMultipleImage((req.files as any)[key], "landing_page");

          if (!uploadedImages.status) {
            res.status(400).json({
              status: false,
              statusCode: 400,
              message: uploadedImages.error || "Gagal mengupload gambar",
            });
            return;
          }

          processedValue = JSON.stringify(uploadedImages.publicUrls);
        }

        const newData = await LandingPageService.createData({ key, value: processedValue });
        processedData.push(newData);
      }

      res.status(201).json({
        status: true,
        statusCode: 201,
        message: "Data berhasil ditambahkan",
        processedData,
      });
      return;
    } catch (error) {
      res.status(error instanceof Error ? 400 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 400 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const { data } = req.body;

      if (!Array.isArray(data) || data.length === 0) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Data must be an array with at least one item",
        });
        return;
      }

      const processedData = [];
      const validKeys = ["logo_image", "hero_image", "img_1", "img_2", "banner_product", "banner_footer", "about_us", "social_whatsapp", "social_instagram", "social_shopee"];
      const imageKeys = ["logo_image", "hero_image", "img_1", "img_2", "banner_product", "banner_footer"];

      for (const item of data) {
        const { key, value } = item;

        // validasi  key dan value
        if (!key || value === undefined) {
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Setiap item harus memiliki 'key' dan 'value ",
          });
          return;
        }

        if (!validKeys.includes(key)) {
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: `Key '${key}' tidak valid`,
          });
          return;
        }

        const existingData = await LandingPageService.getDataByKey(key);
        if (!existingData) {
          res.status(404).json({
            status: false,
            statusCode: 404,
            message: `Data dengan key '${key}' tidak ditemukan`,
          });
          return;
        }

        // default
        let processedValue = value;

        // jika ada file baru, hapus gambar lama dari storage sebelum update
        if (req.files && (req.files as any)[key]) {
          if (imageKeys.includes(key) && (existingData as any).value) {
            try {
              const oldImages = JSON.parse((existingData as any).value);
              await deleteImage(oldImages);
            } catch (error) {
              console.error("Error parsing existing image URLs:", error);
            }
          }
          // Upload gambar baru
          const uploadedImages = await uploadMultipleImage((req.files as any)[key], "landing_page");
          if (!uploadedImages.status) {
            res.status(400).json({
              status: false,
              statusCode: 400,
              message: uploadedImages.error || "Gagal mengupload gambar",
            });
            return;
          }

          processedValue = JSON.stringify(uploadedImages.publicUrls);
        }

        // Update data
        const updatedData = await LandingPageService.updateData(key, processedValue);
        processedData.push(updatedData);
      }
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Data berhasil diperbarui",
        processedData,
      });
      return;
    } catch (error) {
      res.status(error instanceof Error ? 400 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 400 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { key } = req.params;

      if (!key) {
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Key harus disertakan dalam parameter",
        });
        return;
      }

      const existingData = await LandingPageService.getDataByKey(key);

      if (!existingData) {
        res.status(404).json({
          status: false,
          statusCode: 404,
          message: `Data dengan key '${key}' tidak ditemukan`,
        });
        return;
      }

      const imageKeys = ["logo_image", "hero_image", "img_1", "img_2", "banner_product", "banner_footer"];

      if (imageKeys.includes(key) && (existingData as any).value) {
        try {
          const oldImages = JSON.parse((existingData as any).value);
          const deleteResult = await deleteMultipleImage(oldImages);

          if (!deleteResult.status) {
            res.status(400).json({
              status: false,
              statusCode: 400,
              message: deleteResult.error || "Gagal menghapus gambar",
            });
            return;
          }
        } catch (error) {
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Error parsing or deleting images:",
            error,
          });
          return;
        }
      }

      await LandingPageService.deleteData(key);

      res.status(200).json({
        status: true,
        statusCode: 200,
        message: `Data dengan key '${key}' berhasil dihapus`,
      });
    } catch (error) {
      res.status(error instanceof Error ? 400 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 400 : 500,
        message: error instanceof Error ? error.message : "Terjadi kesalahan server",
      });
    }
  }
}
