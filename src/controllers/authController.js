import * as authService from "../services/authService.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";

// ✅ STUDENT REGISTER
export const studentRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await authService.findUserByUsername("student", username);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    
    await authService.createStudent({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "Student registered successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ STUDENT LOGIN
export const studentLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const userData = await authService.findUserByUsername("student", username);

    if (!userData) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await comparePassword(password, userData.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(userData);

    res.json({
      message: "Student login successful",
      token,
      role: userData.role
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ADMIN LOGIN
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const userData = await authService.findUserByUsername("admin", username);

    if (!userData) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, userData.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(userData);

    res.json({
      message: "Admin login successful",
      token,
      role: userData.role
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};