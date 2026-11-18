import { randomBytes } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../config/mailer.js";
import {
  clearPasswordResetToken,
  createUser,
  findUserByEmail,
  findUserById,
  listUsers,
  resetPassword,
  savePasswordResetToken,
  toPublicUser,
} from "../models/User.js";
import authenticate from "../middleware/authenticate.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { isValidPassword, hashResetToken, passwordResetUrl } from "../utils/utils.js";

const router = Router();
const BCRYPT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

function readOptionalString(object, key) {
  if (object[key] === undefined) {
    return "";
  }
  return typeof object[key] === "string" ? object[key].trim() : null;
}

function readFirstString(object, keys) {
  const key = keys.find((candidate) => object[candidate] !== undefined);
  return key === undefined ? "" : readOptionalString(object, key);
}

router.get("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const users = await listUsers();
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

router.post("/register", async (req, res, next) => {
  const body = req.body ?? {};
  const userData = {
    nombreCompleto: readFirstString(body, ["nombreCompleto", "name", "full_name"]),
    direccion: readOptionalString(body, "direccion"),
    telefono: readOptionalString(body, "telefono"),
    whatsapp: readOptionalString(body, "whatsapp"),
    correoElectronico: readFirstString(body, ["correoElectronico", "email"]),
    urlDocumentoIdentidad: readOptionalString(body, "urlDocumentoIdentidad"),
    urlReciboServicio: readOptionalString(body, "urlReciboServicio"),
    urlContratoDisclaimer: readOptionalString(body, "urlContratoDisclaimer"),
    urlComprobanteAceptacion: readOptionalString(body, "urlComprobanteAceptacion"),
  };
  const email = userData.correoElectronico;
  const password = body.password;

  if (
    Object.values(userData).some((value) => value === null) ||
    userData.nombreCompleto.length === 0 ||
    userData.nombreCompleto.length > 120 ||
    userData.telefono.length > 40 ||
    userData.whatsapp.length > 40 ||
    email.length > 320 ||
    !EMAIL_PATTERN.test(email) ||
    !isValidPassword(password)
  ) {
    return res.status(400).json({
      message:
        "Se requiere un perfil con nombre y correo válidos; la contraseña debe tener entre 8 y 72 bytes. Los demás campos deben ser texto.",
    });
  }

  try {
    const user = await createUser({
      ...userData,
      correoElectronico: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    });
    return res.status(201).json({ user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const body = req.body ?? {};
  const email = readFirstString(body, ["correoElectronico", "email"]);
  const { password } = body;

  if (
    typeof email !== "string" ||
    !EMAIL_PATTERN.test(email.trim()) ||
    email.length > 320 ||
    typeof password !== "string" ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      message: "Correo y contraseña son obligatorios; la contraseña no puede superar 72 bytes.",
    });
  }

  try {
    const user = await findUserByEmail(email.trim().toLowerCase());
    const passwordMatches =
      user && (await bcrypt.compare(password, user.password_hash));

    if (!passwordMatches) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos." });
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must contain at least 32 characters");
    }

    const token = jwt.sign(
      { sub: String(user.id), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "No se encontró el usuario." });
    }
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post("/recover-password", async (req, res, next) => {
  const body = req.body ?? {};
  const emailInput = readFirstString(body, ["correoElectronico", "email"]);
  const email = typeof emailInput === "string" ? emailInput.toLowerCase() : "";

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "Introduce un correo válido." });
  }

  try {
    const user = await findUserByEmail(email);
    if (user) {
      const token = randomBytes(32).toString("hex");
      await savePasswordResetToken(
        email,
        hashResetToken(token),
        new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      );

      try {
        await sendPasswordResetEmail(email, passwordResetUrl(token));
      } catch (error) {
        await clearPasswordResetToken(email);
        console.error("Could not send password recovery email:", error);
      }
    }

    return res.status(202).json({
      message: "Si el correo está registrado, recibirás instrucciones para recuperar la cuenta.",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/reset-password", async (req, res, next) => {
  const { token, password } = req.body ?? {};

  if (typeof token !== "string" || !isValidPassword(password)) {
    return res.status(400).json({
      message: "El token es obligatorio y la contraseña debe tener entre 8 y 72 bytes.",
    });
  }

  try {
    const updated = await resetPassword(
      hashResetToken(token),
      await bcrypt.hash(password, BCRYPT_ROUNDS),
    );

    if (!updated) {
      return res.status(400).json({ message: "El token no es válido o ha expirado." });
    }

    return res.json({ message: "La contraseña se actualizó correctamente." });
  } catch (error) {
    return next(error);
  }
});

export default router;
