/**
 * MARIA FORMIGA — FRONTEND EM UM ÚNICO ARQUIVO
 *
 * Instalação: substitua o app.js da raiz por este arquivo e mantenha no HTML apenas:
 * <script src="../app.js" defer></script>
 * Dados, interface e páginas já estão reunidos neste arquivo; não requer outros scripts.
 * Preserve os arquivos HTML, style.css e img/cupcake.png do projeto entregue.
 *
 * Organização:
 * 1. Dados, persistência e regras locais (window.MF).
 * 2. Componentes e utilidades de interface (window.UI).
 * 3. Páginas, formulários, ações de botões e eventos.
 *
 * Esta é uma demonstração local. Não há autenticação real, envio de e-mails,
 * cobrança bancária ou auditoria inviolável. Nenhuma senha é persistida.
 * Valores monetários são representados em centavos nos dados.
 *
 * CONTROLES ESTÁTICOS DEFINIDOS NOS ARQUIVOS HTML
 * Os comentários abaixo documentam seus vínculos; este arquivo não altera o HTML.
 * Campo #email: recebe o e-mail ou nome de acesso da conta.
 * Campo #password: recebe a senha digitada, sem armazenamento.
 * Campo remember: corresponde à opção Manter-me conectado do login original.
 * Botão .pwd-toggle: alterna a visibilidade da senha digitada.
 * Botão de envio de #loginForm: exige campos preenchidos e abre home.html.
 * Campo #recoveryEmail: valida o formato do e-mail no fluxo de recuperação.
 * Botão de envio de #recoveryForm: abre a etapa visual de código, sem enviar e-mail.
 * Campos #codeDigit1 a #codeDigit6: recebem os seis números de recuperação.
 * Botão #btnVerifyCode: abre a redefinição após preenchimento das seis posições.
 * Botão #btnChangeEmail: volta à etapa de e-mail, preservando seu conteúdo.
 * Campo #newPassword: recebe a nova senha para validação de formato.
 * Campo #confirmPassword: exige repetição idêntica da nova senha.
 * Botões [data-password-toggle]: mostram ou ocultam cada senha da recuperação de forma independente.
 * Botão de envio de #resetForm: valida as senhas e limpa os campos, sem alterar credenciais.
 * Botão .mobile-menu: abre ou fecha a navegação móvel e ajusta aria-expanded.
 * Botão .nav-backdrop: fecha o menu móvel ao clicar fora dele.
 * Link #btnConfig: abre as configurações sem navegar para outra página.
 * Link #btnSair: remove a preferência de perfil e retorna a index.html.
 * Botão #dialog-close: fecha o modal, confirmando descarte de alterações quando aplicável.
 * Links .nav-link: navegam entre módulos; a visibilidade respeita o perfil demonstrativo.
 * Campo dinâmico #list-search: filtra a listagem ao digitar.
 * Botões [data-filter]: aplicam o filtro de situação correspondente.
 * Botões dos atalhos iniciais: são links que abrem o módulo descrito no cartão.
 * Botão Aplicar período (#report-form): valida as datas e atualiza o relatório.
 * Campo confirmed: exige confirmação manual do recebimento integral do pedido.
 * Botão submit dos modais: valida o formulário e executa a gravação específica.
 * Botão Cancelar dos modais: fecha o formulário com proteção contra descarte acidental.
 */

