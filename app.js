document.addEventListener('DOMContentLoaded', () => {

    // 1. DECLARAÇÃO GLOBAL DE FUNÇÕES DO MODAL
    function openModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('show'));
        const closeable = modal.querySelector('[aria-label*="Fechar"]');
        if (closeable) setTimeout(() => closeable.focus(), 100);
    }

    function closeModalFn(modal) {
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 250);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.show').forEach(modal => {
                closeModalFn(modal);
            });
        }
    });

    // 2. DATA ATUAL
    const dateEl = document.getElementById('currentDate');
    const dateFullEl = document.getElementById('currentDateFull');
    if (dateEl || dateFullEl) {
        const now = new Date();
        const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const dateStr = now.toLocaleDateString('pt-BR', opts);
        if (dateEl) dateEl.textContent = dateStr;
        if (dateFullEl) dateFullEl.textContent = dateStr;
    }

    // 3. LÓGICA DO MODAL DE NOVO PEDIDO
    const modalPedido = document.getElementById('modalNovoPedido');
    const btnsAbrirPedido = document.querySelectorAll('.btn-novo:not(#btnNovaVenda):not(#btnDespacharModal), .bento-destaque, .btn-iniciar'); 
    const btnFecharPedido = document.getElementById('closePedidoModal');
    const btnCancelPedido = document.getElementById('btnCancelPedidoModal');
    
    btnsAbrirPedido.forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.location.pathname.includes('home.html') || btn.classList.contains('bento-destaque')) {
                window.location.href = 'pedidos.html?openModal=true';
            } else if (modalPedido) {
                openModal(modalPedido);
            }
        });
    });

    if (btnFecharPedido) btnFecharPedido.addEventListener('click', () => closeModalFn(modalPedido));
    if (btnCancelPedido) btnCancelPedido.addEventListener('click', () => closeModalFn(modalPedido));
    if (modalPedido) {
        modalPedido.addEventListener('click', (e) => {
            if (e.target === modalPedido) closeModalFn(modalPedido);
        });
    }

    // MODAL NOVA VENDA (vendas.html)
    const modalVenda = document.getElementById('modalNovaVenda');
    const btnAbrirVenda = document.getElementById('btnNovaVenda');
    const btnFecharVenda = document.getElementById('closeVendaModal');
    const btnCancelVenda = document.getElementById('btnCancelVendaModal');
    const selectVendaProd = document.getElementById('vendaProduto');
    const inputVendaQtd = document.getElementById('vendaQtd');
    const elVendaSubtotal = document.getElementById('vendaSubtotal');
    const elVendaTotal = document.getElementById('vendaTotal');

    if (btnAbrirVenda) btnAbrirVenda.addEventListener('click', () => openModal(modalVenda));
    if (btnFecharVenda) btnFecharVenda.addEventListener('click', () => closeModalFn(modalVenda));
    if (btnCancelVenda) btnCancelVenda.addEventListener('click', () => closeModalFn(modalVenda));
    if (modalVenda) {
        modalVenda.addEventListener('click', (e) => {
            if (e.target === modalVenda) closeModalFn(modalVenda);
        });
    }

    function atualizarCalculoVenda() {
        if (!selectVendaProd || !inputVendaQtd || !elVendaSubtotal || !elVendaTotal) return;
        const selectedOpt = selectVendaProd.options[selectVendaProd.selectedIndex];
        const preco = parseFloat(selectedOpt?.getAttribute('data-preco') || 0);
        const qtd = parseInt(inputVendaQtd.value || 1, 10);
        const total = preco * qtd;
        const totalFmt = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        elVendaSubtotal.textContent = totalFmt;
        elVendaTotal.textContent = totalFmt;
    }

    if (selectVendaProd) selectVendaProd.addEventListener('change', atualizarCalculoVenda);
    if (inputVendaQtd) inputVendaQtd.addEventListener('input', atualizarCalculoVenda);

    const formNovaVenda = document.getElementById('formNovaVenda');
    if (formNovaVenda) {
        formNovaVenda.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Venda concluída com sucesso! Recibo gerado e estoque atualizado.');
            closeModalFn(modalVenda);
        });
    }

    // MODAL DESPACHAR ENTREGA (entregas.html)
    const modalDespachar = document.getElementById('modalDespachar');
    const btnAbrirDespacho = document.getElementById('btnDespacharModal');
    const btnsDespacharLinha = document.querySelectorAll('.btn-despachar-linha');
    const btnFecharDespacho = document.getElementById('closeDespachoModal');
    const btnCancelDespacho = document.getElementById('btnCancelDespachoModal');
    const formDespachar = document.getElementById('formDespachar');

    if (btnAbrirDespacho) btnAbrirDespacho.addEventListener('click', () => openModal(modalDespachar));
    btnsDespacharLinha.forEach(btn => btn.addEventListener('click', () => openModal(modalDespachar)));
    if (btnFecharDespacho) btnFecharDespacho.addEventListener('click', () => closeModalFn(modalDespachar));
    if (btnCancelDespacho) btnCancelDespacho.addEventListener('click', () => closeModalFn(modalDespachar));
    if (modalDespachar) {
        modalDespachar.addEventListener('click', (e) => {
            if (e.target === modalDespachar) closeModalFn(modalDespachar);
        });
    }

    if (formDespachar) {
        formDespachar.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Pedido despachado! Status alterado para "Em Rota".');
            closeModalFn(modalDespachar);
        });
    }

    // MODAL NOVO INSUMO (estoque.html)
    const modalInsumo = document.getElementById('modalNovoInsumo');
    const btnAbrirInsumo = document.getElementById('btnNovoInsumoModal');
    const btnFecharInsumo = document.getElementById('closeInsumoModal');
    const btnCancelInsumo = document.getElementById('btnCancelInsumoModal');
    const formNovoInsumo = document.getElementById('formNovoInsumo');

    if (btnAbrirInsumo) btnAbrirInsumo.addEventListener('click', () => openModal(modalInsumo));
    if (btnFecharInsumo) btnFecharInsumo.addEventListener('click', () => closeModalFn(modalInsumo));
    if (btnCancelInsumo) btnCancelInsumo.addEventListener('click', () => closeModalFn(modalInsumo));
    if (modalInsumo) modalInsumo.addEventListener('click', (e) => { if (e.target === modalInsumo) closeModalFn(modalInsumo); });
    if (formNovoInsumo) {
        formNovoInsumo.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Matéria-prima cadastrada com sucesso!');
            closeModalFn(modalInsumo);
        });
    }

    // MODAL MOVIMENTAÇÃO DE ESTOQUE (estoque.html)
    const modalMov = document.getElementById('modalMovimentacao');
    const btnAbrirMov = document.getElementById('btnMovimentarModal');
    const btnsMovItem = document.querySelectorAll('.btn-mov-item');
    const btnFecharMov = document.getElementById('closeMovModal');
    const btnCancelMov = document.getElementById('btnCancelMovModal');
    const formMov = document.getElementById('formMovimentacao');

    if (btnAbrirMov) btnAbrirMov.addEventListener('click', () => openModal(modalMov));
    btnsMovItem.forEach(btn => btn.addEventListener('click', () => openModal(modalMov)));
    if (btnFecharMov) btnFecharMov.addEventListener('click', () => closeModalFn(modalMov));
    if (btnCancelMov) btnCancelMov.addEventListener('click', () => closeModalFn(modalMov));
    if (modalMov) modalMov.addEventListener('click', (e) => { if (e.target === modalMov) closeModalFn(modalMov); });
    if (formMov) {
        formMov.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Movimentação registrada com sucesso! Saldo atualizado.');
            closeModalFn(modalMov);
        });
    }

    // MODAIS DE PRODUTOS PRONTOS (produtos-prontos.html)
    const modalProducao = document.getElementById('modalEntradaPronto');
    const btnAbrirProducao = document.getElementById('btnEntradaProntoModal');
    const btnFecharProducao = document.getElementById('closeProducaoModal');
    const btnCancelProducao = document.getElementById('btnCancelProducaoModal');
    const formProducao = document.getElementById('formEntradaPronto');

    if (btnAbrirProducao) btnAbrirProducao.addEventListener('click', () => openModal(modalProducao));
    if (btnFecharProducao) btnFecharProducao.addEventListener('click', () => closeModalFn(modalProducao));
    if (btnCancelProducao) btnCancelProducao.addEventListener('click', () => closeModalFn(modalProducao));
    if (modalProducao) modalProducao.addEventListener('click', (e) => { if (e.target === modalProducao) closeModalFn(modalProducao); });
    if (formProducao) {
        formProducao.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Produção registrada! Produtos adicionados ao estoque de pronta-entrega.');
            closeModalFn(modalProducao);
        });
    }

    const modalPerda = document.getElementById('modalBaixaPerda');
    const btnAbrirPerda = document.getElementById('btnBaixaPerdaModal');
    const btnFecharPerda = document.getElementById('closePerdaModal');
    const btnCancelPerda = document.getElementById('btnCancelPerdaModal');
    const formPerda = document.getElementById('formBaixaPerda');

    if (btnAbrirPerda) btnAbrirPerda.addEventListener('click', () => openModal(modalPerda));
    if (btnFecharPerda) btnFecharPerda.addEventListener('click', () => closeModalFn(modalPerda));
    if (btnCancelPerda) btnCancelPerda.addEventListener('click', () => closeModalFn(modalPerda));
    if (modalPerda) modalPerda.addEventListener('click', (e) => { if (e.target === modalPerda) closeModalFn(modalPerda); });
    if (formPerda) {
        formPerda.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Baixa por perda confirmada! Saldo abatido do inventário.');
            closeModalFn(modalPerda);
        });
    }

    // MODAL NOVO CLIENTE (clientes.html)
    const modalCliente = document.getElementById('modalNovoCliente');
    const btnAbrirCliente = document.getElementById('btnNovoClienteModal');
    const btnFecharCliente = document.getElementById('closeClienteModal');
    const btnCancelCliente = document.getElementById('btnCancelClienteModal');
    const formNovoCliente = document.getElementById('formNovoCliente');

    if (btnAbrirCliente) btnAbrirCliente.addEventListener('click', () => openModal(modalCliente));
    if (btnFecharCliente) btnFecharCliente.addEventListener('click', () => closeModalFn(modalCliente));
    if (btnCancelCliente) btnCancelCliente.addEventListener('click', () => closeModalFn(modalCliente));
    if (modalCliente) modalCliente.addEventListener('click', (e) => { if (e.target === modalCliente) closeModalFn(modalCliente); });
    if (formNovoCliente) {
        formNovoCliente.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Cliente cadastrado com sucesso!');
            closeModalFn(modalCliente);
        });
    }

    // MODAL NOVO FORNECEDOR (fornecedores.html)
    const modalFornecedor = document.getElementById('modalNovoFornecedor');
    const btnAbrirFornecedor = document.getElementById('btnNovoFornecedorModal');
    const btnFecharFornecedor = document.getElementById('closeFornecedorModal');
    const btnCancelFornecedor = document.getElementById('btnCancelFornecedorModal');
    const formNovoFornecedor = document.getElementById('formNovoFornecedor');

    if (btnAbrirFornecedor) btnAbrirFornecedor.addEventListener('click', () => openModal(modalFornecedor));
    if (btnFecharFornecedor) btnFecharFornecedor.addEventListener('click', () => closeModalFn(modalFornecedor));
    if (btnCancelFornecedor) btnCancelFornecedor.addEventListener('click', () => closeModalFn(modalFornecedor));
    if (modalFornecedor) modalFornecedor.addEventListener('click', (e) => { if (e.target === modalFornecedor) closeModalFn(modalFornecedor); });
    if (formNovoFornecedor) {
        formNovoFornecedor.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Fornecedor parceiro cadastrado com sucesso!');
            closeModalFn(modalFornecedor);
        });
    }

    // RELATÓRIOS (relatorios.html)
    const btnExportarDados = document.getElementById('btnExportarDados');
    if (btnExportarDados) {
        btnExportarDados.addEventListener('click', () => {
            alert('Exportação de dados iniciada! O arquivo CSV/Planilha com os dados de auditoria financeira foi gerado.');
        });
    }

    // MÁSCARAS AUTOMÁTICAS DE CPF E CNPJ
    function formatarCPF(v) {
        v = v.replace(/\D/g, "");
        if (v.length > 11) v = v.substring(0, 11);
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        return v;
    }

    function formatarCNPJ(v) {
        v = v.replace(/\D/g, "");
        if (v.length > 14) v = v.substring(0, 14);
        v = v.replace(/^(\d{2})(\d)/, "$1.$2");
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
        v = v.replace(/(\d{4})(\d)/, "$1-$2");
        return v;
    }

    document.querySelectorAll('.mask-cpf, #cliCPF').forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = formatarCPF(e.target.value);
        });
    });

    document.querySelectorAll('.mask-cnpj, #fornCNPJ').forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = formatarCNPJ(e.target.value);
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openModal') === 'true' && modalPedido) {
        openModal(modalPedido);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Toggle de Modalidade
    const radiosModalidade = document.querySelectorAll('input[name="modalidade"], input[name="modalidade_top"]');
    const enderecoGroup = document.getElementById('enderecoGroup');
    const camposEnderecoRequeridos = [
        document.getElementById('enderecoRua'),
        document.getElementById('enderecoNumero'),
        document.getElementById('enderecoBairro')
    ];
    const taxaEntregaRow = document.getElementById('taxaEntregaRow');
    const inputTaxaEntrega = document.getElementById('taxaEntrega');

    radiosModalidade.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isRetirada = e.target.value === 'retirada';
            document.querySelectorAll(`input[value="${e.target.value}"]`).forEach(r => r.checked = true);

            if(isRetirada) {
                if (enderecoGroup) enderecoGroup.style.display = 'none';
                camposEnderecoRequeridos.forEach(campo => { if (campo) campo.removeAttribute('required'); });
                if (taxaEntregaRow) taxaEntregaRow.style.display = 'none';
                if (inputTaxaEntrega) {
                    inputTaxaEntrega.value = "0.00";
                    inputTaxaEntrega.setAttribute('disabled', 'true');
                }
            } else {
                if (enderecoGroup) enderecoGroup.style.display = 'block';
                camposEnderecoRequeridos.forEach(campo => { if (campo) campo.setAttribute('required', 'true'); });
                if (taxaEntregaRow) taxaEntregaRow.style.display = 'flex';
                if (inputTaxaEntrega) inputTaxaEntrega.removeAttribute('disabled');
            }
        });
    });

    const selectOutrosPagamentos = document.getElementById('outrosPagamentos');
    const radiosPagamento = document.querySelectorAll('input[name="pagamento"]');
    if(selectOutrosPagamentos) {
        selectOutrosPagamentos.addEventListener('change', (e) => {
            if(e.target.value !== "") radiosPagamento.forEach(radio => radio.checked = false);
        });
    }
    radiosPagamento.forEach(radio => {
        radio.addEventListener('change', () => {
            if(selectOutrosPagamentos) selectOutrosPagamentos.value = "";
        });
    });

    // 4. FILTROS E TABS
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

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

    // 5. MODAL DE CONFIGURAÇÕES E EXCLUSÃO
    const configModal = document.getElementById('configModal');
    const btnConfig = document.getElementById('btnConfig');
    const btnCloseConfig = document.getElementById('closeModal');

    if (btnConfig) btnConfig.addEventListener('click', (e) => { e.preventDefault(); openModal(configModal); });
    if (btnCloseConfig) btnCloseConfig.addEventListener('click', () => closeModalFn(configModal));
    if (configModal) configModal.addEventListener('click', (e) => { if (e.target === configModal) closeModalFn(configModal); });

    const confirmModal = document.getElementById('confirmDeleteModal');
    const btnCancelDelete = document.getElementById('btnCancelDelete');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    const confirmText = document.getElementById('confirmText');

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const userName = btn.getAttribute('data-user') || 'este usuário';
            if (confirmText) confirmText.textContent = `Tem certeza que deseja excluir "${userName}"? Esta ação não pode ser desfeita.`;
            openModal(confirmModal);
        });
    });

    if (btnCancelDelete) btnCancelDelete.addEventListener('click', () => closeModalFn(confirmModal));
    if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', () => closeModalFn(confirmModal));
    if (confirmModal) confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) closeModalFn(confirmModal); });

    // 6. FLUXO DE ALTERAÇÃO DE SENHA
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
            if (!atual) { alert('Por favor, informe a sua senha atual.'); return; }
            if (!nova || nova.length < 8) { alert('A nova senha deve ter pelo menos 8 caracteres.'); return; }
            if (!validatePasswords()) return;
            
            passwordFlow.style.display = 'none';
            btnTrocarSenha.style.display = '';
            btnTrocarSenha.setAttribute('aria-expanded', 'false');
            btnTrocarSenha.innerHTML = '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i> Senha alterada com sucesso';
            setTimeout(() => {
                btnTrocarSenha.innerHTML = '<i class="fa-solid fa-lock"></i> Alterar senha';
            }, 3000);
        });
    }

    // 7. VISIBILIDADE DE SENHA
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
});