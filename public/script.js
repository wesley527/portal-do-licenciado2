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

  // =======================
  // TOAST
  // =======================
  function showToast(message, type = 'success') {
    const toast = document.getElementById('toast')
    toast.textContent = message
    toast.className = `toast ${type}`
    toast.classList.remove('hidden')

    setTimeout(() => {
      toast.classList.add('hidden')
    }, 3000)
  }

  // =======================
  // LOGIN
  // =======================
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value.trim()

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!data.success) {
        showToast('❌ Usuário ou senha inválidos', 'error')
        return
      }

      currentUser = { username, role: data.role }
      userNameSpan.textContent = username
      loginCard.style.display = 'none'
      portal.style.display = 'block'

      if (data.role === 'moderador') {
        registerContainer.style.display = 'block'
      }

      showToast('✅ Login realizado com sucesso!')
      loadFiles()
      loadFilesTreinamentos()
    } catch {
      showToast('❌ Erro ao tentar login', 'error')
    }
  })

  // =======================
  // UPLOAD
  // =======================
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(uploadForm)

    const res = await fetch('/upload', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      showToast('📁 Arquivo enviado com sucesso!')
      uploadForm.reset()
      loadFiles()
    } else {
      showToast('❌ Erro no upload', 'error')
    }
  })

  // =======================
  // UPLOAD TREINAMENTOS
  // =======================
  uploadFormTreinamentos.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(uploadFormTreinamentos)

    const res = await fetch('/upload-treinamentos', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      showToast('🎓 Treinamento enviado com sucesso!')
      uploadFormTreinamentos.reset()
      loadFilesTreinamentos()
    } else {
      showToast('❌ Erro no upload', 'error')
    }
  })

  // =======================
  // LISTAR ARQUIVOS
  // =======================
  async function loadFiles() {
    const res = await fetch('/files')
    const files = await res.json()

    fileList.innerHTML = ''

    files.forEach((file) => {
      const encoded = encodeURIComponent(file)
      const li = document.createElement('li')

      li.innerHTML = `
        <span>${file}</span>
        <button onclick="window.location.href='/download/${encoded}'">Download</button>
        ${
          currentUser.role === 'moderador'
            ? `<button class="delete" data-file="${encoded}">Excluir</button>`
            : ''
        }
      `

      fileList.appendChild(li)
    })

    document.querySelectorAll('.delete').forEach((btn) => {
      btn.onclick = async () => {
        if (!confirm('Deseja excluir este arquivo?')) return
        const res = await fetch(`/delete/${btn.dataset.file}`, { method: 'DELETE' })
        if (res.ok) {
          showToast('🗑️ Arquivo excluído')
          loadFiles()
        }
      }
    })
  }

  // =======================
  // LISTAR TREINAMENTOS
  // =======================
  async function loadFilesTreinamentos() {
    const res = await fetch('/files-treinamentos')
    const files = await res.json()

    fileListTreinamentos.innerHTML = ''

    files.forEach((file) => {
      const encoded = encodeURIComponent(file)
      const li = document.createElement('li')

      li.innerHTML = `
        <span>${file}</span>
        <button onclick="window.location.href='/download-treinamentos/${encoded}'">Download</button>
        ${
          currentUser.role === 'moderador'
            ? `<button class="delete-t" data-file="${encoded}">Excluir</button>`
            : ''
        }
      `

      fileListTreinamentos.appendChild(li)
    })

    document.querySelectorAll('.delete-t').forEach((btn) => {
      btn.onclick = async () => {
        if (!confirm('Deseja excluir este arquivo?')) return
        const res = await fetch(`/delete-treinamentos/${btn.dataset.file}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          showToast('🗑️ Treinamento excluído')
          loadFilesTreinamentos()
        }
      }
    })
  }

 // =======================
// CADASTRO DE USUÁRIO
// =======================
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const username = document.getElementById('new-username').value.trim()
  const password = document.getElementById('new-password').value.trim()
  const role = document.getElementById('new-role').value
  const feedback = document.getElementById('register-feedback')

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  })

  const data = await res.json()

  feedback.classList.remove('hidden', 'success', 'error')

  if (data.success) {
    feedback.textContent = '✅ Usuário cadastrado com sucesso'
    feedback.classList.add('success')
    registerForm.reset()
  } else {
    feedback.textContent = '❌ Erro ao cadastrar usuário'
    feedback.classList.add('error')
  }

  setTimeout(() => {
    feedback.classList.add('hidden')
  }, 3000)
})
})
