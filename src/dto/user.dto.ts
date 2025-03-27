export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  password?: string;
  role?: "admin" | "user";
}
