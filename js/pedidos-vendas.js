/* Registers order and sales flows, including their shared cart. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};
window.MF_PAGE_MODULES.pedidosVendas = {
  /* Creates order and sales operations using shared application services. */
  create({ D, U, $, get, val, cents, required, options, address, paymentOptions, payName, total, clientName, F, S, B, E, M, save, clientPage }) {
    let cart = [], draftTimer;
    /* Monta a tabela de itens do carrinho com valores e ações de remoção. */
    function cartMarkup() {
      return U.table(
        ["Produto", "Qtd.", "Preço un.", "Subtotal", "Ações"],
        cart.map(
           (
            i,
            n,
          ) => [
            E(get("products", i.product)?.name),
            String(i.qty),
            M(i.price),
            M(i.qty * i.price),
             B(
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
             (
              s,
              i,
            ) => s + i.price * i.qty,
            0,
          ) + fee,
        );
    }
    /* Gera os controles para selecionar e incluir produtos no pedido ou venda. */ function cartFields() {
      return `<h3 class="section-heading">Produtos</h3><div class="cart-line">${ S("itemProduct", "Produto", options("products"), "", "")}${ F("itemQty", "Quantidade", 1, "number", 'min="1" step="1"')}${ B("Incluir", "cart-add", "", "btn-secondary")}</div><div id="cart-items">${cartMarkup()}</div>`;
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
          `${draft ? '<p class="notice">Rascunho das últimas 24 horas recuperado.</p>' : ""}<div class="form-grid">${ S("client", "Cliente cadastrado *", options("clients"), v.client)}${
             S(
              "mode",
              "Modalidade *",
              [
                ["retirada", "Retirada"],
                ["entrega", "Entrega"],
              ],
              v.mode || "retirada",
            )
          }${ S("address", "Endereço de entrega", [], v.addressId || "", "")}${ F("due", "Data e hora combinadas *", (v.due || D.date(1) + "T15:00").slice(0, 16), "datetime-local", "required")}${ F("phone", "Telefone para contato *", v.phone || "", "tel", 'required minlength="10" maxlength="30"')}${
             S(
              "payment",
              "Forma de pagamento *",
              paymentOptions().filter(
                 (
                  p,
                ) => p[0] !== "pendente",
              ),
              v.payment,
            )
          }${ F("fee", "Taxa de entrega (R$)", (v.fee || 0) / 100, "number", 'min="0" step="0.01"')}</div>${!o ?  B("Cadastrar cliente e retomar pedido", "order-new-client", "", "btn-secondary") : ""}${cartFields()}${ F("note", "Observações da encomenda", v.note || "", "text", 'maxlength="500"')}<div class="summary-box"><div class="summary-row total"><span>Total do pedido</span><strong id="cart-total"></strong></div></div>`,
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
                 (
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
           () => {
            clearTimeout(draftTimer);
            const form = $("#dialog-body form");
            draftTimer = setTimeout(
               () => {
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
                       (
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
               (
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
             (
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
             (
              i,
            ) => [
              E(get("products", i.product)?.name),
              String(i.qty),
              ...(admin ? [M(i.price), M(i.qty * i.price)] : []),
            ],
          ),
        )}<div class="row-actions">${admin && o.status === "Pendente" && !o.sale ?  B("Editar", "order", id) : ""}${admin && ["Pendente", "Em produção", "Pronto"].includes(o.status) ?  B("Avançar status", "order-next", id) : ""}${admin && o.status !== "Cancelado" && !o.sale ?  B("Receber pagamento", "receive", id) : ""}${admin && o.status !== "Cancelado" && !o.sale ?  B("Cancelar pedido", "order-cancel", id) : ""}</div><h3 class="section-heading">Histórico</h3><ol class="timeline">${o.history.map( (h) => `<li>${E(h.text)}<small>${U.date(h.at)}</small></li>`).join("")}</ol>`,
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
         () => {
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
          `${ F("reason", "Motivo do cancelamento *", "", "text", 'required maxlength="300"')}<p class="notice">O pedido continuará disponível no histórico. Como não houve recebimento, nenhum estoque de produto pronto foi baixado.</p>`,
          "Confirmar cancelamento",
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Exige motivo, cancela o pedido ainda não pago e mantém o histórico. */ (
          fd,
        ) =>
          save(
             () => {
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
          `<div class="sale-client-row">${ S("client", "Cliente — opcional", options("clients", "Cliente Balcão"), draft?.fields.client || "", "")}${/* Cadastra um cliente e retoma esta venda sem perder os dados preenchidos. */ B("Adicionar cliente", "sale-new-client", "", "btn-secondary")}</div>${cartFields()}${
             S(
              "payment",
              "Forma de pagamento *",
              paymentOptions().filter(
                 (
                  p,
                ) => p[0] !== "pendente",
              ),
            )
          }${ F("received", "Valor recebido em dinheiro (R$)", "", "number", 'min="0" step="0.01"')}<div class="summary-box"><div class="summary-row total"><span>Total a receber</span><strong id="cart-total"></strong></div></div>`,
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
               (
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
             (
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
      clientPage.clientForm(undefined, {
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
             S(
              "payment",
              "Forma de pagamento *",
              paymentOptions().filter(
                 (
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
             (
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
             (
              i,
            ) => [
              E(i.name || get("products", i.product)?.name),
              String(i.qty),
              M(i.qty * i.price),
            ],
          ),
        )}${ B("Baixar registro CSV", "receipt-download", id, "btn-secondary")}`,
      );
    }
    /* Keeps an order draft while the auxiliary customer form is open. */
    function orderNewClient() {
      const fd = new FormData($("#dialog-body form"));
      const fields = Object.fromEntries(
        ["client", "mode", "address", "due", "phone", "payment", "note"].map(
          (key) => [key, val(fd, key)],
        ),
      );
      fields.addressId = fields.address;
      fields.fee = Math.round(Number(fd.get("fee") || 0) * 100);
      D.commit(
        (state) => (state.drafts.order = {
          at: Date.now(),
          fields,
          items: structuredClone(cart),
        }),
        "Pedido mantido como rascunho.",
      );
      clearTimeout(draftTimer);
      clientPage.clientForm();
      const form = $("#dialog-body form");
      form.addEventListener("submit", () => {
        if (!$("#app-dialog").open) {
          orderForm();
          $("#f-client").value = D.state.clients.at(-1).id;
          $("#f-client").dispatchEvent(new Event("change"));
        }
      });
    }

    /* Inclui produto e quantidade no carrinho, agrupando produtos repetidos. */
    function cartAdd() {
      const product = get("products", $("#f-itemProduct").value);
      const qty = Number($("#f-itemQty").value);
      if (!product) throw Error("Selecione o produto para incluir.");
      if (!Number.isInteger(qty) || qty < 1)
        throw Error("Informe uma quantidade inteira maior que zero.");
      const item = cart.find((entry) => entry.product === product.id);
      if (item) item.qty += qty;
      else cart.push({ product: product.id, name: product.name, qty, price: product.price });
      updateCart();
      $("#f-itemProduct").value = "";
      $("#f-itemQty").value = 1;
    }

    /* Removes the cart item identified by the action. */
    function cartRemove(id) {
      cart.splice(Number(id), 1);
      updateCart();
    }

    /* Redireciona para vendas com o produto selecionado no carrinho inicial. */
    function quickSale(id) {
      location.href = "vendas.html?product=" + encodeURIComponent(id);
    }

    /* Exporta em CSV os detalhes do recebimento selecionado. */
    function receiptDownload(id) {
      const sale = get("sales", id);
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
        sale.items.map((item) => [
          sale.code,
          U.date(sale.created),
          item.name || get("products", item.product)?.name,
          item.qty,
          (item.price / 100).toFixed(2),
          (sale.total / 100).toFixed(2),
          payName(sale.payment),
        ]),
        "comprovante-demonstrativo-" + sale.code.replace("#", ""),
      );
    }

    return {
      orderForm,
      orderNewClient,
      orderDetail,
      nextOrder,
      cancelOrder,
      saleForm,
      saleNewClient,
      receiveForm,
      receipt,
      cartAdd,
      cartRemove,
      quickSale,
      receiptDownload,
    };
  },
};
