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
  // LOGIN
  // =========================
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value.trim()

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

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
      alert('Erro ao tentar login.')
    }
  })

  // =========================
  // UPLOADS
  // =========================
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(uploadForm)

    const res = await fetch('/upload', { method: 'POST', body: formData })

    if (res.ok) {
      alert('Arquivo enviado com sucesso!')
      uploadForm.reset()
      loadFiles()
    } else {
      alert('Erro ao enviar o arquivo.')
    }
  })

  uploadFormTreinamentos.addEventListener('submit', async (e) => {
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
    }
  })

  // =========================
  // LISTAR UPLOADS
  // =========================
  async function loadFiles() {
    const res = await fetch('/files')
    const files = await res.json()

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

    if (currentUser.role === 'moderador') {
      document.querySelectorAll('.delete-upload').forEach((btn) => {
        btn.addEventListener('click', async () => {
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
    }
  }

  // =========================
  // LISTAR TREINAMENTOS
  // =========================
  async function loadFilesTreinamentos() {
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
    }
  }

  // =========================
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
