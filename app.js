document.addEventListener('DOMContentLoaded', () => {

    // ===================================================
    // DATA ATUAL NO TOP BAR
    // ===================================================
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const now = new Date();
        const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('pt-BR', opts);
    }

    // ===================================================
    // MODAL DE CONFIGURAÇÕES
    // ===================================================
    const configModal = document.getElementById('configModal');
    const btnConfig = document.getElementById('btnConfig');
    const closeModal = document.getElementById('closeModal');

    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('show'));
        // Foca no botão de fechar para acessibilidade
        const closeable = modal.querySelector('[aria-label*="Fechar"]');
        if (closeable) setTimeout(() => closeable.focus(), 100);
    }

    function closeModalFn(modal) {
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 250);
    }

    if (btnConfig) {
        btnConfig.addEventListener('click', (e) => { e.preventDefault(); openModal(configModal); });
    }
    if (closeModal) {
        closeModal.addEventListener('click', () => closeModalFn(configModal));
    }

    // Fechar modal ao clicar no overlay
    if (configModal) {
        configModal.addEventListener('click', (e) => {
            if (e.target === configModal) closeModalFn(configModal);
        });
    }

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (configModal?.classList.contains('show')) closeModalFn(configModal);
            if (confirmModal?.classList.contains('show')) closeModalFn(confirmModal);
        }
    });

    // ===================================================
    // TABS
    // ===================================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            const target = document.getElementById(btn.getAttribute('data-target'));
            if (target) target.classList.add('active');
        });
    });

    // ===================================================
    // MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
    // ===================================================
    const confirmModal = document.getElementById('confirmDeleteModal');
    const btnCancelDelete = document.getElementById('btnCancelDelete');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    const confirmText = document.getElementById('confirmText');

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const userName = btn.getAttribute('data-user') || 'este usuário';
            if (confirmText) {
                confirmText.textContent = `Tem certeza que deseja excluir "${userName}"? Esta ação não pode ser desfeita.`;
            }
            openModal(confirmModal);
        });
    });

    if (btnCancelDelete) {
        btnCancelDelete.addEventListener('click', () => closeModalFn(confirmModal));
    }
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', () => {
            // Simulação: apenas fecha o modal
            closeModalFn(confirmModal);
        });
    }
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) closeModalFn(confirmModal);
        });
    }

    // ===================================================
    // FLUXO DE ALTERAÇÃO DE SENHA
    // ===================================================
    const btnTrocarSenha = document.getElementById('btnTrocarSenha');
    const passwordFlow = document.getElementById('passwordFlow');
    const btnCancelarSenha = document.getElementById('btnCancelarSenha');
    const btnSalvarSenha = document.getElementById('btnSalvarSenha');
    const pwdNova = document.getElementById('pwdNova');
    const pwdConfirmar = document.getElementById('pwdConfirmar');
    const pwdMismatch = document.getElementById('pwdMismatch');

    if (btnTrocarSenha && passwordFlow) {
        btnTrocarSenha.addEventListener('click', () => {
            passwordFlow.style.display = 'block';
            btnTrocarSenha.style.display = 'none';
            btnTrocarSenha.setAttribute('aria-expanded', 'true');
        });
    }
    if (btnCancelarSenha) {
        btnCancelarSenha.addEventListener('click', () => {
            passwordFlow.style.display = 'none';
            btnTrocarSenha.style.display = '';
            btnTrocarSenha.setAttribute('aria-expanded', 'false');
            if (pwdMismatch) pwdMismatch.style.display = 'none';
        });
    }

    // Validação de senhas coincidentes
    function validatePasswords() {
        if (!pwdNova || !pwdConfirmar || !pwdMismatch) return true;
        const nova = pwdNova.value;
        const confirmar = pwdConfirmar.value;
        if (confirmar && nova !== confirmar) {
            pwdMismatch.style.display = 'flex';
            pwdConfirmar.classList.add('input-error');
            return false;
        } else {
            pwdMismatch.style.display = 'none';
            pwdConfirmar.classList.remove('input-error');
            return true;
        }
    }

    if (pwdConfirmar) pwdConfirmar.addEventListener('input', validatePasswords);
    if (pwdNova) pwdNova.addEventListener('input', validatePasswords);

    if (btnSalvarSenha) {
        btnSalvarSenha.addEventListener('click', () => {
            const atual = document.getElementById('pwdAtual')?.value;
            const nova = pwdNova?.value;
            if (!atual) { alert('Por favor, informe sua senha atual.'); return; }
            if (!nova || nova.length < 8) { alert('A nova senha deve ter pelo menos 8 caracteres.'); return; }
            if (!validatePasswords()) return;
            // Simulação de sucesso
            passwordFlow.style.display = 'none';
            btnTrocarSenha.style.display = '';
            btnTrocarSenha.setAttribute('aria-expanded', 'false');
            btnTrocarSenha.innerHTML = '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i> Senha alterada com sucesso';
            setTimeout(() => {
                btnTrocarSenha.innerHTML = '<i class="fa-solid fa-lock"></i> Alterar senha';
            }, 3000);
        });
    }

    // ===================================================
    // VISIBILIDADE DE SENHA (TOGGLE)
    // ===================================================
    document.querySelectorAll('.pwd-toggle').forEach(toggleBtn => {
        toggleBtn.addEventListener('click', () => {
            const input = toggleBtn.closest('.input-wrapper')?.querySelector('input');
            const icon = toggleBtn.querySelector('i');
            if (!input || !icon) return;
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
                toggleBtn.setAttribute('aria-label', toggleBtn.getAttribute('aria-label')?.replace('Mostrar', 'Ocultar') || 'Ocultar senha');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
                toggleBtn.setAttribute('aria-label', toggleBtn.getAttribute('aria-label')?.replace('Ocultar', 'Mostrar') || 'Mostrar senha');
            }
        });
    });

    // ===================================================
    // GRÁFICO INTERATIVO DE FATURAMENTO
    // ===================================================
    const barCols = document.querySelectorAll('.bar-col');
    const valorFaturamento = document.getElementById('valorFaturamento');
    const mesFaturamento = document.getElementById('mesFaturamento');

    barCols.forEach(col => {
        // Suporte a clique e teclado (acessibilidade)
        const handleSelect = () => {
            barCols.forEach(c => c.querySelector('.bar')?.classList.remove('active'));
            col.querySelector('.bar')?.classList.add('active');
            const valor = col.getAttribute('data-valor');
            const mes = col.getAttribute('data-mes');
            if (valorFaturamento && valor) valorFaturamento.textContent = valor;
            if (mesFaturamento && mes) mesFaturamento.textContent = mes;
        };

        col.addEventListener('click', handleSelect);
        col.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(); }
        });
    });

});
