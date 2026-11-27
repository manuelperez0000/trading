import pool from "../config/database.js";
import withTransaction from "./transaction.js";

const commentSelectFields = `
  c.id,
  c.post_id,
  c.user_id,
  c.content,
  c.created_at,
  u.name AS author_name,
  u.name AS username,
  NULLIF(u.avatar_url, '') AS avatar_url
`;

export async function listCommentsByPostId(postId) {
  const postResult = await pool.query("SELECT id FROM posts WHERE id = $1", [
    postId,
  ]);
  if (postResult.rowCount === 0) {
    return null;
  }

  const { rows } = await pool.query(
    `SELECT ${commentSelectFields}
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC, c.id ASC`,
    [postId],
  );
  return rows;
}

export async function createComment({ postId, userId, content }) {
  return withTransaction(async (client) => {
    const post = await client.query(
      "SELECT id FROM posts WHERE id = $1 FOR UPDATE",
      [postId],
    );
    if (post.rowCount === 0) {
      return null;
    }

    const inserted = await client.query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [postId, userId, content],
    );

    await client.query(
      "UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1",
      [postId],
    );

    const { rows } = await client.query(
      `SELECT ${commentSelectFields}
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = $1`,
      [inserted.rows[0].id],
    );
    return rows[0];
  });
}

export async function deleteComment({ postId, commentId, userId }) {
  return withTransaction(async (client) => {
    const postResult = await client.query(
      "SELECT id, user_id FROM posts WHERE id = $1 FOR UPDATE",
      [postId],
    );
    if (postResult.rowCount === 0) {
      return { status: "post_not_found" };
    }

    const commentResult = await client.query(
      "SELECT id, user_id FROM comments WHERE id = $1 AND post_id = $2 FOR UPDATE",
      [commentId, postId],
    );
    if (commentResult.rowCount === 0) {
      return { status: "comment_not_found" };
    }

    const postOwnerId = String(postResult.rows[0].user_id);
    const commentAuthorId = String(commentResult.rows[0].user_id);
    const actorId = String(userId);
    if (commentAuthorId !== actorId && postOwnerId !== actorId) {
      return { status: "forbidden" };
    }

    const deleted = await client.query(
      `DELETE FROM comments
       WHERE id = $1 AND post_id = $2
       RETURNING id, post_id, user_id, content, created_at`,
      [commentId, postId],
    );

    await client.query(
      "UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = $1",
      [postId],
    );

    return { status: "deleted", comment: deleted.rows[0] };
  });
}
