import express from "express";
import { getDashboardStats, createBatch } from "../controllers/adminController.js";

const router = express.Router();

/**
 * @route GET /api/admin/stats
 * @desc Get live dashboard statistics
 */
router.get("/stats", getDashboardStats);

/**
 * @route POST /api/admin/batches
 * @desc Create a new training batch
 */
router.post("/batches", createBatch);

export default router;
