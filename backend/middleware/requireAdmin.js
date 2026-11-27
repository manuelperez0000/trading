import { findUserById, isUserAdmin } from "../models/User.js";
import responser from "../utils/responser.js";

export default async function requireAdmin(req, res, next) {
  try {
    if (req.user?.role === "admin") {
      return next();
    }

    const adminUserIds = (process.env.ADMINS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (adminUserIds.includes(String(req.user?.id))) {
      return next();
    }

    if (req.user?.id) {
      const dbUser = await findUserById(req.user.id);
      if (dbUser && isUserAdmin(dbUser)) {
        return next();
      }
    }

    return responser.error({
      res,
      message: "No tienes permiso de administrador para realizar esta acción.",
      status: 403,
    });
  } catch (err) {
    return next(err);
  }
}
