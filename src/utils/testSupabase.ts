import { supabase } from "../config/supabase";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  const { data, error } = await supabase.from("users").select("*").limit(1);
  if (error) {
    console.error("Supabase connection failed:", error.message);
  } else {
    console.log("Supabase connected successfully! 🚀", data);
  }
}

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "daging@dagingue.com",
    password: "password123",
  });
  console.log("Test Login");
  console.log("access token: ", data.session?.access_token);

  const token = data.session?.access_token;

  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log(payload);
  } else {
    console.error("Token tidak ditemukan!");
  }

  // checkRole();
}

async function checkRole() {
  // const { data, error } = await supabase.rpc("role");
  // console.log("CHECK ROLE!");
  // console.log("data: ", data);
  // console.log("error: ", error);

  const { data, error } = await supabase.rpc("role").single();
  console.log("CHECK ROLE!");
  console.log("data: ", data);
  console.log("error: ", error);
}

async function checkServiceRole() {
  const tokenParts = process.env.SUPABASE_SERVICE_ROLE_KEY!.split(".");
  const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
  console.log(payload);
}

// testConnection();
// testLogin();
checkServiceRole();
