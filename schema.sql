CREATE TABLE IF NOT EXISTS contatos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  data TEXT
);

CREATE INDEX IF NOT EXISTS idx_contatos_nome ON contatos (nome);
