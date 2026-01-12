document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form')
  const uploadForm = document.getElementById('upload-form')
  const uploadFormTreinamentos = document.getElementById('upload-form-treinamentos')
  const registerForm = document.getElementById('register-form')
  const fileList = document.getElementById('file-list')
  const fileListTreinamentos = document.getElementById('file-list-treinamentos')
  const userNameSpan = document.getElementById('user-name')
  const loginCard = document.getElementById('login-card')
  const portal = document.getElementById('portal')
  const registerContainer = document.querySelector('.register-container')

  let currentUser = null

  // =========================
<<<<<<< HEAD
  // LOGIN (ROTA CORRIGIDA)
  // =========================
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
=======
  // LOGIN
  // =========================
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value.trim()
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
<<<<<<< HEAD
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
=======
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b

      if (data.success) {
        currentUser = { username, role: data.role }
        userNameSpan.textContent = username
        loginCard.style.display = 'none'
        portal.style.display = 'block'

        if (data.role === 'moderador') {
          registerContainer.style.display = 'block'
        }

        loadFiles()
        loadFilesTreinamentos()
      } else {
        alert('Usuário ou senha inválidos.')
      }
    } catch {
<<<<<<< HEAD
      alert('Erro ao tentar login.');
=======
      alert('Erro ao tentar login.')
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
    }
  })

  // =========================
