BEGIN;

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS comments_count INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (btrim(content) <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_created
  ON comments (post_id, created_at ASC);

UPDATE posts AS publication
SET comments_count = (
  SELECT COUNT(*)::INT
  FROM comments
  WHERE post_id = publication.id
);

COMMIT;
