/* Registra operações exclusivas de cadastro e endereço de clientes. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};

window.MF_PAGE_MODULES.clientes = {
  /* Cria as operações de cliente com os serviços compartilhados do sistema. */
  create({ D, U, get, F, S, required, val, E, address, B, save }) {
    async function lookupAddress(zip) {
      if (zip.length !== 8) throw Error("Informe um CEP válido.");
      let response;
      try {
        response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
      } catch {
        throw Error("Não foi possível validar o CEP. Verifique sua conexão.");
      }
      if (!response.ok)
        throw Error("O serviço de CEP não respondeu corretamente.");
      let result;
      try {
        result = await response.json();
      } catch {
        throw Error("O serviço de CEP retornou uma resposta inválida.");
      }
      if (result.erro)
        throw Error("O CEP informado não foi encontrado.");
      if (!result.logradouro)
        throw Error(
          "Não foi possível confirmar o logradouro para este CEP. Confira o CEP e a rua.",
        );
      if (!result.bairro || !result.localidade)
        throw Error(
          "O CEP não retornou bairro ou cidade. Confira o CEP informado.",
        );
      return result;
    }
    const cities = [
      ["Biritiba-Mirim", "Biritiba-Mirim"],
      ["Mogi das Cruzes", "Mogi das Cruzes"],
      ["Salesópolis", "Salesópolis"],
      ["Guararema", "Guararema"],
      ["Bertioga", "Bertioga"],
      ["Suzano", "Suzano"],
      ["Santa Branca", "Santa Branca"],
    ];
    /* Abre cadastro/edição e valida telefone e duplicidade. */
    function clientForm(id, flow = {}) {
      D.needPermission("manage");
      const client = get("clients", id);
      U.open(
        client ? "Editar cliente" : "Cadastrar cliente",
        U.form(
          `<div class="client-form-grid"><div class="client-form-left">${F("name", "Nome completo *", client?.name || "", "text", required)}${F("phone", "Telefone / WhatsApp *", client?.phone || "", "tel", 'required minlength="10" maxlength="30"')}</div><div class="client-form-right">${F("document", "CPF (opcional)", client?.cpf || "", "text", 'data-mask="cpf" inputmode="numeric" maxlength="14"')}${F("email", "E-mail (opcional)", client?.email || "", "email", 'maxlength="120" autocomplete="email"')}</div></div>${!client ? '<label class="toggle-row"><input type="checkbox" name="addAddress" checked><span class="toggle-switch" aria-hidden="true"></span><span>Cadastrar endereço agora</span></label>' : ""}<p class="help">Os endereços são gerenciados separadamente, permitindo mais de um local por cliente.</p>`,
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
      const cityOptions =
        clientAddress?.city &&
        !cities.some(([value]) => value === clientAddress.city)
          ? [
              [clientAddress.city, clientAddress.city + " (atual)"],
              ...cities,
            ]
          : cities;
      let addressSaved = false;
      U.open(
        clientAddress ? "Editar endereço" : "Novo endereço",
        U.form(
          `<div class="form-grid"><div class="full">${F("zip", "CEP *", clientAddress?.zip || "", "text", 'required pattern="[0-9]{5}-?[0-9]{3}" data-mask="cep" inputmode="numeric" maxlength="9" autocomplete="postal-code"')}</div>${F("street", "Rua / avenida *", clientAddress?.street || "", "text", required)}${F("number", "Número ou S/N *", clientAddress?.number || "", "text", 'required maxlength="20"')}${F("district", "Bairro *", clientAddress?.district || "", "text", required)}${S("city", "Cidade *", cityOptions, clientAddress?.city || "Biritiba-Mirim", "required")}${F("extra", "Complemento", clientAddress?.extra || "", "text", 'maxlength="120"')}</div>`,
        ),
        undefined,
        onCancel
          ? () => {
              if (addressSaved) onSaved?.();
              else onCancel();
            }
          : undefined,
      );
      const form = document.querySelector("#dialog-body form");
      const zipField = form.elements.namedItem("zip");
      const streetField = form.elements.namedItem("street");
      const districtField = form.elements.namedItem("district");
      const cityField = form.elements.namedItem("city");
      const addressError = form.querySelector(".form-error");
      let requestId = 0;
      let cachedLookup;

      function lockAddressParts(locked) {
        streetField.readOnly = locked;
        districtField.readOnly = locked;
        cityField.disabled = locked;
      }

      function applyLookup(result) {
        streetField.value = result.logradouro;
        if (result.bairro) districtField.value = result.bairro;
        if (result.localidade) {
          if (
            ![...cityField.options].some(
              (option) => option.value === result.localidade,
            )
          )
            cityField.add(new Option(result.localidade, result.localidade));
          cityField.value = result.localidade;
        }
        lockAddressParts(true);
      }

      function getLookup(zip) {
        if (cachedLookup?.zip === zip) return cachedLookup.promise;
        const promise = lookupAddress(zip);
        cachedLookup = { zip, promise };
        promise.catch(() => {
          if (cachedLookup?.promise === promise) cachedLookup = undefined;
        });
        return promise;
      }

      async function updateAddressFromZip() {
        const zip = zipField.value.replace(/\D/g, "");
        const currentRequest = ++requestId;
        addressError.textContent = "";
        if (!zip) {
          cachedLookup = undefined;
          lockAddressParts(false);
          return;
        }
        if (zip.length !== 8) return;

        lockAddressParts(true);
        if (cachedLookup?.zip !== zip) {
          streetField.value = "";
          districtField.value = "";
          cityField.selectedIndex = -1;
        }
        try {
          const result = await getLookup(zip);
          if (
            currentRequest !== requestId ||
            zipField.value.replace(/\D/g, "") !== zip
          )
            return;
          applyLookup(result);
        } catch (error) {
          if (currentRequest === requestId)
            addressError.textContent = error.message;
        }
      }

      zipField.addEventListener("input", updateAddressFromZip);
      if (zipField.value.replace(/\D/g, "").length === 8)
        updateAddressFromZip();

      U.bindForm(async (_formData, submittedForm) => {
        const zip = zipField.value.replace(/\D/g, "");
        const result = await getLookup(zip);
        if (!submittedForm.isConnected || !submittedForm.closest("dialog")?.open)
          return;
        applyLookup(result);
        const data = Object.fromEntries(
          ["street", "number", "district", "city", "zip", "extra"].map(
            (keyName) => [
              keyName,
              String(submittedForm.elements.namedItem(keyName).value).trim(),
            ],
          ),
        );
        if (
          !submittedForm.isConnected ||
          !submittedForm.closest("dialog")?.open
        )
          return;
        save(() => {
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
