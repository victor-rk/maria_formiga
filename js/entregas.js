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
      if (
        !o.address?.street ||
        !o.address?.number ||
        !o.address?.district ||
        !o.address?.zip
      )
        throw Error("Pedido sem endereço válido.");
      U.open(
        "Despachar pedido " + o.code,
        U.form(
          `<section class="delivery-address-info"><strong>Endereço de entrega</strong><p>${E(address(o.address))}<br>Contato: ${E(U.formatPhone(o.phone))}</p><button type="button" class="btn-secondary" data-action="delivery-map" data-id="${E(o.id)}">Ver no mapa</button></section>${ F("driver", "Responsável pela entrega *", o.driver || "", "text", required)}${ F("routeNote", "Instruções de entrega", o.routeNote || "", "text", 'maxlength="300"')}`,
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
      const canReceivePayment = D.permission("manage");
      U.open(
        "Confirmar entrega " + o.code,
        U.form(
          `<section class="delivery-address-info"><strong>Endereço de entrega</strong><p>${E(address(o.address))}</p><button type="button" class="btn-secondary" data-action="delivery-map" data-id="${E(o.id)}">Ver no mapa</button></section><p>Total do pedido: <strong>${U.money(total(o))}</strong></p>${needsPayment && canReceivePayment ? `${S("payment", "Forma de pagamento", paymentOptions().filter((option) => option[0] !== "pendente"), o.payment, "")}<label class="check-row"><input type="checkbox" name="paymentReceived" required> Confirmo que recebi o valor total.</label>` : needsPayment ? `<p class="help">O recebimento continua pendente e poderá ser registrado pela administração.</p>` : `<p class="help">Recebimento já registrado por ${E(payName(o.payment))}.</p>`}<label class="check-row"><input type="checkbox" name="deliveryConfirmed" required> Confirmo que o pedido foi entregue ao cliente.</label>`,
          canReceivePayment ? "Confirmar recebimento e entrega" : "Confirmar entrega",
        ),
      );
      U.bindForm((fd) => {
        const registerPayment = needsPayment && canReceivePayment;
        if (registerPayment) D.available(o.items);
        save(
          (state) => {
            if (registerPayment) {
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
          registerPayment
            ? "Recebimento e entrega confirmados."
            : "Entrega confirmada.",
        );
      });
    }

    function showMap(id) {
      const o = get("orders", id);
      if (!o?.address?.zip || !o.address.number)
        throw Error("O pedido não possui CEP e número para localizar no mapa.");
      const query = [
        o.address.zip,
        o.address.number,
        o.address.street,
        o.address.district,
        o.address.city,
      ]
        .filter(Boolean)
        .join(" ");
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
      U.open(
        "Localização do pedido " + o.code,
        `<p class="delivery-address-info">${E(address(o.address))}</p><iframe class="delivery-map" title="Mapa do endereço de entrega" src="${E(embedUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><a class="btn-secondary" href="${E(mapsUrl)}" target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a>`,
      );
    }

    return { dispatchForm, delivered, showMap };
  },
};
