import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

const logger = isProd
  ? pino() // ✅ production: gunakan logger default (JSON, tidak pakai pino-pretty)
  : pino({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    });

export default logger;