<<<<<<< HEAD
  // UPLOAD NORMAL
  // =========================
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(uploadForm);
=======
  // UPLOADS
  // =========================
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(uploadForm)
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b

    const res = await fetch('/upload', { method: 'POST', body: formData })

    if (res.ok) {
      alert('Arquivo enviado com sucesso!')
      uploadForm.reset()
      loadFiles()
    } else {
      alert('Erro ao enviar o arquivo.')
    }
  })

  // =========================
  // UPLOAD TREINAMENTOS
  // =========================
  uploadFormTreinamentos.addEventListener('submit', async (e) => {
<<<<<<< HEAD
    e.preventDefault();

    const formData = new FormData(uploadFormTreinamentos);

    const res = await fetch('/upload-treinamentos', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      alert('Arquivo de treinamento enviado com sucesso!');
      uploadFormTreinamentos.reset();
      loadFilesTreinamentos();
    } else {
      alert('Erro ao enviar o arquivo.');
=======
    e.preventDefault()
    const formData = new FormData(uploadFormTreinamentos)

    const res = await fetch('/upload-treinamentos', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      alert('Arquivo de treinamento enviado com sucesso!')
      uploadFormTreinamentos.reset()
      loadFilesTreinamentos()
    } else {
      alert('Erro ao enviar o arquivo.')
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
    }
  })

  // =========================
<<<<<<< HEAD
  // LISTAR ARQUIVOS
=======
  // LISTAR UPLOADS
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
  // =========================
  async function loadFiles() {
    const res = await fetch('/files')
    const files = await res.json()

<<<<<<< HEAD
    fileList.innerHTML = '';

    files.forEach(file => {
      const encoded = encodeURIComponent(file);

      const li = document.createElement('li');
      li.innerHTML = `
        <span>${file}</span>
        <button onclick="window.location.href='/download/${encoded}'">Download</button>
        ${currentUser.role === 'moderador'
          ? `<button class="delete-btn" data-file="${encoded}">Excluir</button>`
          : ''}
      `;
      fileList.appendChild(li);
    });
=======
    fileList.innerHTML = ''

    files.forEach((file) => {
      const encoded = encodeURIComponent(file)

      const li = document.createElement('li')
      li.innerHTML = `
        <span>${file}</span>
        <button onclick="window.location.href='/download/uploads/${encoded}'">Download</button>
        ${
          currentUser.role === 'moderador'
            ? `<button class="delete-upload" data-file="${file}">Excluir</button>`
            : ''
        }
      `
      fileList.appendChild(li)
    })
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b

    if (currentUser.role === 'moderador') {
      document.querySelectorAll('.delete-upload').forEach((btn) => {
        btn.addEventListener('click', async () => {
<<<<<<< HEAD
          const encoded = btn.dataset.file;
          if (confirm('Tem certeza que deseja excluir este arquivo?')) {
            const res = await fetch(`/delete/${encoded}`, { method: 'DELETE' });
            res.ok ? loadFiles() : alert('Erro ao excluir arquivo.');
          }
        });
      });
=======
          const file = btn.dataset.file
          if (!confirm(`Deseja excluir "${file}"?`)) return

          const res = await fetch(
            `/delete/uploads/${encodeURIComponent(file)}`,
            { method: 'DELETE' }
          )

          if (res.ok) loadFiles()
          else alert('Erro ao excluir o arquivo.')
        })
      })
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
    }
  }

  // =========================
  // LISTAR TREINAMENTOS
  // =========================
  async function loadFilesTreinamentos() {
<<<<<<< HEAD
    const res = await fetch('/files-treinamentos');
    const files = await res.json();

    fileListTreinamentos.innerHTML = '';

    files.forEach(file => {
      const encoded = encodeURIComponent(file);

      const li = document.createElement('li');
      li.innerHTML = `
        <span>${file}</span>
        <button onclick="window.location.href='/download-treinamentos/${encoded}'">Download</button>
        ${currentUser.role === 'moderador'
          ? `<button class="delete-btn-treinamentos" data-file="${encoded}">Excluir</button>`
          : ''}
      `;
      fileListTreinamentos.appendChild(li);
    });

    if (currentUser.role === 'moderador') {
      document.querySelectorAll('.delete-btn-treinamentos').forEach(btn => {
        btn.addEventListener('click', async () => {
          const encoded = btn.dataset.file;
          if (confirm('Tem certeza que deseja excluir este arquivo?')) {
            const res = await fetch(`/delete-treinamentos/${encoded}`, { method: 'DELETE' });
            res.ok ? loadFilesTreinamentos() : alert('Erro ao excluir arquivo.');
          }
        });
      });
=======
    const res = await fetch('/files-treinamentos')
    const files = await res.json()

    fileListTreinamentos.innerHTML = ''

    files.forEach((file) => {
      const encoded = encodeURIComponent(file)

      const li = document.createElement('li')
      li.innerHTML = `
        <span>${file}</span>
        <button onclick="window.location.href='/download/treinamentos/${encoded}'">Download</button>
        ${
          currentUser.role === 'moderador'
            ? `<button class="delete-treinamento" data-file="${file}">Excluir</button>`
            : ''
        }
      `
      fileListTreinamentos.appendChild(li)
    })

    if (currentUser.role === 'moderador') {
      document.querySelectorAll('.delete-treinamento').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const file = btn.dataset.file
          if (!confirm(`Deseja excluir "${file}"?`)) return

          const res = await fetch(
            `/delete/treinamentos/${encodeURIComponent(file)}`,
            { method: 'DELETE' }
          )

          if (res.ok) loadFilesTreinamentos()
          else alert('Erro ao excluir o arquivo.')
        })
      })
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
    }
  }

  // =========================
<<<<<<< HEAD
  // CADASTRO (ROTA CORRIGIDA)
  // =========================
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-password').value.trim();
    const role = document.getElementById('new-role').value;

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();

    document.getElementById('register-success').textContent =
      data.success
        ? `Usuário ${username} cadastrado com sucesso!`
        : data.message || 'Erro ao cadastrar usuário.';

    if (data.success) registerForm.reset();
  });
});
=======
  // CADASTRO DE USUÁRIO
  // =========================
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const username = document.getElementById('new-username').value.trim()
    const password = document.getElementById('new-password').value.trim()
    const role = document.getElementById('new-role').value

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      })

      const data = await res.json()

      document.getElementById('register-success').textContent = data.success
        ? `Usuário ${username} cadastrado com sucesso!`
        : data.message || 'Erro ao cadastrar usuário.'

      if (data.success) registerForm.reset()
    } catch {
      document.getElementById('register-success').textContent =
        'Erro ao cadastrar usuário.'
    }
  })
})
>>>>>>> aee8aec3a138b55ed295ba7eb57d92dab1a0473b
