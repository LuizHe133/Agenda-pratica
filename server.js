const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'agenda.db');
const schemaPath = path.join(__dirname, 'schema.sql');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('Banco de dados conectado em', dbPath);
  }
});

const schema = fs.readFileSync(schemaPath, 'utf8');

 db.serialize(() => {
  db.run(schema, (err) => {
    if (err) {
      console.error('Erro ao aplicar schema:', err.message);
    }
  });
});

app.get('/api/contatos', (req, res) => {
  db.all('SELECT * FROM contatos ORDER BY nome ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/contatos', (req, res) => {
  const { nome, telefone, email, data } = req.body;

  if (!nome || !telefone) {
    return res.status(400).json({ erro: 'Nome e telefone são obrigatórios.' });
  }

  db.run(
    'INSERT INTO contatos (nome, telefone, email, data) VALUES (?, ?, ?, ?)',
    [nome, telefone, email || '', data || ''],
    function (err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        nome,
        telefone,
        email: email || '',
        data: data || ''
      });
    }
  );
});

app.put('/api/contatos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, telefone, email, data } = req.body;

  if (!nome || !telefone) {
    return res.status(400).json({ erro: 'Nome e telefone são obrigatórios.' });
  }

  db.run(
    'UPDATE contatos SET nome = ?, telefone = ?, email = ?, data = ? WHERE id = ?',
    [nome, telefone, email || '', data || '', id],
    function (err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Contato não encontrado.' });
      }
      res.json({ id: Number(id), nome, telefone, email: email || '', data: data || '' });
    }
  );
});

app.delete('/api/contatos/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM contatos WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Contato não encontrado.' });
    }
    res.json({ mensagem: 'Contato removido com sucesso.' });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