/* ==================== 1. DADOS E REGRAS LOCAIS ==================== */
/* Estado e regras da demonstração. Nenhuma credencial é persistida. */
"use strict";
window.MF = (
  /* Inicializa o módulo de dados, persistência e regras locais. */ () => {
    const KEY = "maria-formiga:v2";
    const uid = /* Gera um identificador único para registros locais. */ () =>
      globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    // Retorna o dia local, sem deslocá-lo para a data UTC próxima à meia-noite.
    function localDate(value = new Date()) {
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value))
        return value;
      const current = value instanceof Date ? value : new Date(value);
      return `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    }
    // Soma dias de calendário para respeitar alterações de horário local.
    function date(offset = 0) {
      const current = new Date();
      current.setDate(current.getDate() + offset);
      return localDate(current);
    }
    const now =
      /* Registra o instante atual no formato ISO para manter a ordem cronológica. */ () =>
        new Date().toISOString();
    /* Cria os cadastros e estoques fictícios iniciais da demonstração. */ function initial() {
      return {
        version: 2,
        revision: 0,
        clients: [
          {
            id: "c1",
            name: "Ana Paula (exemplo)",
            cpf: "52998224725",
            email: "ana@example.com",
            phone: "11999990001",
            addresses: [
              {
                id: "a1",
                street: "Rua das Flores",
                number: "123",
                district: "Centro",
                city: "Biritiba-Mirim",
                zip: "08940000",
                extra: "",
              },
            ],
          },
          {
            id: "c2",
            name: "Carlos Henrique (exemplo)",
            cpf: "11144477735",
            email: "carlos@example.com",
            phone: "11999990002",
            addresses: [
              {
                id: "a2",
                street: "Rua das Palmeiras",
                number: "45",
                district: "Centro",
                city: "Biritiba-Mirim",
                zip: "08940000",
                extra: "Casa",
              },
            ],
          },
        ],
        suppliers: [
          {
            id: "s1",
            name: "Distribuidora Exemplo",
            cnpj: "11222333000181",
            category: "Insumos",
            phone: "1140000000",
            email: "vendas@example.com",
            lead: 2,
          },
        ],
        materials: [
          {
            id: "m1",
            name: "Chocolate nobre",
            unit: "kg",
            stock: 10,
            min: 2,
            cost: 8000,
          },
          {
            id: "m2",
            name: "Leite condensado",
            unit: "kg",
            stock: 15,
            min: 3,
            cost: 2200,
          },
          {
            id: "m3",
            name: "Manteiga",
            unit: "kg",
            stock: 5,
            min: 1,
            cost: 4000,
          },
          {
            id: "m4",
            name: "Embalagem individual",
            unit: "un",
            stock: 100,
            min: 20,
            cost: 100,
          },
        ],
        products: [
          {
            id: "p1",
            name: "Brigadeiro Gourmet",
            yield: 20,
            price: 800,
            margin: 40,
            days: 4,
            recipe: [
              { material: "m1", qty: 0.2 },
              { material: "m2", qty: 0.4 },
              { material: "m3", qty: 0.02 },
              { material: "m4", qty: 20 },
            ],
          },
          {
            id: "p2",
            name: "Caixa de Brigadeiros",
            yield: 1,
            price: 4800,
            margin: 40,
            days: 4,
            recipe: [
              { material: "m1", qty: 0.06 },
              { material: "m2", qty: 0.12 },
              { material: "m3", qty: 0.006 },
              { material: "m4", qty: 6 },
            ],
          },
        ],
        batches: [
          {
            id: "b1",
            product: "p1",
            qty: 45,
            expires: date(3),
            created: now(),
            unitCost: 260,
          },
          {
            id: "b2",
            product: "p2",
            qty: 8,
            expires: date(2),
            created: now(),
            unitCost: 1560,
          },
        ],
        orders: [],
        sales: [],
        movements: [],
        users: [
          {
            id: "u1",
            name: "Gabrielly · Proprietária",
            email: "admin@example.com",
            phone: "11999990000",
            birth: "1995-01-01",
            role: "admin",
            active: true,
          },
          {
            id: "u2",
            name: "Auxiliar Operacional",
            email: "auxiliar@example.com",
            phone: "11999990003",
            birth: "1995-01-01",
            role: "aux",
            active: true,
          },
        ],
        audit: [],
        drafts: {},
      };
    }
    let state,
      persistent = true,
      conflict = false;
    try {
      state = JSON.parse(localStorage.getItem(KEY));
      if (!state || state.version !== 2) state = initial();
    } catch {
      state = initial();
      persistent = false;
    }
    let role = "admin";
    try {
      role =
        sessionStorage.getItem("mf-role") ||
        localStorage.getItem("mf-role") ||
        "admin";
    } catch {}
    const permission =
      /* Consulta as ações liberadas para o perfil demonstrativo selecionado. */ (
        action,
      ) =>
        role === "admin" ||
        ["readOrders", "readStock", "deliver", "produce"].includes(action);
    /* Executa uma alteração local com revisão, histórico e recuperação do estado em caso de erro; não substitui uma transação no servidor. */ function commit(
      fn,
      message,
    ) {
      if (conflict)
        throw Error(
          "Os dados mudaram em outra aba. Recarregue esta página antes de salvar.",
        );
      const backup = JSON.stringify(state);
      try {
        const latest = JSON.parse(localStorage.getItem(KEY) || "null");
        if (latest && latest.revision > state.revision) {
          conflict = true;
          throw Error(
            "Outra aba atualizou os dados. Recarregue antes de continuar.",
          );
        }
      } catch (e) {
        if (conflict) throw e;
      }
      try {
        fn(state);
        state.revision++;
        state.audit.push({
          id: uid(),
          at: now(),
          actor: role === "admin" ? "Proprietária" : "Auxiliar",
          text: message,
        });
        try {
          localStorage.setItem(KEY, JSON.stringify(state));
        } catch {
          persistent = false;
        }
      } catch (e) {
        state = JSON.parse(backup);
        throw e;
      }
      return persistent;
    }
    window.addEventListener(
      "storage",
      /* Responde ao evento “storage” no contexto de Dados e regras locais. */ (
        e,
      ) => {
        if (e.key === KEY) {
          conflict = true;
          window.dispatchEvent(new CustomEvent("mf-conflict"));
        }
      },
    );
    /* Seleciona o perfil demonstrativo e grava sua preferência, sem autenticar uma conta real. */ function setRole(
      value,
      remember,
    ) {
      role = value === "aux" ? "aux" : "admin";
      try {
        sessionStorage.setItem("mf-role", role);
        if (remember) localStorage.setItem("mf-role", role);
        else localStorage.removeItem("mf-role");
      } catch {}
    }
    const stock = /* Soma o saldo dos lotes não vencidos de um produto. */ (
      product,
    ) =>
      state.batches
        .filter(
          /* Seleciona os registros que atendem à condição — Dados e regras locais. */ (
            b,
          ) => b.product === product && b.expires >= date(),
        )
        .reduce(
          /* Acumula os valores necessários ao cálculo — Dados e regras locais. */ (
            s,
            b,
          ) => s + b.qty,
          0,
        );
    const cost =
      /* Calcula o custo dos insumos por unidade produzida a partir da ficha técnica. */ (
        product,
      ) =>
        product.recipe.reduce(
          /* Acumula os valores necessários ao cálculo — Dados e regras locais. */ (
            sum,
            line,
          ) =>
            sum +
            (state.materials.find(
              /* Localiza o registro que corresponde à condição — Dados e regras locais. */ (
                m,
              ) => m.id === line.material,
            )?.cost || 0) *
              line.qty,
          0,
        ) / product.yield;
    const margin =
      /* Calcula a margem sobre o preço de venda considerando o custo informado. */ (
        price,
        costValue,
      ) => (price > 0 ? ((price - costValue) / price) * 100 : 0);
    /* Impede a operação quando os produtos prontos não cobrem a quantidade solicitada. */ function available(
      items,
    ) {
      for (const item of items) {
        if (stock(item.product) < item.qty)
          throw Error(
            `Estoque insuficiente para ${state.products.find(/* Localiza o registro que corresponde à condição — Impede a operação quando os produtos prontos não cobrem a quantidade solicitada. */ (p) => p.id === item.product)?.name || "o produto"}.`,
          );
      }
    }
    /* Baixa produtos dos lotes que vencem primeiro e retorna o custo histórico dos itens consumidos. */ function consume(
      items,
    ) {
      available(items);
      let total = 0;
      for (const item of items) {
        let pending = item.qty;
        const batches = state.batches
          .filter(
            /* Seleciona os registros que atendem à condição — Baixa produtos dos lotes que vencem primeiro e retorna o custo histórico dos itens consumidos. */ (
              b,
            ) => b.product === item.product && b.qty > 0 && b.expires >= date(),
          )
          .sort(
            /* Ordena os registros pelo critério indicado — Baixa produtos dos lotes que vencem primeiro e retorna o custo histórico dos itens consumidos. */ (
              a,
              b,
            ) => a.expires.localeCompare(b.expires),
          );
        for (const b of batches) {
          const qty = Math.min(pending, b.qty);
          b.qty -= qty;
          pending -= qty;
          total += qty * b.unitCost;
          if (!pending) break;
        }
      }
      return Math.round(total);
    }
    /* Bloqueia ações não autorizadas para o perfil demonstrativo atual. */ function needPermission(
      action,
    ) {
      if (!permission(action)) throw Error("Seu perfil não permite esta ação.");
    }
    /* Valida quantidade de dígitos e dígitos verificadores de um CPF. */ function validCPF(
      value,
    ) {
      const n = value.replace(/\D/g, "");
      if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
      return [9, 10].every(
        /* Confere se todos os elementos atendem à validação — Valida quantidade de dígitos e dígitos verificadores de um CPF. */ (
          len,
        ) => {
          let sum = 0;
          for (let i = 0; i < len; i++) sum += Number(n[i]) * (len + 1 - i);
          const digit = (sum * 10) % 11;
          return (digit === 10 ? 0 : digit) === Number(n[len]);
        },
      );
    }
    /* Valida quantidade de dígitos e dígitos verificadores de um CNPJ numérico. */ function validCNPJ(
      value,
    ) {
      const n = value.replace(/\D/g, "");
      if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
      return [12, 13].every(
        /* Confere se todos os elementos atendem à validação — Valida quantidade de dígitos e dígitos verificadores de um CNPJ numérico. */ (
          len,
        ) => {
          let w = len - 7,
            sum = 0;
          for (let i = 0; i < len; i++) {
            sum += Number(n[i]) * w;
            w = w === 2 ? 9 : w - 1;
          }
          const rest = sum % 11;
          return (rest < 2 ? 0 : 11 - rest) === Number(n[len]);
        },
      );
    }
    return {
      get state /* Executa a rotina interna de Dados e regras locais. */() {
        return state;
      },
      get role /* Executa a rotina interna de Dados e regras locais. */() {
        return role;
      },
      get persistent /* Executa a rotina interna de Dados e regras locais. */() {
        return persistent;
      },
      uid,
      date,
      now,
      localDate,
      commit,
      setRole,
      permission,
      needPermission,
      stock,
      cost,
      margin,
      available,
      consume,
      validCPF,
      validCNPJ,
    };
  }
)();

/* ==================== 2. APRESENTAÇÃO ==================== */
window.UI = (
  /* Inicializa os componentes e utilidades de interface. */ () => {
    const esc =
      /* Escapa caracteres especiais antes de inserir conteúdo em HTML. */ (
        v,
      ) =>
        String(v ?? "").replace(
          /[&<>"']/g,
          /* Executa a etapa interna — Apresentação. */ (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[c],
        );
    const money =
      /* Formata um valor inteiro em centavos como moeda brasileira. */ (n) =>
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format((Number(n) || 0) / 100);
    const num =
      /* Formata quantidades com até três casas decimais no padrão brasileiro. */ (
        n,
      ) =>
        new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(
          Number(n) || 0,
        );
    const date =
      /* Formata uma data ou instante para apresentação no padrão brasileiro. */ (
        v,
      ) =>
        v
          ? new Date(v.length === 10 ? v + "T12:00:00" : v).toLocaleString(
              "pt-BR",
              v.length === 10
                ? { dateStyle: "short" }
                : { dateStyle: "short", timeStyle: "short" },
            )
          : "—";
    const badge =
      /* Gera o indicador textual e visual de situação de um registro. */ (
        text,
        type = "pendente",
      ) => `<span class="status-badge status-${type}">${esc(text)}</span>`;
    // Gera botões com ícone decorativo; o rótulo permanece explícito e acessível.
    function btn(text, action, id = "", cls = "btn-acao-tabela") {
      const recordActions = [
        "client",
        "supplier",
        "material",
        "product",
        "user",
        "order",
      ];
      const icons = {
        settings: "fa-gear",
        "clear-filters": "fa-filter-circle-xmark",
        addresses: "fa-location-dot",
        "address-edit": "fa-location-dot",
        "client-history": "fa-clock-rotate-left",
        "material-history": "fa-clock-rotate-left",
        movement: "fa-arrow-right-arrow-left",
        production: "fa-plus",
        loss: "fa-minus",
        sale: "fa-plus",
        "quick-sale": "fa-cash-register",
        "order-detail": "fa-eye",
        "order-next": "fa-arrow-right",
        "order-cancel": "fa-ban",
        receive: "fa-hand-holding-dollar",
        receipt: "fa-receipt",
        dispatch: "fa-truck",
        delivered: "fa-check",
        print: "fa-print",
        export: "fa-file-arrow-down",
        "receipt-download": "fa-download",
        "recipe-add": "fa-plus",
        "cart-add": "fa-plus",
        "recipe-remove": "fa-trash-can",
        "cart-remove": "fa-trash-can",
        "order-new-client": "fa-user-plus",
        "sale-new-client": "fa-user-plus",
      };
      const icon = recordActions.includes(action)
        ? id
          ? "fa-pen"
          : "fa-plus"
        : icons[action];
      const destructive = [
        "order-cancel",
        "recipe-remove",
        "cart-remove",
      ].includes(action);
      return `<button type="button" class="${cls}${destructive ? " action-danger" : ""}" data-action="${esc(action)}" data-id="${esc(id)}">${icon ? `<i class="fa-solid ${icon}" aria-hidden="true"></i>` : ""}<span>${esc(text)}</span></button>`;
    }
    // Retorna apenas os números, limitando o tamanho dos documentos e telefones.
    function numericDigits(value, limit = 11) {
      return String(value ?? "")
        .replace(/\D/g, "")
        .slice(0, limit);
    }
    // Aplica progressivamente a máscara 000.000.000-00, sem exigir pontuação manual.
    function formatCPF(value) {
      const digits = numericDigits(value);
      return (
        digits.slice(0, 3) +
        (digits.length > 3 ? "." + digits.slice(3, 6) : "") +
        (digits.length > 6 ? "." + digits.slice(6, 9) : "") +
        (digits.length > 9 ? "-" + digits.slice(9, 11) : "")
      );
    }
    // Pontua progressivamente os 14 números do CNPJ, inclusive ao colar ou editar.
    function formatCNPJ(value) {
      const digits = numericDigits(value, 14);
      return (
        digits.slice(0, 2) +
        (digits.length > 2 ? "." + digits.slice(2, 5) : "") +
        (digits.length > 5 ? "." + digits.slice(5, 8) : "") +
        (digits.length > 8 ? "/" + digits.slice(8, 12) : "") +
        (digits.length > 12 ? "-" + digits.slice(12, 14) : "")
      );
    }
    // Ajusta automaticamente telefone fixo (10 dígitos) e celular (11 dígitos), com DDD.
    function formatPhone(value) {
      const digits = numericDigits(value);
      if (!digits) return "";
      if (digits.length <= 2) return "(" + digits;
      const local = digits.slice(2);
      const split = local.length > 8 ? 5 : 4;
      return (
        "(" +
        digits.slice(0, 2) +
        ") " +
        local.slice(0, split) +
        (local.length > split ? "-" + local.slice(split) : "")
      );
    }
    const maskFormatters = {
      cpf: formatCPF,
      cnpj: formatCNPJ,
      phone: formatPhone,
    };
    // Encontra a posição visual do cursor pelo número de dígitos antes dele.
    function digitCaret(value, digitCount) {
      if (digitCount <= 0) return 0;
      let found = 0;
      for (let position = 0; position < value.length; position++) {
        if (/\d/.test(value[position]) && ++found === digitCount)
          return position + 1;
      }
      return value.length;
    }
    // Formata um campo sem deslocar o cursor durante inserção, exclusão ou colagem.
    function applyInputMask(input, preserveCaret = false) {
      const mask = input.dataset.mask;
      if (!mask) return;
      const raw = input.value;
      const selection = input.selectionStart ?? raw.length;
      const count = raw.slice(0, selection).replace(/\D/g, "").length;
      const digits = numericDigits(raw, mask === "cnpj" ? 14 : 11);
      input.value = maskFormatters[mask](digits);
      // A máscara confere o tamanho; os dígitos verificadores continuam no cadastro.
      const complete =
        mask === "cpf"
          ? digits.length === 11
          : mask === "cnpj"
            ? digits.length === 14
            : [10, 11].includes(digits.length);
      input.setCustomValidity(
        digits.length && !complete
          ? mask === "cpf"
            ? "Informe os 11 números do CPF."
            : mask === "cnpj"
              ? "Informe os 14 números do CNPJ."
              : "Informe o telefone com DDD e 10 ou 11 números."
          : "",
      );
      if (preserveCaret && document.activeElement === input) {
        const caret = digitCaret(input.value, count);
        input.setSelectionRange(caret, caret);
      }
    }
    // Aplica as máscaras também aos dados preenchidos ao abrir um formulário de edição.
    function prepareMasks(root) {
      root
        .querySelectorAll("input[data-mask]")
        .forEach((input) => applyInputMask(input));
    }
    // A delegação atende a todos os campos criados dinamicamente nos modais.
    document.addEventListener("input", (event) => {
      if (event.target.matches("input[data-mask]") && !event.isComposing)
        applyInputMask(event.target, true);
    });
    // Finaliza a formatação após composição de texto por teclado virtual.
    document.addEventListener("compositionend", (event) => {
      if (event.target.matches("input[data-mask]"))
        applyInputMask(event.target, true);
    });
    // Copia o trecho selecionado da senha real, mesmo enquanto o campo mostra bolinhas.
    document.addEventListener("copy", (event) => {
      const input = event.target;
      if (
        !(input instanceof HTMLInputElement) ||
        !input.matches(
          'input[type="password"], input[autocomplete="new-password"], input[autocomplete="current-password"]',
        ) ||
        !event.clipboardData
      )
        return;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? start;
      if (start === end) return;
      event.clipboardData.setData("text/plain", input.value.slice(start, end));
      event.preventDefault();
    });
    // Copia sob ação do usuário; a mudança de tipo é síncrona e restaurada antes da pintura.
    // Isso permite copiar uma senha oculta também em navegadores que bloqueiam a cópia nativa.
    async function copyPassword(input, selectionOnly = false) {
      const start = selectionOnly ? (input.selectionStart ?? 0) : 0;
      const end = selectionOnly
        ? (input.selectionEnd ?? start)
        : input.value.length;
      if (start === end) return false;
      const text = input.value.slice(start, end);
      const originalType = input.type;
      const originalStart = input.selectionStart;
      const originalEnd = input.selectionEnd;
      const focused = document.activeElement;
      let copied = false;
      try {
        input.type = "text";
        input.focus({ preventScroll: true });
        input.setSelectionRange(start, end);
        copied = document.execCommand("copy");
      } catch {
        // O caminho moderno abaixo atende quando a cópia síncrona não está disponível.
      } finally {
        input.type = originalType;
        input.setSelectionRange(originalStart, originalEnd);
        focused?.focus({ preventScroll: true });
      }
      if (!copied && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          copied = true;
        } catch {
          // Retorna o resultado sem registrar ou persistir o conteúdo da senha.
        }
      }
      return copied;
    }
    // Ctrl+C e Cmd+C mantêm o comportamento de copiar somente o trecho selecionado.
    document.addEventListener("keydown", (event) => {
      const input = event.target;
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        event.key.toLowerCase() === "c" &&
        input instanceof HTMLInputElement &&
        input.type === "password" &&
        input.selectionStart !== input.selectionEnd
      ) {
        event.preventDefault();
        copyPassword(input, true);
      }
    });
    // Permite apagar números junto a pontos, parênteses e hífens sem prender o cursor.
    document.addEventListener("beforeinput", (event) => {
      const input = event.target;
      if (
        !input.matches("input[data-mask]") ||
        input.selectionStart !== input.selectionEnd
      )
        return;
      const backward = event.inputType === "deleteContentBackward";
      const forward = event.inputType === "deleteContentForward";
      if (!backward && !forward) return;
      const position = input.selectionStart ?? 0;
      const adjacent = input.value[backward ? position - 1 : position];
      if (!adjacent || /\d/.test(adjacent)) return;
      const count = input.value.slice(0, position).replace(/\D/g, "").length;
      const remove = backward ? count - 1 : count;
      const digits = numericDigits(
        input.value,
        input.dataset.mask === "cnpj" ? 14 : 11,
      );
      if (remove < 0 || remove >= digits.length) return;
      event.preventDefault();
      input.value = digits.slice(0, remove) + digits.slice(remove + 1);
      applyInputMask(input);
      const caret = digitCaret(input.value, remove);
      input.setSelectionRange(caret, caret);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    /* Gera um campo de formulário com rótulo associado, valor inicial e restrições de preenchimento. */ function field(
      name,
      label,
      value = "",
      type = "text",
      extra = "",
    ) {
      // Documentos e telefones recebem o mesmo comportamento em todos os módulos.
      const mask = ["cpf", "cnpj"].includes(name.toLowerCase())
        ? name.toLowerCase()
        : type === "tel"
          ? "phone"
          : "";
      if (mask) {
        value = maskFormatters[mask](value);
        extra = extra.replace(
          /\b(?:maxlength|minlength|inputmode|pattern)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
          "",
        );
        extra += ` data-mask="${mask}" inputmode="numeric" maxlength="${mask === "cpf" ? 14 : mask === "cnpj" ? 18 : 15}"`;
      }
      return `<div class="input-group"><label for="f-${name}">${esc(label)}</label><input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}></div>`;
    }
    /* Gera uma lista de seleção com rótulo, opções e valor selecionado. */ function select(
      name,
      label,
      options,
      value = "",
      extra = "required",
    ) {
      return `<div class="input-group"><label for="f-${name}">${esc(label)}</label><select id="f-${name}" name="${name}" class="custom-select" ${extra}>${options.map(/* Transforma cada registro para compor o resultado — Gera uma lista de seleção com rótulo, opções e valor selecionado. */ (o) => `<option value="${esc(o[0])}" ${String(o[0]) === String(value) ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select></div>`;
    }
    const actions =
      /* Gera os botões de confirmar e cancelar usados no rodapé dos formulários. */ (
        submit = "Salvar",
      ) =>
        `<div class="flow-actions sticky-actions"><button class="btn-primary" type="submit">${esc(submit)}</button><button class="btn-secondary" type="button" data-action="close">Cancelar</button></div>`;
    let opener;
    let returnOnClose = null;
    let dirty = false;
    /* Abre o diálogo, preenche título e conteúdo, acompanha alterações e direciona o foco. */ function open(
      title,
      html,
      after,
      onReturn,
    ) {
      const dialog = document.getElementById("app-dialog");
      // Ao trocar o conteúdo do mesmo modal, preserva o elemento que o abriu.
      if (dialog.open) dialog.close();
      else opener = document.activeElement;
      dirty = false;
      returnOnClose = onReturn || null;
      document.getElementById("dialog-title").textContent = title;
      document.getElementById("dialog-body").innerHTML = html;
      prepareMasks(dialog);
      dialog.showModal();
      document.body.classList.add("dialog-open");
      dialog.oninput = /* Trata dialog.oninput no contexto de open. */ () =>
        (dirty = true);
      dialog.oncancel = /* Trata dialog.oncancel no contexto de open. */ (
        e,
      ) => {
        e.preventDefault();
        close();
      };
      dialog.onclick = /* Trata dialog.onclick no contexto de open. */ (e) => {
        if (e.target === dialog) {
          const r = dialog.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            close();
        }
      };
      setTimeout(
        /* Executa a atualização após o intervalo agendado — Abre o diálogo, preenche título e conteúdo, acompanha alterações e direciona o foco. */ () => {
          (
            dialog.querySelector("input:not([type=hidden]),select,textarea") ||
            document.getElementById("dialog-close")
          ).focus();
        },
        0,
      );
      if (after) after(dialog);
    }
    /* Fecha o diálogo, pede confirmação quando existem alterações e devolve o foco ao controle de origem. */ function close(
      force = false,
    ) {
      const d = document.getElementById("app-dialog");
      if (!d?.open) return;
      if (
        !force &&
        dirty &&
        !confirm("Descartar as alterações deste formulário?")
      )
        return;
      // Formulários auxiliares podem devolver o usuário ao fluxo que estava preenchendo.
      if (returnOnClose) {
        const resume = returnOnClose;
        returnOnClose = null;
        resume();
        return;
      }
      d.close();
      dirty = false;
      document.body.classList.remove("dialog-open");
      opener?.focus();
    }
    // Considera pendente apenas um formulário aberto que recebeu alterações.
    function hasUnsavedChanges() {
      return Boolean(document.getElementById("app-dialog")?.open && dirty);
    }
    // Registra alterações feitas por botões que adicionam ou removem itens.
    function markDirty() {
      dirty = true;
    }
    /* Apresenta uma notificação temporária de sucesso, aviso ou erro. */ function toast(
      message,
      error = false,
    ) {
      const root = document.getElementById("notifications");
      root.textContent = message;
      root.classList.toggle("is-error", error);
      root.classList.add("visible");
      clearTimeout(root.timer);
      root.timer = setTimeout(
        /* Executa a atualização após o intervalo agendado — Apresenta uma notificação temporária de sucesso, aviso ou erro. */ () =>
          root.classList.remove("visible"),
        6500,
      );
    }
    /* Intercepta o envio, verifica os campos obrigatórios e mostra erros sem perder o formulário. */ function bindForm(
      handler,
    ) {
      const f = document.querySelector("#dialog-body form");
      f.addEventListener(
        "submit",
        /* Responde ao evento “submit” no contexto de bindForm. */ (e) => {
          e.preventDefault();
          const error = f.querySelector(".form-error");
          error.textContent = "";
          try {
            prepareMasks(f);
            if (!f.reportValidity()) return;
            handler(new FormData(f), f);
          } catch (e) {
            error.textContent = e.message;
            error.focus();
          }
        },
      );
    }
    const form =
      /* Envolve o conteúdo em um formulário com área de erros e botões padronizados. */ (
        body,
        submit = "Salvar",
      ) =>
        `<form><p class="form-error" role="alert" tabindex="-1"></p>${body}${actions(submit)}</form>`;
    /* Monta uma tabela acessível com cabeçalhos e mensagem para ausência de resultados. */ function table(
      headers,
      rows,
      empty = "Nenhum registro encontrado.",
    ) {
      return `<div class="table-responsive" role="region" aria-label="Resultados" tabindex="0"><table class="data-table"><thead><tr>${headers.map(/* Transforma cada registro para compor o resultado — Monta uma tabela acessível com cabeçalhos e mensagem para ausência de resultados. */ (h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map(/* Transforma cada registro para compor o resultado — Monta uma tabela acessível com cabeçalhos e mensagem para ausência de resultados. */ (cells) => `<tr>${cells.map(/* Transforma cada registro para compor o resultado — Monta uma tabela acessível com cabeçalhos e mensagem para ausência de resultados. */ (c) => `<td class="${String(c).includes("R$") ? "money-cell" : /\b\d{2}\/\d{2}\/\d{4}/.test(String(c)) ? "date-cell" : ""}">${c}</td>`).join("")}</tr>`).join("") : `<tr><td class="empty-state" colspan="${headers.length}">${esc(empty)}</td></tr>`}</tbody></table></div>`;
    }
    /* Gera e baixa um arquivo CSV com os registros fornecidos. */ function csv(
      headers,
      rows,
      name,
    ) {
      const cell =
        /* Escapa aspas e neutraliza prefixos de fórmulas ao preparar uma célula para CSV. */ (
          v,
        ) =>
          '"' +
          String(v ?? "")
            .replace(/^[\s]*[=+@\-]/, "'$&")
            .replace(/"/g, '""') +
          '"';
      const text =
        "\uFEFF" +
        [headers, ...rows]
          .map(
            /* Transforma cada registro para compor o resultado — Gera e baixa um arquivo CSV com os registros fornecidos. */ (
              r,
            ) => r.map(cell).join(";"),
          )
          .join("\r\n");
      const url = URL.createObjectURL(
        new Blob([text], { type: "text/csv;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = name + ".csv";
      a.click();
      setTimeout(
        /* Executa a atualização após o intervalo agendado — Gera e baixa um arquivo CSV com os registros fornecidos. */ () =>
          URL.revokeObjectURL(url),
        1000,
      );
    }
    return {
      hasUnsavedChanges,
      markDirty,
      formatCPF,
      formatCNPJ,
      formatPhone,
      applyInputMask,
      prepareMasks,
      esc,
      money,
      num,
      date,
      badge,
      btn,
      field,
      select,
      actions,
      open,
      close,
      toast,
      bindForm,
      form,
      table,
      csv,
    };
  }
)();

/* ==================== 3. PÁGINAS E INTERAÇÕES ==================== */
/* Interface multipágina em JavaScript nativo, sem dependências de execução. */
(
  /* Inicializa as páginas, os formulários e os eventos da aplicação. */ () => {
    const D = MF,
      U = UI,
      $ = /* Executa a rotina interna de Páginas e interações. */ (s) =>
        document.querySelector(s),
      E = U.esc,
      M = U.money,
      B = U.btn,
      F = U.field,
      S = U.select;
    const page = document.body.dataset.page;
    const get =
      /* Localiza um registro pelo identificador no conjunto de dados solicitado. */ (
        type,
        id,
      ) =>
        D.state[type].find(
          /* Localiza o registro que corresponde à condição — Páginas e interações. */ (
            x,
          ) => x.id === id,
        );
    const val =
      /* Lê e remove espaços externos de um campo enviado pelo formulário. */ (
        fd,
        key,
      ) => String(fd.get(key) || "").trim();
    const number =
      /* Lê um valor numérico e impede valores inválidos ou inferiores ao mínimo. */ (
        fd,
        key,
        min = 0,
      ) => {
        const n = Number(fd.get(key));
        if (!Number.isFinite(n) || n < min)
          throw Error("Informe uma quantidade ou valor válido.");
        return n;
      };
    const integer =
      /* Exige uma quantidade inteira válida e respeita o mínimo informado. */ (
        fd,
        key,
        min = 1,
      ) => {
        const n = number(fd, key, min);
        if (!Number.isInteger(n))
          throw Error("A quantidade deve ser um número inteiro.");
        return n;
      };
    const cents =
      /* Converte um valor monetário informado no formulário para centavos inteiros. */ (
        fd,
        key,
      ) => Math.round(number(fd, key) * 100);
    const required = 'required maxlength="120"';
    const perms = {
      home: "readStock",
      pedidos: "readOrders",
      entregas: "deliver",
      estoque: "readStock",
      "produtos-prontos": "readStock",
      produtos: "manage",
      clientes: "manage",
      fornecedores: "manage",
      vendas: "manage",
      relatorios: "manage",
    };
    let query = "",
      filter = "Todos",
      reportType = "vendas",
      reportStart = D.date(-30),
      reportEnd = D.date(),
      currentRows = [],
      reportHeaders = [];
    /* Persiste a alteração local, fecha o diálogo, atualiza a página e informa o resultado. */ function save(
      fn,
      message,
    ) {
      const persisted = D.commit(fn, message);
      U.close(true);
      const trigger = document.activeElement;
      const action = trigger?.dataset.action;
      const recordId = trigger?.dataset.id;
      render();
      // A atualização da tabela não perde o foco do botão acionado pelo teclado.
      if (action)
        document
          .querySelector(
            `[data-action="${CSS.escape(action)}"][data-id="${CSS.escape(recordId || "")}"]`,
          )
          ?.focus();
      U.toast(
        persisted
          ? message
          : message +
              " Não foi possível salvar as alterações de forma permanente.",
        !persisted,
      );
    }
    /* Apresenta o erro no diálogo aberto ou em uma notificação da página. */ function fail(
      e,
    ) {
      const d = $("#app-dialog");
      if (d?.open) {
        let error = $("#dialog-body .dialog-error");
        if (!error) {
          error = document.createElement("p");
          error.className = "form-error dialog-error";
          error.setAttribute("role", "alert");
          error.tabIndex = -1;
          $("#dialog-body").prepend(error);
        }
        error.textContent = e.message || String(e);
        error.focus();
      } else U.toast(e.message || String(e), true);
    }
    /* Converte registros cadastrados em opções para campos de seleção. */ function options(
      type,
      label = "Selecione...",
    ) {
      return [
        ["", label],
        ...D.state[type].map(
          /* Transforma cada registro para compor o resultado — Converte registros cadastrados em opções para campos de seleção. */ (
            x,
          ) => [x.id, x.name],
        ),
      ];
    }
    /* Reúne os componentes de um endereço em uma descrição legível. */ function address(
      a,
    ) {
      return a
        ? [a.street, a.number, a.extra, a.district, a.city, a.zip]
            .filter(Boolean)
            .join(", ")
        : "Sem endereço";
    }
    /* Define as formas de pagamento exibidas nos formulários. */ function paymentOptions() {
      return [
        ["", "Selecione..."],
        ["pix", "Pix"],
        ["debito", "Cartão de débito"],
        ["credito", "Cartão de crédito"],
        ["dinheiro", "Dinheiro"],
        ["boleto", "Boleto"],
        ["transferencia", "Transferência"],
        ["pendente", "A definir / pendente"],
      ];
    }
    const payName =
      /* Converte o código da forma de pagamento no nome apresentado ao usuário. */ (
        v,
      ) =>
        paymentOptions().find(
          /* Localiza o registro que corresponde à condição — Páginas e interações. */ (
            p,
          ) => p[0] === v,
        )?.[1] || "Não definido";
    const total =
      /* Calcula o total dos itens do pedido e acrescenta a taxa de entrega. */ (
        o,
      ) =>
        o.items.reduce(
          /* Acumula os valores necessários ao cálculo — Páginas e interações. */ (
            sum,
            i,
          ) => sum + i.qty * i.price,
          0,
        ) + (o.fee || 0);
    const clientName = /* Obtém o nome do cliente vinculado ao registro. */ (
      id,
    ) => get("clients", id)?.name || "Cliente não encontrado";
    const productsText =
      /* Resume produtos e quantidades preservando o nome registrado quando disponível. */ (
        items,
      ) =>
        items
          .map(
            /* Transforma cada registro para compor o resultado — Páginas e interações. */ (
              i,
            ) =>
              `${i.qty} × ${i.name || get("products", i.product)?.name || "Produto"}`,
          )
          .join("; ");
    /* Gera a barra de busca, filtros, limpeza e ações do módulo atual. */ function toolbar(
      actions,
      filters = ["Todos"],
    ) {
      return `<div class="toolbar"><div class="search-box"><label class="sr-only" for="list-search">Buscar registros</label><input type="search" id="list-search" placeholder="Buscar nesta página..." value="${E(query)}" autocomplete="off"></div><div class="filters" role="group" aria-label="Filtrar resultados">${filters.map(/* Transforma cada registro para compor o resultado — Gera a barra de busca, filtros, limpeza e ações do módulo atual. */ (f) => `<button type="button" class="filter-btn ${filter === f ? "active" : ""}" data-filter="${E(f)}" aria-pressed="${filter === f}">${E(f)}</button>`).join("")}</div><div class="toolbar-actions">${query || filter !== "Todos" ? /* Botão “Limpar filtros”: Limpa a busca e retorna ao filtro Todos. */ B("Limpar filtros", "clear-filters", "", "btn-secondary") : ""}${actions}</div></div>`;
    }
    /* Monta o cartão de listagem com título, total de resultados e tabela. */ function list(
      title,
      headers,
      rows,
      empty,
    ) {
      return `<section class="table-card"><div class="table-header-row"><h2>${E(title)}</h2><span class="count-badge">${rows.length} ${rows.length === 1 ? "registro" : "registros"}</span></div>${U.table(headers, rows, empty)}</section>`;
    }
    /* Compara o termo da busca sem diferenciar maiúsculas e acentos. */ function matches(
      x,
    ) {
      return JSON.stringify(x)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(
          query
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase(),
        );
    }
    /* Gera os cartões de indicadores a partir de rótulos e valores. */ function kpis(
      items,
    ) {
      return `<div class="kpi-mini-grid">${items.map(/* Transforma cada registro para compor o resultado — Gera os cartões de indicadores a partir de rótulos e valores. */ ([label, value]) => `<div class="kpi-mini-card"><div><span class="kpi-mini-label">${E(label)}</span><strong class="kpi-mini-val">${E(value)}</strong></div></div>`).join("")}</div>`;
    }
    /* Atualiza o conteúdo do módulo e aplica as permissões demonstrativas. */ function render() {
      const root = $("#app");
      if (!root) return;

      if (!D.permission(perms[page] || "manage")) {
        root.innerHTML =
          '<div class="notice"><h2>Acesso restrito</h2><p>Este módulo está disponível para a proprietária.</p><a href="home.html">Voltar ao início</a></div>';
        root.setAttribute("aria-busy", "false");
        return;
      }
      if (page === "home") renderHome(root);
      else if (page === "relatorios") renderReports(root);
      else renderList(root);
      root.setAttribute("aria-busy", "false");
    }
    // Monta os atalhos principais sem descrições redundantes, respeitando o perfil atual.
    function renderHome(root) {
      const cards = [
        {
          title: "Novo Pedido",
          href: "pedidos.html?openModal=true",
          icon: "fa-plus",
          permission: "manage",
          featured: true,
        },
        {
          title: "Caixa / Vendas",
          href: "vendas.html",
          icon: "fa-cash-register",
          permission: "manage",
        },
        {
          title: "Pedidos em Andamento",
          href: "pedidos.html",
          icon: "fa-clipboard-check",
          permission: "readOrders",
        },
        {
          title: "Estoque Geral",
          href: "estoque.html",
          icon: "fa-cube",
          permission: "readStock",
        },
        {
          title: "Entregas",
          href: "entregas.html",
          icon: "fa-truck",
          permission: "deliver",
        },
        {
          title: "Relatórios",
          href: "relatorios.html",
          icon: "fa-file-lines",
          permission: "manage",
        },
        {
          title: "Clientes",
          href: "clientes.html",
          icon: "fa-user-group",
          permission: "manage",
        },
      ];
      root.innerHTML = `<div class="bento-grid-new">${cards
        .filter((card) => D.permission(card.permission))
        .map(
          (card) =>
            `<a href="${card.href}" class="bento-card${card.featured ? " bento-destaque" : ""}"><div class="bento-icon-wrapper"><div class="icon-box"><i class="fa-solid ${card.icon}" aria-hidden="true"></i></div><i class="fa-solid fa-chevron-right arrow-icon" aria-hidden="true"></i></div><div class="bento-text"><h2>${card.title}</h2></div></a>`,
        )
        .join("")}</div>`;
    }
    /* Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ function renderList(
      root,
    ) {
      const admin = D.role === "admin";
      let rows = [],
        headers = [],
        actions = "",
        title = "",
        filters = ["Todos"];
      if (page === "clientes") {
        actions =
          /* Botão “Novo cliente”: Abre cadastro ou edição de cliente. */ B(
            "Novo cliente",
            "client",
            "",
            "btn-novo",
          );
        title = "Clientes cadastrados";
        headers = ["Cliente", "CPF", "Contato", "Endereços", "Ações"];
        rows = D.state.clients
          .filter(matches)
          .map(
            /* Transforma cada registro para compor o resultado — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              c,
            ) => [
              E(c.name),
              E(c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")),
              `${E(U.formatPhone(c.phone))}<br><span class="muted">${E(c.email)}</span>`,
              String(c.addresses.length),
              /* Botão “Editar”: Abre cadastro ou edição de cliente. */ B(
                "Editar",
                "client",
                c.id,
              ) +
                /* Botão “Endereços”: Lista endereços do cliente. */ B(
                  "Endereços",
                  "addresses",
                  c.id,
                ) +
                /* Botão “Histórico”: Consulta os pedidos do cliente. */ B(
                  "Histórico",
                  "client-history",
                  c.id,
                ),
            ],
          );
      } else if (page === "fornecedores") {
        actions =
          /* Botão “Novo fornecedor”: Abre cadastro ou edição de fornecedor. */ B(
            "Novo fornecedor",
            "supplier",
            "",
            "btn-novo",
          );
        title = "Fornecedores de insumos";
        headers = [
          "Fornecedor",
          "CNPJ",
          "Categoria",
          "Contato",
          "Prazo",
          "Ações",
        ];
        rows = D.state.suppliers
          .filter(matches)
          .map(
            /* Transforma cada registro para compor o resultado — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              s,
            ) => [
              E(s.name),
              E(U.formatCNPJ(s.cnpj)),
              E(s.category),
              `${E(U.formatPhone(s.phone))}<br>${E(s.email)}`,
              `${s.lead} dia(s) úteis`,
              /* Botão “Editar”: Abre cadastro ou edição de fornecedor. */ B(
                "Editar",
                "supplier",
                s.id,
              ),
            ],
          );
      } else if (page === "estoque") {
        actions = admin
          ? /* Botão “Movimentar”: Abre movimentação do insumo selecionado. */ B(
              "Movimentar",
              "movement",
              "",
              "btn-secondary",
            ) +
            /* Botão “Nova matéria-prima”: Abre cadastro ou edição de matéria-prima. */ B(
              "Nova matéria-prima",
              "material",
              "",
              "btn-novo",
            )
          : "";
        title = "Insumos e ingredientes";
        headers = [
          "Matéria-prima",
          "Saldo",
          "Mínimo",
          ...(admin ? ["Custo por unidade"] : []),
          "Situação",
          "Ações",
        ];
        filters = ["Todos", "Estoque baixo", "Nível seguro"];
        rows = D.state.materials
          .filter(
            /* Seleciona os registros que atendem à condição — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              m,
            ) =>
              matches(m) &&
              (filter === "Todos" ||
                (filter === "Estoque baixo"
                  ? m.stock <= m.min
                  : m.stock > m.min)),
          )
          .map(
            /* Transforma cada registro para compor o resultado — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              m,
            ) => [
              E(m.name),
              `${U.num(m.stock)} ${E(m.unit)}`,
              `${U.num(m.min)} ${E(m.unit)}`,
              ...(admin ? [M(m.cost)] : []),
              U.badge(
                m.stock <= m.min ? "Estoque baixo" : "Nível seguro",
                m.stock <= m.min ? "critico" : "pronto",
              ),
              (admin
                ? /* Botão “Movimentar”: Abre movimentação do insumo selecionado. */ B(
                    "Movimentar",
                    "movement",
                    m.id,
                  ) +
                  /* Botão “Editar”: Abre cadastro ou edição de matéria-prima. */ B(
                    "Editar",
                    "material",
                    m.id,
                  )
                : "") +
                /* Botão “Histórico”: Consulta movimentações da matéria-prima. */ B(
                  "Histórico",
                  "material-history",
                  m.id,
                ),
            ],
          );
      } else if (page === "produtos") {
        actions =
          /* Botão “Novo produto”: Abre cadastro ou edição da ficha técnica. */ B(
            "Novo produto",
            "product",
            "",
            "btn-novo",
          );
        title = "Catálogo e fichas técnicas";
        headers = [
          "Produto",
          "Custo de insumos/un.",
          "Preço/un.",
          "Margem sobre venda",
          "Mínimo",
          "Ações",
        ];
        rows = D.state.products
          .filter(matches)
          .map(
            /* Transforma cada registro para compor o resultado — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              p,
            ) => [
              E(p.name),
              M(D.cost(p)),
              M(p.price),
              U.num(D.margin(p.price, D.cost(p))) + "%",
              U.num(p.margin) + "%",
              /* Botão “Ficha técnica / Editar”: Abre cadastro ou edição da ficha técnica. */ B(
                "Ficha técnica / Editar",
                "product",
                p.id,
              ),
            ],
          );
      } else if (page === "produtos-prontos") {
        actions =
          (D.permission("produce")
            ? /* Botão “Registrar produção”: Abre o registro de produção concluída. */ B(
                "Registrar produção",
                "production",
                "",
                "btn-novo",
              )
            : "") +
          (admin
            ? /* Botão “Baixa por perda”: Abre a baixa por perda de um lote. */ B(
                "Baixa por perda",
                "loss",
                "",
                "btn-secondary",
              )
            : "");
        title = "Produtos e lotes";
        headers = [
          "Produto",
          "Lote",
          "Quantidade",
          "Validade",
          "Situação",
          "Ações",
        ];
        filters = ["Todos", "Disponíveis", "Vencidos", "Estoque baixo"];
        rows = D.state.batches
          .filter(
            /* Seleciona os registros que atendem à condição — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              b,
            ) => {
              const p = get("products", b.product);
              return (
                b.qty > 0 &&
                matches({ ...b, name: p?.name }) &&
                (filter === "Todos" ||
                  (filter === "Vencidos"
                    ? b.expires < D.date()
                    : filter === "Disponíveis"
                      ? b.expires >= D.date()
                      : D.stock(b.product) <= 5))
              );
            },
          )
          .map(
            /* Transforma cada registro para compor o resultado — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              b,
            ) => {
              const expired = b.expires < D.date();
              return [
                E(get("products", b.product)?.name),
                E(b.id.slice(0, 8)),
                U.num(b.qty),
                U.date(b.expires),
                U.badge(
                  expired
                    ? "Vencido"
                    : b.expires <= D.date(1)
                      ? "Vence em breve"
                      : "Disponível",
                  expired
                    ? "critico"
                    : b.expires <= D.date(1)
                      ? "pendente"
                      : "pronto",
                ),
                admin
                  ? /* Botão “Registrar perda”: Abre a baixa por perda de um lote. */ B(
                      "Registrar perda",
                      "loss",
                      b.id,
                    ) +
                    (expired
                      ? ""
                      : /* Botão “Vender”: Leva o produto selecionado à página de vendas. */ B(
                          "Vender",
                          "quick-sale",
                          b.product,
                        ))
                  : "Consulta",
              ];
            },
          );
      } else if (page === "pedidos") {
        actions = admin
          ? /* Botão “Novo pedido”: Abre cadastro ou edição de pedido. */ B(
              "Novo pedido",
              "order",
              "",
              "btn-novo",
            )
          : "";
        title = "Pedidos registrados";
        headers = [
          "Pedido",
          "Cliente",
          "Produtos",
          ...(admin ? ["Total"] : []),
          "Entrega / retirada",
          "Status",
          "Ações",
        ];
        filters = [
          "Todos",
          "Pendente",
          "Em produção",
          "Pronto",
          "Finalizado",
          "Cancelado",
        ];
        rows = D.state.orders
          .filter(
            /* Seleciona os registros que atendem à condição — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              o,
            ) =>
              matches({
                ...o,
                name: clientName(o.client),
                products: productsText(o.items),
              }) &&
              (filter === "Todos" || o.status === filter),
          )
          .sort(
            /* Ordena os registros pelo critério indicado — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              a,
              b,
            ) => b.created.localeCompare(a.created),
          )
          .map(
            /* Transforma cada registro para compor o resultado — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              o,
            ) => [
              E(o.code),
              E(clientName(o.client)),
              E(productsText(o.items)),
              ...(admin ? [M(total(o))] : []),
              `${U.date(o.due)}<br><span class="muted">${o.mode === "entrega" ? "Entrega" : "Retirada"}</span>`,
              U.badge(
                o.status,
                o.status === "Cancelado"
                  ? "critico"
                  : o.status === "Finalizado"
                    ? "pronto"
                    : "pendente",
              ),
              /* Botão “Detalhes”: Mostra os detalhes e o histórico do pedido. */ B(
                "Detalhes",
                "order-detail",
                o.id,
              ),
            ],
          );
      } else if (page === "vendas") {
        actions =
          /* Botão “Nova venda de balcão”: Inicia uma venda de balcão. */ B(
            "Nova venda de balcão",
            "sale",
            "",
            "btn-novo",
          );
        title = "Histórico de vendas";
        headers = [
          "Venda",
          "Cliente",
          "Produtos",
          "Pagamento",
          "Data / hora",
          "Total",
          "Ações",
        ];
        filters = ["Todos", "Pagas", "Pendentes"];
        const sales = D.state.sales.filter(
          /* Seleciona os registros que atendem à condição — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
            s,
          ) =>
            matches({
              ...s,
              name: s.client ? clientName(s.client) : "Cliente Balcão",
              products: productsText(s.items),
            }) && filter !== "Pendentes",
        );
        rows = sales
          .slice()
          .reverse()
          .map(
            /* Transforma cada registro para compor o resultado — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              s,
            ) => [
              E(s.code),
              E(s.client ? clientName(s.client) : "Cliente Balcão"),
              E(productsText(s.items)),
              E(payName(s.payment)),
              U.date(s.created),
              M(s.total),
              /* Botão “Comprovante”: Exibe o comprovante demonstrativo. */ B(
                "Comprovante",
                "receipt",
                s.id,
              ),
            ],
          );
        if (filter !== "Pagas")
          rows.push(
            ...D.state.orders
              .filter(
                /* Seleciona os registros que atendem à condição — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
                  o,
                ) =>
                  o.status !== "Cancelado" &&
                  !o.sale &&
                  matches({ ...o, name: clientName(o.client) }),
              )
              .map(
                /* Transforma cada registro para compor o resultado — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
                  o,
                ) => [
                  E(o.code),
                  E(clientName(o.client)),
                  E(productsText(o.items)),
                  U.badge("Pendente"),
                  U.date(o.created),
                  M(total(o)),
                  /* Botão “Receber”: Abre o recebimento integral do pedido. */ B(
                    "Receber",
                    "receive",
                    o.id,
                  ),
                ],
              ),
          );
      } else if (page === "entregas") {
        title = "Despachos e logística";
        headers = [
          "Pedido",
          "Cliente",
          "Endereço / telefone",
          "Prazo",
          "Responsável",
          "Status",
          "Ações",
        ];
        filters = ["Todos", "Aguardando envio", "Em rota", "Entregue"];
        rows = D.state.orders
          .filter(
            /* Seleciona os registros que atendem à condição — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              o,
            ) =>
              o.mode === "entrega" &&
              o.status !== "Cancelado" &&
              matches({
                ...o,
                name: clientName(o.client),
                address: address(o.address),
              }) &&
              (filter === "Todos" ||
                (o.delivery || "Aguardando envio") === filter),
          )
          .sort(
            /* Ordena os registros pelo critério indicado — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              a,
              b,
            ) => a.due.localeCompare(b.due),
          )
          .map(
            /* Transforma cada registro para compor o resultado — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
              o,
            ) => [
              E(o.code),
              E(clientName(o.client)),
              `${E(address(o.address))}<br><span class="muted">${E(U.formatPhone(o.phone))}</span>`,
              U.date(o.due),
              E(o.driver || "Não definido"),
              U.badge(
                o.delivery || "Aguardando envio",
                o.delivery === "Entregue" ? "pronto" : "pendente",
              ),
              o.delivery === "Entregue"
                ? /* Botão “Detalhes”: Mostra os detalhes e o histórico do pedido. */ B(
                    "Detalhes",
                    "order-detail",
                    o.id,
                  )
                : o.delivery === "Em rota"
                  ? /* Botão “Confirmar entrega”: Confirma a entrega ao cliente. */ B(
                      "Confirmar entrega",
                      "delivered",
                      o.id,
                    )
                  : /* Botão “Despachar”: Abre o despacho do pedido pronto. */ B(
                      "Despachar",
                      "dispatch",
                      o.id,
                    ),
            ],
          );
      }
      root.innerHTML =
        (page === "vendas"
          ? kpis([
              [
                "Recebido hoje",
                M(
                  D.state.sales
                    .filter(
                      /* Seleciona os registros que atendem à condição — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
                        s,
                      ) => D.localDate(s.created) === D.date(),
                    )
                    .reduce(
                      /* Acumula os valores necessários ao cálculo — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
                        a,
                        s,
                      ) => a + s.total,
                      0,
                    ),
                ),
              ],
              ["Vendas registradas", String(D.state.sales.length)],
              [
                "Pedidos a receber",
                String(
                  D.state.orders.filter(
                    /* Seleciona os registros que atendem à condição — Monta as listagens de cada página com busca, filtros, dados e ações específicas. */ (
                      o,
                    ) => !o.sale && o.status !== "Cancelado",
                  ).length,
                ),
              ],
            ])
          : "") +
        toolbar(actions, filters) +
        list(
          title,
          headers,
          rows,
          page === "pedidos"
            ? "Nenhum pedido encontrado. Use Novo pedido para começar."
            : "Nenhum registro encontrado para estes filtros.",
        );
    }
    /* Abre cadastro ou edição de cliente e valida CPF, duplicidade e telefone. */ function clientForm(
      id,
      flow = {},
    ) {
      D.needPermission("manage");
      const c = get("clients", id);
      U.open(
        c ? "Editar cliente" : "Cadastrar cliente",
        U.form(
          `<div class="form-grid">${/* Campo “Nome completo *” (name): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("name", "Nome completo *", c?.name || "", "text", required)}${/* Campo “CPF *” (cpf): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("cpf", "CPF *", c?.cpf || "", "text", 'required inputmode="numeric" maxlength="14"')}${/* Campo “E-mail *” (email): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("email", "E-mail *", c?.email || "", "email", 'required maxlength="120" autocomplete="email"')}${/* Campo “Telefone / WhatsApp *” (phone): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("phone", "Telefone / WhatsApp *", c?.phone || "", "tel", 'required minlength="10" maxlength="30" autocomplete="tel"')}</div><p class="help">Os endereços são gerenciados separadamente, permitindo mais de um local por cliente.</p>`,
        ),
        undefined,
        flow.onCancel,
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Abre cadastro ou edição de cliente e valida CPF, duplicidade e telefone. */ (
          fd,
        ) => {
          const cpf = val(fd, "cpf").replace(/\D/g, "");
          if (!D.validCPF(cpf)) throw Error("Informe um CPF válido.");
          if (
            D.state.clients.some(
              /* Verifica se algum registro atende à condição — Abre cadastro ou edição de cliente e valida CPF, duplicidade e telefone. */ (
                x,
              ) => x.id !== id && x.cpf === cpf,
            )
          )
            throw Error("Este CPF já está cadastrado.");
          const phone = val(fd, "phone").replace(/\D/g, "");
          if (![10, 11].includes(phone.length))
            throw Error("Informe o telefone com DDD.");
          const clientId = c?.id || D.uid();
          const updateClient =
            /* Atualiza os dados dentro da gravação local — Abre cadastro ou edição de cliente e valida CPF, duplicidade e telefone. */ (
              s,
            ) => {
              const data = {
                name: val(fd, "name"),
                cpf,
                email: val(fd, "email"),
                phone,
              };
              if (c) Object.assign(c, data);
              else s.clients.push({ id: clientId, ...data, addresses: [] });
            };
          const message = c ? "Cliente atualizado." : "Cliente cadastrado.";
          if (flow.onSaved) {
            // O cadastro auxiliar retorna à venda e seleciona o cliente recém-criado.
            const persisted = D.commit(updateClient, message);
            flow.onSaved(clientId);
            U.toast(
              persisted
                ? message
                : message +
                    " Não foi possível salvar as alterações de forma permanente.",
              !persisted,
            );
          } else save(updateClient, message);
        },
      );
    }
    /* Lista os endereços associados ao cliente e oferece cadastro e edição. */ function addresses(
      id,
    ) {
      D.needPermission("manage");
      const c = get("clients", id);
      U.open(
        "Endereços de " + c.name,
        `<p class="help">Cadastre e selecione o endereço no pedido. Alterações futuras não modificam entregas já registradas.</p>${U.table(
          ["Endereço", "Ações"],
          c.addresses.map(
            /* Transforma cada registro para compor o resultado — Lista os endereços associados ao cliente e oferece cadastro e edição. */ (
              a,
            ) => [
              E(address(a)),
              /* Botão “Editar”: Abre cadastro ou edição de endereço. */ B(
                "Editar",
                "address-edit",
                id + "|" + a.id,
              ),
            ],
          ),
          "Nenhum endereço cadastrado.",
        )}${/* Botão “Novo endereço”: Abre cadastro ou edição de endereço. */ B("Novo endereço", "address-edit", id + "|", "btn-primary")}`,
      );
    }
    /* Cadastra ou atualiza o endereço selecionado sem alterar cópias já registradas em pedidos. */ function addressForm(
      key,
    ) {
      D.needPermission("manage");
      const [cid, aid] = key.split("|"),
        c = get("clients", cid),
        a = c.addresses.find(
          /* Localiza o registro que corresponde à condição — Cadastra ou atualiza o endereço selecionado sem alterar cópias já registradas em pedidos. */ (
            x,
          ) => x.id === aid,
        );
      U.open(
        a ? "Editar endereço" : "Novo endereço",
        U.form(
          `<div class="form-grid">${/* Campo “Rua / avenida *” (street): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("street", "Rua / avenida *", a?.street || "", "text", required)}${/* Campo “Número ou S/N *” (number): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("number", "Número ou S/N *", a?.number || "", "text", 'required maxlength="20"')}${/* Campo “Bairro *” (district): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("district", "Bairro *", a?.district || "", "text", required)}${/* Campo “Cidade *” (city): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("city", "Cidade *", a?.city || "Biritiba-Mirim", "text", required)}${/* Campo “CEP *” (zip): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("zip", "CEP *", a?.zip || "", "text", 'required pattern="[0-9]{5}-?[0-9]{3}" inputmode="numeric" maxlength="9"')}${/* Campo “Complemento” (extra): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("extra", "Complemento", a?.extra || "", "text", 'maxlength="120"')}</div>`,
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Cadastra ou atualiza o endereço selecionado sem alterar cópias já registradas em pedidos. */ (
          fd,
        ) =>
          save(
            /* Atualiza os dados dentro da gravação local — Cadastra ou atualiza o endereço selecionado sem alterar cópias já registradas em pedidos. */ () => {
              const data = Object.fromEntries(
                ["street", "number", "district", "city", "zip", "extra"].map(
                  /* Transforma cada registro para compor o resultado — Cadastra ou atualiza o endereço selecionado sem alterar cópias já registradas em pedidos. */ (
                    k,
                  ) => [k, val(fd, k)],
                ),
              );
              if (a) Object.assign(a, data);
              else c.addresses.push({ id: D.uid(), ...data });
            },
            "Endereço salvo.",
          ),
      );
    }
    /* Cadastra ou edita fornecedor, validando CNPJ e duplicidade. */ function supplierForm(
      id,
    ) {
      D.needPermission("manage");
      const s = get("suppliers", id);
      U.open(
        s ? "Editar fornecedor" : "Novo fornecedor",
        U.form(
          `<div class="form-grid">${/* Campo “Razão social / nome fantasia *” (name): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("name", "Razão social / nome fantasia *", s?.name || "", "text", required)}${/* Campo “CNPJ *” (cnpj): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("cnpj", "CNPJ *", s?.cnpj || "", "text", 'required maxlength="18" inputmode="numeric"')}${/* Campo “Categoria de insumo *” (category): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("category", "Categoria de insumo *", s?.category || "", "text", required)}${/* Campo “Prazo em dias úteis *” (lead): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("lead", "Prazo em dias úteis *", s?.lead ?? 2, "number", 'required min="0" max="365" step="1"')}${/* Campo “Telefone *” (phone): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("phone", "Telefone *", s?.phone || "", "tel", 'required minlength="10" maxlength="30"')}${/* Campo “E-mail para pedidos *” (email): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("email", "E-mail para pedidos *", s?.email || "", "email", 'required maxlength="120"')}</div>`,
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Cadastra ou edita fornecedor, validando CNPJ e duplicidade. */ (
          fd,
        ) => {
          const cnpj = val(fd, "cnpj").replace(/\D/g, "");
          if (!D.validCNPJ(cnpj)) throw Error("Informe um CNPJ válido.");
          if (
            D.state.suppliers.some(
              /* Verifica se algum registro atende à condição — Cadastra ou edita fornecedor, validando CNPJ e duplicidade. */ (
                x,
              ) => x.id !== id && x.cnpj === cnpj,
            )
          )
            throw Error("CNPJ já cadastrado.");
          const data = {
            name: val(fd, "name"),
            cnpj,
            category: val(fd, "category"),
            lead: integer(fd, "lead", 0),
            phone: val(fd, "phone").replace(/\D/g, ""),
            email: val(fd, "email"),
          };
          save(
            /* Atualiza os dados dentro da gravação local — Cadastra ou edita fornecedor, validando CNPJ e duplicidade. */ (
              st,
            ) =>
              s
                ? Object.assign(s, data)
                : st.suppliers.push({ id: D.uid(), ...data }),
            "Fornecedor salvo.",
          );
        },
      );
    }
    /* Cadastra ou edita matéria-prima, sua unidade, saldo inicial, mínimo e custo. */ function materialForm(
      id,
    ) {
      D.needPermission("manage");
      const m = get("materials", id);
      U.open(
        m ? "Editar matéria-prima" : "Nova matéria-prima",
        U.form(
          `<div class="form-grid">${/* Campo “Nome da matéria-prima *” (name): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("name", "Nome da matéria-prima *", m?.name || "", "text", required)}${
            /* Seleção “Unidade base *” (unit): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S(
              "unit",
              "Unidade base *",
              [
                ["kg", "Quilograma (kg)"],
                ["g", "Grama (g)"],
                ["l", "Litro (l)"],
                ["ml", "Mililitro (ml)"],
                ["un", "Unidade (un)"],
              ],
              m?.unit || "kg",
              m ? "disabled" : "required",
            )
          }${!m ? /* Campo “Saldo inicial *” (stock): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("stock", "Saldo inicial *", 0, "number", 'required min="0" step="0.001"') : ""}${/* Campo “Estoque mínimo *” (min): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("min", "Estoque mínimo *", m?.min || 0, "number", 'required min="0" step="0.001"')}${/* Campo “Custo em R$ por unidade base *” (cost): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("cost", "Custo em R$ por unidade base *", m ? m.cost / 100 : 0, "number", 'required min="0.01" step="0.01"')}</div><p class="help">Use a mesma unidade na receita e nas movimentações. O saldo é alterado por movimentação, preservando o histórico. O custo atual não altera vendas anteriores.</p>`,
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Cadastra ou edita matéria-prima, sua unidade, saldo inicial, mínimo e custo. */ (
          fd,
        ) => {
          const name = val(fd, "name");
          if (
            D.state.materials.some(
              /* Verifica se algum registro atende à condição — Cadastra ou edita matéria-prima, sua unidade, saldo inicial, mínimo e custo. */ (
                x,
              ) =>
                x.id !== id &&
                x.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
            )
          )
            throw Error("Já existe matéria-prima com este nome.");
          const data = {
            name,
            min: number(fd, "min"),
            cost: cents(fd, "cost"),
          };
          save(
            /* Atualiza os dados dentro da gravação local — Cadastra ou edita matéria-prima, sua unidade, saldo inicial, mínimo e custo. */ (
              s,
            ) => {
              if (m) Object.assign(m, data);
              else {
                const material = {
                  id: D.uid(),
                  ...data,
                  unit: val(fd, "unit"),
                  stock: number(fd, "stock"),
                };
                s.materials.push(material);
                s.movements.push({
                  id: D.uid(),
                  material: material.id,
                  type: "entrada",
                  qty: material.stock,
                  reason: "Saldo inicial",
                  at: D.now(),
                });
              }
            },
            "Matéria-prima salva.",
          );
        },
      );
    }
    /* Registra entrada ou saída de matéria-prima e impede retirada superior ao saldo. */ function movementForm(
      id,
    ) {
      D.needPermission("manage");
      U.open(
        "Movimentar matéria-prima",
        U.form(
          `${/* Seleção “Matéria-prima *” (material): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S("material", "Matéria-prima *", options("materials"), id)}<p id="movement-stock" class="notice"></p><div class="form-grid">${
            /* Seleção “Operação *” (type): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S(
              "type",
              "Operação *",
              [
                ["entrada", "Entrada / compra"],
                ["saida", "Saída / uso ou perda"],
              ],
            )
          }${/* Campo “Quantidade na unidade base *” (qty): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("qty", "Quantidade na unidade base *", "", "number", 'required min="0.001" step="0.001"')}${/* Campo “Novo custo por unidade (R$) — opcional” (cost): preenchimento opcional; valor inicial e restrições são definidos nos argumentos seguintes. */ F("cost", "Novo custo por unidade (R$) — opcional", "", "number", 'min="0.01" step="0.01"')}${/* Seleção “Fornecedor — opcional” (supplier): preenchimento opcional; valor inicial e restrições são definidos nos argumentos seguintes. */ S("supplier", "Fornecedor — opcional", options("suppliers", "Não vincular"), "", "")}</div>${/* Campo “Motivo / referência *” (reason): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("reason", "Motivo / referência *", "", "text", 'required maxlength="200"')}`,
        ),
      );
      const update =
        /* Exibe o saldo e a unidade da matéria-prima selecionada. */ () => {
          const m = get("materials", $("#f-material").value);
          $("#movement-stock").textContent = m
            ? `Saldo: ${U.num(m.stock)} ${m.unit}. Informe a quantidade em ${m.unit}.`
            : "Selecione uma matéria-prima.";
        };
      $("#f-material").onchange = update;
      update();
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Registra entrada ou saída de matéria-prima e impede retirada superior ao saldo. */ (
          fd,
        ) => {
          const m = get("materials", val(fd, "material")),
            qty = number(fd, "qty", 0.001),
            type = val(fd, "type");
          if (m.unit === "un" && !Number.isInteger(qty))
            throw Error("Para unidades, informe uma quantidade inteira.");
          if (type === "saida" && qty > m.stock)
            throw Error("A saída supera o saldo disponível.");
          save(
            /* Atualiza os dados dentro da gravação local — Registra entrada ou saída de matéria-prima e impede retirada superior ao saldo. */ (
              s,
            ) => {
              m.stock =
                Math.round(
                  (m.stock + (type === "entrada" ? qty : -qty)) * 1000,
                ) / 1000;
              if (type === "entrada" && val(fd, "cost"))
                m.cost = cents(fd, "cost");
              s.movements.push({
                id: D.uid(),
                material: m.id,
                type,
                qty,
                reason: val(fd, "reason"),
                supplier: val(fd, "supplier"),
                at: D.now(),
              });
            },
            "Movimentação registrada.",
          );
        },
      );
    }
    let recipe = [];
    /* Gera uma linha de insumo, quantidade e remoção para cada componente da receita. */ function recipeMarkup() {
      return recipe
        .map(
          /* Transforma cada registro para compor o resultado — Gera uma linha de insumo, quantidade e remoção para cada componente da receita. */ (
            r,
            i,
          ) =>
            `<div class="recipe-line">${
              /* Seleção “Matéria-prima *” (nome dinâmico): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S(
                "recipeMaterial" + i,
                "Matéria-prima *",
                D.state.materials.map(
                  /* Transforma cada registro para compor o resultado — Gera uma linha de insumo, quantidade e remoção para cada componente da receita. */ (
                    m,
                  ) => [m.id, `${m.name} (${m.unit})`],
                ),
                r.material,
              )
            }${/* Campo “Quantidade *” (nome dinâmico): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("recipeQty" + i, "Quantidade *", r.qty, "number", 'required min="0.001" step="0.001"')}${/* Botão “Remover”: Remove a linha selecionada da receita. */ B("Remover", "recipe-remove", String(i))}</div>`,
        )
        .join("");
    }
    /* Cadastra ou edita a ficha técnica e impede preço abaixo da margem mínima configurada. */ function productForm(
      id,
    ) {
      D.needPermission("manage");
      if (!D.state.materials.length)
        throw Error("Cadastre matérias-primas antes do produto.");
      const p = get("products", id);
      recipe = structuredClone(
        p?.recipe || [{ material: D.state.materials[0].id, qty: 1 }],
      );
      U.open(
        p ? "Editar ficha técnica" : "Novo produto e receita",
        U.form(
          `<div class="form-grid">${/* Campo “Nome do produto *” (name): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("name", "Nome do produto *", p?.name || "", "text", required)}${/* Campo “Rendimento da receita (unidades) *” (yield): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("yield", "Rendimento da receita (unidades) *", p?.yield || 1, "number", 'required min="1" step="1"')}${/* Campo “Preço de venda por unidade (R$) *” (price): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("price", "Preço de venda por unidade (R$) *", p ? p.price / 100 : 0, "number", 'required min="0.01" step="0.01"')}${/* Campo “Margem mínima sobre venda (%) *” (margin): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("margin", "Margem mínima sobre venda (%) *", p?.margin ?? 40, "number", 'required min="0" max="99.9" step="0.1"')}${/* Campo “Validade sugerida em dias *” (days): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("days", "Validade sugerida em dias *", p?.days || 4, "number", 'required min="1" max="365" step="1"')}</div><h3 class="section-heading">Composição da receita</h3><div id="recipe-lines">${recipeMarkup()}</div>${/* Botão “Adicionar insumo”: Acrescenta uma linha de matéria-prima à ficha técnica. */ B("Adicionar insumo", "recipe-add", "", "btn-secondary")}<div id="product-summary" class="notice" aria-live="polite"></div>`,
        ),
      );
      $("#dialog-body").addEventListener("input", productSummary);
      $("#dialog-body").addEventListener("change", productSummary);
      productSummary();
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Cadastra ou edita a ficha técnica e impede preço abaixo da margem mínima configurada. */ (
          fd,
        ) => {
          syncRecipe();
          if (!recipe.length)
            throw Error("Vincule ao menos uma matéria-prima.");
          if (
            new Set(
              recipe.map(
                /* Transforma cada registro para compor o resultado — Cadastra ou edita a ficha técnica e impede preço abaixo da margem mínima configurada. */ (
                  r,
                ) => r.material,
              ),
            ).size !== recipe.length
          )
            throw Error("Agrupe o mesmo insumo em uma única linha.");
          const data = {
            name: val(fd, "name"),
            yield: integer(fd, "yield"),
            price: cents(fd, "price"),
            margin: number(fd, "margin"),
            days: integer(fd, "days"),
            recipe: structuredClone(recipe),
          };
          if (data.margin >= 100)
            throw Error("A margem deve ser menor que 100%.");
          if (D.margin(data.price, D.cost(data)) + 1e-6 < data.margin)
            throw Error(
              "Preço abaixo da margem mínima. Ajuste o preço ou a margem.",
            );
          save(
            /* Atualiza os dados dentro da gravação local — Cadastra ou edita a ficha técnica e impede preço abaixo da margem mínima configurada. */ (
              s,
            ) =>
              p
                ? Object.assign(p, data)
                : s.products.push({ id: D.uid(), ...data }),
            "Ficha técnica salva.",
          );
        },
      );
    }
    /* Atualiza a receita em memória com os valores preenchidos nas linhas do formulário. */ function syncRecipe() {
      recipe.forEach(
        /* Aplica a operação a cada elemento — Atualiza a receita em memória com os valores preenchidos nas linhas do formulário. */ (
          r,
          i,
        ) => {
          r.material = $("#f-recipeMaterial" + i)?.value || r.material;
          r.qty = Number($("#f-recipeQty" + i)?.value || 0);
        },
      );
    }
    /* Atualiza custo unitário, margem atual e preço mínimo enquanto a ficha é preenchida. */ function productSummary() {
      syncRecipe();
      const p = { recipe, yield: Number($("#f-yield")?.value) || 1 },
        cost = D.cost(p),
        price = Math.round(Number($("#f-price")?.value) * 100) || 0,
        margin = Number($("#f-margin")?.value) || 0;
      $("#product-summary").textContent =
        `Insumos por unidade: ${M(cost)} · Margem atual: ${U.num(D.margin(price, cost))}% · Preço mínimo: ${M(Math.ceil(cost / (1 - margin / 100)))}`;
    }
    /* Confirma produção, verifica insumos, deduz a receita proporcionalmente e cria um lote pronto. */ function productionForm() {
      D.needPermission("produce");
      if (!D.state.products.length)
        throw Error("Cadastre um produto e sua receita primeiro.");
      U.open(
        "Registrar produção concluída",
        U.form(
          `${/* Seleção “Produto *” (product): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S("product", "Produto *", options("products"))}<div class="form-grid">${/* Campo “Quantidade produzida *” (qty): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("qty", "Quantidade produzida *", 1, "number", 'required min="1" step="1"')}${/* Campo “Data de validade *” (expires): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("expires", "Data de validade *", D.date(4), "date", `required min="${D.date()}"`)}</div><div id="production-preview" class="notice" aria-live="polite">Selecione o produto para conferir os insumos.</div>`,
          "Confirmar produção",
        ),
      );
      /* Exibe os insumos necessários e seus saldos para a quantidade de produção informada. */ function preview() {
        const p = get("products", $("#f-product").value);
        if (p) {
          const qty = Number($("#f-qty").value) || 0;
          $("#production-preview").textContent = p.recipe
            .map(
              /* Transforma cada registro para compor o resultado — Exibe os insumos necessários e seus saldos para a quantidade de produção informada. */ (
                r,
              ) => {
                const m = get("materials", r.material);
                return `${m.name}: ${U.num((r.qty * qty) / p.yield)} ${m.unit} necessários; saldo ${U.num(m.stock)} ${m.unit}`;
              },
            )
            .join(" · ");
        }
      }
      $("#f-product").onchange =
        /* Trata $("#f-product").onchange no contexto de productionForm. */ () => {
          const p = get("products", $("#f-product").value);
          if (p) $("#f-expires").value = D.date(p.days);
          preview();
        };
      $("#f-qty").oninput = preview;
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Confirma produção, verifica insumos, deduz a receita proporcionalmente e cria um lote pronto. */ (
          fd,
        ) => {
          const p = get("products", val(fd, "product")),
            qty = integer(fd, "qty"),
            expires = val(fd, "expires");
          if (expires < D.date())
            throw Error("A validade não pode ser anterior à produção.");
          for (const r of p.recipe) {
            const m = get("materials", r.material);
            if (m.stock + 1e-8 < (r.qty * qty) / p.yield)
              throw Error("Matéria-prima insuficiente: " + m.name);
          }
          save(
            /* Atualiza os dados dentro da gravação local — Confirma produção, verifica insumos, deduz a receita proporcionalmente e cria um lote pronto. */ (
              s,
            ) => {
              const unitCost = Math.round(D.cost(p));
              for (const r of p.recipe) {
                const m = get("materials", r.material),
                  used = (r.qty * qty) / p.yield;
                m.stock = Math.max(
                  0,
                  Math.round((m.stock - used) * 1000000) / 1000000,
                );
                s.movements.push({
                  id: D.uid(),
                  material: m.id,
                  type: "saida",
                  qty: used,
                  reason: "Produção: " + p.name,
                  at: D.now(),
                });
              }
              s.batches.push({
                id: D.uid(),
                product: p.id,
                qty,
                expires,
                created: D.now(),
                unitCost,
              });
            },
            "Produção registrada.",
          );
        },
      );
    }
    /* Registra a baixa de um lote por validade, avaria ou qualidade, sem gerar receita. */ function lossForm(
      id,
    ) {
      D.needPermission("manage");
      const batches = D.state.batches.filter(
        /* Seleciona os registros que atendem à condição — Registra a baixa de um lote por validade, avaria ou qualidade, sem gerar receita. */ (
          b,
        ) => b.qty > 0,
      );
      if (!batches.length)
        throw Error("Não há saldo em lotes para registrar perda.");
      U.open(
        "Baixa por perda",
        U.form(
          `${
            /* Seleção “Produto / lote *” (batch): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S(
              "batch",
              "Produto / lote *",
              batches.map(
                /* Transforma cada registro para compor o resultado — Registra a baixa de um lote por validade, avaria ou qualidade, sem gerar receita. */ (
                  b,
                ) => [
                  b.id,
                  `${get("products", b.product).name} · ${b.id.slice(0, 8)} · saldo ${b.qty} · validade ${U.date(b.expires)}`,
                ],
              ),
              id || batches[0].id,
            )
          }${/* Campo “Quantidade a descartar *” (qty): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("qty", "Quantidade a descartar *", 1, "number", 'required min="1" step="1"')}${
            /* Seleção “Motivo *” (reason): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S(
              "reason",
              "Motivo *",
              [
                ["Validade expirada", "Validade expirada"],
                ["Avaria", "Avaria"],
                ["Qualidade", "Controle de qualidade"],
              ],
            )
          }${/* Campo “Observação” (note): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("note", "Observação", "", "text", 'maxlength="200"')}<p class="notice">Esta operação reduz o saldo do lote e não gera receita financeira.</p>`,
          "Confirmar baixa",
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Registra a baixa de um lote por validade, avaria ou qualidade, sem gerar receita. */ (
          fd,
        ) => {
          const b = get("batches", val(fd, "batch")),
            qty = integer(fd, "qty");
          if (qty > b.qty) throw Error("Quantidade maior que o saldo do lote.");
          save(
            /* Atualiza os dados dentro da gravação local — Registra a baixa de um lote por validade, avaria ou qualidade, sem gerar receita. */ (
              s,
            ) => {
              b.qty -= qty;
              s.movements.push({
                id: D.uid(),
                product: b.product,
                batch: b.id,
                type: "perda",
                qty,
                reason: val(fd, "reason") + " " + val(fd, "note"),
                at: D.now(),
              });
            },
            "Perda registrada.",
          );
        },
      );
    }
    let cart = [],
      draftTimer;
    /* Monta a tabela de itens com quantidade, preço, subtotal e opção de remoção. */ function cartMarkup() {
      return U.table(
        ["Produto", "Qtd.", "Preço un.", "Subtotal", "Ações"],
        cart.map(
          /* Transforma cada registro para compor o resultado — Monta a tabela de itens com quantidade, preço, subtotal e opção de remoção. */ (
            i,
            n,
          ) => [
            E(get("products", i.product)?.name),
            String(i.qty),
            M(i.price),
            M(i.qty * i.price),
            /* Botão “Remover”: Remove o item selecionado do carrinho. */ B(
              "Remover",
              "cart-remove",
              String(n),
            ),
          ],
        ),
        "Nenhum produto adicionado.",
      );
    }
    /* Atualiza a tabela e o total do carrinho, incluindo taxa de entrega quando aplicável. */ function updateCart() {
      if ($("#cart-items")) $("#cart-items").innerHTML = cartMarkup();
      const fee = Math.round(Number($("#f-fee")?.value || 0) * 100);
      if ($("#cart-total"))
        $("#cart-total").textContent = M(
          cart.reduce(
            /* Acumula os valores necessários ao cálculo — Atualiza a tabela e o total do carrinho, incluindo taxa de entrega quando aplicável. */ (
              s,
              i,
            ) => s + i.price * i.qty,
            0,
          ) + fee,
        );
    }
    /* Gera os controles para selecionar e incluir produtos no pedido ou venda. */ function cartFields() {
      return `<h3 class="section-heading">Produtos</h3><div class="cart-line">${/* Seleção “Produto” (itemProduct): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S("itemProduct", "Produto", options("products"), "", "")}${/* Campo “Quantidade” (itemQty): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("itemQty", "Quantidade", 1, "number", 'min="1" step="1"')}${/* Botão “Incluir”: Inclui o produto e a quantidade no carrinho; agrupa produtos repetidos. */ B("Incluir", "cart-add", "", "btn-secondary")}</div><div id="cart-items">${cartMarkup()}</div>`;
    }
    /* Cadastra ou edita pedido, recupera rascunho e valida cliente, itens, pagamento e endereço. */ function orderForm(
      id,
    ) {
      D.needPermission("manage");
      if (!D.state.clients.length || !D.state.products.length)
        throw Error(
          "Cadastre clientes e produtos antes de registrar um pedido.",
        );
      const o = get("orders", id);
      if (o && (o.status !== "Pendente" || o.sale))
        throw Error(
          "Somente pedidos pendentes e ainda não pagos podem ser editados.",
        );
      const draft =
        !o &&
        D.state.drafts.order &&
        Date.now() - D.state.drafts.order.at < 86400000
          ? D.state.drafts.order
          : null;
      cart = structuredClone(o?.items || draft?.items || []);
      const v = o || draft?.fields || {};
      U.open(
        o ? "Editar pedido " + o.code : "Registrar novo pedido",
        U.form(
          `${draft ? '<p class="notice">Rascunho das últimas 24 horas recuperado.</p>' : ""}<div class="form-grid">${/* Seleção “Cliente cadastrado *” (client): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S("client", "Cliente cadastrado *", options("clients"), v.client)}${
            /* Seleção “Modalidade *” (mode): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S(
              "mode",
              "Modalidade *",
              [
                ["retirada", "Retirada"],
                ["entrega", "Entrega"],
              ],
              v.mode || "retirada",
            )
          }${/* Seleção “Endereço de entrega” (address): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S("address", "Endereço de entrega", [], v.addressId || "", "")}${/* Campo “Data e hora combinadas *” (due): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("due", "Data e hora combinadas *", (v.due || D.date(1) + "T15:00").slice(0, 16), "datetime-local", "required")}${/* Campo “Telefone para contato *” (phone): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("phone", "Telefone para contato *", v.phone || "", "tel", 'required minlength="10" maxlength="30"')}${
            /* Seleção “Forma de pagamento *” (payment): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S(
              "payment",
              "Forma de pagamento *",
              paymentOptions().filter(
                /* Seleciona os registros que atendem à condição — Cadastra ou edita pedido, recupera rascunho e valida cliente, itens, pagamento e endereço. */ (
                  p,
                ) => p[0] !== "pendente",
              ),
              v.payment,
            )
          }${/* Campo “Taxa de entrega (R$)” (fee): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("fee", "Taxa de entrega (R$)", (v.fee || 0) / 100, "number", 'min="0" step="0.01"')}</div>${!o ? /* Botão “Cadastrar cliente e retomar pedido”: Mantém o pedido em rascunho, cadastra cliente e retoma o formulário. */ B("Cadastrar cliente e retomar pedido", "order-new-client", "", "btn-secondary") : ""}${cartFields()}${/* Campo “Observações da encomenda” (note): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("note", "Observações da encomenda", v.note || "", "text", 'maxlength="500"')}<div class="summary-box"><div class="summary-row total"><span>Total do pedido</span><strong id="cart-total"></strong></div></div>`,
          "Salvar pedido",
        ),
      );
      const updateAddress =
        /* Atualiza os endereços e o telefone disponíveis ao selecionar um cliente. */ () => {
          const c = get("clients", $("#f-client").value),
            select = $("#f-address");
          select.innerHTML =
            '<option value="">Selecione...</option>' +
            (c?.addresses || [])
              .map(
                /* Transforma cada registro para compor o resultado — Cadastra ou edita pedido, recupera rascunho e valida cliente, itens, pagamento e endereço. */ (
                  a,
                ) => `<option value="${E(a.id)}">${E(address(a))}</option>`,
              )
              .join("");
          if (c) {
            $("#f-phone").value = c.phone;
            U.applyInputMask($("#f-phone"));
          }
        };
      updateAddress();
      if (v.phone) {
        $("#f-phone").value = v.phone;
        U.applyInputMask($("#f-phone"));
      }
      $("#f-address").value = v.addressId || "";
      const updateMode =
        /* Alterna exigências de endereço e taxa conforme entrega ou retirada. */ () => {
          const delivery = $("#f-mode").value === "entrega";
          $("#f-address").required = delivery;
          $("#f-address").disabled = !delivery;
          $("#f-fee").disabled = !delivery;
          if (!delivery) $("#f-fee").value = 0;
          updateCart();
        };
      $("#f-client").onchange = updateAddress;
      $("#f-mode").onchange = updateMode;
      $("#f-fee").oninput = updateCart;
      updateMode();
      if (!o) {
        $("#dialog-body form").addEventListener(
          "input",
          /* Responde ao evento “input” no contexto de orderForm. */ () => {
            clearTimeout(draftTimer);
            const form = $("#dialog-body form");
            draftTimer = setTimeout(
              /* Executa a atualização após o intervalo agendado — Cadastra ou edita pedido, recupera rascunho e valida cliente, itens, pagamento e endereço. */ () => {
                if (!form?.isConnected) return;
                const f = new FormData(form),
                  fields = Object.fromEntries(
                    [
                      "client",
                      "mode",
                      "address",
                      "due",
                      "phone",
                      "payment",
                      "note",
                    ].map(
                      /* Transforma cada registro para compor o resultado — Cadastra ou edita pedido, recupera rascunho e valida cliente, itens, pagamento e endereço. */ (
                        k,
                      ) => [k, val(f, k)],
                    ),
                  );
                fields.addressId = fields.address;
                fields.fee = Math.round(Number(f.get("fee") || 0) * 100);
                try {
                  D.commit(
                    /* Aplica as alterações ao estado dentro da operação local — Cadastra ou edita pedido, recupera rascunho e valida cliente, itens, pagamento e endereço. */ (
                      s,
                    ) =>
                      (s.drafts.order = {
                        at: Date.now(),
                        fields,
                        items: structuredClone(cart),
                      }),
                    "Rascunho atualizado.",
                  );
                } catch {}
              },
              600,
            );
          },
        );
      }
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Cadastra ou edita pedido, recupera rascunho e valida cliente, itens, pagamento e endereço. */ (
          fd,
        ) => {
          const c = get("clients", val(fd, "client")),
            mode = val(fd, "mode"),
            a = c?.addresses.find(
              /* Localiza o registro que corresponde à condição — Cadastra ou edita pedido, recupera rascunho e valida cliente, itens, pagamento e endereço. */ (
                a,
              ) => a.id === val(fd, "address"),
            );
          if (!cart.length) throw Error("Inclua pelo menos um produto.");
          if (mode === "entrega" && !a)
            throw Error(
              "Cadastre um endereço válido em Clientes antes de selecionar entrega.",
            );
          const due = val(fd, "due");
          if (!due || !Number.isFinite(new Date(due).getTime()))
            throw Error("Informe data e horário válidos.");
          const data = {
            client: c.id,
            mode,
            addressId: a?.id || "",
            address: mode === "entrega" ? structuredClone(a) : null,
            phone: val(fd, "phone").replace(/\D/g, ""),
            due,
            fee: mode === "entrega" ? cents(fd, "fee") : 0,
            payment: val(fd, "payment"),
            note: val(fd, "note"),
            items: structuredClone(cart),
          };
          clearTimeout(draftTimer);
          save(
            /* Atualiza os dados dentro da gravação local — Cadastra ou edita pedido, recupera rascunho e valida cliente, itens, pagamento e endereço. */ (
              s,
            ) => {
              if (o) {
                Object.assign(o, data);
                o.history.push({
                  at: D.now(),
                  text: "Pedido editado pela proprietária.",
                });
              } else {
                s.orders.push({
                  id: D.uid(),
                  code: "#" + String(1049 + s.orders.length),
                  ...data,
                  created: D.now(),
                  status: "Pendente",
                  delivery: "Aguardando envio",
                  history: [{ at: D.now(), text: "Pedido registrado." }],
                });
              }
              delete s.drafts.order;
            },
            o ? "Pedido atualizado." : "Pedido registrado.",
          );
        },
      );
    }
    /* Mostra dados, itens, ações permitidas e histórico de um pedido. */ function orderDetail(
      id,
    ) {
      const o = get("orders", id);
      if (!o) throw Error("Pedido não encontrado.");
      const admin = D.role === "admin";
      U.open(
        "Pedido " + o.code,
        `<dl class="detail-list"><dt>Cliente</dt><dd>${E(clientName(o.client))}</dd><dt>Registrado em</dt><dd>${U.date(o.created)}</dd><dt>Data combinada</dt><dd>${U.date(o.due)}</dd><dt>Modalidade</dt><dd>${o.mode === "entrega" ? "Entrega" : "Retirada"}</dd><dt>Endereço</dt><dd>${E(address(o.address))}</dd><dt>Contato</dt><dd>${E(U.formatPhone(o.phone))}</dd><dt>Status</dt><dd>${U.badge(o.status)}</dd>${admin ? `<dt>Financeiro</dt><dd>${o.sale ? "Pago" : "Pendente"} · ${E(payName(o.payment))} · ${M(total(o))}</dd>` : ""}<dt>Observações</dt><dd>${E(o.note || "Nenhuma")}</dd></dl>${U.table(
          [
            "Produto",
            "Quantidade",
            ...(admin ? ["Preço unitário", "Subtotal"] : []),
          ],
          o.items.map(
            /* Transforma cada registro para compor o resultado — Mostra dados, itens, ações permitidas e histórico de um pedido. */ (
              i,
            ) => [
              E(get("products", i.product)?.name),
              String(i.qty),
              ...(admin ? [M(i.price), M(i.qty * i.price)] : []),
            ],
          ),
        )}<div class="row-actions">${admin && o.status === "Pendente" && !o.sale ? /* Botão “Editar”: Abre cadastro ou edição de pedido. */ B("Editar", "order", id) : ""}${admin && ["Pendente", "Em produção", "Pronto"].includes(o.status) ? /* Botão “Avançar status”: Solicita avanço de etapa do pedido. */ B("Avançar status", "order-next", id) : ""}${admin && o.status !== "Cancelado" && !o.sale ? /* Botão “Receber pagamento”: Abre o recebimento integral do pedido. */ B("Receber pagamento", "receive", id) : ""}${admin && o.status !== "Cancelado" && !o.sale ? /* Botão “Cancelar pedido”: Abre a confirmação de cancelamento com motivo. */ B("Cancelar pedido", "order-cancel", id) : ""}</div><h3 class="section-heading">Histórico</h3><ol class="timeline">${o.history.map(/* Transforma cada registro para compor o resultado — Mostra dados, itens, ações permitidas e histórico de um pedido. */ (h) => `<li>${E(h.text)}<small>${U.date(h.at)}</small></li>`).join("")}</ol>`,
      );
    }
    /* Avança o pedido para a próxima etapa, verificando as condições de finalização. */ function nextOrder(
      id,
    ) {
      D.needPermission("manage");
      const o = get("orders", id),
        next = {
          Pendente: "Em produção",
          "Em produção": "Pronto",
          Pronto: "Finalizado",
        }[o.status];
      if (!next) throw Error("Não é possível avançar este status.");
      if (next === "Finalizado" && o.mode === "entrega")
        throw Error("Conclua a entrega pelo módulo Entregas.");
      if (next === "Finalizado" && !o.sale)
        throw Error("Registre o recebimento antes de finalizar a retirada.");
      if (!confirm(`Alterar o pedido ${o.code} para ${next}?`)) return;
      save(
        /* Atualiza os dados dentro da gravação local — Avança o pedido para a próxima etapa, verificando as condições de finalização. */ () => {
          o.status = next;
          o.history.push({
            at: D.now(),
            text: "Status alterado para " + next + ".",
          });
        },
        "Status atualizado.",
      );
    }
    /* Exige motivo, cancela o pedido ainda não pago e mantém o histórico. */ function cancelOrder(
      id,
    ) {
      D.needPermission("manage");
      const o = get("orders", id);
      if (o.sale)
        throw Error(
          "Não é possível cancelar um pedido com pagamento registrado.",
        );
      U.open(
        "Cancelar pedido " + o.code,
        U.form(
          `${/* Campo “Motivo do cancelamento *” (reason): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("reason", "Motivo do cancelamento *", "", "text", 'required maxlength="300"')}<p class="notice">O pedido continuará disponível no histórico. Como não houve recebimento, nenhum estoque de produto pronto foi baixado.</p>`,
          "Confirmar cancelamento",
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Exige motivo, cancela o pedido ainda não pago e mantém o histórico. */ (
          fd,
        ) =>
          save(
            /* Atualiza os dados dentro da gravação local — Exige motivo, cancela o pedido ainda não pago e mantém o histórico. */ () => {
              o.status = "Cancelado";
              o.history.push({
                at: D.now(),
                text: "Cancelado: " + val(fd, "reason"),
              });
            },
            "Cancelamento registrado.",
          ),
      );
    }
    /* Registra uma venda de balcão, confere estoque e valor recebido e calcula o troco. */ function saleForm(
      productId,
      draft = null,
    ) {
      D.needPermission("manage");
      cart = structuredClone(draft?.items || []);
      if (productId && !draft) {
        const p = get("products", productId);
        cart.push({ product: p.id, qty: 1, price: p.price, name: p.name });
      }
      U.open(
        "Registrar venda de balcão",
        U.form(
          `<div class="sale-client-row">${/* Seleção “Cliente — opcional” (client): permite vincular o cliente à venda. */ S("client", "Cliente — opcional", options("clients", "Cliente Balcão"), draft?.fields.client || "", "")}${/* Cadastra um cliente e retoma esta venda sem perder os dados preenchidos. */ B("Adicionar cliente", "sale-new-client", "", "btn-secondary")}</div>${cartFields()}${
            /* Seleção “Forma de pagamento *” (payment): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S(
              "payment",
              "Forma de pagamento *",
              paymentOptions().filter(
                /* Seleciona os registros que atendem à condição — Registra uma venda de balcão, confere estoque e valor recebido e calcula o troco. */ (
                  p,
                ) => p[0] !== "pendente",
              ),
            )
          }${/* Campo “Valor recebido em dinheiro (R$)” (received): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("received", "Valor recebido em dinheiro (R$)", "", "number", 'min="0" step="0.01"')}<div class="summary-box"><div class="summary-row total"><span>Total a receber</span><strong id="cart-total"></strong></div></div>`,
          "Confirmar recebimento e venda",
        ),
      );
      // Restaura também os valores ainda não incluídos no carrinho e o dinheiro recebido.
      if (draft) {
        for (const [name, value] of Object.entries(draft.fields)) {
          const input = document.getElementById("f-" + name);
          if (input) input.value = value;
        }
        if (draft.dirty) U.markDirty();
      }
      updateCart();
      const update =
        /* Exige valor recebido apenas quando a forma de pagamento é dinheiro. */ () => {
          const cash = $("#f-payment").value === "dinheiro";
          $("#f-received").required = cash;
          $("#f-received").disabled = !cash;
        };
      $("#f-payment").onchange = update;
      update();
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Registra uma venda de balcão, confere estoque e valor recebido e calcula o troco. */ (
          fd,
        ) => {
          if (!cart.length) throw Error("Inclua ao menos um produto.");
          D.available(cart);
          const amount = cart.reduce(
              /* Acumula os valores necessários ao cálculo — Registra uma venda de balcão, confere estoque e valor recebido e calcula o troco. */ (
                s,
                i,
              ) => s + i.qty * i.price,
              0,
            ),
            payment = val(fd, "payment");
          let change = 0;
          if (payment === "dinheiro") {
            const received = cents(fd, "received");
            if (received < amount)
              throw Error("Valor recebido menor que o total.");
            change = received - amount;
          }
          save(
            /* Atualiza os dados dentro da gravação local — Registra uma venda de balcão, confere estoque e valor recebido e calcula o troco. */ (
              s,
            ) => {
              const cost = D.consume(cart);
              s.sales.push({
                id: D.uid(),
                code: "#VD-" + (305 + s.sales.length),
                client: val(fd, "client"),
                items: structuredClone(cart),
                total: amount,
                fee: 0,
                cost,
                payment,
                change,
                created: D.now(),
              });
            },
            "Venda registrada.",
          );
        },
      );
    }
    // Mantém a venda em memória enquanto o cadastro auxiliar de cliente está aberto.
    function saleNewClient() {
      const draft = {
        items: structuredClone(cart),
        fields: Object.fromEntries(
          ["client", "payment", "received", "itemProduct", "itemQty"].map(
            (name) => [name, document.getElementById("f-" + name).value],
          ),
        ),
        dirty: U.hasUnsavedChanges(),
      };
      const resume = () => saleForm(undefined, draft);
      clientForm(undefined, {
        onCancel: resume,
        onSaved(clientId) {
          draft.fields.client = clientId;
          draft.dirty = true;
          resume();
        },
      });
    }
    /* Registra o recebimento integral de um pedido e baixa seus produtos prontos. */ function receiveForm(
      id,
    ) {
      D.needPermission("manage");
      const o = get("orders", id);
      if (o.sale || o.status === "Cancelado")
        throw Error("O pedido não está disponível para recebimento.");
      U.open(
        "Receber pedido " + o.code,
        U.form(
          `<p class="notice">Total a receber: <strong>${M(total(o))}</strong></p>${
            /* Seleção “Forma de pagamento *” (payment): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S(
              "payment",
              "Forma de pagamento *",
              paymentOptions().filter(
                /* Seleciona os registros que atendem à condição — Registra o recebimento integral de um pedido e baixa seus produtos prontos. */ (
                  p,
                ) => p[0] !== "pendente",
              ),
              o.payment,
            )
          }<label class="check-row"><input type="checkbox" name="confirmed" required> Confirmei o recebimento do valor total.</label>`,
          "Registrar recebimento",
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Registra o recebimento integral de um pedido e baixa seus produtos prontos. */ (
          fd,
        ) => {
          D.available(o.items);
          save(
            /* Atualiza os dados dentro da gravação local — Registra o recebimento integral de um pedido e baixa seus produtos prontos. */ (
              s,
            ) => {
              const cost = D.consume(o.items),
                sale = {
                  id: D.uid(),
                  code: "#VD-" + (305 + s.sales.length),
                  client: o.client,
                  order: o.id,
                  items: structuredClone(o.items),
                  total: total(o),
                  fee: o.fee,
                  cost,
                  payment: val(fd, "payment"),
                  created: D.now(),
                  change: 0,
                };
              s.sales.push(sale);
              o.sale = sale.id;
              o.payment = sale.payment;
              o.history.push({
                at: D.now(),
                text: "Recebimento integral registrado manualmente.",
              });
            },
            "Recebimento registrado.",
          );
        },
      );
    }
    /* Exibe o registro demonstrativo de recebimento e permite exportá-lo como CSV. */ function receipt(
      id,
    ) {
      D.needPermission("manage");
      const s = get("sales", id);
      U.open(
        "Comprovante " + s.code,
        `<dl class="detail-list"><dt>Data</dt><dd>${U.date(s.created)}</dd><dt>Cliente</dt><dd>${E(s.client ? clientName(s.client) : "Cliente Balcão")}</dd><dt>Forma</dt><dd>${E(payName(s.payment))}</dd><dt>Total</dt><dd>${M(s.total)}</dd><dt>Troco</dt><dd>${M(s.change || 0)}</dd></dl>${U.table(
          ["Produto", "Quantidade", "Valor"],
          s.items.map(
            /* Transforma cada registro para compor o resultado — Exibe o registro demonstrativo de recebimento e permite exportá-lo como CSV. */ (
              i,
            ) => [
              E(i.name || get("products", i.product)?.name),
              String(i.qty),
              M(i.qty * i.price),
            ],
          ),
        )}${/* Botão “Baixar registro CSV”: Baixa o registro de recebimento em CSV. */ B("Baixar registro CSV", "receipt-download", id, "btn-secondary")}`,
      );
    }
    /* Valida pedido pronto e endereço antes de registrar responsável e despacho. */ function dispatchForm(
      id,
    ) {
      D.needPermission("deliver");
      const o = get("orders", id);
      if (!o || o.mode !== "entrega" || o.status !== "Pronto")
        throw Error("O pedido precisa estar pronto e marcado para entrega.");
      if (!o.address?.street || !o.address?.number || !o.address?.district)
        throw Error("Pedido sem endereço válido.");
      U.open(
        "Despachar pedido " + o.code,
        U.form(
          `<p class="notice">${E(address(o.address))}<br>Contato: ${E(U.formatPhone(o.phone))}</p>${/* Campo “Responsável pela entrega *” (driver): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("driver", "Responsável pela entrega *", o.driver || "", "text", required)}${/* Campo “Instruções de entrega” (routeNote): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("routeNote", "Instruções de entrega", o.routeNote || "", "text", 'maxlength="300"')}`,
          "Confirmar despacho",
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Valida pedido pronto e endereço antes de registrar responsável e despacho. */ (
          fd,
        ) =>
          save(
            /* Atualiza os dados dentro da gravação local — Valida pedido pronto e endereço antes de registrar responsável e despacho. */ () => {
              o.driver = val(fd, "driver");
              o.routeNote = val(fd, "routeNote");
              o.delivery = "Em rota";
              o.history.push({
                at: D.now(),
                text: "Despachado por " + o.driver + ".",
              });
            },
            "Pedido em rota.",
          ),
      );
    }
    /* Confirma a entrega em rota e finaliza o pedido com histórico. */ function delivered(
      id,
    ) {
      D.needPermission("deliver");
      const o = get("orders", id);
      if (o.delivery !== "Em rota")
        throw Error("O pedido precisa estar em rota.");
      if (!o.sale)
        throw Error(
          "A proprietária precisa registrar o recebimento antes da conclusão.",
        );
      if (!confirm("Confirmar que o pedido foi entregue ao cliente?")) return;
      save(
        /* Atualiza os dados dentro da gravação local — Confirma a entrega em rota e finaliza o pedido com histórico. */ () => {
          o.delivery = "Entregue";
          o.status = "Finalizado";
          o.deliveredAt = D.now();
          o.history.push({ at: D.now(), text: "Entrega concluída." });
        },
        "Entrega confirmada.",
      );
    }
    /* Apresenta o histórico de pedidos do cliente ou movimentações da matéria-prima. */ function history(
      type,
      id,
    ) {
      let rows, title;
      if (type === "client") {
        title = "Histórico de pedidos";
        rows = D.state.orders
          .filter(
            /* Seleciona os registros que atendem à condição — Apresenta o histórico de pedidos do cliente ou movimentações da matéria-prima. */ (
              o,
            ) => o.client === id,
          )
          .map(
            /* Transforma cada registro para compor o resultado — Apresenta o histórico de pedidos do cliente ou movimentações da matéria-prima. */ (
              o,
            ) => [E(o.code), U.date(o.created), E(o.status), M(total(o))],
          );
        U.open(
          title,
          U.table(
            ["Pedido", "Data", "Status", "Total"],
            rows,
            "Este cliente ainda não possui pedidos.",
          ),
        );
      } else {
        title = "Movimentações da matéria-prima";
        rows = D.state.movements
          .filter(
            /* Seleciona os registros que atendem à condição — Apresenta o histórico de pedidos do cliente ou movimentações da matéria-prima. */ (
              m,
            ) => m.material === id,
          )
          .slice()
          .reverse()
          .map(
            /* Transforma cada registro para compor o resultado — Apresenta o histórico de pedidos do cliente ou movimentações da matéria-prima. */ (
              m,
            ) => [U.date(m.at), E(m.type), U.num(m.qty), E(m.reason)],
          );
        U.open(
          title,
          U.table(["Data", "Operação", "Quantidade", "Motivo"], rows),
        );
      }
    }
    /* Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ function renderReports(
      root,
    ) {
      D.needPermission("manage");
      const within =
        /* Verifica se a data do registro pertence ao intervalo selecionado. */ (
          v,
        ) => D.localDate(v) >= reportStart && D.localDate(v) <= reportEnd;
      let rows = [];
      if (reportType === "vendas") {
        reportHeaders = [
          "Venda",
          "Data",
          "Cliente",
          "Produtos / quantidades",
          "Pagamento",
          "Receita (R$)",
          "Insumos (R$)",
          "Resultado após insumos (R$)",
          "Margem (%)",
        ];
        rows = D.state.sales
          .filter(
            /* Seleciona os registros que atendem à condição — Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ (
              s,
            ) => within(s.created),
          )
          .map(
            /* Transforma cada registro para compor o resultado — Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ (
              s,
            ) => [
              s.code,
              U.date(s.created),
              s.client ? clientName(s.client) : "Cliente Balcão",
              productsText(s.items),
              payName(s.payment),
              (s.total / 100).toFixed(2),
              (s.cost / 100).toFixed(2),
              ((s.total - s.cost) / 100).toFixed(2),
              D.margin(s.total, s.cost).toFixed(1),
            ],
          );
      } else if (reportType === "pedidos" || reportType === "entregas") {
        reportHeaders = [
          "Pedido",
          "Emissão",
          "Data combinada",
          "Cliente",
          "Produtos / quantidades",
          "Modalidade",
          "Pagamento",
          "Status",
          "Recebido",
          "Total (R$)",
          "Custo de insumos (R$)",
          "Resultado (R$)",
          "Margem (%)",
          ...(reportType === "entregas"
            ? ["Endereço", "Responsável", "Status entrega"]
            : []),
        ];
        rows = D.state.orders
          .filter(
            /* Seleciona os registros que atendem à condição — Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ (
              o,
            ) =>
              within(o.created) &&
              (reportType !== "entregas" || o.mode === "entrega"),
          )
          .map(
            /* Transforma cada registro para compor o resultado — Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ (
              o,
            ) => {
              const sale = get("sales", o.sale),
                cost =
                  sale?.cost ??
                  Math.round(
                    o.items.reduce(
                      /* Acumula os valores necessários ao cálculo — Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ (
                        s,
                        i,
                      ) => s + D.cost(get("products", i.product)) * i.qty,
                      0,
                    ),
                  );
              return [
                o.code,
                U.date(o.created),
                U.date(o.due),
                clientName(o.client),
                productsText(o.items),
                o.mode,
                payName(o.payment),
                o.status,
                o.sale ? "Sim" : "Não",
                (total(o) / 100).toFixed(2),
                (cost / 100).toFixed(2),
                ((total(o) - cost) / 100).toFixed(2),
                D.margin(total(o), cost).toFixed(1),
                ...(reportType === "entregas"
                  ? [address(o.address), o.driver || "", o.delivery]
                  : []),
              ];
            },
          );
      } else {
        reportHeaders = [
          "Data",
          "Item",
          "Tipo",
          "Quantidade",
          "Unidade",
          "Motivo",
        ];
        rows = D.state.movements
          .filter(
            /* Seleciona os registros que atendem à condição — Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ (
              m,
            ) => within(m.at),
          )
          .map(
            /* Transforma cada registro para compor o resultado — Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ (
              m,
            ) => [
              U.date(m.at),
              m.material
                ? get("materials", m.material)?.name
                : get("products", m.product)?.name,
              m.type,
              U.num(m.qty),
              m.material ? get("materials", m.material)?.unit : "un",
              m.reason,
            ],
          );
      }
      currentRows = rows;
      const sales = D.state.sales.filter(
          /* Seleciona os registros que atendem à condição — Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ (
            s,
          ) => within(s.created),
        ),
        revenue = sales.reduce(
          /* Acumula os valores necessários ao cálculo — Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ (
            s,
            x,
          ) => s + x.total,
          0,
        ),
        cost = sales.reduce(
          /* Acumula os valores necessários ao cálculo — Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ (
            s,
            x,
          ) => s + x.cost,
          0,
        );
      root.innerHTML =
        kpis([
          ["Recebimentos no período", M(revenue)],
          ["Custo dos insumos vendidos", M(cost)],
          ["Resultado após insumos", M(revenue - cost)],
        ]) +
        `<p class="notice">Os resultados consideram apenas os insumos das fichas técnicas; não representam lucro líquido. Custos de vendas são preservados na confirmação. Pedidos sem recebimento apresentam estimativa pelo custo atual.</p><div class="toolbar"><form id="report-form" class="report-period">${
          /* Seleção “Relatório” (reportType): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S(
            "reportType",
            "Relatório",
            [
              ["vendas", "Vendas"],
              ["pedidos", "Pedidos"],
              ["entregas", "Entregas"],
              ["estoque", "Estoque"],
            ],
            reportType,
          )
        }${/* Campo “De *” (start): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("start", "De *", reportStart, "date", "required")}${/* Campo “Até *” (end): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("end", "Até *", reportEnd, "date", "required")}<button class="btn-secondary" type="submit">Aplicar período</button></form><div class="toolbar-actions">${/* Botão “Imprimir / PDF”: Abre a impressão nativa da página. */ B("Imprimir / PDF", "print", "", "btn-secondary")}${/* Botão “Exportar CSV”: Baixa os resultados filtrados em CSV. */ B("Exportar CSV", "export", "", "btn-novo")}</div></div><p class="help print-title">Período: ${U.date(reportStart)} a ${U.date(reportEnd)} · Tipo: ${E(reportType)}</p>` +
        list(
          "Demonstrativo · " + U.date(reportStart) + " a " + U.date(reportEnd),
          reportHeaders,
          rows.map(
            /* Transforma cada registro para compor o resultado — Filtra relatórios por período e tipo, calcula indicadores e prepara linhas para exportação. */ (
              r,
            ) => r.map(E),
          ),
          "Não há movimentações no período selecionado.",
        );
      $("#report-form").onsubmit =
        /* Trata $("#report-form").onsubmit no contexto de renderReports. */ (
          e,
        ) => {
          e.preventDefault();
          const fd = new FormData(e.target),
            start = val(fd, "start"),
            end = val(fd, "end");
          if (start > end) {
            U.toast("A data inicial deve ser anterior ou igual à final.", true);
            return;
          }
          reportStart = start;
          reportEnd = end;
          reportType = val(fd, "reportType");
          render();
        };
    }
    // Gera os botões operacionais de Configurações, com ícone, rótulo e cor próprios da ação.
    function settingsAction(
      label,
      action,
      id = "",
      kind = "neutral",
      icon = "fa-pen",
    ) {
      return `<button type="button" class="settings-action settings-action--${E(kind)}" data-action="${E(action)}" data-id="${E(id)}"><i class="fa-solid ${E(icon)}" aria-hidden="true"></i><span>${E(label)}</span></button>`;
    }
    // Apresenta abas de navegação com indicador de seleção, separadas dos botões de ação.
    function settings(tab = "profile", focusTab = false) {
      const admin = D.role === "admin";
      const user =
        D.state.users.find((u) => u.role === D.role && u.active) ||
        D.state.users[0];
      const tabs = [
        { key: "profile", label: "Meu perfil", action: "settings-profile" },
      ];
      if (admin)
        tabs.push(
          {
            key: "users",
            label: "Gerenciar usuários",
            action: "settings-users",
          },
          {
            key: "audit",
            label: "Histórico de alterações",
            action: "settings-audit",
          },
        );
      if (!tabs.some((item) => item.key === tab)) tab = "profile";
      // As abas alternam o painel; não representam operações sobre usuários ou dados.
      let content = `<div class="settings-tabs" role="tablist" aria-label="Seções de configurações">${tabs.map((item) => `<button type="button" role="tab" class="settings-tab${item.key === tab ? " is-active" : ""}" id="settings-tab-${item.key}" data-action="${item.action}" aria-selected="${item.key === tab}" aria-controls="settings-panel-${item.key}" tabindex="${item.key === tab ? 0 : -1}">${E(item.label)}</button>`).join("")}</div>`;
      let panel = "";
      if (tab === "users") {
        panel =
          U.table(
            ["Usuário", "Perfil", "Situação", "Ações"],
            D.state.users.map((u) => [
              E(u.name),
              u.role === "admin" ? "Administrador" : "Operacional",
              `<span class="settings-state${u.active ? " is-active" : ""}">${u.active ? "Ativo" : "Inativo"}</span>`,
              `<div class="settings-row-actions">${
                // Editar abre o formulário de dados do usuário.
                settingsAction("Editar", "user", u.id, "edit", "fa-pen")
              }${
                u.role === "aux"
                  ? // Ativar ou desativar altera a situação da conta; excluir mantém a confirmação existente.
                    settingsAction(
                      u.active ? "Desativar" : "Ativar",
                      "user-toggle",
                      u.id,
                      u.active ? "warning" : "success",
                      u.active ? "fa-user-slash" : "fa-user-check",
                    ) +
                    settingsAction(
                      "Excluir",
                      "user-delete",
                      u.id,
                      "danger",
                      "fa-trash-can",
                    )
                  : ""
              }</div>`,
            ]),
          ) +
          `<div class="settings-footer">${
            // Novo usuário abre um cadastro, visualmente separado da navegação entre abas.
            settingsAction(
              "Novo usuário",
              "user",
              "",
              "primary",
              "fa-user-plus",
            )
          }</div>`;
      } else if (tab === "audit") {
        panel = U.table(
          ["Data", "Perfil", "Ação"],
          D.state.audit
            .slice(-100)
            .reverse()
            .map((entry) => [U.date(entry.at), E(entry.actor), E(entry.text)]),
        );
      } else {
        panel = `<dl class="detail-list settings-profile-details"><dt>Nome</dt><dd>${E(user.name)}</dd><dt>E-mail</dt><dd>${E(user.email)}</dd><dt>Telefone</dt><dd>${E(U.formatPhone(user.phone))}</dd><dt>Nascimento</dt><dd>${U.date(user.birth)}</dd><dt>Perfil</dt><dd>${admin ? "Administrador" : "Operacional"}</dd></dl><div class="settings-profile-actions">${
          // Editar meus dados abre o formulário do perfil atual.
          settingsAction(
            "Editar meus dados",
            "my-profile",
            user.id,
            "primary",
            "fa-user-pen",
          )
        }${
          // Alterar senha abre o fluxo de preenchimento e confirmação de senha.
          settingsAction(
            "Alterar senha",
            "password-preview",
            "",
            "neutral",
            "fa-lock",
          )
        }</div>`;
      }
      // Mantém todos os painéis referenciados pelas abas no DOM, ocultando os não selecionados.
      content += tabs
        .map(
          (item) =>
            `<section class="settings-panel" id="settings-panel-${item.key}" role="tabpanel" aria-labelledby="settings-tab-${item.key}" tabindex="0"${item.key === tab ? "" : " hidden"}>${item.key === tab ? panel : ""}</section>`,
        )
        .join("");
      U.open("Configurações", content, (dialog) => {
        const tabList = dialog.querySelector('[role="tablist"]');
        // As setas, Home e End alternam as abas e mantêm o foco no item selecionado.
        tabList.addEventListener("keydown", (event) => {
          if (!event.target.matches('[role="tab"]')) return;
          const index = tabs.findIndex((item) => item.key === tab);
          let next = index;
          if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
          else if (event.key === "ArrowLeft")
            next = (index - 1 + tabs.length) % tabs.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = tabs.length - 1;
          else return;
          event.preventDefault();
          settings(tabs[next].key, true);
        });
        // Executa após o foco inicial do modal para não devolver o foco ao botão Fechar.
        if (focusTab)
          setTimeout(
            () =>
              dialog
                .querySelector('[role="tab"][aria-selected="true"]')
                ?.focus(),
            0,
          );
      });
    }
    /* Cadastra ou edita dados de usuário e seu perfil demonstrativo sem criar credenciais. */ function userForm(
      id,
      self = false,
    ) {
      if (!self) D.needPermission("manage");
      const u = get("users", id);
      U.open(
        u ? "Editar usuário" : "Novo usuário",
        U.form(
          `<div class="form-grid">${/* Campo “Nome completo *” (name): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("name", "Nome completo *", u?.name || "", "text", required)}${/* Campo “E-mail *” (email): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("email", "E-mail *", u?.email || "", "email", 'required maxlength="120"')}${/* Campo “Data de nascimento *” (birth): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("birth", "Data de nascimento *", u?.birth || "", "date", `required max="${D.date()}"`)}${/* Campo “Telefone *” (phone): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("phone", "Telefone *", u?.phone || "", "tel", 'required minlength="10" maxlength="30"')}${
            !self
              ? /* Seleção “Perfil *” (role): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ S(
                  "role",
                  "Perfil *",
                  [
                    ["admin", "Administrador"],
                    ["aux", "Operacional"],
                  ],
                  u?.role || "aux",
                  u?.id === "u1" ? "disabled" : "required",
                )
              : ""
          }</div>`,
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Cadastra ou edita dados de usuário e seu perfil demonstrativo sem criar credenciais. */ (
          fd,
        ) => {
          const email = val(fd, "email");
          if (
            D.state.users.some(
              /* Verifica se algum registro atende à condição — Cadastra ou edita dados de usuário e seu perfil demonstrativo sem criar credenciais. */ (
                x,
              ) => x.id !== id && x.email.toLowerCase() === email.toLowerCase(),
            )
          )
            throw Error("Este e-mail já está cadastrado.");
          const data = {
            name: val(fd, "name"),
            email,
            birth: val(fd, "birth"),
            phone: val(fd, "phone").replace(/\D/g, ""),
            role: self || u?.id === "u1" ? u.role : val(fd, "role"),
          };
          save(
            /* Atualiza os dados dentro da gravação local — Cadastra ou edita dados de usuário e seu perfil demonstrativo sem criar credenciais. */ (
              s,
            ) =>
              u
                ? Object.assign(u, data)
                : s.users.push({ id: D.uid(), ...data, active: true }),
            "Usuário salvo.",
          );
        },
      );
    }
    /* Mostra a prévia de alteração de senha e valida o formato sem gravar a credencial. */ function passwordPreview() {
      U.open(
        "Alterar senha",
        U.form(
          `${/* Campo “Senha atual *” (current): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("current", "Senha atual *", "", "password", 'required autocomplete="current-password"')}${/* Campo “Nova senha *” (new): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("new", "Nova senha *", "", "password", 'required minlength="8" maxlength="128" autocomplete="new-password"')}${/* Campo “Confirmar nova senha *” (confirm): coleta o valor indicado pelo rótulo; valor inicial e restrições são definidos nos argumentos seguintes. */ F("confirm", "Confirmar nova senha *", "", "password", 'required autocomplete="new-password"')}<p class="help">Use ao menos 8 caracteres, maiúscula, minúscula, número e símbolo.</p>`,
          "Validar senha",
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Mostra a prévia de alteração de senha e valida o formato sem gravar a credencial. */ (
          fd,
        ) => {
          validatePassword(val(fd, "new"), val(fd, "confirm"));
          U.close(true);
          U.toast("Formato da senha validado.");
        },
      );
    }
    /* Exige oito caracteres, maiúscula, minúscula, número, símbolo e confirmação idêntica. */ function validatePassword(
      p,
      c,
    ) {
      if (
        p.length < 8 ||
        !/[A-Z]/.test(p) ||
        !/[a-z]/.test(p) ||
        !/\d/.test(p) ||
        !/[\W_]/.test(p)
      )
        throw Error(
          "Use ao menos 8 caracteres com maiúscula, minúscula, número e símbolo.",
        );
      if (!c || p !== c)
        throw Error(
          "As senhas precisam ser iguais e a confirmação é obrigatória.",
        );
    }
    const handlers = {
      /* Cadastra um cliente a partir de Vendas e retoma o preenchimento da venda. */ "sale-new-client":
        saleNewClient,
      /* Ação order-new-client: Mantém o pedido em rascunho, cadastra cliente e retoma o formulário. */ "order-new-client":
        /* Mantém o pedido em rascunho, cadastra cliente e retoma o formulário. */ () => {
          const fd = new FormData($("#dialog-body form"));
          const fields = Object.fromEntries(
            [
              "client",
              "mode",
              "address",
              "due",
              "phone",
              "payment",
              "note",
            ].map(
              /* Transforma cada registro para compor o resultado — Páginas e interações. */ (
                k,
              ) => [k, val(fd, k)],
            ),
          );
          fields.addressId = fields.address;
          fields.fee = Math.round(Number(fd.get("fee") || 0) * 100);
          D.commit(
            /* Aplica as alterações ao estado dentro da operação local — Páginas e interações. */ (
              s,
            ) =>
              (s.drafts.order = {
                at: Date.now(),
                fields,
                items: structuredClone(cart),
              }),
            "Pedido mantido como rascunho.",
          );
          clearTimeout(draftTimer);
          clientForm();
          const f = $("#dialog-body form");
          f.addEventListener(
            "submit",
            /* Responde ao evento “submit” no contexto de Páginas e interações. */ () => {
              if (!$("#app-dialog").open) {
                orderForm();
                $("#f-client").value = D.state.clients.at(-1).id;
                $("#f-client").dispatchEvent(new Event("change"));
              }
            },
          );
        },
      /* Ação clear-filters: Limpa a busca e retorna ao filtro Todos. */ "clear-filters":
        /* Limpa a busca e retorna ao filtro Todos. */ () => {
          query = "";
          filter = "Todos";
          render();
          $("#list-search")?.focus();
        },
      /* Ação settings: Abre as configurações e o perfil. */ settings:
        /* Alterna as telas de perfil, usuários e histórico local conforme a permissão. */ () =>
          settings(),
      /* Ação settings-profile: Exibe os dados do perfil atual. */ "settings-profile":
        /* Exibe os dados do perfil atual. */ () => settings("profile", true),
      /* Ação settings-users: Lista as contas demonstrativas para administração. */ "settings-users":
        /* Lista as contas demonstrativas para administração. */ () =>
          settings("users", true),
      /* Ação settings-audit: Mostra o histórico de alterações locais. */ "settings-audit":
        /* Mostra o histórico de alterações locais. */ () =>
          settings("audit", true),
      /* Ação client: Abre cadastro ou edição de cliente. */ client: clientForm,
      /* Ação addresses: Lista endereços do cliente. */ addresses,
      /* Ação address-edit: Abre cadastro ou edição de endereço. */ "address-edit":
        addressForm,
      /* Ação supplier: Abre cadastro ou edição de fornecedor. */ supplier:
        supplierForm,
      /* Ação material: Abre cadastro ou edição de matéria-prima. */ material:
        materialForm,
      /* Ação movement: Abre movimentação do insumo selecionado. */ movement:
        movementForm,
      /* Ação product: Abre cadastro ou edição da ficha técnica. */ product:
        productForm,
      /* Ação production: Abre o registro de produção concluída. */ production:
        productionForm,
      /* Ação loss: Abre a baixa por perda de um lote. */ loss: lossForm,
      /* Ação order: Abre cadastro ou edição de pedido. */ order: orderForm,
      /* Ação sale: Inicia uma venda de balcão. */ sale: /* Inicia uma venda de balcão. */ () =>
        saleForm(),
      /* Ação quick-sale: Leva o produto selecionado à página de vendas. */ "quick-sale":
        /* Leva o produto selecionado à página de vendas. */ (id) => {
          location.href = "vendas.html?product=" + encodeURIComponent(id);
        },
      /* Ação order-detail: Mostra os detalhes e o histórico do pedido. */ "order-detail":
        orderDetail,
      /* Ação order-next: Solicita avanço de etapa do pedido. */ "order-next":
        nextOrder,
      /* Ação order-cancel: Abre a confirmação de cancelamento com motivo. */ "order-cancel":
        cancelOrder,
      /* Ação receive: Abre o recebimento integral do pedido. */ receive:
        receiveForm,
      /* Ação receipt: Exibe o comprovante demonstrativo. */ receipt,
      /* Ação dispatch: Abre o despacho do pedido pronto. */ dispatch:
        dispatchForm,
      /* Ação delivered: Confirma a entrega ao cliente. */ delivered,
      /* Ação client-history: Consulta os pedidos do cliente. */ "client-history":
        /* Consulta os pedidos do cliente. */ (id) => history("client", id),
      /* Ação material-history: Consulta movimentações da matéria-prima. */ "material-history":
        /* Consulta movimentações da matéria-prima. */ (id) =>
          history("material", id),
      /* Ação user: Abre cadastro ou edição de usuário. */ user: /* Abre cadastro ou edição de usuário. */ (
        id,
      ) => userForm(id),
      /* Ação my-profile: Permite editar os dados do próprio perfil. */ "my-profile":
        /* Permite editar os dados do próprio perfil. */ (id) =>
          userForm(id, true),
      /* Ação password-preview: Abre a validação demonstrativa de alteração de senha. */ "password-preview":
        passwordPreview,
      /* Ação user-delete: Exclui um usuário operacional após confirmação, mantendo o histórico. */ "user-delete":
        /* Exclui um usuário operacional após confirmação, mantendo o histórico. */ (
          id,
        ) => {
          D.needPermission("manage");
          const u = get("users", id);
          if (u.role === "admin")
            throw Error("Não é possível excluir este administrador.");
          if (
            confirm(
              "Excluir o usuário " +
                u.name +
                "? O histórico das operações será preservado.",
            )
          )
            save(
              /* Atualiza os dados dentro da gravação local — Páginas e interações. */ (
                s,
              ) => {
                s.users = s.users.filter(
                  /* Seleciona os registros que atendem à condição — Páginas e interações. */ (
                    x,
                  ) => x.id !== id,
                );
              },
              "Usuário excluído.",
            );
        },
      /* Ação user-toggle: Alterna a situação ativa ou inativa do usuário operacional. */ "user-toggle":
        /* Alterna a situação ativa ou inativa do usuário operacional. */ (
          id,
        ) => {
          D.needPermission("manage");
          const u = get("users", id);
          if (u.role === "admin")
            throw Error("Não é possível desativar este administrador.");
          if (confirm(`${u.active ? "Desativar" : "Ativar"} ${u.name}?`))
            save(
              /* Atualiza os dados dentro da gravação local — Páginas e interações. */ () =>
                (u.active = !u.active),
              "Situação do usuário atualizada.",
            );
        },
      /* Ação close: Solicita o fechamento do diálogo. */ close:
        /* Fecha o diálogo, pede confirmação quando existem alterações e devolve o foco ao controle de origem. */ () =>
          U.close(),
      /* Ação print: Abre a impressão nativa da página. */ print:
        /* Abre a impressão nativa da página. */ () => window.print(),
      /* Ação export: Baixa os resultados filtrados em CSV. */ export:
        /* Baixa os resultados filtrados em CSV. */ () =>
          U.csv(
            reportHeaders,
            currentRows,
            "maria-formiga-" + reportType + "-" + reportStart,
          ),
      /* Ação receipt-download: Baixa o registro de recebimento em CSV. */ "receipt-download":
        /* Baixa o registro de recebimento em CSV. */ (id) => {
          const s = get("sales", id);
          U.csv(
            [
              "Venda",
              "Data",
              "Produto",
              "Quantidade",
              "Preço unitário (R$)",
              "Total recebido (R$)",
              "Pagamento",
            ],
            s.items.map(
              /* Transforma cada registro para compor o resultado — Páginas e interações. */ (
                i,
              ) => [
                s.code,
                U.date(s.created),
                i.name || get("products", i.product)?.name,
                i.qty,
                (i.price / 100).toFixed(2),
                (s.total / 100).toFixed(2),
                payName(s.payment),
              ],
            ),
            "comprovante-demonstrativo-" + s.code.replace("#", ""),
          );
        },
      /* Ação recipe-add: Acrescenta uma linha de matéria-prima à ficha técnica. */ "recipe-add":
        /* Acrescenta uma linha de matéria-prima à ficha técnica. */ () => {
          syncRecipe();
          recipe.push({ material: D.state.materials[0].id, qty: 1 });
          $("#recipe-lines").innerHTML = recipeMarkup();
          productSummary();
        },
      /* Ação recipe-remove: Remove a linha selecionada da receita. */ "recipe-remove":
        /* Remove a linha selecionada da receita. */ (id) => {
          syncRecipe();
          recipe.splice(Number(id), 1);
          $("#recipe-lines").innerHTML = recipeMarkup();
          productSummary();
        },
      /* Ação cart-add: Inclui o produto e a quantidade no carrinho; agrupa produtos repetidos. */ "cart-add":
        /* Inclui o produto e a quantidade no carrinho; agrupa produtos repetidos. */ () => {
          const p = get("products", $("#f-itemProduct").value),
            qty = Number($("#f-itemQty").value);
          if (!p) throw Error("Selecione o produto para incluir.");
          if (!Number.isInteger(qty) || qty < 1)
            throw Error("Informe uma quantidade inteira maior que zero.");
          const item = cart.find(
            /* Localiza o registro que corresponde à condição — Páginas e interações. */ (
              i,
            ) => i.product === p.id,
          );
          if (item) item.qty += qty;
          else cart.push({ product: p.id, name: p.name, qty, price: p.price });
          updateCart();
          $("#f-itemProduct").value = "";
          $("#f-itemQty").value = 1;
        },
      /* Ação cart-remove: Remove o item selecionado do carrinho. */ "cart-remove":
        /* Remove o item selecionado do carrinho. */ (id) => {
          cart.splice(Number(id), 1);
          updateCart();
        },
    };
    document.addEventListener(
      "click",
      /* Responde ao evento “click” no contexto de Páginas e interações. */ (
        e,
      ) => {
        const target = e.target.closest("[data-action]");
        if (target) {
          e.preventDefault();
          try {
            handlers[target.dataset.action]?.(target.dataset.id);
            if (
              [
                "cart-add",
                "cart-remove",
                "recipe-add",
                "recipe-remove",
              ].includes(target.dataset.action)
            )
              U.markDirty();
          } catch (e) {
            fail(e);
          }
        }
        const filterBtn = e.target.closest("[data-filter]");
        if (filterBtn) {
          filter = filterBtn.dataset.filter;
          render();
          document
            .querySelector(`[data-filter="${CSS.escape(filter)}"]`)
            ?.focus();
        }
      },
    );
    document.addEventListener(
      "input",
      /* Responde ao evento “input” no contexto de Páginas e interações. */ (
        e,
      ) => {
        if (e.target.id === "list-search") {
          const position = e.target.selectionStart;
          query = e.target.value;
          render();
          const input = $("#list-search");
          input.focus();
          input.setSelectionRange(position, position);
        }
      },
    );
    if (page === "index") {
      // O campo de identificação e a senha permanecem vazios na abertura do login.
      const loginForm = $("#loginForm");
      const usernameInput = $("#email");
      const passwordInput = $("#password");
      const togglePassword = $(".pwd-toggle");
      // O botão do olho revela ou oculta somente a senha em digitação.
      togglePassword.addEventListener("click", () => {
        const show = passwordInput.type === "password";
        passwordInput.type = show ? "text" : "password";
        togglePassword.setAttribute(
          "aria-label",
          show ? "Ocultar senha" : "Mostrar senha",
        );
        const icon = togglePassword.querySelector("i");
        icon.classList.toggle("fa-eye", !show);
        icon.classList.toggle("fa-eye-slash", show);
      });
      // O perfil é obtido pela identificação da conta; não há seletor no formulário.
      loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (loginForm.dataset.loading === "true") return;
        if (!loginForm.reportValidity()) return;
        // Exige somente conteúdo nos dois campos; não compara usuário ou senha.
        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        if (!username || !password) {
          U.toast("Preencha o usuário e a senha.", true);
          (username ? passwordInput : usernameInput).focus();
          return;
        }
        // Preserva a opção de visualizar o perfil operacional pelo nome auxiliar.
        const role = ["auxiliar", "auxiliar@example.com"].includes(username)
          ? "aux"
          : "admin";
        // A opção Manter-me conectado preserva somente a preferência do perfil.
        D.setRole(role, loginForm.elements.remember.checked);
        passwordInput.value = "";
        // Exibe uma transição visual breve; não executa autenticação nem outra chamada externa.
        loginForm.dataset.loading = "true";
        loginForm.setAttribute("aria-busy", "true");
        $("#btnLogin").disabled = true;
        const loading = document.createElement("div");
        loading.className = "login-loading";
        loading.setAttribute("role", "status");
        loading.setAttribute("aria-live", "polite");
        loading.tabIndex = -1;
        loading.innerHTML =
          '<div class="login-loading-content"><img src="../img/cupcake.png" width="56" height="56" alt=""><span class="login-loading-spinner" aria-hidden="true"></span><p>Carregando...</p></div>';
        document.body.appendChild(loading);
        $(".auth-wrapper").inert = true;
        loading.focus();
        setTimeout(() => {
          location.href = "home.html";
        }, 550);
      });
      // O retorno pelo botão Voltar não deixa o formulário bloqueado pelo carregamento.
      window.addEventListener("pageshow", (event) => {
        if (!event.persisted) return;
        document.querySelector(".login-loading")?.remove();
        $(".auth-wrapper").inert = false;
        delete loginForm.dataset.loading;
        loginForm.removeAttribute("aria-busy");
        $("#btnLogin").disabled = false;
      });
      return;
    }
    if (page === "recuperacao") {
      const recoveryForm = $("#recoveryForm");
      const verificationForm = $("#verificationForm");
      const emailInput = $("#recoveryEmail");
      const codeDigits = [...verificationForm.querySelectorAll(".code-digit")];
      const title = $("#recoveryTitle");
      const description = $("#recoveryDescription");
      // Transfere números digitados ou colados para as posições seguintes, sem conferir seu valor.
      function fillVerificationCode(start, text) {
        const digits = String(text)
          .replace(/\D/g, "")
          .slice(0, codeDigits.length - start);
        if (!digits) return;
        [...digits].forEach((digit, offset) => {
          codeDigits[start + offset].value = digit;
        });
        const next = Math.min(start + digits.length, codeDigits.length - 1);
        codeDigits[next].focus();
        codeDigits[next].select();
      }
      // A primeira etapa solicita apenas um e-mail com formato válido; não envia mensagens.
      recoveryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!recoveryForm.reportValidity()) return;
        recoveryForm.hidden = true;
        verificationForm.hidden = false;
        verificationForm.reset();
        title.textContent = "Verificar código";
        description.textContent =
          "Informe os seis dígitos do código de recuperação para " +
          emailInput.value.trim() +
          ".";
        codeDigits[0].focus();
      });
      // Cada campo recebe somente números e permite colar o código completo.
      codeDigits.forEach((input, index) => {
        input.addEventListener("input", (event) => {
          const content =
            event.data && event.data.length > 1 ? event.data : input.value;
          const numeric = String(content).replace(/\D/g, "");
          input.value = numeric.slice(0, 1);
          if (numeric) fillVerificationCode(index, numeric);
        });
        input.addEventListener("paste", (event) => {
          event.preventDefault();
          fillVerificationCode(index, event.clipboardData.getData("text"));
        });
        // As setas e o Backspace facilitam a correção do código pelo teclado.
        input.addEventListener("keydown", (event) => {
          if (event.key === "Backspace" && !input.value && index > 0) {
            event.preventDefault();
            codeDigits[index - 1].value = "";
            codeDigits[index - 1].focus();
          } else if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            codeDigits[index - 1].focus();
            codeDigits[index - 1].select();
          } else if (
            event.key === "ArrowRight" &&
            index < codeDigits.length - 1
          ) {
            event.preventDefault();
            codeDigits[index + 1].focus();
            codeDigits[index + 1].select();
          }
        });
        input.addEventListener("focus", () => input.select());
      });
      // Basta preencher as seis posições com números, inclusive 000000; não há verificação de código.
      verificationForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!verificationForm.reportValidity()) return;
        location.href = "redefinir-senha.html";
      });
      // Retorna à primeira etapa preservando o endereço de e-mail já digitado.
      $("#btnChangeEmail").addEventListener("click", () => {
        verificationForm.hidden = true;
        recoveryForm.hidden = false;
        title.textContent = "Recuperação de Senha";
        description.textContent =
          "Informe o e-mail cadastrado para recuperar seu acesso.";
        verificationForm.reset();
        emailInput.focus();
      });
      return;
    }
    if (page === "redefinir-senha") {
      // Cada olho altera apenas o campo indicado, preservando o conteúdo e a validação.
      const passwordToggles = Array.from(
        document.querySelectorAll("[data-password-toggle]"),
      );
      function setPasswordVisibility(button, visible) {
        const input = document.getElementById(button.dataset.passwordToggle);
        const label =
          input.id === "newPassword"
            ? "nova senha"
            : "confirmação da nova senha";
        input.type = visible ? "text" : "password";
        button.setAttribute("aria-pressed", String(visible));
        button.setAttribute(
          "aria-label",
          `${visible ? "Ocultar" : "Mostrar"} ${label}`,
        );
        const icon = button.querySelector("i");
        icon.classList.toggle("fa-eye", !visible);
        icon.classList.toggle("fa-eye-slash", visible);
      }
      passwordToggles.forEach((button) => {
        button.addEventListener("click", () => {
          const input = document.getElementById(button.dataset.passwordToggle);
          setPasswordVisibility(button, input.type === "password");
        });
      });
      // Após limpar o formulário, volta a ocultar os dois campos e restaura os ícones.
      $("#resetForm").addEventListener("reset", () => {
        passwordToggles.forEach((button) =>
          setPasswordVisibility(button, false),
        );
      });
      $("#resetForm").onsubmit =
        /* Trata $("#resetForm").onsubmit no contexto de Páginas e interações. */ (
          e,
        ) => {
          e.preventDefault();
          try {
            validatePassword(
              $("#newPassword").value,
              $("#confirmPassword").value,
            );
            e.target.reset();
            U.toast("Formato da senha validado.");
          } catch (err) {
            fail(err);
          }
        };
      return;
    }
    $("#today").textContent = new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    $("#today").dateTime = D.date();
    const sidebar = $(".sidebar");
    sidebar.id = "menu-lateral";
    sidebar.querySelectorAll("a[href]").forEach(
      /* Aplica a operação a cada elemento — Páginas e interações. */ (a) => {
        const key = a.getAttribute("href").replace(".html", "");
        if (perms[key] && !D.permission(perms[key])) a.hidden = true;
      },
    );
    // O ícone de menu informa seu estado sem exibir um rótulo visual redundante.
    const menuButton = $(".mobile-menu");
    const menuBackdrop = $(".nav-backdrop");
    const mainContent = $(".main-content");
    const mobileViewport = window.matchMedia("(max-width: 768px)");
    function toggleMenu(open, restoreFocus = true) {
      const expanded = Boolean(open && mobileViewport.matches);
      sidebar.classList.toggle("open", expanded);
      sidebar.inert = mobileViewport.matches && !expanded;
      mainContent.inert = expanded;
      menuBackdrop.hidden = !expanded;
      document.body.classList.toggle("menu-open", expanded);
      menuButton.setAttribute("aria-expanded", String(expanded));
      menuButton.setAttribute(
        "aria-label",
        expanded ? "Fechar menu" : "Abrir menu",
      );
      menuButton.querySelector("i").className = expanded
        ? "fa-solid fa-xmark"
        : "fa-solid fa-bars";
      if (expanded) sidebar.querySelector("a:not([hidden])")?.focus();
      else if (restoreFocus && mobileViewport.matches) menuButton.focus();
    }
    // As seções sem funções disponíveis para o perfil não deixam títulos vazios no menu.
    sidebar.querySelectorAll(".nav-group").forEach((group) => {
      group.hidden = !group.querySelector(".nav-link:not([hidden])");
    });
    menuButton.addEventListener("click", () =>
      toggleMenu(!sidebar.classList.contains("open")),
    );
    menuBackdrop.addEventListener("click", () => toggleMenu(false));
    mobileViewport.addEventListener("change", () => toggleMenu(false, false));
    toggleMenu(false, false);
    $("#btnConfig").addEventListener("click", (event) => {
      event.preventDefault();
      if (mobileViewport.matches) toggleMenu(false);
      settings();
    });
    $("#btnSair").addEventListener("click", () => {
      try {
        sessionStorage.removeItem("mf-role");
        localStorage.removeItem("mf-role");
      } catch {}
    });
    $("#dialog-close").addEventListener("click", () => U.close());
    document.addEventListener("keydown", (event) => {
      if (!sidebar.classList.contains("open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        toggleMenu(false);
      }
      if (event.key !== "Tab") return;
      const nodes = [
        ...sidebar.querySelectorAll("a:not([hidden]),button:not([hidden])"),
      ];
      const first = nodes[0],
        last = nodes.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    });
    window.addEventListener(
      "mf-conflict",
      /* Responde ao evento “mf-conflict” no contexto de Páginas e interações. */ () =>
        U.toast(
          "Dados alterados em outra aba. Recarregue a página antes de salvar.",
          true,
        ),
    );
    window.addEventListener(
      "beforeunload",
      /* Responde ao evento “beforeunload” no contexto de Páginas e interações. */ (
        e,
      ) => {
        if (U.hasUnsavedChanges()) {
          e.preventDefault();
          e.returnValue = "";
        }
      },
    );
    render();
    const params = new URLSearchParams(location.search);
    if (page === "pedidos" && params.get("openModal") === "true") {
      try {
        orderForm();
      } catch (e) {
        fail(e);
      }
      window.history.replaceState(null, "", location.pathname);
    }
    if (page === "vendas" && params.has("product")) {
      try {
        saleForm(params.get("product"));
      } catch (e) {
        fail(e);
      }
      window.history.replaceState(null, "", location.pathname);
    }
  }
)();
