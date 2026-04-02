import express from "express";
const router = express.Router();

import {
  studentRegister,
  studentLogin,
  adminLogin
} from "../controllers/authController.js";

import {
  verifyToken,
  isAdmin,
  isStudent
} from "../middlewares/authMiddleware.js";

// STUDENT
router.post("/student/register", studentRegister);
router.post("/student/login", studentLogin);

// ADMIN
router.post("/admin/login", adminLogin);

// DASHBOARDS
router.get("/student/dashboard", verifyToken, isStudent, (req, res) => {
  res.json({ message: "Welcome Student Dashboard" });
});

router.get("/admin/dashboard", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin Dashboard" });
});

export default router;