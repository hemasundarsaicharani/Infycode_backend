import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173", // Local frontend development
  "http://localhost:3000", // Fallback local port
  process.env.FRONTEND_URL // Vercel deployment URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // For cookies/authorization headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to InfyCode Template Backend...");
});
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);

export default app;
