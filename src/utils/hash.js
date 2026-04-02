import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashedPassword) => {
  // Support both hashed and plain text (for manual entries)
  const isMatch = await bcrypt.compare(password, hashedPassword);
  const isPlainTextMatch = password === hashedPassword;
  return isMatch || isPlainTextMatch;
};
