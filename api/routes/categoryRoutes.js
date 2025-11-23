/**
 * Category Routes
 * Definisi semua endpoint untuk categories
 */

const express = require("express");
const router = express.Router();
const { getAllCategories } = require("../controllers/categoryController");

// Public routes
router.get("/", getAllCategories);

module.exports = router;
