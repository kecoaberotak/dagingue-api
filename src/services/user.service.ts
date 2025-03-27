import { supabase } from "../config/supabase";
import { CreateUserDTO, UpdateUserDTO } from "../dto/user.dto";

export class UserService {
  static async createUser(data: CreateUserDTO) {
    const { data: user, error } = await supabase.from("users").insert([data]).select("*").single();
    if (error) throw new Error(error.message);
    return user;
  }

  static async getUsers() {
    const { data: users, error } = await supabase.from("users").select("*");
    if (error) throw new Error(error.message);
    return users;
  }

  static async getUserById(id: number) {
    const { data: user, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) throw new Error(error.message);
    return user;
  }

  static async updateUser(id: number, data: UpdateUserDTO) {
    const { data: updatedUser, error } = await supabase.from("users").update(data).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);
    return updatedUser;
  }

  static async deleteUser(id: number) {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { message: "User deleted succefully" };
  }
}
