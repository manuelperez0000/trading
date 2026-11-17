import { createHash, randomBytes } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../config/mailer.js";
import {
  clearPasswordResetToken,
  createUser,
  findUserByEmail,
  listUsers,
  resetPassword,
  savePasswordResetToken,
} from "../models/User.js";
import authenticate from "../middleware/authenticate.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { isValidPassword, hashResetToken, passwordResetUrl } from "../utils/utils.js";

const router = Router();
const BCRYPT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

router.get("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const users = await listUsers();
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});



router.post("/register", async (req, res, next) => {
  const { name, email, password } = req.body ?? {};

  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.trim().length > 120 ||
    typeof email !== "string" ||
    email.length > 320 ||
    !EMAIL_PATTERN.test(email) ||
    !isValidPassword(password)
  ) {
    return res.status(400).json({
      message:
        "Nombre y correo válidos son obligatorios; la contraseña debe tener entre 8 y 72 bytes.",
    });
  }

  try {
    const user = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    });
    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
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
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/recover-password", async (req, res, next) => {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

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
