/* Registra formul?rios exclusivos de mat?ria-prima e movimenta??es de estoque. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};

window.MF_PAGE_MODULES.estoque = {
  /* Cria opera??es de estoque com acesso controlado aos servi?os compartilhados. */
  create({ D, U, $, get, F, S, required, val, number, cents, save, options }) {
    /* Cadastra ou edita matéria-prima, sua unidade, saldo inicial, mínimo e custo. */ function materialForm(
      id,
    ) {
      D.needPermission("manage");
      const m = get("materials", id);
      U.open(
        m ? "Editar matéria-prima" : "Nova matéria-prima",
        U.form(
          `<div class="form-grid">${ F("name", "Nome da matéria-prima *", m?.name || "", "text", required)}${
             S(
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
          }</div><div class="form-grid material-detail-grid${m ? " is-editing" : ""}">${!m ?  F("stock", "Saldo inicial *", 0, "number", 'required min="0" step="0.001"') : ""}${ F("min", "Estoque mínimo *", m?.min || 0, "number", 'required min="0" step="0.001"')}${ F("cost", "Custo por unidade base *", m ? m.cost / 100 : 0, "money", "required")}</div>`,
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Cadastra ou edita matéria-prima, sua unidade, saldo inicial, mínimo e custo. */ (
          fd,
        ) => {
          const name = val(fd, "name");
          if (
            D.state.materials.some(
               (
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
          if (data.cost < 1)
            throw Error("Informe um custo maior que zero.");
          save(
             (
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
                  amount: Math.round(material.stock * material.cost),
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
          `<div class="movement-material-row">${ S("material", "Matéria-prima *", options("materials"), id)}<div id="movement-stock" class="input-group movement-stock-field" aria-live="polite"><label for="movement-stock-value">Saldo atual</label><input id="movement-stock-value" type="text" value="-" readonly></div></div><div class="form-grid">${
             S(
              "type",
              "Operação *",
              [
                ["entrada", "Entrada / compra"],
                ["saida", "Saída / uso ou perda"],
              ],
            )
          }<div class="quantity-unit movement-quantity-unit">${ F("qty", "Quantidade *", "", "number", 'required min="0.001" step="0.001"')}<span id="movement-unit"></span></div>${ F("cost", "Novo custo por unidade — opcional", "", "money", "")}${ F("reason", "Motivo", "", "text", 'maxlength="200"')}</div>`,
        ),
      );
      const update =
        /* Exibe o saldo e a unidade da matéria-prima selecionada. */ () => {
          const m = get("materials", $("#f-material").value);
          $("#movement-stock-value").value = m
            ? `${U.num(m.stock)} ${m.unit}`
            : "-";
          $("#movement-unit").textContent = m?.unit || "";
          if (m) $("#f-qty").setAttribute("aria-describedby", "movement-unit");
          else $("#f-qty").removeAttribute("aria-describedby");
        };
      $("#f-material").onchange = update;
      update();
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Registra entrada ou saída de matéria-prima e impede retirada superior ao saldo. */ (
          fd,
        ) => {
          const m = get("materials", val(fd, "material")),
            qty = number(fd, "qty", 0.001),
            type = val(fd, "type"),
            newCost = val(fd, "cost") ? cents(fd, "cost") : null;
          if (m.unit === "un" && !Number.isInteger(qty))
            throw Error("Para unidades, informe uma quantidade inteira.");
          if (type === "saida" && qty > m.stock)
            throw Error("A saída supera o saldo disponível.");
          if (type === "entrada" && newCost !== null && newCost < 1)
            throw Error("Informe um custo maior que zero.");
          const amount =
            type === "entrada" ? Math.round(qty * (newCost ?? m.cost)) : 0;
          save(
             (
              s,
            ) => {
              m.stock =
                Math.round(
                  (m.stock + (type === "entrada" ? qty : -qty)) * 1000,
                ) / 1000;
              if (type === "entrada" && newCost !== null) {
                m.cost = newCost;
              }
              s.movements.push({
                id: D.uid(),
                material: m.id,
                type,
                qty,
                amount,
                reason: val(fd, "reason"),
                at: D.now(),
              });
            },
            "Movimentação registrada.",
          );
        },
      );
    }

    return { materialForm, movementForm };
  },
};
