import { supabase } from "../config/supabase";

const deleteImage = async (imageUrl: string) => {
  // Ambil path setelah "/object/public/"
  const filePath = imageUrl.split("/object/public/")[1];

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

export { deleteImage };
