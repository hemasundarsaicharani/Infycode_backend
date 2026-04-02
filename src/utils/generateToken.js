import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export default generateToken;