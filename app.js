// app.js atualizado

const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const usersFile = path.join(__dirname, 'users.json');
const uploadDir = path.join(__dirname, 'uploads');
const treinamentosDir = path.join(__dirname, 'uploads', 'treinamentos');

if (!fs.existsSync(usersFile)) {
  const initialUsers = [
    { username: 'moderador', password: '1234', role: 'moderador' },
    { username: 'funcionario', password: '1234', role: 'funcionario' }
  ];
  fs.writeFileSync(usersFile, JSON.stringify(initialUsers, null, 2));
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(treinamentosDir)) {
  fs.mkdirSync(treinamentosDir);
}

function getUsersArray() {
  try {
    const data = JSON.parse(fs.readFileSync(usersFile));
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

app.use(express.static('public'));
app.use(express.json());
app.use(fileUpload());

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsersArray();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true, role: user.role });
  } else {
    res.json({ success: false });
  }
});

app.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ success: false });

  const users = getUsersArray();
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ success: false, message: 'Usuário já existe' });
  }

  users.push({ username, password, role });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

app.post('/upload', (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send('Nenhum arquivo enviado.');
  }
  const file = req.files.file;
  const uploadPath = path.join(uploadDir, file.name);

  file.mv(uploadPath, err => {
    if (err) return res.status(500).send(err);
    res.send('Arquivo enviado com sucesso.');
  });
});

app.get('/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json([]);
    const fileStats = files.map(file => {
      const filePath = path.join(uploadDir, file);
      const stat = fs.statSync(filePath);
      return { name: file, isFile: stat.isFile() };
    }).filter(item => item.isFile).map(item => item.name);
    res.json(fileStats);
  });
});

app.get('/download/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('Arquivo não encontrado.');
  }
});

app.delete('/delete/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.sendStatus(200);
  } else {
    res.status(404).send('Arquivo não encontrado.');
  }
});

app.post('/upload-treinamentos', (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send('Nenhum arquivo enviado.');
  }
  const file = req.files.file;
  const uploadPath = path.join(treinamentosDir, file.name);

  file.mv(uploadPath, err => {
    if (err) return res.status(500).send(err);
    res.send('Arquivo enviado com sucesso.');
  });
});

app.get('/files-treinamentos', (req, res) => {
  fs.readdir(treinamentosDir, (err, files) => {
    if (err) return res.status(500).json([]);
    const fileStats = files.map(file => {
      const filePath = path.join(treinamentosDir, file);
      const stat = fs.statSync(filePath);
      return { name: file, isFile: stat.isFile() };
    }).filter(item => item.isFile).map(item => item.name);
    res.json(fileStats);
  });
});

app.get('/download-treinamentos/:filename', (req, res) => {
  const filePath = path.join(treinamentosDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('Arquivo não encontrado.');
  }
});

app.delete('/delete-treinamentos/:filename', (req, res) => {
  const filePath = path.join(treinamentosDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.sendStatus(200);
  } else {
    res.status(404).send('Arquivo não encontrado.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
