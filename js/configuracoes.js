/* Registers the settings interface and user forms. */
window.MF_PAGE_MODULES = window.MF_PAGE_MODULES || {};
window.MF_PAGE_MODULES.configuracoes = {
  /* Creates profile, user management, and change-history operations. */
  create({ D, U, get, val, F, S, B, required, E, save }) {
     /* Builds an accessible action button for the settings screens. */
     function settingsAction(
      label,
      action,
      id = "",
      kind = "neutral",
      icon = "fa-pen",
    ) {
      return `<button type="button" class="settings-action settings-action--${E(kind)}" data-action="${E(action)}" data-id="${E(id)}"><i class="fa-solid ${E(icon)}" aria-hidden="true"></i><span>${E(label)}</span></button>`;
    }
    // Apresenta abas de navegação com indicador de seleção, separadas dos botões de ação.
    function settings(tab = "profile", focusTab = false) {
      const admin = D.role === "admin";
      const user =
        D.state.users.find((u) => u.role === D.role && u.active) ||
        D.state.users[0];
      const tabs = [
        { key: "profile", label: "Meu perfil", action: "settings-profile" },
      ];
      if (admin)
        tabs.push(
          {
            key: "users",
            label: "Gerenciar usuários",
            action: "settings-users",
          },
          {
            key: "audit",
            label: "Histórico de alterações",
            action: "settings-audit",
          },
        );
      if (!tabs.some((item) => item.key === tab)) tab = "profile";
      // As abas alternam o painel; não representam operações sobre usuários ou dados.
      let content = `<div class="settings-tabs" role="tablist" aria-label="Seções de configurações">${tabs.map((item) => `<button type="button" role="tab" class="settings-tab${item.key === tab ? " is-active" : ""}" id="settings-tab-${item.key}" data-action="${item.action}" aria-selected="${item.key === tab}" aria-controls="settings-panel-${item.key}" tabindex="${item.key === tab ? 0 : -1}">${E(item.label)}</button>`).join("")}</div>`;
      let panel = "";
      if (tab === "users") {
        panel =
          U.table(
            ["Usuário", "Perfil", "Situação", "Ações"],
            D.state.users.map((u) => [
              E(u.name),
              u.role === "admin" ? "Administrador" : "Operacional",
              `<span class="settings-state${u.active ? " is-active" : ""}">${u.active ? "Ativo" : "Inativo"}</span>`,
              `<div class="settings-row-actions">${
                // Editar abre o formulário de dados do usuário.
                settingsAction("Editar", "user", u.id, "edit", "fa-pen")
              }${
                u.role === "aux"
                  ? // Ativar ou desativar altera a situação da conta; excluir mantém a confirmação existente.
                    settingsAction(
                      u.active ? "Desativar" : "Ativar",
                      "user-toggle",
                      u.id,
                      u.active ? "warning" : "success",
                      u.active ? "fa-user-slash" : "fa-user-check",
                    ) +
                    settingsAction(
                      "Excluir",
                      "user-delete",
                      u.id,
                      "danger",
                      "fa-trash-can",
                    )
                  : ""
              }</div>`,
            ]),
          ) +
          `<div class="settings-footer">${
            // Novo usuário abre um cadastro, visualmente separado da navegação entre abas.
            settingsAction(
              "Novo usuário",
              "user",
              "",
              "primary",
              "fa-user-plus",
            )
          }</div>`;
      } else if (tab === "audit") {
        panel = U.table(
          ["Data", "Perfil", "Ação"],
          D.state.audit
            .slice(-100)
            .reverse()
            .map((entry) => [U.date(entry.at), E(entry.actor), E(entry.text)]),
        );
      } else {
        panel = `<dl class="detail-list settings-profile-details"><dt>Nome</dt><dd>${E(user.name)}</dd><dt>E-mail</dt><dd>${E(user.email)}</dd><dt>Telefone</dt><dd>${E(U.formatPhone(user.phone))}</dd><dt>Nascimento</dt><dd>${U.date(user.birth)}</dd><dt>Perfil</dt><dd>${admin ? "Administrador" : "Operacional"}</dd></dl><div class="settings-profile-actions">${
          // Editar meus dados abre o formulário do perfil atual.
          settingsAction(
            "Editar meus dados",
            "my-profile",
            user.id,
            "primary",
            "fa-user-pen",
          )
        }${
          // Alterar senha abre o fluxo de preenchimento e confirmação de senha.
          settingsAction(
            "Alterar senha",
            "password-preview",
            "",
            "neutral",
            "fa-lock",
          )
        }</div>`;
      }
      // Mantém todos os painéis referenciados pelas abas no DOM, ocultando os não selecionados.
      content += tabs
        .map(
          (item) =>
            `<section class="settings-panel" id="settings-panel-${item.key}" role="tabpanel" aria-labelledby="settings-tab-${item.key}" tabindex="0"${item.key === tab ? "" : " hidden"}>${item.key === tab ? panel : ""}</section>`,
        )
        .join("");
      U.open("Configurações", content, (dialog) => {
        const tabList = dialog.querySelector('[role="tablist"]');
        // As setas, Home e End alternam as abas e mantêm o foco no item selecionado.
        tabList.addEventListener("keydown", (event) => {
          if (!event.target.matches('[role="tab"]')) return;
          const index = tabs.findIndex((item) => item.key === tab);
          let next = index;
          if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
          else if (event.key === "ArrowLeft")
            next = (index - 1 + tabs.length) % tabs.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = tabs.length - 1;
          else return;
          event.preventDefault();
          settings(tabs[next].key, true);
        });
        // Executa após o foco inicial do modal para não devolver o foco ao botão Fechar.
        if (focusTab)
          setTimeout(
            () =>
              dialog
                .querySelector('[role="tab"][aria-selected="true"]')
                ?.focus(),
            0,
          );
      });
    }
    /* Cadastra ou edita dados de usuário e seu perfil demonstrativo sem criar credenciais. */ function userForm(
      id,
      self = false,
    ) {
      if (!self) D.needPermission("manage");
      const u = get("users", id);
      U.open(
        u ? "Editar usuário" : "Novo usuário",
        U.form(
          `<div class="form-grid">${ F("name", "Nome completo *", u?.name || "", "text", required)}${ F("email", "E-mail *", u?.email || "", "email", 'required maxlength="120"')}${ F("birth", "Data de nascimento *", u?.birth || "", "date", `required max="${D.date()}"`)}${ F("phone", "Telefone *", u?.phone || "", "tel", 'required minlength="10" maxlength="30"')}${
            !self
              ?  S(
                  "role",
                  "Perfil *",
                  [
                    ["admin", "Administrador"],
                    ["aux", "Operacional"],
                  ],
                  u?.role || "aux",
                  u?.id === "u1" ? "disabled" : "required",
                )
              : ""
          }</div>`,
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Cadastra ou edita dados de usuário e seu perfil demonstrativo sem criar credenciais. */ (
          fd,
        ) => {
          const email = val(fd, "email");
          if (
            D.state.users.some(
               (
                x,
              ) => x.id !== id && x.email.toLowerCase() === email.toLowerCase(),
            )
          )
            throw Error("Este e-mail já está cadastrado.");
          const data = {
            name: val(fd, "name"),
            email,
            birth: val(fd, "birth"),
            phone: val(fd, "phone").replace(/\D/g, ""),
            role: self || u?.id === "u1" ? u.role : val(fd, "role"),
          };
          save(
             (
              s,
            ) =>
              u
                ? Object.assign(u, data)
                : s.users.push({ id: D.uid(), ...data, active: true }),
            "Usuário salvo.",
          );
        },
      );
    }
    /* Mostra a prévia de alteração de senha e valida o formato sem gravar a credencial. */ function passwordPreview() {
      U.open(
        "Alterar senha",
        U.form(
          `${ F("current", "Senha atual *", "", "password", 'required autocomplete="current-password"')}${ F("new", "Nova senha *", "", "password", 'required minlength="8" maxlength="128" autocomplete="new-password"')}${ F("confirm", "Confirmar nova senha *", "", "password", 'required autocomplete="new-password"')}<p class="help">Use ao menos 8 caracteres, maiúscula, minúscula, número e símbolo.</p>`,
          "Validar senha",
        ),
      );
      U.bindForm(
        /* Valida os campos enviados e executa a operação do formulário — Mostra a prévia de alteração de senha e valida o formato sem gravar a credencial. */ (
          fd,
        ) => {
          validatePassword(val(fd, "new"), val(fd, "confirm"));
          U.close(true);
          U.toast("Formato da senha validado.");
        },
      );
    }
    /* Exige oito caracteres, maiúscula, minúscula, número, símbolo e confirmação idêntica. */ function validatePassword(
      p,
      c,
    ) {
      if (
        p.length < 8 ||
        !/[A-Z]/.test(p) ||
        !/[a-z]/.test(p) ||
        !/\d/.test(p) ||
        !/[\W_]/.test(p)
      )
        throw Error(
          "Use ao menos 8 caracteres com maiúscula, minúscula, número e símbolo.",
        );
      if (!c || p !== c)
        throw Error(
          "As senhas precisam ser iguais e a confirmação é obrigatória.",
        );
    }

    /* Exclui usuário operacional após confirmação e preserva o histórico. */
    function deleteUser(id) {
      D.needPermission("manage");
      const user = get("users", id);
      if (user.role === "admin")
        throw Error("Não é possível excluir este administrador.");
      U.confirmCard(
        "Excluir o usuário " +
          user.name +
          "? O histórico das operações será preservado.",
        () =>
        save(
          (state) => {
            state.users = state.users.filter((item) => item.id !== id);
          },
          "Usuário excluído.",
        ),
        { confirmText: "Excluir usuário", danger: true },
      );
    }

    /* Ativa ou desativa um usuário operacional após confirmação. */
    function toggleUser(id) {
      D.needPermission("manage");
      const user = get("users", id);
      if (user.role === "admin")
        throw Error("Não é possível desativar este administrador.");
      U.confirmCard(
        `${user.active ? "Desativar" : "Ativar"} ${user.name}?`,
        () =>
        save(
          () => (user.active = !user.active),
          "Situação do usuário atualizada.",
        ),
        { confirmText: user.active ? "Desativar usuário" : "Ativar usuário" },
      );
    }

    return {
      settings,
      userForm,
      passwordPreview,
      validatePassword,
      deleteUser,
      toggleUser,
    };
  },
};
