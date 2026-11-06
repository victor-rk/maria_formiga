/* Registra as funções exclusivas da página de relatórios para o runtime compartilhado. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};

window.MF_PAGE_MODULES.relatorios = {
  /* Cria a página de relatórios usando os dados e componentes compartilhados. */
  create(context) {
    const {
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
    } = context;

    let reportType = "vendas";
    let reportStart = D.date(-30);
    let reportEnd = D.date();
    let reportHeaders = [];
    let currentRows = [];

    /* Renderiza os indicadores e a tabela conforme o período e tipo selecionados. */
    function renderReports(root) {
      D.needPermission("manage");

      /* Verifica se a data do registro pertence ao intervalo selecionado. */
      const within = (value) =>
        D.localDate(value) >= reportStart &&
        D.localDate(value) <= reportEnd;

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
          .filter((sale) => within(sale.created))
          .map((sale) => [
            sale.code,
            U.date(sale.created),
            sale.client ? clientName(sale.client) : "Cliente Balcão",
            productsText(sale.items),
            payName(sale.payment),
            (sale.total / 100).toFixed(2),
            (sale.cost / 100).toFixed(2),
            ((sale.total - sale.cost) / 100).toFixed(2),
            D.margin(sale.total, sale.cost).toFixed(1),
          ]);
      } else if (
        reportType === "pedidos" ||
        reportType === "entregas"
      ) {
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
            (order) =>
              within(order.created) &&
              (reportType !== "entregas" || order.mode === "entrega"),
          )
          .map((order) => {
            const sale = get("sales", order.sale);
            const cost =
              sale?.cost ??
              Math.round(
                order.items.reduce(
                  (sum, item) =>
                    sum + D.cost(get("products", item.product)) * item.qty,
                  0,
                ),
              );
            const orderTotal = total(order);

            return [
              order.code,
              U.date(order.created),
              U.date(order.due),
              clientName(order.client),
              productsText(order.items),
              order.mode,
              payName(order.payment),
              order.status,
              order.sale ? "Sim" : "Não",
              (orderTotal / 100).toFixed(2),
              (cost / 100).toFixed(2),
              ((orderTotal - cost) / 100).toFixed(2),
              D.margin(orderTotal, cost).toFixed(1),
              ...(reportType === "entregas"
                ? [address(order.address), order.driver || "", order.delivery]
                : []),
            ];
          });
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
          .filter((movement) => within(movement.at))
          .map((movement) => [
            U.date(movement.at),
            movement.material
              ? get("materials", movement.material)?.name
              : get("products", movement.product)?.name,
            movement.type,
            U.num(movement.qty),
            movement.material
              ? get("materials", movement.material)?.unit
              : "un",
            movement.reason,
          ]);
      }

      currentRows = rows;
      const sales = D.state.sales.filter((sale) => within(sale.created));
      const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      const cost = sales.reduce((sum, sale) => sum + sale.cost, 0);

      root.innerHTML =
        kpis([
          ["Recebimentos no período", M(revenue)],
          ["Custo dos insumos vendidos", M(cost)],
          ["Resultado após insumos", M(revenue - cost)],
        ]) +
        `<p class="notice">Os resultados consideram apenas os insumos das fichas técnicas; não representam lucro líquido. Custos de vendas são preservados na confirmação. Pedidos sem recebimento apresentam estimativa pelo custo atual.</p><div class="toolbar"><form id="report-form" class="report-period">${
          S(
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
        }${F("start", "De *", reportStart, "date", "required")}${F("end", "Até *", reportEnd, "date", "required")}<button class="btn-secondary" type="submit">Aplicar período</button></form><div class="toolbar-actions">${B("Imprimir / PDF", "print", "", "btn-secondary")}${B("Exportar CSV", "export", "", "btn-novo")}</div></div><p class="help print-title">Período: ${U.date(reportStart)} a ${U.date(reportEnd)} · Tipo: ${E(reportType)}</p>` +
        list(
          "Demonstrativo · " +
            U.date(reportStart) +
            " a " +
            U.date(reportEnd),
          reportHeaders,
          rows.map((row) => row.map(E)),
          "Não há movimentações no período selecionado.",
        );

      /* Valida o período informado e atualiza o relatório selecionado. */
      $("#report-form").onsubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const start = val(formData, "start");
        const end = val(formData, "end");
        if (start > end) {
          U.toast("A data inicial deve ser anterior ou igual à final.", true);
          return;
        }
        reportStart = start;
        reportEnd = end;
        reportType = val(formData, "reportType");
        render();
      };
    }

    /* Baixa os resultados filtrados no formato CSV. */
    function exportReport() {
      U.csv(
        reportHeaders,
        currentRows,
        "maria-formiga-" + reportType + "-" + reportStart,
      );
    }

    return { render: renderReports, export: exportReport };
  },
};
