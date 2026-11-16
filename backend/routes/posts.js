import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { createPost } from "../models/Post.js";

const router = Router();

function isHttpUrl(value) {
  if (typeof value !== "string" || value.length > 2048) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

router.post("/", authenticate, async (req, res, next) => {
  const { title, text, image } = req.body ?? {};

  if (
    typeof title !== "string" ||
    title.trim().length === 0 ||
    title.trim().length > 200 ||
    typeof text !== "string" ||
    text.trim().length === 0 ||
    !isHttpUrl(image)
  ) {
    return res.status(400).json({
      message: "Se requieren un título (máximo 200 caracteres), texto e imagen con URL HTTP o HTTPS.",
    });
  }

  try {
    const post = await createPost({
      userId: req.user.id,
      title: title.trim(),
      text,
      image: image.trim(),
    });
    return res.status(201).json({ post });
  } catch (error) {
    return next(error);
  }
});

export default router;
