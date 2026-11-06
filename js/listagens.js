/* Registers administrative page listings. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};
window.MF_PAGE_MODULES.listagens = {
  /* Creates listings and keeps search state local to this module. */
  create({ D, U, E, M, B, page, get, total, clientName, productsText, payName, address }) {
    let query = "", filter = "Todos";
    /* Monta busca, filtros e ações disponíveis para a página atual. */
    function toolbar(
      actions,
      filters = ["Todos"],
    ) {
      return `<div class="toolbar"><div class="search-box"><label class="sr-only" for="list-search">Buscar registros</label><input type="search" id="list-search" placeholder="Buscar nesta página..." value="${E(query)}" autocomplete="off"></div><div class="filters" role="group" aria-label="Filtrar resultados">${filters.map( (f) => `<button type="button" class="filter-btn ${filter === f ? "active" : ""}" data-filter="${E(f)}" aria-pressed="${filter === f}">${E(f)}</button>`).join("")}</div><div class="toolbar-actions">${query || filter !== "Todos" ?  B("Limpar filtros", "clear-filters", "", "btn-secondary") : ""}${actions}</div></div>`;
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
      return `<div class="kpi-mini-grid">${items.map( ([label, value]) => `<div class="kpi-mini-card"><div><span class="kpi-mini-label">${E(label)}</span><strong class="kpi-mini-val">${E(value)}</strong></div></div>`).join("")}</div>`;
    }
    /* Exibe histórico de pedidos do cliente ou movimentações de matéria-prima. */
    function history(type, id) {
      if (type === "client") {
        const rows = D.state.orders
          .filter((order) => order.client === id)
          .map((order) => [
            E(order.code),
            U.date(order.created),
            E(order.status),
            M(total(order)),
          ]);
        U.open(
          "Histórico de pedidos",
          U.table(
            ["Pedido", "Data", "Status", "Total"],
            rows,
            "Este cliente ainda não possui pedidos.",
          ),
        );
        return;
      }

      const rows = D.state.movements
        .filter((movement) => movement.material === id)
        .slice()
        .reverse()
        .map((movement) => [
          U.date(movement.at),
          E(movement.type),
          U.num(movement.qty),
          E(movement.reason),
        ]);
      U.open(
        "Movimentações da matéria-prima",
        U.table(["Data", "Operação", "Quantidade", "Motivo"], rows),
      );
    }

    /* Conecta busca e filtros às atualizações da listagem. */
    function bind(render) {
      document.addEventListener("click", (event) => {
        const filterButton = event.target.closest("[data-filter]");
        if (!filterButton) return;
        filter = filterButton.dataset.filter;
        render();
        document
          .querySelector(`[data-filter="${CSS.escape(filter)}"]`)
          ?.focus();
      });
      document.addEventListener("input", (event) => {
        if (event.target.id !== "list-search") return;
        const position = event.target.selectionStart;
        query = event.target.value;
        render();
        const input = document.querySelector("#list-search");
        input.focus();
        input.setSelectionRange(position, position);
      });
    }

    /* Limpa busca e filtros e devolve o foco ao campo de busca. */
    function clearFilters(render) {
      query = "";
      filter = "Todos";
      render();
      document.querySelector("#list-search")?.focus();
    }

    /* Monta a listagem do domínio atual com filtros e ações correspondentes. */
    function renderList(
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
           B(
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
             (
              c,
            ) => [
              E(c.name),
              E(c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")),
              `${E(U.formatPhone(c.phone))}<br><span class="muted">${E(c.email)}</span>`,
              String(c.addresses.length),
               B(
                "Editar",
                "client",
                c.id,
              ) +
                 B(
                  "Endereços",
                  "addresses",
                  c.id,
                ) +
                 B(
                  "Histórico",
                  "client-history",
                  c.id,
                ),
            ],
          );
      } else if (page === "fornecedores") {
        actions =
           B(
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
             (
              s,
            ) => [
              E(s.name),
              E(U.formatCNPJ(s.cnpj)),
              E(s.category),
              `${E(U.formatPhone(s.phone))}<br>${E(s.email)}`,
              `${s.lead} dia(s) úteis`,
               B(
                "Editar",
                "supplier",
                s.id,
              ),
            ],
          );
      } else if (page === "estoque") {
        actions = admin
          ?  B(
              "Movimentar",
              "movement",
              "",
              "btn-secondary",
            ) +
             B(
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
             (
              m,
            ) =>
              matches(m) &&
              (filter === "Todos" ||
                (filter === "Estoque baixo"
                  ? m.stock <= m.min
                  : m.stock > m.min)),
          )
          .map(
             (
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
                ?  B(
                    "Movimentar",
                    "movement",
                    m.id,
                  ) +
                   B(
                    "Editar",
                    "material",
                    m.id,
                  )
                : "") +
                 B(
                  "Histórico",
                  "material-history",
                  m.id,
                ),
            ],
          );
      } else if (page === "produtos") {
        actions =
           B(
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
             (
              p,
            ) => [
              E(p.name),
              M(D.cost(p)),
              M(p.price),
              U.num(D.margin(p.price, D.cost(p))) + "%",
              U.num(p.margin) + "%",
               B(
                "Ficha técnica / Editar",
                "product",
                p.id,
              ),
            ],
          );
      } else if (page === "produtos-prontos") {
        actions =
          (D.permission("produce")
            ?  B(
                "Registrar produção",
                "production",
                "",
                "btn-novo",
              )
            : "") +
          (admin
            ?  B(
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
             (
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
             (
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
                  ?  B(
                      "Registrar perda",
                      "loss",
                      b.id,
                    ) +
                    (expired
                      ? ""
                      :  B(
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
          ?  B(
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
             (
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
             (
              a,
              b,
            ) => b.created.localeCompare(a.created),
          )
          .map(
             (
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
               B(
                "Detalhes",
                "order-detail",
                o.id,
              ),
            ],
          );
      } else if (page === "vendas") {
        actions =
           B(
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
           (
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
             (
              s,
            ) => [
              E(s.code),
              E(s.client ? clientName(s.client) : "Cliente Balcão"),
              E(productsText(s.items)),
              E(payName(s.payment)),
              U.date(s.created),
              M(s.total),
               B(
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
                 (
                  o,
                ) =>
                  o.status !== "Cancelado" &&
                  !o.sale &&
                  matches({ ...o, name: clientName(o.client) }),
              )
              .map(
                 (
                  o,
                ) => [
                  E(o.code),
                  E(clientName(o.client)),
                  E(productsText(o.items)),
                  U.badge("Pendente"),
                  U.date(o.created),
                  M(total(o)),
                   B(
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
             (
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
             (
              a,
              b,
            ) => a.due.localeCompare(b.due),
          )
          .map(
             (
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
                ?  B(
                    "Detalhes",
                    "order-detail",
                    o.id,
                  )
                : o.delivery === "Em rota"
                  ?  B(
                      "Confirmar entrega",
                      "delivered",
                      o.id,
                    )
                  :  B(
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
                       (
                        s,
                      ) => D.localDate(s.created) === D.date(),
                    )
                    .reduce(
                       (
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
                     (
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
    // Inicializa os m?dulos de cliente e fornecedor quando seus scripts est?o presentes.
    
    return {
      render: renderList,
      list,
      kpis,
      history,
      bind,
      clearFilters,
    };
  },
};
