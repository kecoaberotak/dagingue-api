import { supabase } from "../config/supabase";
import { CreateBumbuDTO, UpdateBumbuDTO } from "../dto/bumbu.dto";

export class BumbuService {
  static async getAllBumbu() {
    const { data, error } = await supabase.from("bumbu").select("*");
    if (error) throw new Error(error.message);
    return data;
  }

  static async getBumbuById(id: string) {
    const { data, error } = await supabase.from("bumbu").select("*").eq("id", id).single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async createBumbu(payload: CreateBumbuDTO) {
    const { data, error } = await supabase.from("bumbu").insert(payload).select("*").single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async updateBumbu(id: string, payload: UpdateBumbuDTO) {
    const { data: existingData } = await supabase.from("bumbu").select("id").eq("id", id).single();
    if (!existingData) {
      throw new Error("Data bumbu tidak ditemukan");
    }

    const { data, error } = await supabase.from("bumbu").update(payload).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async deleteBumbu(id: string) {
    const { data: existingData } = await supabase.from("bumbu").select("id").eq("id", id).single();
    if (!existingData) {
      throw new Error("Data bumbu tidak ditemukan");
    }

    const { error } = await supabase.from("bumbu").delete().eq("id", id);
    if (error) throw new Error(error.message);

    return { message: "Bumbu berhasil dihapus" };
  }
}
