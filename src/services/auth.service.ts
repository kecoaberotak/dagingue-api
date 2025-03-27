import { AuthDTO } from "../dto/auth.dto";

export class AuthService {
  async signIn(dto: AuthDTO) {
    // authentifikasi dengan Supabase
  }

  async signUp(dto: AuthDTO) {
    // registrasi dengan Supabase
  }

  async signOut() {
    // logika logout
  }
}
