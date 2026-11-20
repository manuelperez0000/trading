import responser from "../utils/responser.js";

export default function requireAdmin(req, res, next) {
  const adminUserIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (
    adminUserIds.length === 0 ||
    adminUserIds.some((id) => !/^\d+$/.test(id))
  ) {
    return next(
      new Error("ADMIN_USER_IDS must be a comma-separated list of user IDs"),
    );
  }

  if (!adminUserIds.includes(req.user.id)) {
    return responser.error({
      res,
      message: "No tienes permiso para listar usuarios.",
      status: 403,
    });
  }

  return next();
}
