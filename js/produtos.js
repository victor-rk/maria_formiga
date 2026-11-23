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
                [["", "Selecione..."], ...D.state.materials.map(
                   (
                    m,
                  ) => [m.id, `${m.name} (${m.unit})`],
                )],
                r.material,
              )
            }<div class="quantity-unit">${ F("recipeQty" + i, "Quantidade *", r.qty, "number", 'required min="0.001" step="0.001"')}<span id="recipe-unit-${i}">${D.state.materials.find((m) => m.id === r.material)?.unit || ""}</span></div>${ B("Remover", "recipe-remove", String(i))}</div>`,
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
        p?.recipe || [{ material: "", qty: "" }],
      );
      U.open(
        p ? "Editar ficha técnica" : "Novo produto e receita",
        `<form class="checkout-form product-form"><p class="form-error" role="alert" tabindex="-1"></p><div class="checkout-main"><div class="form-grid">${ F("name", "Nome do produto *", p?.name || "", "text", required)}${ F("yield", "Rendimento da receita (unidades) *", p?.yield || "", "number", 'required min="1" step="1"')}${ F("price", "Preço de venda por unidade *", p ? p.price / 100 : "", "money", "required")}${ F("margin", "Margem mínima sobre venda (%) *", p?.margin ?? 40, "number", 'required min="0" max="99.9" step="0.1"')}${ F("days", "Validade sugerida em dias *", p?.days || 4, "number", 'required min="1" max="365" step="1"')}</div><h3 class="section-heading">Composição da receita</h3><div id="recipe-lines">${recipeMarkup()}</div>${ B("Adicionar insumo", "recipe-add", "", "btn-secondary")}</div><aside class="checkout-summary product-summary" aria-live="polite"><div id="product-summary-content"></div>${U.actions("Salvar produto")}</aside></form>`,
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
            recipe: recipe.map((line) => ({ ...line, qty: Number(line.qty) })),
          };
          if (data.price < 1)
            throw Error("Informe um preço maior que zero.");
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
          r.material = $("#f-recipeMaterial" + i)?.value || "";
          r.qty = $("#f-recipeQty" + i)?.value || "";
        },
      );
    }
    /* Atualiza custo unitário, margem atual e preço mínimo enquanto a ficha é preenchida. */ function productSummary() {
      syncRecipe();
      const yieldCount = Number($("#f-yield")?.value),
        price = U.moneyCents($("#f-price")?.value),
        margin = Number($("#f-margin")?.value),
        complete = yieldCount > 0 && recipe.length > 0 && recipe.every((r) => r.material && Number(r.qty) > 0),
        cost = complete ? D.cost({ recipe, yield: yieldCount }) : 0,
        currentMargin = complete && price > 0 ? D.margin(price, cost) : null,
        suggestedPrice = complete && Number.isFinite(margin) && margin < 100
          ? Math.ceil(cost / (1 - margin / 100) - 1e-8)
          : null;
      recipe.forEach((r, i) => {
        const material = get("materials", $("#f-recipeMaterial" + i)?.value);
        const unit = $("#recipe-unit-" + i);
        if (unit) unit.textContent = material?.unit || "";
      });
      const summary = $("#product-summary-content");
      if (!summary) return;
      const marginWarning = currentMargin !== null && Number.isFinite(margin) && currentMargin < margin
        ? '<p class="summary-hint is-warning">O preço ainda não atinge a margem mínima.</p>'
        : "";
      summary.innerHTML = `<h3>Resumo do produto</h3><div class="product-summary-row"><span>Custo por unidade</span><strong>${complete ? M(cost) : "—"}</strong></div><div class="product-summary-row"><span>Margem atual</span><strong>${currentMargin === null ? "—" : U.num(currentMargin) + "%"}</strong></div><div class="product-summary-row"><span>Preço mínimo</span><strong>${suggestedPrice === null ? "—" : M(suggestedPrice)}</strong></div>${marginWarning}<p class="checkout-empty">Atualizado conforme você preenche a ficha.</p>`;
    }
    /* Confirma produção, verifica insumos, deduz a receita proporcionalmente e cria um lote pronto. */ function productionForm() {
      D.needPermission("produce");
      if (!D.state.products.length)
        throw Error("Cadastre um produto e sua receita primeiro.");
      U.open(
        "Registrar produção concluída",
        `<form class="checkout-form production-form"><p class="form-error" role="alert" tabindex="-1"></p><div class="checkout-main"><div class="form-grid">${ S("product", "Produto *", options("products"))}${ F("qty", "Quantidade produzida *", 1, "number", 'required min="1" step="1"')}${ F("expires", "Data de validade *", D.date(4), "date", `required min="${D.date()}"`)}</div></div><aside class="checkout-summary production-summary" aria-live="polite"><div id="production-preview"></div>${U.actions("Confirmar produção")}</aside></form>`,
      );
      /* Exibe os insumos necessários e seus saldos para a quantidade de produção informada. */ function preview() {
        const p = get("products", $("#f-product").value);
        const summary = $("#production-preview");
        if (!p) {
          summary.innerHTML = '<h3>Resumo da produção</h3><p class="checkout-empty">Selecione um produto para consultar os insumos necessários.</p>';
          return;
        }
        const qty = Number($("#f-qty").value) || 0,
          expires = $("#f-expires").value;
        const materials = p.recipe
          .map((r) => {
            const m = get("materials", r.material),
               needed = (r.qty * qty) / p.yield,
               stock = m?.stock || 0,
               unit = m?.unit || "",
               insufficient = stock + 1e-8 < needed;
            return `<div class="production-material${insufficient ? " is-insufficient" : ""}"><div><strong>${U.esc(m?.name || "Matéria-prima indisponível")}</strong><span>${U.num(needed)} ${U.esc(unit)} necessários</span></div><div><span>Saldo atual</span><strong>${U.num(stock)} ${U.esc(unit)}</strong></div></div>`;
          })
          .join("");
        summary.innerHTML = `<h3>Resumo da produção</h3><div class="production-summary-details"><div><span>Produto</span><strong>${U.esc(p.name)}</strong></div><div><span>Quantidade</span><strong>${U.num(qty)} un</strong></div><div><span>Validade</span><strong>${expires ? U.date(expires) : "—"}</strong></div></div><h4 class="production-material-heading">Matérias-primas</h4><div class="production-material-list">${materials}</div>`;
      }
      $("#f-product").onchange =
         () => {
          const p = get("products", $("#f-product").value);
          if (p) $("#f-expires").value = D.date(p.days);
          preview();
        };
      $("#f-qty").oninput = preview;
      $("#f-expires").onchange = preview;
      preview();
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
          }${ F("note", "Observação", "", "text", 'maxlength="200"')}`,
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
      recipe.push({ material: "", qty: "" });
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
