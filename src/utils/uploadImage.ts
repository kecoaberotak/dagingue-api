import { supabase } from "../config/supabase";

export const uploadImage = async (file: Express.Multer.File, folderName: string): Promise<{ status: boolean; publicUrl?: string; error?: string }> => {
  if (!file.buffer) {
    return {
      status: false,
      error: "File tidak valid atau corrupt",
    };
  }

  // Validasi ekstensi file
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

  const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return {
      status: false,
      error: "Format file tidak valid. Hanya diperbolehkan jpg, jpeg, png, webp",
    };
  }

  // simpan ke storage
  const filename = `${folderName}/${Date.now()}-${file.originalname}`;
  const { error: uploadError } = await supabase.storage.from("dagingue-api").upload(filename, file.buffer, { contentType: file.mimetype });

  if (uploadError) {
    return {
      status: false,
      error: uploadError.message,
    };
  }

  const { data } = supabase.storage.from("dagingue-api").getPublicUrl(filename);
  return {
    status: true,
    publicUrl: data.publicUrl,
  };
};

export const uploadMultipleImage = async (files: Express.Multer.File[], folderName: string): Promise<{ status: boolean; publicUrls?: string[]; error?: string }> => {
  const uploadedUrls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await uploadImage(file, folderName);
    if (result.status && result.publicUrl) {
      uploadedUrls.push(result.publicUrl);
    } else {
      // Jika ada satu saja yang gagal, langsung return error
      return {
        status: false,
        error: `Gagal mengupload gambar ${file.originalname}`,
      };
    }
  }

  return {
    status: true,
    publicUrls: uploadedUrls,
  };
};
