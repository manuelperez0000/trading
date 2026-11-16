export default function errorManager(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === "23505") {
    return res.status(409).json({ message: "Ya existe una cuenta con ese correo." });
  }

  if (error.status === 400 || error.status === 413) {
    return res
      .status(error.status)
      .json({ message: error.status === 413 ? "La solicitud es demasiado grande." : "JSON inválido." });
  }

  console.error("Request failed:", error);
  return res.status(500).json({ message: "Error interno del servidor." });
}