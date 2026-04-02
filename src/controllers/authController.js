import db from "../config/firebase.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

const studentsRef = db.ref("students");
const adminsRef = db.ref("admins");


// ✅ STUDENT REGISTER
export const studentRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const snapshot = await studentsRef
      .orderByChild("username")
      .equalTo(username)
      .once("value");

    if (snapshot.exists()) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserRef = studentsRef.push();

    await newUserRef.set({
      username,
      email,
      password: hashedPassword,
      role: "student",
      status: "Pending",
      createdAt: new Date().toISOString()
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

    const snapshot = await studentsRef
      .orderByChild("username")
      .equalTo(username)
      .once("value");

    if (!snapshot.exists()) {
      return res.status(400).json({ message: "Debug: User not found in database (Check exact spelling/case of username)" });
    }

    let userData;
    snapshot.forEach(child => userData = child.val());

    const isMatch = await bcrypt.compare(password, userData.password);
    const isPlainTextMatch = password === userData.password; // Fallback for manual Firebase plain-text entries

    if (!isMatch && !isPlainTextMatch) {
      return res.status(400).json({ message: "Debug: User found, but Password does not match" });
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

    const snapshot = await adminsRef
      .orderByChild("username")
      .equalTo(username)
      .once("value");

    if (!snapshot.exists()) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    let userData;
    snapshot.forEach(child => userData = child.val());

    const isMatch = await bcrypt.compare(password, userData.password);
    const isPlainTextMatch = password === userData.password; // Fallback for manual Firebase plain-text entries

    if (!isMatch && !isPlainTextMatch) {
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