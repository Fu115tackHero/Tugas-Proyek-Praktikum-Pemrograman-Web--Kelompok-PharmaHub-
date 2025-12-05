/**
 * PharmaHub Backend API
 */
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      const isDev = (process.env.NODE_ENV || "development") !== "production";
      const envAllowed = (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "https://pharmahub.vercel.app",
        "https://tugas-proyek-praktikum-pemrograman-web--kelompok-pharmahub-.vercel.app",
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
        ...envAllowed,
      ].filter(Boolean);

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        (isDev && origin?.startsWith("http://localhost"))
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const router = require("./routes");
app.use("/api", router);

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
  });
});

module.exports = app;
