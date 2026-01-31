-- 商品テーブルの作成
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- サンプルデータの投入
INSERT INTO products (name, price, stock, category) VALUES
  ('Tシャツ（赤）', 3000, 50, 'アパレル'),
  ('Tシャツ（青）', 3000, 30, 'アパレル'),
  ('ジーンズ', 8000, 25, 'アパレル'),
  ('スニーカー', 12000, 15, 'シューズ'),
  ('サンダル', 5000, 40, 'シューズ');
