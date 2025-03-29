import { supabase } from "../config/supabase";
import { AuthDTO } from "../dto/auth.dto";

export class AuthService {
  async signUp(data: AuthDTO) {
    // registrasi dengan Supabase
    const { email, password } = data;

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    return { message: "Registrasi berhasil, silakan cek email untuk verifikasi." };
  }

  async signIn(data: AuthDTO) {
    // authentifikasi dengan Supabase
    const { email, password } = data;

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    return {
      message: "Login Berhasil",
      token: signInData.session?.access_token,
      email: signInData.user?.email,
    };
  }

  async signOut() {
    // logika logout
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return { message: "Logout Berhasil" };
  }
}
