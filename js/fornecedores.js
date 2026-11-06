/* Registra operações exclusivas de cadastro e edição de fornecedores. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};

window.MF_PAGE_MODULES.fornecedores = {
  /* Cria o formulário de fornecedor usando os serviços compartilhados. */
  create({ D, U, get, F, required, val, integer, save }) {
    /* Valida CNPJ e duplicidade antes de cadastrar ou atualizar fornecedor. */
    function supplierForm(id) {
      D.needPermission("manage");
      const supplier = get("suppliers", id);
      U.open(
        supplier ? "Editar fornecedor" : "Novo fornecedor",
        U.form(
          `<div class="form-grid">${F("name", "Razão social / nome fantasia *", supplier?.name || "", "text", required)}${F("cnpj", "CNPJ *", supplier?.cnpj || "", "text", 'required maxlength="18" inputmode="numeric"')}${F("category", "Categoria de insumo *", supplier?.category || "", "text", required)}${F("lead", "Prazo em dias úteis *", supplier?.lead ?? 2, "number", 'required min="0" max="365" step="1"')}${F("phone", "Telefone *", supplier?.phone || "", "tel", 'required minlength="10" maxlength="30"')}${F("email", "E-mail para pedidos *", supplier?.email || "", "email", 'required maxlength="120"')}</div>`,
        ),
      );
      U.bindForm((formData) => {
        const cnpj = val(formData, "cnpj").replace(/\D/g, "");
        if (!D.validCNPJ(cnpj)) throw Error("Informe um CNPJ válido.");
        if (
          D.state.suppliers.some(
            (item) => item.id !== id && item.cnpj === cnpj,
          )
        )
          throw Error("CNPJ já cadastrado.");
        const data = {
          name: val(formData, "name"),
          cnpj,
          category: val(formData, "category"),
          lead: integer(formData, "lead", 0),
          phone: val(formData, "phone").replace(/\D/g, ""),
          email: val(formData, "email"),
        };
        save(
          (state) =>
            supplier
              ? Object.assign(supplier, data)
              : state.suppliers.push({ id: D.uid(), ...data }),
          "Fornecedor salvo.",
        );
      });
    }

    return { supplierForm };
  },
};
