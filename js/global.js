/**
 * Servi?os compartilhados do sistema Maria Formiga.
 * window.MF cont?m estado, persist?ncia e regras de neg?cio comuns.
 * window.UI re?ne componentes, valida??o e utilit?rios de interface.
 * Os fluxos de tela s?o inicializados em runtime.js e nos m?dulos de p?gina.
 * Esta demonstra??o n?o realiza autentica??o real nem envia e-mails.
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
            category: "Insumos",
            phone: "1140000000",
            email: "vendas@example.com",
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
            email: "admin@mariaformiga.com",
            phone: "11999990000",
            birth: "1995-01-01",
            role: "admin",
            active: true,
          },
          {
            id: "u2",
            name: "Auxiliar Operacional",
            email: "auxiliar@mariaformiga.com",
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
    state.users?.forEach((user) => {
      if (user.email === "admin@example.com")
        user.email = "admin@mariaformiga.com";
      else if (user.email === "auxiliar@example.com")
        user.email = "auxiliar@mariaformiga.com";
    });
    let role = null;
    try {
      role =
        sessionStorage.getItem("mf-role") ||
        localStorage.getItem("mf-role") ||
        null;
    } catch {}
    if (!["admin", "aux"].includes(role)) role = null;
    const permission =
      /* Consulta as ações liberadas para o perfil demonstrativo selecionado. */ (
        action,
      ) =>
        role === "admin" ||
        (role === "aux" &&
          ["readOrders", "readStock", "deliver"].includes(action));
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
       (
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
      if (!["admin", "aux"].includes(value))
        throw Error("Perfil de acesso inválido.");
      role = value;
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
           (
            b,
          ) => b.product === product && b.expires >= date(),
        )
        .reduce(
           (
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
           (
            sum,
            line,
          ) =>
            sum +
            (state.materials.find(
               (
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
            `Estoque insuficiente para ${state.products.find( (p) => p.id === item.product)?.name || "o produto"}.`,
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
             (
              b,
            ) => b.product === item.product && b.qty > 0 && b.expires >= date(),
          )
          .sort(
             (
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
    return {
      get state () {
        return state;
      },
      get role () {
        return role;
      },
      get persistent () {
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
    const moneyCents = (value) => {
      const raw = String(value ?? "").trim();
      if (!raw) return 0;
      const normalized = raw.includes(",")
        ? raw.replace(/\./g, "").replace(",", ".")
        : raw;
      const amount = Number(normalized);
      if (!Number.isFinite(amount) || amount < 0)
        throw Error("Informe um valor monetário válido.");
      return Math.round(amount * 100);
    };
    const formatMoneyInput = (value) => {
      const digits = String(value ?? "").replace(/\D/g, "").slice(0, 14);
      if (!digits) return "";
      const cents = Number(digits);
      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(cents / 100);
    };
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
        "delivery-map": "fa-map-location-dot",
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
    // Retorna apenas os números, respeitando o limite de cada máscara.
    function numericDigits(value, limit = 11) {
      return String(value ?? "")
        .replace(/\D/g, "")
        .slice(0, limit);
    }
    // Formata CPF sem verificar se o documento é válido.
    function formatCpf(value) {
      const digits = numericDigits(value, 11);
      if (digits.length <= 3) return digits;
      if (digits.length <= 6)
        return digits.slice(0, 3) + "." + digits.slice(3);
      if (digits.length <= 9)
        return (
          digits.slice(0, 3) +
          "." +
          digits.slice(3, 6) +
          "." +
          digits.slice(6)
        );
      return (
        digits.slice(0, 3) +
        "." +
        digits.slice(3, 6) +
        "." +
        digits.slice(6, 9) +
        "-" +
        digits.slice(9)
      );
    }
    function formatCep(value) {
      const digits = numericDigits(value, 8);
      return digits.length > 5
        ? digits.slice(0, 5) + "-" + digits.slice(5)
        : digits;
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
      phone: formatPhone,
      cpf: formatCpf,
      cep: formatCep,
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
      const digits = numericDigits(raw);
      input.value = maskFormatters[mask](digits);
      input.setCustomValidity(
        mask === "phone" && digits.length && ![10, 11].includes(digits.length)
          ? "Informe o telefone com DDD e 10 ou 11 números."
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
    document.addEventListener("input", (event) => {
      const input = event.target;
      if (!input.matches("input[data-money]")) return;
      input.value = formatMoneyInput(input.value);
      input.setSelectionRange(input.value.length, input.value.length);
    }, true);
    const moveMoneyCaretToEnd = (event) => {
      const input = event.target;
      if (input.matches?.("input[data-money]"))
        input.setSelectionRange(input.value.length, input.value.length);
    };
    document.addEventListener("focus", moveMoneyCaretToEnd, true);
    document.addEventListener("click", moveMoneyCaretToEnd, true);
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
      const digits = numericDigits(input.value);
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
      // Telefones recebem máscara em todos os módulos.
      const mask = type === "tel" ? "phone" : "";
      if (mask) {
        value = maskFormatters[mask](value);
        extra = extra.replace(
          /\b(?:maxlength|minlength|inputmode|pattern)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
          "",
        );
        extra += ` data-mask="${mask}" inputmode="numeric" maxlength="15"`;
      }
      if (type === "money") {
        const formatted =
          value === ""
            ? ""
            : formatMoneyInput(String(Math.round(Number(value || 0) * 100)));
        return `<div class="input-group"><label for="f-${name}">${esc(label)}</label><div class="money-input"><span aria-hidden="true">R$</span><input id="f-${name}" name="${name}" type="text" inputmode="numeric" autocomplete="off" data-money value="${esc(formatted)}" ${extra}></div></div>`;
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
      return `<div class="input-group"><label for="f-${name}">${esc(label)}</label><select id="f-${name}" name="${name}" class="custom-select" ${extra}>${options.map( (o) => `<option value="${esc(o[0])}" ${String(o[0]) === String(value) ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select></div>`;
    }
    const actions =
      /* Gera os botões de confirmar e cancelar usados no rodapé dos formulários. */ (
        submit = "Salvar",
      ) =>
        `<div class="flow-actions sticky-actions"><button class="btn-primary" type="submit">${esc(submit)}</button><button class="btn-secondary" type="button" data-action="close">Cancelar</button></div>`;
    let opener;
    let returnOnClose = null;
    let dirty = false;
    let confirmationState = null;
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
      dialog.oninput =  () =>
        (dirty = true);
      dialog.oncancel =  (
        e,
      ) => {
        e.preventDefault();
        close();
      };
      dialog.onclick =  (e) => {
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
         () => {
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
      if (!force && confirmationState) {
        const state = confirmationState;
        restoreConfirmation(state);
        if (!state.wasOpen) close(true);
        else state.focus?.focus();
        return;
      }
      if (!force && dirty) {
        confirmCard(
          "As alterações deste formulário ainda não foram salvas. Deseja descartá-las?",
          () => close(true),
          { confirmText: "Descartar alterações", danger: true },
        );
        return;
      }
      confirmationState = null;
      d.classList.remove("confirmation-dialog");
      d.removeAttribute("role");
      d.removeAttribute("aria-describedby");
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
    function restoreConfirmation(state) {
      if (confirmationState !== state) return;
      const dialog = document.getElementById("app-dialog"),
        body = document.getElementById("dialog-body");
      confirmationState = null;
      body.replaceChildren(state.fragment);
      document.getElementById("dialog-title").textContent = state.title;
      dialog.classList.remove("confirmation-dialog");
      dialog.removeAttribute("role");
      dialog.removeAttribute("aria-describedby");
      dirty = state.dirty;
    }
    function confirmCard(message, onConfirm, options = {}) {
      if (confirmationState) return;
      const dialog = document.getElementById("app-dialog"),
        body = document.getElementById("dialog-body"),
        wasOpen = Boolean(dialog?.open);
      if (!wasOpen) open("Confirmar ação", "");
      const fragment = document.createDocumentFragment();
      while (body.firstChild) fragment.appendChild(body.firstChild);
      confirmationState = {
        title: document.getElementById("dialog-title").textContent,
        fragment,
        wasOpen,
        dirty,
        focus: document.activeElement,
      };
      document.getElementById("dialog-title").textContent = "Confirmar ação";
      dialog.classList.add("confirmation-dialog");
      dialog.setAttribute("role", "alertdialog");
      dialog.setAttribute("aria-describedby", "confirm-card-message");
      body.innerHTML = `<section class="confirm-card"><p id="confirm-card-message">${esc(message)}</p><div class="confirm-card-actions"><button type="button" class="${options.danger ? "btn-danger" : "btn-primary"}" data-confirm="yes">${esc(options.confirmText || "Confirmar")}</button><button type="button" class="btn-secondary" data-confirm="no">${esc(options.cancelText || "Voltar")}</button></div></section>`;
      const state = confirmationState;
      body.querySelector('[data-confirm="no"]').addEventListener("click", () => {
        if (confirmationState !== state) return;
        restoreConfirmation(state);
        if (!state.wasOpen) close(true);
        else state.focus?.focus();
      });
      body.querySelector('[data-confirm="yes"]').addEventListener("click", () => {
        if (confirmationState !== state) return;
        restoreConfirmation(state);
        try {
          onConfirm();
          if (!state.wasOpen && dialog.open) close(true);
        } catch (error) {
          toast(error.message, true);
          if (!state.wasOpen && dialog.open) close(true);
        }
      });
      body.querySelector('[data-confirm="yes"]').focus();
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
         () =>
          root.classList.remove("visible"),
        6500,
      );
    }
    /* Intercepta o envio, verifica os campos obrigatórios e mostra erros sem perder o formulário. */ function bindForm(
      handler,
    ) {
      const f = document.querySelector("#dialog-body form");
      let pending = false;
      const showError = (reason) => {
        if (!f.isConnected || !f.closest("dialog")?.open) return;
        const error = f.querySelector(".form-error");
        error.textContent = reason?.message || String(reason);
        error.focus();
      };
      f.addEventListener(
        "submit",
         (e) => {
          e.preventDefault();
          if (pending) return;
          const error = f.querySelector(".form-error");
          error.textContent = "";
          try {
            prepareMasks(f);
            if (!f.reportValidity()) return;
            const result = handler(new FormData(f), f);
            if (result && typeof result.then === "function") {
              pending = true;
              f.setAttribute("aria-busy", "true");
              const controls = [...f.elements].map((control) => [
                control,
                control.disabled,
              ]);
              controls.forEach(([control]) => (control.disabled = true));
              Promise.resolve(result)
                .catch(showError)
                .finally(() => {
                  pending = false;
                  if (!f.isConnected) return;
                  f.removeAttribute("aria-busy");
                  controls.forEach(
                    ([control, wasDisabled]) =>
                      (control.disabled = wasDisabled),
                  );
                });
            }
          } catch (reason) {
            showError(reason);
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
      return `<div class="table-responsive" role="region" aria-label="Resultados" tabindex="0"><table class="data-table"><thead><tr>${headers.map( (h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map( (cells) => `<tr>${cells.map( (c) => `<td class="${String(c).includes("R$") ? "money-cell" : /\b\d{2}\/\d{2}\/\d{4}/.test(String(c)) ? "date-cell" : ""}">${c}</td>`).join("")}</tr>`).join("") : `<tr><td class="empty-state" colspan="${headers.length}">${esc(empty)}</td></tr>`}</tbody></table></div>`;
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
             (
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
         () =>
          URL.revokeObjectURL(url),
        1000,
      );
    }
    return {
      hasUnsavedChanges,
      markDirty,
      formatPhone,
      applyInputMask,
      prepareMasks,
      esc,
      money,
      moneyCents,
      formatMoneyInput,
      num,
      date,
      badge,
      btn,
      field,
      select,
      actions,
      open,
      close,
      confirmCard,
      toast,
      bindForm,
      form,
      table,
      csv,
    };
  }
)();
