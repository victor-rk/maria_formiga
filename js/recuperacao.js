window.MF_PAGE = "recuperacao";
document.addEventListener("DOMContentLoaded", () => {
(() => {
  "use strict";
  const D = window.MF;
  const U = window.UI;
  const $ = (selector) => document.querySelector(selector);
  const page = document.body.dataset.page;
  if (page === "recuperacao") {
      const recoveryForm = $("#recoveryForm");
      const verificationForm = $("#verificationForm");
      const emailInput = $("#recoveryEmail");
      const codeDigits = [...verificationForm.querySelectorAll(".code-digit")];
      const title = $("#recoveryTitle");
      const description = $("#recoveryDescription");
      // Transfere números digitados ou colados para as posições seguintes, sem conferir seu valor.
      function fillVerificationCode(start, text) {
        const digits = String(text)
          .replace(/\D/g, "")
          .slice(0, codeDigits.length - start);
        if (!digits) return;
        [...digits].forEach((digit, offset) => {
          codeDigits[start + offset].value = digit;
        });
        const next = Math.min(start + digits.length, codeDigits.length - 1);
        codeDigits[next].focus();
        codeDigits[next].select();
      }
      // A primeira etapa solicita apenas um e-mail com formato válido; não envia mensagens.
      recoveryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!recoveryForm.reportValidity()) return;
        recoveryForm.hidden = true;
        verificationForm.hidden = false;
        verificationForm.reset();
        title.textContent = "Verificar código";
        description.textContent =
          "Informe os seis dígitos do código de recuperação para " +
          emailInput.value.trim() +
          ".";
        codeDigits[0].focus();
      });
      // Cada campo recebe somente números e permite colar o código completo.
      codeDigits.forEach((input, index) => {
        input.addEventListener("input", (event) => {
          const content =
            event.data && event.data.length > 1 ? event.data : input.value;
          const numeric = String(content).replace(/\D/g, "");
          input.value = numeric.slice(0, 1);
          if (numeric) fillVerificationCode(index, numeric);
        });
        input.addEventListener("paste", (event) => {
          event.preventDefault();
          fillVerificationCode(index, event.clipboardData.getData("text"));
        });
        // As setas e o Backspace facilitam a correção do código pelo teclado.
        input.addEventListener("keydown", (event) => {
          if (event.key === "Backspace" && !input.value && index > 0) {
            event.preventDefault();
            codeDigits[index - 1].value = "";
            codeDigits[index - 1].focus();
          } else if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            codeDigits[index - 1].focus();
            codeDigits[index - 1].select();
          } else if (
            event.key === "ArrowRight" &&
            index < codeDigits.length - 1
          ) {
            event.preventDefault();
            codeDigits[index + 1].focus();
            codeDigits[index + 1].select();
          }
        });
        input.addEventListener("focus", () => input.select());
      });
      // Basta preencher as seis posições com números, inclusive 000000; não há verificação de código.
      verificationForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!verificationForm.reportValidity()) return;
        location.href = "redefinir-senha.html";
      });
      // Retorna à primeira etapa preservando o endereço de e-mail já digitado.
      $("#btnChangeEmail").addEventListener("click", () => {
        verificationForm.hidden = true;
        recoveryForm.hidden = false;
        title.textContent = "Recuperação de Senha";
        description.textContent =
          "Informe o e-mail cadastrado para recuperar seu acesso.";
        verificationForm.reset();
        emailInput.focus();
      });
      return;
    }
})();
});
