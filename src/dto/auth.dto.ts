import { IsEmail, IsString, MinLength } from "class-validator";

export class AuthDTO {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
