import db from "../config/firebaseAdmin.js";

const studentsRef = db.ref("students");
const adminsRef = db.ref("admins");

export const findUserByUsername = async (role, username) => {
  const ref = role === "admin" ? adminsRef : studentsRef;
  const snapshot = await ref
    .orderByChild("username")
    .equalTo(username)
    .once("value");

  if (!snapshot.exists()) return null;

  let userData;
  snapshot.forEach((child) => (userData = child.val()));
  return userData;
};

export const createStudent = async (studentData) => {
  const newUserRef = studentsRef.push();
  await newUserRef.set({
    ...studentData,
    role: "student",
    status: "Pending",
    createdAt: new Date().toISOString(),
  });
  return newUserRef.key;
};
