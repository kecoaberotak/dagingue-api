import { supabase } from "../config/supabase";
import { CreateLandingPageDTO, UpdateLandingPageDTO } from "../dto/landingPage.dto";

export class LandingPageService {
  static async getAllData() {
    const { data, error } = await supabase.from("landing_page").select("*");
    if (error) throw new Error(error.message);
    return data;
  }

  static async getDataByKey(key: string) {
    const { data, error } = await supabase.from("landing_page").select("*");
    if (error) throw new Error(error.message);
    return data;
  }

  static async createData(dto: CreateLandingPageDTO) {
    const { data, error } = await supabase.from("landing_page").insert([dto]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async updateData(key: string, dto: UpdateLandingPageDTO) {
    const { data, error } = await supabase.from("landing_page").update(dto).eq("key", key).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async deleteData(key: string) {
    const { error } = await supabase.from("landing_page").delete().eq("key", key);
    if (error) throw new Error(error.message);
    return { message: "Data deleted successfully" };
  }
}
