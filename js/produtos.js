/* Registra opera??es de fichas t?cnicas, produ??o e perdas de produtos. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};

window.MF_PAGE_MODULES.produtos = {
  /* Cria opera??es de produtos e produ??o com os servi?os compartilhados. */
  create({ D, U, $, get, F, S, B, required, val, number, integer, cents, save, options, M }) {
    let recipe = [];
    /* Gera uma linha de insumo, quantidade e remoção para cada componente da receita. */ function recipeMarkup() {
      return recipe
        .map(
           (
            r,
            i,
          ) =>
            `<div class="recipe-line">${
               S(
                "recipeMaterial" + i,
                "Matéria-prima *",
                D.state.materials.map(
                   (
                    m,
                  ) => [m.id, `${m.name} (${m.unit})`],
                ),
                r.material,
              )
            }${ F("recipeQty" + i, "Quantidade *", r.qty, "number", 'required min="0.001" step="0.001"')}${ B("Remover", "recipe-remove", String(i))}</div>`,
        )
        .join("");
    }
    /* Cadastra ou edita a ficha técnica e impede preço abaixo da margem mínima configurada. */ function productForm(
      id,
    ) {
      D.needPermission("manage");
      if (!D.state.materials.length)
        throw Error("Cadastre matérias-primas antes do produto.");
      const p = get("products", id);
      recipe = structuredClone(
        p?.recipe || [{ material: D.state.materials[0].id, qty: 1 }],
      );
      U.open(
        p ? "Editar ficha técnica" : "Novo produto e receita",
        U.form(
          `<div class="form-grid">${ F("name", "Nome do produto *", p?.name || "", "text", required)}${ F("yield", "Rendimento da receita (unidades) *", p?.yield || 1, "number", 'required min="1" step="1"')}${ F("price", "Preço de venda por unidade (R$) *", p ? p.price / 100 : 0, "number", 'required min="0.01" step="0.01"')}${ F("margin", "Margem mínima sobre venda (%) *", p?.margin ?? 40, "number", 'required min="0" max="99.9" step="0.1"')}${ F("days", "Validade sugerida em dias *", p?.days || 4, "number", 'required min="1" max="365" step="1"')}</div><h3 class="section-heading">Composição da receita</h3><div id="recipe-lines">${recipeMarkup()}</div>${ B("Adicionar insumo", "recipe-add", "", "btn-secondary")}<div id="product-summary" class="notice" aria-live="polite"></div>`,
        ),
      );
      $("#dialog-body").addEventListener("input", productSummary);
      $("#dialog-body").addEventListener("change", productSummary);
      productSummary();
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Cadastra ou edita a ficha técnica e impede preço abaixo da margem mínima configurada. */ (
          fd,
        ) => {
          syncRecipe();
          if (!recipe.length)
            throw Error("Vincule ao menos uma matéria-prima.");
          if (
            new Set(
              recipe.map(
                 (
                  r,
                ) => r.material,
              ),
            ).size !== recipe.length
          )
            throw Error("Agrupe o mesmo insumo em uma única linha.");
          const data = {
            name: val(fd, "name"),
            yield: integer(fd, "yield"),
            price: cents(fd, "price"),
            margin: number(fd, "margin"),
            days: integer(fd, "days"),
            recipe: structuredClone(recipe),
          };
          if (data.margin >= 100)
            throw Error("A margem deve ser menor que 100%.");
          if (D.margin(data.price, D.cost(data)) + 1e-6 < data.margin)
            throw Error(
              "Preço abaixo da margem mínima. Ajuste o preço ou a margem.",
            );
          save(
             (
              s,
            ) =>
              p
                ? Object.assign(p, data)
                : s.products.push({ id: D.uid(), ...data }),
            "Ficha técnica salva.",
          );
        },
      );
    }
    /* Atualiza a receita em memória com os valores preenchidos nas linhas do formulário. */ function syncRecipe() {
      recipe.forEach(
         (
          r,
          i,
        ) => {
          r.material = $("#f-recipeMaterial" + i)?.value || r.material;
          r.qty = Number($("#f-recipeQty" + i)?.value || 0);
        },
      );
    }
    /* Atualiza custo unitário, margem atual e preço mínimo enquanto a ficha é preenchida. */ function productSummary() {
      syncRecipe();
      const p = { recipe, yield: Number($("#f-yield")?.value) || 1 },
        cost = D.cost(p),
        price = Math.round(Number($("#f-price")?.value) * 100) || 0,
        margin = Number($("#f-margin")?.value) || 0;
      $("#product-summary").textContent =
        `Insumos por unidade: ${M(cost)} · Margem atual: ${U.num(D.margin(price, cost))}% · Preço mínimo: ${M(Math.ceil(cost / (1 - margin / 100)))}`;
    }
    /* Confirma produção, verifica insumos, deduz a receita proporcionalmente e cria um lote pronto. */ function productionForm() {
      D.needPermission("produce");
      if (!D.state.products.length)
        throw Error("Cadastre um produto e sua receita primeiro.");
      U.open(
        "Registrar produção concluída",
        U.form(
          `${ S("product", "Produto *", options("products"))}<div class="form-grid">${ F("qty", "Quantidade produzida *", 1, "number", 'required min="1" step="1"')}${ F("expires", "Data de validade *", D.date(4), "date", `required min="${D.date()}"`)}</div><div id="production-preview" class="notice" aria-live="polite">Selecione o produto para conferir os insumos.</div>`,
          "Confirmar produção",
        ),
      );
      /* Exibe os insumos necessários e seus saldos para a quantidade de produção informada. */ function preview() {
        const p = get("products", $("#f-product").value);
        if (p) {
          const qty = Number($("#f-qty").value) || 0;
          $("#production-preview").textContent = p.recipe
            .map(
               (
                r,
              ) => {
                const m = get("materials", r.material);
                return `${m.name}: ${U.num((r.qty * qty) / p.yield)} ${m.unit} necessários; saldo ${U.num(m.stock)} ${m.unit}`;
              },
            )
            .join(" · ");
        }
      }
      $("#f-product").onchange =
         () => {
          const p = get("products", $("#f-product").value);
          if (p) $("#f-expires").value = D.date(p.days);
          preview();
        };
      $("#f-qty").oninput = preview;
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Confirma produção, verifica insumos, deduz a receita proporcionalmente e cria um lote pronto. */ (
          fd,
        ) => {
          const p = get("products", val(fd, "product")),
            qty = integer(fd, "qty"),
            expires = val(fd, "expires");
          if (expires < D.date())
            throw Error("A validade não pode ser anterior à produção.");
          for (const r of p.recipe) {
            const m = get("materials", r.material);
            if (m.stock + 1e-8 < (r.qty * qty) / p.yield)
              throw Error("Matéria-prima insuficiente: " + m.name);
          }
          save(
             (
              s,
            ) => {
              const unitCost = Math.round(D.cost(p));
              for (const r of p.recipe) {
                const m = get("materials", r.material),
                  used = (r.qty * qty) / p.yield;
                m.stock = Math.max(
                  0,
                  Math.round((m.stock - used) * 1000000) / 1000000,
                );
                s.movements.push({
                  id: D.uid(),
                  material: m.id,
                  type: "saida",
                  qty: used,
                  reason: "Produção: " + p.name,
                  at: D.now(),
                });
              }
              s.batches.push({
                id: D.uid(),
                product: p.id,
                qty,
                expires,
                created: D.now(),
                unitCost,
              });
            },
            "Produção registrada.",
          );
        },
      );
    }
    /* Registra a baixa de um lote por validade, avaria ou qualidade, sem gerar receita. */ function lossForm(
      id,
    ) {
      D.needPermission("manage");
      const batches = D.state.batches.filter(
         (
          b,
        ) => b.qty > 0,
      );
      if (!batches.length)
        throw Error("Não há saldo em lotes para registrar perda.");
      U.open(
        "Baixa por perda",
        U.form(
          `${
             S(
              "batch",
              "Produto / lote *",
              batches.map(
                 (
                  b,
                ) => [
                  b.id,
                  `${get("products", b.product).name} · ${b.id.slice(0, 8)} · saldo ${b.qty} · validade ${U.date(b.expires)}`,
                ],
              ),
              id || batches[0].id,
            )
          }${ F("qty", "Quantidade a descartar *", 1, "number", 'required min="1" step="1"')}${
             S(
              "reason",
              "Motivo *",
              [
                ["Validade expirada", "Validade expirada"],
                ["Avaria", "Avaria"],
                ["Qualidade", "Controle de qualidade"],
              ],
            )
          }${ F("note", "Observação", "", "text", 'maxlength="200"')}<p class="notice">Esta operação reduz o saldo do lote e não gera receita financeira.</p>`,
          "Confirmar baixa",
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Registra a baixa de um lote por validade, avaria ou qualidade, sem gerar receita. */ (
          fd,
        ) => {
          const b = get("batches", val(fd, "batch")),
            qty = integer(fd, "qty");
          if (qty > b.qty) throw Error("Quantidade maior que o saldo do lote.");
          save(
             (
              s,
            ) => {
              b.qty -= qty;
              s.movements.push({
                id: D.uid(),
                product: b.product,
                batch: b.id,
                type: "perda",
                qty,
                reason: val(fd, "reason") + " " + val(fd, "note"),
                at: D.now(),
              });
            },
            "Perda registrada.",
          );
        },
      );
    }

    /* Adiciona uma linha de insumo ? ficha t?cnica em edi??o. */
    function addRecipeLine() {
      syncRecipe();
      recipe.push({ material: D.state.materials[0].id, qty: 1 });
      $("#recipe-lines").innerHTML = recipeMarkup();
      productSummary();
    }

    /* Remove a linha selecionada e atualiza o resumo da ficha t?cnica. */
    function removeRecipeLine(id) {
      syncRecipe();
      recipe.splice(Number(id), 1);
      $("#recipe-lines").innerHTML = recipeMarkup();
      productSummary();
    }

    return { productForm, productionForm, lossForm, addRecipeLine, removeRecipeLine };
  },
};
