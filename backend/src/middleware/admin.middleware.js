import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const adminAuthMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Admin authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    if (payload.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const admin = await Admin.findById(payload.id).select("-password");
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid admin token" });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired admin token" });
  }
};
