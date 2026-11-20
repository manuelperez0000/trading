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
import {
  hashResetToken,
  isValidEmail,
  isValidPassword,
  passwordResetUrl,
  readFirstString,
  validationMessage,
  validateRegistrationData,
} from "../utils/utils.js";
import responser from "../utils/responser.js";

const router = Router();
const BCRYPT_ROUNDS = 12;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

router.get("/", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const users = await listUsers();
    return responser.success({
      res,
      message: "Usuarios listados correctamente.",
      body: { users },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/register", async (req, res, next) => {
  const { errors, password, userData } = validateRegistrationData(req.body);
  if (errors.length > 0) {
    return responser.error({
      res,
      message: validationMessage(errors),
      status: 400,
    });
  }

  try {
    const user = await createUser({
      ...userData,
      correoElectronico: userData.correoElectronico.toLowerCase(),
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    });
    return responser.success({
      res,
      message: "Usuario registrado correctamente.",
      body: { user: toPublicUser(user) },
      status: 201,
    });
  } catch (error) {
    if (error.code === "23505" && error.constraint === "users_email_key") {
      return responser.error({
        res,
        message: "Este correo electrónico ya está registrado.",
        status: 409,
      });
    }
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const body = req.body ?? {};
  const email = readFirstString(body, ["correoElectronico", "email"]);
  const { password } = body;

  if (
    typeof email !== "string" ||
    !isValidEmail(email.trim()) ||
    typeof password !== "string" ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return responser.error({
      res,
      message: "Correo y contraseña son obligatorios; la contraseña no puede superar 72 bytes.",
      status: 400,
    });
  }

  try {
    const user = await findUserByEmail(email.trim().toLowerCase());
    const passwordMatches =
      user && (await bcrypt.compare(password, user.password_hash));

    if (!passwordMatches) {
      return responser.error({
        res,
        message: "Correo o contraseña incorrectos.",
        status: 401,
      });
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET must contain at least 32 characters");
    }

    const token = jwt.sign(
      { sub: String(user.id), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10d" },
    );

    return responser.success({
      res,
      message: "Inicio de sesión exitoso.",
      body: {
        token,
        user: toPublicUser(user),
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return responser.error({
        res,
        message: "No se encontró el usuario.",
        status: 404,
      });
    }
    return responser.success({
      res,
      message: "Usuario encontrado.",
      body: { user: toPublicUser(user) },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/recover-password", async (req, res, next) => {
  const body = req.body ?? {};
  const emailInput = readFirstString(body, ["correoElectronico", "email"]);
  const email = typeof emailInput === "string" ? emailInput.toLowerCase() : "";

  if (!isValidEmail(email)) {
    return responser.error({
      res,
      message: "Introduce un correo válido.",
      status: 400,
    });
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

    return responser.success({
      res,
      message: "Si el correo está registrado, recibirás instrucciones para recuperar la cuenta.",
      status: 202,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/reset-password", async (req, res, next) => {
  const { token, password } = req.body ?? {};

  if (typeof token !== "string" || !isValidPassword(password)) {
    return responser.error({
      res,
      message: "El token es obligatorio y la contraseña debe tener entre 8 y 72 bytes.",
      status: 400,
    });
  }

  try {
    const updated = await resetPassword(
      hashResetToken(token),
      await bcrypt.hash(password, BCRYPT_ROUNDS),
    );

    if (!updated) {
      return responser.error({
        res,
        message: "El token no es válido o ha expirado.",
        status: 400,
      });
    }

    return responser.success({
      res,
      message: "La contraseña se actualizó correctamente.",
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
