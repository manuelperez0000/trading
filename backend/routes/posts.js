import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import responser from "../utils/responser.js";
import {
  createPost,
  deletePost,
  findPostById,
  listPosts,
} from "../models/Post.js";
import { isDatabaseId, isHttpUrl } from "../utils/utils.js";

const router = Router();

router.get("/", async (req, res, next) => {
  const statusQuery = req.query.status;
  if (
    statusQuery !== undefined &&
    statusQuery !== "true" &&
    statusQuery !== "false"
  ) {
    return responser.error({
      res,
      message: "El estatus debe ser true o false.",
      status: 400,
    });
  }

  try {
    const posts = await listPosts(
      statusQuery === undefined ? null : statusQuery === "true",
    );
    return responser.success({
      res,
      message: "Publicaciones listadas correctamente.",
      body: { posts },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  if (!isDatabaseId(req.params.id)) {
    return responser.error({
      res,
      message: "El ID de la publicación no es válido.",
      status: 400,
    });
  }

  try {
    const post = await findPostById(req.params.id);
    if (!post) {
      return responser.error({
        res,
        message: "No se encontró la publicación.",
        status: 404,
      });
    }
    return responser.success({
      res,
      message: "Publicación encontrada.",
      body: { post },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  const { title, text, image } = req.body ?? {};

  if (
    typeof title !== "string" ||
    title.trim().length === 0 ||
    title.trim().length > 200 ||
    typeof text !== "string" ||
    text.trim().length === 0 ||
    !isHttpUrl(image)
  ) {
    return responser.error({
      res,
      message: "Se requieren un título (máximo 200 caracteres), texto e imagen con URL HTTP o HTTPS.",
      status: 400,
    });
  }

  try {
    const post = await createPost({
      userId: 123,
      /* userId: req.user.id, */
      title: title.trim(),
      text,
      image: image.trim(),
    });
    return responser.success({
      res,
      message: "Publicación creada correctamente.",
      body: { post },
      status: 201,
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  if (!isDatabaseId(req.params.id)) {
    return responser.error({
      res,
      message: "El ID de la publicación no es válido.",
      status: 400,
    });
  }

  try {
    const post = await deletePost({
      id: req.params.id,
      userId: req.user.id,
    });
    if (!post) {
      return responser.error({
        res,
        message: "No se encontró la publicación o no tienes permiso para eliminarla.",
        status: 404,
      });
    }
    return responser.success({
      res,
      message: "Publicación eliminada correctamente.",
      body: { post },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
