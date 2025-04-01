import { supabase } from "../config/supabase";
import { CreatePotongDTO, UpdatePotongDTO } from "../dto/potong.dto";

export class PotongService {
  static async getAllPotong() {
    const { data, error } = await supabase.from("potong").select("*");
    if (error) throw new Error(error.message);
    return data;
  }

  static async getPotongById(id: string) {
    const { data, error } = await supabase.from("potong").select("*").eq("id", id).single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async createPotong(payload: CreatePotongDTO) {
    const { data, error } = await supabase.from("potong").insert(payload).select("*").single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async updatePotong(id: string, payload: UpdatePotongDTO) {
    const { data: existingData } = await supabase.from("potong").select("id").eq("id", id).single();
    if (!existingData) {
      throw new Error("Data potong tidak ditemukan");
    }

    const { data, error } = await supabase.from("potong").update(payload).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async deletePotong(id: string) {
    const { data: existingData } = await supabase.from("potong").select("id").eq("id", id).single();
    if (!existingData) throw new Error("Data potong tidak ditemukan");

    const { error } = await supabase.from("potong").delete().eq("id", id);
    if (error) throw new Error(error.message);

    return { message: "Potong berhasil dihapus" };
  }
}
