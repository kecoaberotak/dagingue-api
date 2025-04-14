import { Response, Request } from "express";
import { uploadMultipleImage } from "../utils/uploadImage";
import { deleteMultipleImage } from "../utils/deleteImage";
import { LandingPageService } from "../services/landingPage.service";
import logger from "../utils/logger";

export class LandingPageController {
  static async getAll(req: Request, res: Response) {
    try {
      const data = await LandingPageService.getAllData();
      logger.info("Landing page data fetched successfully");
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Success get all data",
        data,
      });
      return;
    } catch (error) {
      logger.error({ err: error }, "Failed to fetch landing page data");
      res.status(500).json({
        status: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }

  static async create(req: Request, res: Response) {
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(req.body.data);
        logger.info(`Parsed landing page create data with ${parsedData.length} items`);
      } catch (error) {
        logger.warn("Invalid JSON in 'data' field during create");
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Invalid JSON format in 'data' field",
        });
        return;
      }

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        logger.warn("Empty or invalid data array on create");
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Data must be an array with at least one item",
        });
        return;
      }

      const processedData = [];

      const validKeys = ["logo_image", "hero_image", "img_1", "img_2", "banner_product", "banner_footer", "about_us", "social_whatsapp", "social_instagram", "social_shopee"];

      for (const item of parsedData) {
        const { key, value } = item;

        // pengecekan key dan value
        if (!key || value === undefined) {
          logger.warn("Missing key or value in one of the create items");
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Setiap item harus memiliki 'key' dan 'value'",
          });
          return;
        }

        if (!validKeys.includes(key)) {
          logger.warn(`Invalid key '${key}' on create`);
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: `Key '${key}' tidak valid`,
          });
          return;
        }

        const existingData = await LandingPageService.getDataByKey(key);
        if (existingData) {
          logger.warn(`Key '${key}' already exists on create`);
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: `Key '${key}' already exists`,
          });
          return;
        }

        let processedValue = value;

        if (req.files && Array.isArray(req.files)) {
          const matchedFiles = req.files.filter((file) => file.fieldname === key);

          if (matchedFiles.length > 0) {
            const uploadedImages = await uploadMultipleImage(matchedFiles, "landing_page");

            if (!uploadedImages.status) {
              logger.error({ err: uploadedImages.error }, `Image upload failed for key '${key}'`);
              res.status(400).json({
                status: false,
                statusCode: 400,
                message: uploadedImages.error || "Gagal mengupload gambar",
              });
              return;
            }

            processedValue = processedValue = uploadedImages.publicUrls?.[0] ?? ""; // ambil string URL-nya langsung
          }
        }

        const newData = await LandingPageService.createData({ key, value: processedValue });
        logger.info(`Landing page data created for key '${key}'`);
        processedData.push(newData);
      }

      logger.info("Landing page data creation successful");
      res.status(201).json({
        status: true,
        statusCode: 201,
        message: "Data berhasil ditambahkan",
        processedData,
      });
      return;
    } catch (error) {
      logger.error({ err: error }, "Unexpected error during landing page create");
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
      let parsedData;
      try {
        parsedData = JSON.parse(req.body.data);
        logger.info(`Parsed landing page update data with ${parsedData.length} items`);
      } catch (error) {
        logger.warn("Invalid JSON in 'data' field during update");
        res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Invalid JSON format in 'data' field",
        });
        return;
      }

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        logger.warn("Empty or invalid data array on update");
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

      for (const item of parsedData) {
        const { key, value } = item;

        // validasi  key dan value
        if (!key || value === undefined) {
          logger.warn("Missing key or value in one of the update items");
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: "Setiap item harus memiliki 'key' dan 'value ",
          });
          return;
        }

        if (!validKeys.includes(key)) {
          logger.warn(`Invalid key '${key}' on update`);
          res.status(400).json({
            status: false,
            statusCode: 400,
            message: `Key '${key}' tidak valid`,
          });
          return;
        }

        const existingData = await LandingPageService.getDataByKey(key);
        if (!existingData) {
          logger.warn(`Data with key '${key}' not found for update`);
          res.status(404).json({
            status: false,
            statusCode: 404,
            message: `Data dengan key '${key}' tidak ditemukan`,
          });
          return;
        }

        // default
        let processedValue = value;

        if (req.files && Array.isArray(req.files)) {
          const matchedFiles = req.files.filter((file) => file.fieldname === key);

          if (matchedFiles.length > 0 && imageKeys.includes(key)) {
            // Hapus gambar lama jika ada
            try {
              let oldUrls: string[] = [];

              try {
                const parsed = JSON.parse(existingData.value);
                oldUrls = Array.isArray(parsed) ? parsed : [parsed]; // kalau dia string, masukin ke array
              } catch (error) {
                oldUrls = [existingData.value]; // fallback kalau parse gagal
              }

              const deleteResult = await deleteMultipleImage(oldUrls);

              if (!deleteResult.status) {
                logger.error({ err: deleteResult.error }, `Failed to delete old image for key '${key}'`);
                res.status(400).json({
                  status: false,
                  statusCode: 400,
                  message: deleteResult.error || "Gagal menghapus gambar lama",
                });
                return;
              }
              logger.info(`Old image deleted for key '${key}'`);
            } catch (error) {
              logger.error({ err: error }, "Error parsing existing image URLs");
              res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Error parsing existing image URLs:",
                error,
              });
              return;
            }

            // Upload gambar baru
            const uploadedImages = await uploadMultipleImage(matchedFiles, "landing_page");

            if (!uploadedImages.status || !uploadedImages.publicUrls || uploadedImages.publicUrls.length === 0) {
              logger.error({ err: uploadedImages.error }, `Image upload failed for key '${key}'`);
              res.status(400).json({
                status: false,
                statusCode: 400,
                message: uploadedImages.error || "Gagal mengupload gambar",
              });
              return;
            }

            // Ambil hanya 1 URL pertama (karena 1 file untuk 1 key)
            processedValue = uploadedImages.publicUrls[0];
          }
        }

        // Update data
        const updatedData = await LandingPageService.updateData(key, { value: processedValue });
        logger.info(`Landing page data updated for key '${key}'`);
        processedData.push(updatedData);
      }
      logger.info("Landing page data update successful");
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Data berhasil diperbarui",
        processedData,
      });
      return;
    } catch (error) {
      logger.error({ err: error }, "Unexpected error during landing page update");
      res.status(error instanceof Error ? 400 : 500).json({
        status: false,
        statusCode: error instanceof Error ? 400 : 500,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
      return;
    }
  }
}
