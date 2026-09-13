document.addEventListener('DOMContentLoaded', () => {
    
    // --- Accordion Logic ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            
            // Toggle active class on header
            header.classList.toggle('active');
            
            // Animate max-height
            if (header.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = 0;
            }
        });
    });

    // --- Modal Logic ---
    const modal = document.getElementById('configModal');
    const btnConfig = document.getElementById('btnConfig');
    const btnCloseModal = document.getElementById('closeModal');

    if (btnConfig && modal) {
        btnConfig.addEventListener('click', () => {
            modal.classList.add('show');
        });
    }

    if (btnCloseModal && modal) {
        btnCloseModal.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // --- Tabs Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- Password Change Flow Logic ---
    const btnTrocarSenha = document.getElementById('btnTrocarSenha');
    const passwordFlow = document.getElementById('passwordFlow');
    const btnCancelarSenha = document.getElementById('btnCancelarSenha');

    if (btnTrocarSenha && passwordFlow && btnCancelarSenha) {
        btnTrocarSenha.addEventListener('click', (e) => {
            e.preventDefault();
            btnTrocarSenha.style.display = 'none';
            passwordFlow.style.display = 'block';
        });

        btnCancelarSenha.addEventListener('click', (e) => {
            e.preventDefault();
            passwordFlow.style.display = 'none';
            btnTrocarSenha.style.display = 'block';
        });
    }

    // --- Password Visibility Toggle Logic ---
    const pwdToggles = document.querySelectorAll('.pwd-toggle');
    pwdToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Find input inside the same wrapper
            const input = toggle.parentElement.querySelector('input');
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.classList.remove('fa-eye');
                    toggle.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    toggle.classList.remove('fa-eye-slash');
                    toggle.classList.add('fa-eye');
                }
            }
        });
    });

    // --- Interactive Chart Logic ---
    const chartBars = document.querySelectorAll('.bar-col');
    const valorFaturamento = document.getElementById('valorFaturamento');
    const mesFaturamento = document.getElementById('mesFaturamento');

    if (chartBars.length > 0 && valorFaturamento && mesFaturamento) {
        chartBars.forEach(col => {
            col.addEventListener('click', () => {
                // Remove active de todos
                chartBars.forEach(c => c.querySelector('.bar').classList.remove('active'));
                
                // Adiciona active no clicado
                col.querySelector('.bar').classList.add('active');

                // Puxa e atualiza o valor financeiro e o mês
                const valor = col.getAttribute('data-valor');
                const mes = col.getAttribute('data-mes');
                
                if (valor) valorFaturamento.textContent = valor;
                if (mes) mesFaturamento.textContent = mes;
            });
        });
    }

});
