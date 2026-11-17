/* Registra operações exclusivas de cadastro e edição de fornecedores. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};

window.MF_PAGE_MODULES.fornecedores = {
  /* Cria o formulário de fornecedor usando os serviços compartilhados. */
  create({ D, U, get, F, required, val, save }) {
    /* Cadastra ou atualiza os dados de contato do fornecedor. */
    function supplierForm(id) {
      D.needPermission("manage");
      const supplier = get("suppliers", id);
      U.open(
        supplier ? "Editar fornecedor" : "Novo fornecedor",
        U.form(
          `<div class="form-grid">${F("name", "Razão social / nome fantasia *", supplier?.name || "", "text", required)}${F("category", "Categoria de insumo *", supplier?.category || "", "text", required)}${F("phone", "Telefone *", supplier?.phone || "", "tel", 'required minlength="10" maxlength="30"')}${F("email", "E-mail para pedidos *", supplier?.email || "", "email", 'required maxlength="120"')}</div>`,
        ),
      );
      U.bindForm((formData) => {
        const data = {
          name: val(formData, "name"),
          category: val(formData, "category"),
          phone: val(formData, "phone").replace(/\D/g, ""),
          email: val(formData, "email"),
        };
        save(
          (state) => {
            if (supplier) {
              delete supplier.cnpj;
              delete supplier.lead;
              Object.assign(supplier, data);
            } else state.suppliers.push({ id: D.uid(), ...data });
          },
          "Fornecedor salvo.",
        );
      });
    }

    return { supplierForm };
  },
};
