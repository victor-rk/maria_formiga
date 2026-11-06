document.addEventListener("DOMContentLoaded", () => {
(() => {
  "use strict";
  const D = window.MF;
  const U = window.UI;
  const $ = (selector) => document.querySelector(selector);
  const page = document.body.dataset.page;
  if (page === "redefinir-senha") {
      // Cada olho altera apenas o campo indicado, preservando o conteúdo e a validação.
      const passwordToggles = Array.from(
        document.querySelectorAll("[data-password-toggle]"),
      );
      function setPasswordVisibility(button, visible) {
        const input = document.getElementById(button.dataset.passwordToggle);
        const label =
          input.id === "newPassword"
            ? "nova senha"
            : "confirmação da nova senha";
        input.type = visible ? "text" : "password";
        button.setAttribute("aria-pressed", String(visible));
        button.setAttribute(
          "aria-label",
          `${visible ? "Ocultar" : "Mostrar"} ${label}`,
        );
        const icon = button.querySelector("i");
        icon.classList.toggle("fa-eye", !visible);
        icon.classList.toggle("fa-eye-slash", visible);
      }
      passwordToggles.forEach((button) => {
        button.addEventListener("click", () => {
          const input = document.getElementById(button.dataset.passwordToggle);
          setPasswordVisibility(button, input.type === "password");
        });
      });
      // Após limpar o formulário, volta a ocultar os dois campos e restaura os ícones.
      $("#resetForm").addEventListener("reset", () => {
        passwordToggles.forEach((button) =>
          setPasswordVisibility(button, false),
        );
      });
      $("#resetForm").onsubmit =
         (
          e,
        ) => {
          e.preventDefault();
          try {
            window.MF_PAGE_UTILS.validatePassword(
              $("#newPassword").value,
              $("#confirmPassword").value,
            );
            e.target.reset();
            U.toast("Formato da senha validado.");
          } catch (err) {
            window.MF_PAGE_UTILS.fail(err);
          }
        };
      return;
    }
})();
});
