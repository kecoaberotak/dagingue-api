import { supabase } from "../config/supabase";

// keduanya bikin throw new error

const deleteImage = async (imageUrl: string) => {
  // Ambil path setelah "/object/public/"
  const filePath = imageUrl.split("/object/public/dagingue-api/")[1];

  if (!filePath) {
    return {
      status: false,
      message: "File path tidak valid",
    };
  }

  // Hapus file di Supabase Storage
  const { error: deleteError } = await supabase.storage.from("dagingue-api").remove([filePath]);

  if (deleteError) {
    return {
      status: false,
      message: deleteError.message,
    };
  }

  return {
    status: true,
    message: "Success delete image",
  };
};

const deleteMultipleImage = async (imageUrls: string[]) => {
  const errors: string[] = [];

  for (const url of imageUrls) {
    const result = await deleteImage(url);
    if (!result.status) {
      errors.push(result.message);
    }
  }

  if (errors.length > 0) {
    return {
      status: false,
      error: errors.join("; "),
    };
  }

  return {
    status: true,
    message: "Semua gambar berhasil dihapus",
  };
};

export { deleteImage, deleteMultipleImage };
