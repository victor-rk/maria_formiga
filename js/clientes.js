/* Registra operações exclusivas de cadastro e endereço de clientes. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};

window.MF_PAGE_MODULES.clientes = {
  /* Cria as operações de cliente com os serviços compartilhados do sistema. */
  create({ D, U, get, F, required, val, E, address, B, save }) {
    /* Abre cadastro/edição e valida telefone e duplicidade. */
    function clientForm(id, flow = {}) {
      D.needPermission("manage");
      const client = get("clients", id);
      U.open(
        client ? "Editar cliente" : "Cadastrar cliente",
        U.form(
          `<div class="form-grid">${F("name", "Nome completo *", client?.name || "", "text", required)}${F("document", "CPF (opcional)", client?.cpf || "", "text", 'inputmode="numeric" maxlength="14"')}${F("email", "E-mail *", client?.email || "", "email", 'required maxlength="120" autocomplete="email"')}${F("phone", "Telefone / WhatsApp *", client?.phone || "", "tel", 'required minlength="10" maxlength="30"')}</div>${!client ? '<label class="toggle-row"><input type="checkbox" name="addAddress" checked><span class="toggle-switch" aria-hidden="true"></span><span>Cadastrar endereço agora</span></label>' : ""}<p class="help">Os endereços são gerenciados separadamente, permitindo mais de um local por cliente.</p>`,
        ),
        undefined,
        flow.onCancel,
      );
      U.bindForm((formData) => {
        const cpf = val(formData, "document").replace(/\D/g, "");
        const phone = val(formData, "phone").replace(/\D/g, "");
        if (![10, 11].includes(phone.length))
          throw Error("Informe o telefone com DDD.");

        const clientId = client?.id || D.uid();
        const addAddress =
          !client && formData.get("addAddress") === "on";
        const updateClient = (state) => {
          const data = {
            name: val(formData, "name"),
            cpf,
            email: val(formData, "email"),
            phone,
          };
          if (client) Object.assign(client, data);
          else state.clients.push({ id: clientId, ...data, addresses: [] });
        };
        const message = client
          ? "Cliente atualizado."
          : "Cliente cadastrado.";

        if (flow.onSaved || addAddress) {
          const persisted = D.commit(updateClient, message);
          U.toast(
            persisted
              ? message
              : message +
                  " Não foi possível salvar as alterações de forma permanente.",
            !persisted,
          );
          if (addAddress) {
            addressForm(
              clientId + "|",
              () => flow.onSaved?.(clientId),
              flow.onCancel,
            );
          } else flow.onSaved?.(clientId);
        } else save(updateClient, message);
      });
    }

    /* Exibe endereços do cliente e as ações para editar ou cadastrar. */
    function addresses(id) {
      D.needPermission("manage");
      const client = get("clients", id);
      U.open(
        "Endereços de " + client.name,
        `<p class="help">Cadastre e selecione o endereço no pedido. Alterações futuras não modificam entregas já registradas.</p>${U.table(
          ["Endereço", "Ações"],
          client.addresses.map((item) => [
            E(address(item)),
            B("Editar", "address-edit", id + "|" + item.id),
          ]),
          "Nenhum endereço cadastrado.",
        )}${B("Novo endereço", "address-edit", id + "|", "btn-primary")}`,
      );
    }

    /* Salva o endereço selecionado sem alterar cópias em pedidos existentes. */
    function addressForm(key, onSaved, onCancel) {
      D.needPermission("manage");
      const [clientId, addressId] = key.split("|");
      const client = get("clients", clientId);
      const clientAddress = client.addresses.find(
        (item) => item.id === addressId,
      );
      let addressSaved = false;
      U.open(
        clientAddress ? "Editar endereço" : "Novo endereço",
        U.form(
          `<div class="form-grid">${F("street", "Rua / avenida *", clientAddress?.street || "", "text", required)}${F("number", "Número ou S/N *", clientAddress?.number || "", "text", 'required maxlength="20"')}${F("district", "Bairro *", clientAddress?.district || "", "text", required)}${F("city", "Cidade *", clientAddress?.city || "Biritiba-Mirim", "text", required)}${F("zip", "CEP *", clientAddress?.zip || "", "text", 'required pattern="[0-9]{5}-?[0-9]{3}" inputmode="numeric" maxlength="9"')}${F("extra", "Complemento", clientAddress?.extra || "", "text", 'maxlength="120"')}</div>`,
        ),
        undefined,
        onCancel
          ? () => {
              if (addressSaved) onSaved?.();
              else onCancel();
            }
          : undefined,
      );
      U.bindForm((formData) => {
        save(() => {
          const data = Object.fromEntries(
            ["street", "number", "district", "city", "zip", "extra"].map(
              (keyName) => [keyName, val(formData, keyName)],
            ),
          );
          if (clientAddress) Object.assign(clientAddress, data);
          else client.addresses.push({ id: D.uid(), ...data });
          addressSaved = true;
        }, "Endereço salvo.");
        if (!onCancel) onSaved?.();
      });
    }

    return { clientForm, addresses, addressForm };
  },
};
