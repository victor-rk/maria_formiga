/* Registra opera??es exclusivas de despacho e confirma??o de entregas. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};

window.MF_PAGE_MODULES.entregas = {
  /* Cria as opera??es de entrega com os servi?os compartilhados do sistema. */
  create({ D, U, get, F, S, required, val, save, address, E, total, paymentOptions, payName }) {
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
    /* Confirma o recebimento, se pendente, e finaliza a entrega no mesmo fluxo. */ function delivered(
      id,
    ) {
      D.needPermission("deliver");
      const o = get("orders", id);
      if (o.delivery !== "Em rota")
        throw Error("O pedido precisa estar em rota.");
      const needsPayment = !o.sale;
      U.open(
        "Confirmar entrega " + o.code,
        U.form(
          `<p class="notice">Confirme a entrega de <strong>${E(address(o.address))}</strong>.<br>Total do pedido: <strong>${U.money(total(o))}</strong></p>${needsPayment ? `${S("payment", "Forma de pagamento *", paymentOptions().filter((option) => option[0] !== "pendente"), o.payment)}<label class="check-row"><input type="checkbox" name="paymentReceived" required> Confirmo que recebi o valor total.</label>` : `<p class="notice">Recebimento já registrado por ${E(payName(o.payment))}.</p>`}<label class="check-row"><input type="checkbox" name="deliveryConfirmed" required> Confirmo que o pedido foi entregue ao cliente.</label>`,
          "Confirmar recebimento e entrega",
        ),
      );
      U.bindForm((fd) => {
        if (needsPayment) D.available(o.items);
        save(
          (state) => {
            if (needsPayment) {
              const cost = D.consume(o.items);
              const sale = {
                id: D.uid(),
                code: "#VD-" + (305 + state.sales.length),
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
              state.sales.push(sale);
              o.sale = sale.id;
              o.payment = sale.payment;
              o.history.push({
                at: D.now(),
                text: "Recebimento integral registrado na confirmação da entrega.",
              });
            }
          o.delivery = "Entregue";
          o.status = "Finalizado";
          o.deliveredAt = D.now();
          o.history.push({ at: D.now(), text: "Entrega concluída." });
          },
          needsPayment
            ? "Recebimento e entrega confirmados."
            : "Entrega confirmada.",
        );
      });
    }

    return { dispatchForm, delivered };
  },
};
