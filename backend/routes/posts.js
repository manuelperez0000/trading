import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import optionalAuthenticate from "../middleware/optionalAuthenticate.js";
import responser from "../utils/responser.js";
import {
  createPost,
  deletePost,
  findPostById,
  listPosts,
} from "../models/Post.js";
import {
  createComment,
  deleteComment,
  listCommentsByPostId,
} from "../models/Comment.js";
import { togglePostLike } from "../models/Like.js";
import { isDatabaseId, isHttpUrl } from "../utils/utils.js";

const router = Router();

router.get("/", optionalAuthenticate, async (req, res, next) => {
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
      req.user?.id ?? null,
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

router.get("/:id", optionalAuthenticate, async (req, res, next) => {
  if (!isDatabaseId(req.params.id)) {
    return responser.error({
      res,
      message: "El ID de la publicación no es válido.",
      status: 400,
    });
  }

  try {
    const post = await findPostById(req.params.id, req.user?.id ?? null);
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

router.post("/", authenticate, async (req, res, next) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return responser.error({
      res,
      message: "El cuerpo de la solicitud debe ser un objeto JSON.",
      status: 400,
    });
  }

  const { title, text, image } = body;
  const normalizedText = typeof text === "string" ? text.trim() : "";
  const normalizedImage = image === undefined ? "" : image;
  const normalizedTitle =
    title === undefined
      ? normalizedText.slice(0, 200) || "Publicación con imagen"
      : title;

  if (
    typeof normalizedTitle !== "string" ||
    normalizedTitle.trim().length === 0 ||
    normalizedTitle.trim().length > 200 ||
    (text !== undefined &&
      (typeof text !== "string" || text.length > 5000)) ||
    (normalizedText.length === 0 && normalizedImage === "") ||
    (normalizedImage !== "" && !isHttpUrl(normalizedImage))
  ) {
    return responser.error({
      res,
      message: "La publicación debe incluir texto (máximo 5000 caracteres) o una imagen con URL HTTP o HTTPS; el título no puede superar 200 caracteres.",
      status: 400,
    });
  }

  try {
    const createdPost = await createPost({
      userId: req.user.id,
      title: normalizedTitle.trim(),
      text: normalizedText,
      image: normalizedImage,
    });
    const post = await findPostById(createdPost.id, req.user.id);
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

router.post("/:id/like", authenticate, async (req, res, next) => {
  if (!isDatabaseId(req.params.id)) {
    return responser.error({
      res,
      message: "El ID de la publicación no es válido.",
      status: 400,
    });
  }

  try {
    const liked = await togglePostLike({
      userId: req.user.id,
      postId: req.params.id,
    });
    if (liked === null) {
      return responser.error({
        res,
        message: "No se encontró la publicación.",
        status: 404,
      });
    }
    const post = await findPostById(req.params.id, req.user.id);
    return responser.success({
      res,
      message: liked
        ? "Me gusta agregado correctamente."
        : "Me gusta eliminado correctamente.",
      body: { liked, post },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/comments", optionalAuthenticate, async (req, res, next) => {
  if (!isDatabaseId(req.params.id)) {
    return responser.error({
      res,
      message: "El ID de la publicación no es válido.",
      status: 400,
    });
  }

  try {
    const comments = await listCommentsByPostId(req.params.id);
    if (!comments) {
      return responser.error({
        res,
        message: "No se encontró la publicación.",
        status: 404,
      });
    }
    return responser.success({
      res,
      message: "Comentarios listados correctamente.",
      body: { comments },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/comments", authenticate, async (req, res, next) => {
  if (!isDatabaseId(req.params.id)) {
    return responser.error({
      res,
      message: "El ID de la publicación no es válido.",
      status: 400,
    });
  }

  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return responser.error({
      res,
      message: "El cuerpo de la solicitud debe ser un objeto JSON.",
      status: 400,
    });
  }

  const { content } = body;
  if (typeof content !== "string" || content.trim().length === 0) {
    return responser.error({
      res,
      message: "El comentario no puede estar vacío.",
      status: 400,
    });
  }

  const normalizedContent = content.trim();
  if (normalizedContent.length > 2000) {
    return responser.error({
      res,
      message: "El comentario no puede superar 2000 caracteres.",
      status: 400,
    });
  }

  try {
    const comment = await createComment({
      postId: req.params.id,
      userId: req.user.id,
      content: normalizedContent,
    });
    if (!comment) {
      return responser.error({
        res,
        message: "No se encontró la publicación.",
        status: 404,
      });
    }
    const post = await findPostById(req.params.id, req.user.id);
    return responser.success({
      res,
      message: "Comentario publicado correctamente.",
      body: {
        comment,
        comments_count: post?.comments_count ?? 0,
        post,
      },
      status: 201,
    });
  } catch (error) {
    return next(error);
  }
});

router.delete(
  "/:id/comments/:commentId",
  authenticate,
  async (req, res, next) => {
    if (
      !isDatabaseId(req.params.id) ||
      !isDatabaseId(req.params.commentId)
    ) {
      return responser.error({
        res,
        message: "El ID de la publicación o del comentario no es válido.",
        status: 400,
      });
    }

    try {
      const result = await deleteComment({
        postId: req.params.id,
        commentId: req.params.commentId,
        userId: req.user.id,
      });
      if (result.status === "post_not_found") {
        return responser.error({
          res,
          message: "No se encontró la publicación.",
          status: 404,
        });
      }
      if (result.status === "comment_not_found") {
        return responser.error({
          res,
          message: "No se encontró el comentario.",
          status: 404,
        });
      }
      if (result.status === "forbidden") {
        return responser.error({
          res,
          message: "No tienes permiso para eliminar este comentario.",
          status: 403,
        });
      }
      const post = await findPostById(req.params.id, req.user.id);
      return responser.success({
        res,
        message: "Comentario eliminado correctamente.",
        body: {
          comment: result.comment,
          comments_count: post?.comments_count ?? 0,
          post,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
);

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
