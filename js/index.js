document.addEventListener("DOMContentLoaded", () => {
(() => {
  "use strict";
  const D = window.MF;
  const U = window.UI;
  const $ = (selector) => document.querySelector(selector);
  const page = document.body.dataset.page;
  if (page === "index") {
      // O campo de identificação e a senha permanecem vazios na abertura do login.
      const loginForm = $("#loginForm");
      const usernameInput = $("#email");
      const passwordInput = $("#password");
      const togglePassword = $(".pwd-toggle");
      // O botão do olho revela ou oculta somente a senha em digitação.
      togglePassword.addEventListener("click", () => {
        const show = passwordInput.type === "password";
        passwordInput.type = show ? "text" : "password";
        togglePassword.setAttribute(
          "aria-label",
          show ? "Ocultar senha" : "Mostrar senha",
        );
        const icon = togglePassword.querySelector("i");
        icon.classList.toggle("fa-eye", !show);
        icon.classList.toggle("fa-eye-slash", show);
      });
      // O perfil é obtido pela identificação da conta; não há seletor no formulário.
      loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (loginForm.dataset.loading === "true") return;
        if (!loginForm.reportValidity()) return;
        // Exige somente conteúdo nos dois campos; não compara usuário ou senha.
        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        if (!username || !password) {
          U.toast("Preencha o usuário e a senha.", true);
          (username ? passwordInput : usernameInput).focus();
          return;
        }
        const role =
          username === "admin@mariaformiga.com"
            ? "admin"
            : username === "auxiliar@mariaformiga.com"
              ? "aux"
              : null;
        if (!role) {
          U.toast(
            "Conta não reconhecida. Use o e-mail do administrador ou do auxiliar.",
            true,
          );
          usernameInput.focus();
          return;
        }
        // A opção Manter-me conectado preserva somente a preferência do perfil.
        D.setRole(role, loginForm.elements.remember.checked);
        passwordInput.value = "";
        // Exibe uma transição visual breve; não executa autenticação nem outra chamada externa.
        loginForm.dataset.loading = "true";
        loginForm.setAttribute("aria-busy", "true");
        $("#btnLogin").disabled = true;
        const loading = document.createElement("div");
        loading.className = "login-loading";
        loading.setAttribute("role", "status");
        loading.setAttribute("aria-live", "polite");
        loading.tabIndex = -1;
        loading.innerHTML =
          '<div class="login-loading-content"><img src="../assets/img/cupcake.png" width="56" height="56" alt=""><span class="login-loading-spinner" aria-hidden="true"></span><p>Carregando...</p></div>';
        document.body.appendChild(loading);
        $(".auth-wrapper").inert = true;
        loading.focus();
        setTimeout(() => {
          location.href = "home.html";
        }, 550);
      });
      // O retorno pelo botão Voltar não deixa o formulário bloqueado pelo carregamento.
      window.addEventListener("pageshow", (event) => {
        if (!event.persisted) return;
        document.querySelector(".login-loading")?.remove();
        $(".auth-wrapper").inert = false;
        delete loginForm.dataset.loading;
        loginForm.removeAttribute("aria-busy");
        $("#btnLogin").disabled = false;
      });
      return;
    }
})();
});
