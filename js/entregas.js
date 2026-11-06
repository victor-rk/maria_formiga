/* Registra opera??es exclusivas de despacho e confirma??o de entregas. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};

window.MF_PAGE_MODULES.entregas = {
  /* Cria as opera??es de entrega com os servi?os compartilhados do sistema. */
  create({ D, U, get, F, required, val, save, address }) {
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
          `<p class="notice">${E(address(o.address))}<br>Contato: ${E(U.formatPhone(o.phone))}</p>${ F("driver", "Responsável pela entrega *", o.driver || "", "text", required)}${ F("routeNote", "Instruções de entrega", o.routeNote || "", "text", 'maxlength="300"')}`,
          "Confirmar despacho",
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Valida pedido pronto e endereço antes de registrar responsável e despacho. */ (
          fd,
        ) =>
          save(
             () => {
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
         () => {
          o.delivery = "Entregue";
          o.status = "Finalizado";
          o.deliveredAt = D.now();
          o.history.push({ at: D.now(), text: "Entrega concluída." });
        },
        "Entrega confirmada.",
      );
    }

    return { dispatchForm, delivered };
  },
};
