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
          }${!m ?  F("stock", "Saldo inicial *", 0, "number", 'required min="0" step="0.001"') : ""}${ F("min", "Estoque mínimo *", m?.min || 0, "number", 'required min="0" step="0.001"')}${ F("cost", "Custo em R$ por unidade base *", m ? m.cost / 100 : 0, "number", 'required min="0.01" step="0.01"')}</div><p class="help">Use a mesma unidade na receita e nas movimentações. O saldo é alterado por movimentação, preservando o histórico. O custo atual não altera vendas anteriores.</p>`,
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
          `${ S("material", "Matéria-prima *", options("materials"), id)}<p id="movement-stock" class="notice"></p><div class="form-grid">${
             S(
              "type",
              "Operação *",
              [
                ["entrada", "Entrada / compra"],
                ["saida", "Saída / uso ou perda"],
              ],
            )
          }${ F("qty", "Quantidade na unidade base *", "", "number", 'required min="0.001" step="0.001"')}${ F("cost", "Novo custo por unidade (R$) — opcional", "", "number", 'min="0.01" step="0.01"')}${ S("supplier", "Fornecedor — opcional", options("suppliers", "Não vincular"), "", "")}</div>${ F("reason", "Motivo / referência *", "", "text", 'required maxlength="200"')}`,
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
             (
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

    return { materialForm, movementForm };
  },
};
