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

  /* =======================
     TOAST STACK
  ======================= */
  let toastContainer = document.querySelector('.toast-container')
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.className = 'toast-container'
    document.body.appendChild(toastContainer)
  }

  function showToast(message, type = 'success') {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    }

    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || '🔔'}</span>
      <span>${message}</span>
    `

    toastContainer.appendChild(toast)

    setTimeout(() => toast.classList.add('hide'), 2800)
    setTimeout(() => toast.remove(), 3200)
  }

  /* =======================
     LOADER GLOBAL
  ======================= */
  function showLoader(text = 'Processando...') {
    if (document.getElementById('global-loader')) return

    const loader = document.createElement('div')
    loader.id = 'global-loader'
    loader.className = 'loader-overlay'
    loader.innerHTML = `
      <div class="loader-card">
        <div class="loader-spinner"></div>
        <p>${text}</p>
      </div>
    `
    document.body.appendChild(loader)
  }

  function hideLoader() {
    const loader = document.getElementById('global-loader')
    if (loader) loader.remove()
  }

  /* =======================
     CONFIRMAÇÃO CUSTOM
  ======================= */
  function confirmAction(message) {
    return new Promise((resolve) => {
      const modal = document.createElement('div')
      modal.className = 'loader-overlay'
      modal.innerHTML = `
        <div class="loader-card">
          <p style="margin-bottom:20px">${message}</p>
          <button id="confirmYes">Confirmar</button>
          <button id="confirmNo" style="margin-top:10px;background:#ef4444">Cancelar</button>
        </div>
      `
      document.body.appendChild(modal)

      document.getElementById('confirmYes').onclick = () => {
        modal.remove()
        resolve(true)
      }

      document.getElementById('confirmNo').onclick = () => {
        modal.remove()
        resolve(false)
      }
    })
  }

  /* =======================
     LOGIN
  ======================= */
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    showLoader('Entrando...')

    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value.trim()

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()
      hideLoader()

      if (!data.success) {
        showToast('Usuário ou senha inválidos', 'error')
        return
      }

      currentUser = { username, role: data.role }
      userNameSpan.textContent = username
      loginCard.style.display = 'none'
      portal.style.display = 'block'

      if (data.role === 'moderador') registerContainer.style.display = 'block'

      showToast('Login realizado com sucesso!')
      loadFiles()
      loadFilesTreinamentos()
    } catch {
      hideLoader()
      showToast('Erro ao tentar login', 'error')
    }
  })

  /* =======================
     UPLOAD
  ======================= */
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    showLoader('Enviando arquivo...')

    const res = await fetch('/upload', {
      method: 'POST',
      body: new FormData(uploadForm),
    })

    hideLoader()

    if (res.ok) {
      showToast('Arquivo enviado com sucesso!')
      uploadForm.reset()
      loadFiles()
    } else {
      showToast('Erro no upload', 'error')
    }
  })

  /* =======================
     UPLOAD TREINAMENTOS
  ======================= */
  uploadFormTreinamentos.addEventListener('submit', async (e) => {
    e.preventDefault()
    showLoader('Enviando treinamento...')

    const res = await fetch('/upload-treinamentos', {
      method: 'POST',
      body: new FormData(uploadFormTreinamentos),
    })

    hideLoader()

    if (res.ok) {
      showToast('Treinamento enviado com sucesso!')
      uploadFormTreinamentos.reset()
      loadFilesTreinamentos()
    } else {
      showToast('Erro no upload', 'error')
    }
  })

  /* =======================
     LISTAR ARQUIVOS
  ======================= */
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
        const ok = await confirmAction('Deseja excluir este arquivo?')
        if (!ok) return

        showLoader('Excluindo...')
        const res = await fetch(`/delete/${btn.dataset.file}`, { method: 'DELETE' })
        hideLoader()

        if (res.ok) {
          showToast('Arquivo excluído')
          loadFiles()
        }
      }
    })
  }

  /* =======================
     LISTAR TREINAMENTOS
  ======================= */
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
        const ok = await confirmAction('Deseja excluir este treinamento?')
        if (!ok) return

        showLoader('Excluindo...')
        const res = await fetch(`/delete-treinamentos/${btn.dataset.file}`, {
          method: 'DELETE',
        })
        hideLoader()

        if (res.ok) {
          showToast('Treinamento excluído')
          loadFilesTreinamentos()
        }
      }
    })
  }

  /* =======================
     CADASTRO DE USUÁRIO
  ======================= */
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    showLoader('Cadastrando usuário...')

    const username = document.getElementById('new-username').value.trim()
    const password = document.getElementById('new-password').value.trim()
    const role = document.getElementById('new-role').value

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    })

    const data = await res.json()
    hideLoader()

    if (data.success) {
      showToast('Usuário cadastrado com sucesso!')
      registerForm.reset()
    } else {
      showToast('Erro ao cadastrar usuário', 'error')
    }
  })
})
