window.MF_PAGE = "home";
window.MF_PAGES = window.MF_PAGES || {};
window.MF_PAGES.home = (root) => {
  const cards = [
    {
      title: "Novo Pedido",
      href: "pedidos.html?openModal=true",
      icon: "fa-plus",
      permission: "manage",
      featured: true,
    },
    {
      title: "Caixa / Vendas",
      href: "vendas.html",
      icon: "fa-cash-register",
      permission: "manage",
    },
    {
      title: "Pedidos em Andamento",
      href: "pedidos.html",
      icon: "fa-clipboard-check",
      permission: "readOrders",
    },
    {
      title: "Estoque Geral",
      href: "estoque.html",
      icon: "fa-cube",
      permission: "readStock",
    },
    {
      title: "Entregas",
      href: "entregas.html",
      icon: "fa-truck",
      permission: "deliver",
    },
    {
      title: "Relatórios",
      href: "relatorios.html",
      icon: "fa-file-lines",
      permission: "manage",
    },
    {
      title: "Clientes",
      href: "clientes.html",
      icon: "fa-user-group",
      permission: "manage",
    },
  ];
  root.innerHTML = `<div class="bento-grid-new">${cards
    .filter((card) => window.MF.permission(card.permission))
    .map(
      (card) =>
        `<a href="${card.href}" class="bento-card${card.featured ? " bento-destaque" : ""}"><div class="bento-icon-wrapper"><div class="icon-box"><i class="fa-solid ${card.icon}" aria-hidden="true"></i></div><i class="fa-solid fa-chevron-right arrow-icon" aria-hidden="true"></i></div><div class="bento-text"><h2>${card.title}</h2></div></a>`,
    )
    .join("")}</div>`;
};
