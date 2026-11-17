/* Inicializa renderização, formulários e fluxos de negócio das páginas. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};
/* ==================== 3. PÁGINAS E INTERAÇÕES ==================== */
/* Interface multipágina em JavaScript nativo, sem dependências de execução. */
(
  /* Inicializa as páginas, os formulários e os eventos da aplicação. */ () => {
    const D = MF,
      U = UI,
      $ =  (s) =>
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
           (
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
      ) => U.moneyCents(fd.get(key));
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
           (
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
           (
            p,
          ) => p[0] === v,
        )?.[1] || "Não definido";
    const total =
      /* Calcula o total dos itens do pedido e acrescenta a taxa de entrega. */ (
        o,
      ) =>
        o.items.reduce(
           (
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
             (
              i,
            ) =>
              `${i.qty} × ${i.name || get("products", i.product)?.name || "Produto"}`,
          )
          .join("; ");
    const listPage = window.MF_PAGE_MODULES.listagens?.create({
      D, U, E, M, B, page, get, total, clientName, productsText, payName, address,
    });
    const { list, kpis } = listPage || {};
    /* Atualiza o conteúdo do módulo e aplica as permissões demonstrativas. */
    function render() {
      const root = $("#app");
      if (!root) return;

      if (!D.permission(perms[page] || "manage")) {
        root.innerHTML =
          '<div class="notice"><h2>Acesso restrito</h2><p>Este módulo está disponível para a proprietária.</p><a href="home.html">Voltar ao início</a></div>';
        root.setAttribute("aria-busy", "false");
        return;
      }
      if (page === "home") window.MF_PAGES.home(root);
      else if (page === "relatorios") reportPage.render(root);
      else listPage.render(root);
      root.setAttribute("aria-busy", "false");
    }
    const clientPage = window.MF_PAGE_MODULES.clientes?.create({
      D, U, get, F, S, required, val, E, address, B, save,
    });
    const supplierPage = window.MF_PAGE_MODULES.fornecedores?.create({
      D, U, get, F, required, val, integer, save,
    });
    // Inicializa o m?dulo de mat?ria-prima quando a p?gina carrega seu script.
    const stockPage = window.MF_PAGE_MODULES.estoque?.create({
      D, U, $, get, F, S, required, val, number, cents, save, options,
    });
    // Inicializa as opera??es de produtos e lotes se o m?dulo estiver carregado.
    const productPage = window.MF_PAGE_MODULES.produtos?.create({
      D, U, $, get, F, S, B, required, val, number, integer, cents, save, options, M,
    });
    const operationsPage = window.MF_PAGE_MODULES.pedidosVendas?.create({
      D, U, $, get, val, cents, required, options, address, paymentOptions, payName,
      total, clientName, F, S, B, E, M, save, clientPage,
    });
    const {
      orderForm, orderDetail, nextOrder, cancelOrder, saleForm, saleNewClient,
      receiveForm, receipt, quickSale, receiptDownload,
    } = operationsPage || {};
    const deliveryPage = window.MF_PAGE_MODULES.entregas?.create({
      D, U, get, F, S, required, val, save, address, E, total, paymentOptions, payName,
    });
    const settingsPage = window.MF_PAGE_MODULES.configuracoes?.create({
      D, U, get, val, F, S, B, required, E, save,
    });
    const { settings, userForm, passwordPreview, validatePassword } =
      settingsPage || {};
    const handlers = {
      /* Cadastra um cliente a partir de Vendas e retoma o preenchimento da venda. */ "sale-new-client":
        saleNewClient,
       "order-new-client": operationsPage?.orderNewClient,
       "order-new-address": operationsPage?.orderNewAddress,
       "clear-filters": () => listPage.clearFilters(render),
       settings:
        /* Alterna as telas de perfil, usuários e histórico local conforme a permissão. */ () =>
          settings(),
       "settings-profile":
        /* Exibe os dados do perfil atual. */ () => settings("profile", true),
       "settings-users":
        /* Lista as contas demonstrativas para administração. */ () =>
          settings("users", true),
       "settings-audit":
        /* Mostra o histórico de alterações locais. */ () =>
          settings("audit", true),
       client: clientPage?.clientForm,
       addresses: clientPage?.addresses,
       "address-edit":
        clientPage?.addressForm,
       supplier:
        supplierPage?.supplierForm,
       material:
        stockPage?.materialForm,
       movement:
        stockPage?.movementForm,
       product:
        productPage?.productForm,
       production:
        productPage?.productionForm,
       loss: productPage?.lossForm,
       order: orderForm,
       sale: /* Inicia uma venda de balcão. */ () =>
        saleForm(),
       "quick-sale": operationsPage?.quickSale,
       "order-detail":
        orderDetail,
       "order-next":
        nextOrder,
       "order-cancel":
        cancelOrder,
       receive:
        receiveForm,
       receipt,
       dispatch:
        deliveryPage?.dispatchForm,
       delivered: deliveryPage?.delivered,
       "client-history":
        /* Consulta os pedidos do cliente. */ (id) => listPage.history("client", id),
       "material-history":
        /* Consulta movimentações da matéria-prima. */ (id) =>
          listPage.history("material", id),
       user: /* Abre cadastro ou edição de usuário. */ (
        id,
      ) => userForm(id),
       "my-profile":
        /* Permite editar os dados do próprio perfil. */ (id) =>
          userForm(id, true),
       "password-preview":
        passwordPreview,
       "user-delete": settingsPage?.deleteUser,
       "user-toggle": settingsPage?.toggleUser,
       close:
        /* Fecha o diálogo, pede confirmação quando existem alterações e devolve o foco ao controle de origem. */ () =>
          U.close(),
       print:
        /* Abre a impressão nativa da página. */ () => window.print(),
       export:
        /* Delega a exportação CSV ao módulo de relatórios. */ () =>
          reportPage.export(),
       "receipt-download": operationsPage?.receiptDownload,
       "recipe-add": productPage?.addRecipeLine,
       "recipe-remove": productPage?.removeRecipeLine,
       "cart-add": operationsPage?.cartAdd,
       "cart-remove": operationsPage?.cartRemove,
    };
    document.addEventListener(
      "click",
       (
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
      },
    );
    const reportPage =
      page === "relatorios"
        ? window.MF_PAGE_MODULES.relatorios.create({
            D,
            U,
            $,
            E,
            M,
            B,
            F,
            S,
            list,
            kpis,
            get,
            val,
            total,
            clientName,
            productsText,
            payName,
            address,
            render,
          })
        : null;

    listPage?.bind(render);
    window.MF_PAGE_UTILS = { fail, validatePassword };
    if (["index", "recuperacao", "redefinir-senha"].includes(page)) return;

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
       (a) => {
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
       () =>
        U.toast(
          "Dados alterados em outra aba. Recarregue a página antes de salvar.",
          true,
        ),
    );
    window.addEventListener(
      "beforeunload",
       (
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
    if (
      page === "entregas" &&
      params.get("action") === "dispatch" &&
      params.has("order")
    ) {
      try {
        deliveryPage.dispatchForm(params.get("order"));
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
