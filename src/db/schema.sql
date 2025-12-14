-- 記事テーブル
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  viewCount INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- タグテーブル
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 記事とタグの関連付けテーブル
CREATE TABLE IF NOT EXISTS article_tags (
  articleId INTEGER NOT NULL,
  tagId INTEGER NOT NULL,
  PRIMARY KEY (articleId, tagId),
  FOREIGN KEY (articleId) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

-- インデックス作成（検索高速化）
CREATE INDEX IF NOT EXISTS idx_articles_uuid ON articles(uuid);
CREATE INDEX IF NOT EXISTS idx_articles_createdAt ON articles(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_articles_updatedAt ON articles(updatedAt DESC);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
