import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send({ message: "Dagingue API is running! 🚀" });
// });

app.use("/api", routes);

export default app;
