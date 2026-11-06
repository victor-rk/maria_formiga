# Sistema de Gestão para Confeitaria — Maria Formiga Doces Gourmet

![HTML5](https://img.shields.io/badge/HTML5-sem%C3%A2ntico-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-modular-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)
![FATEC](https://img.shields.io/badge/FATEC-Mogi%20das%20Cruzes-5B2C83)
![Projeto Integrador II](https://img.shields.io/badge/Projeto%20Integrador-II-6C757D)

> **Desenvolvimento de Sistema de Gestão para Otimização Operacional**<br>
> *Confeitaria com sabor e amor em cada mordida — solução digital de otimização operacional e controle financeiro.*

## Visão geral

O **Sistema de Gestão para Confeitaria — Maria Formiga Doces Gourmet** é uma aplicação web acadêmica desenvolvida para apoiar rotinas administrativas e operacionais de uma confeitaria. A documentação de Engenharia de Software identifica dificuldades relacionadas ao controle financeiro, à definição de preços e margens e à execução manual de processos, que pode gerar retrabalho, erros de cálculo e informações desorganizadas.

A aplicação reúne telas para clientes, fornecedores, matérias-primas, receitas, produção, pedidos, vendas, entregas e relatórios. O código disponível é uma demonstração frontend executada no navegador: os dados de exemplo e as alterações são mantidos localmente, sem integração com servidor ou banco de dados remoto.

## Funcionalidades

Os itens abaixo descrevem o comportamento encontrado no código deste repositório, e não apenas requisitos documentados.

| Módulo | Recursos implementados |
|---|---|
| **Clientes** | Cadastro e edição de clientes e endereços; validação de CPF e dados de contato. |
| **Fornecedores** | Cadastro e manutenção de dados de fornecedores e validação de CNPJ. |
| **Matéria-prima** | Cadastro de insumos com unidade, saldo, custo e nível mínimo; registro de entradas e saídas; indicação de estoque baixo. |
| **Produtos e receitas** | Fichas técnicas com insumos, quantidades e rendimento; cálculo de custo por unidade e validação do preço em relação à margem mínima configurada. |
| **Produção e produtos prontos** | Registro da produção com consumo proporcional dos insumos e criação de lotes de produtos acabados; controle por lote e validade. |
| **Pedidos** | Registro de encomendas associadas a clientes, modalidade, data combinada, itens, pagamento e observações; edição de pedidos pendentes não pagos; rascunho local recuperável por até 24 horas. |
| **Vendas** | Registro de venda de balcão e recebimento integral de pedidos; verificação de disponibilidade de produtos prontos; cálculo de troco para pagamentos em dinheiro e geração de comprovante/exportação. |
| **Entregas** | Despacho de pedidos prontos para entrega com endereço e responsável; acompanhamento dos estados “Em rota” e “Entregue”. A confirmação de entrega também finaliza o pedido. |
| **Relatórios** | Filtros por período para vendas, pedidos, entregas e movimentações de estoque; exportação dos resultados em CSV e impressão pela função do navegador. |
| **Início e configurações** | Painel com atalhos e indicadores; configurações locais de perfil, usuários demonstrativos e histórico de alterações. |
| **Login e recuperação de senha** | Telas de login, recuperação e redefinição com validações e estados visuais demonstrativos. Não há autenticação de credenciais nem envio real de e-mail. |

### Regras de negócio observadas

- Uma venda ou recebimento não pode consumir quantidade superior ao estoque de produtos prontos disponível.
- O consumo de produtos prontos considera lotes válidos por ordem de vencimento.
- A produção consome os insumos indicados na ficha técnica e registra um novo lote.
- O sistema identifica matéria-prima em nível baixo quando o saldo é menor ou igual ao mínimo cadastrado.
- O preço de um produto é validado em relação à margem mínima informada na ficha técnica.
- Pedidos para entrega exigem um endereço cadastrado válido; o despacho requer pedido pronto e um responsável.
- Pedidos seguem os estados **Pendente → Em produção → Pronto → Finalizado**, com **Cancelado** como estado alternativo. A entrega possui acompanhamento próprio.
- Nos relatórios, “resultado após insumos” considera o custo dos insumos, mas **não representa lucro líquido** nem inclui todos os custos da operação.
- A aplicação inicializa dados fictícios de exemplo quando não encontra dados locais compatíveis.

## Arquitetura e organização

A aplicação é multipágina e utiliza HTML, CSS e JavaScript nativos, sem etapa de compilação. Dados e componentes comuns ficam separados dos fluxos de tela organizados por domínio.

- `CSS/global.css` reúne tokens e componentes compartilhados pela área administrativa; `CSS/auth.css` contém os estilos comuns às telas de autenticação. As folhas de página guardam somente regras exclusivas; telas sem estilos próprios não importam uma folha vazia.
- `js/global.js` inicializa os serviços compartilhados `window.MF` (estado e regras locais) e `window.UI` (componentes e utilitários de interface).
- `js/runtime.js` coordena inicialização, permissões, navegação e eventos comuns.
- `js/listagens.js` implementa busca, filtros e renderização das tabelas administrativas.
- `js/pedidos-vendas.js` implementa pedidos, vendas, recebimento e carrinho.
- `js/configuracoes.js` implementa perfil, usuários e histórico de alterações.
- `js/clientes.js` implementa cadastro e endereços de clientes; também é carregado em Pedidos e Vendas para os fluxos de criação de cliente.
- `js/fornecedores.js` implementa o cadastro e a edição de fornecedores.
- `js/estoque.js` implementa o cadastro e a movimentação de matérias-primas.
- `js/produtos.js` implementa fichas técnicas, produção e registro de perdas; é compartilhado pelas páginas de Produtos e Produtos Prontos.
- `js/entregas.js` implementa o despacho e a confirmação de entrega.
- `js/relatorios.js` implementa renderização, filtros e exportação CSV; `runtime.js` fornece os serviços compartilhados.
- `pages/*.html` contém a estrutura das telas. A pasta tem esse nome no projeto atual.
- `assets/img/` contém os recursos de imagem usados pela interface.

```text
.
├── CSS/
│   ├── global.css
│   ├── auth.css
│   ├── home.css
│   ├── index.css
│   ├── produtos.css
│   ├── recuperacao.css
│   ├── redefinir-senha.css
│   └── relatorios.css
├── assets/
│   └── img/
│       └── cupcake.png
├── js/
│   ├── global.js
│   ├── runtime.js
│   ├── listagens.js
│   ├── pedidos-vendas.js
│   ├── configuracoes.js
│   ├── clientes.js
│   ├── entregas.js
│   ├── estoque.js
│   ├── fornecedores.js
│   ├── home.js
│   ├── index.js
│   ├── produtos.js
│   ├── recuperacao.js
│   ├── redefinir-senha.js
│   └── relatorios.js
├── pages/
│   ├── index.html
│   ├── home.html
│   ├── clientes.html
│   ├── fornecedores.html
│   ├── estoque.html
│   ├── produtos.html
│   ├── produtos-prontos.html
│   ├── pedidos.html
│   ├── vendas.html
│   ├── entregas.html
│   ├── relatorios.html
│   ├── recuperacao.html
│   └── redefinir-senha.html
└── README.md
```

### Entidades e dados

O estado local representa clientes e endereços, fornecedores, matérias-primas, produtos e itens de receita, lotes produzidos, pedidos, vendas, movimentações de estoque, usuários demonstrativos, histórico de alterações e rascunhos. Os dados são armazenados como estado da aplicação no navegador; isso não corresponde a um modelo conectado a uma API ou banco de dados de produção.

## Tecnologias

| Categoria | Tecnologias utilizadas |
|---|---|
| Interface | HTML5 semântico, CSS3, variáveis CSS, Flexbox e Grid |
| Lógica | JavaScript nativo moderno (ES6+) |
| Armazenamento no navegador | `localStorage` e `sessionStorage` |
| APIs do navegador | `Intl.NumberFormat`, `Blob`, `URL.createObjectURL`, impressão do navegador e `crypto.randomUUID()` opcional para identificadores locais |
| Recursos externos da interface | Google Fonts (Poppins) e Font Awesome 6.4.0, carregados por CDN |
| Engenharia de Software | Documentação acadêmica do Projeto Integrador II; requisitos e modelagem descritos no documento oficial do projeto |

As fontes e os ícones carregados por CDN dependem de conexão com a internet. O uso de `crypto.randomUUID()` é apenas para gerar identificadores; não oferece autenticação ou proteção dos dados.

## Como executar

Não há manifesto de dependências ou etapa de build no projeto. Para testar localmente:

1. Clone o repositório:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   ```

   Substitua `<URL_DO_REPOSITORIO>` pela URL do repositório GitHub.

2. Abra a pasta clonada no VS Code.
3. Inicie a página `pages/index.html` usando uma extensão de servidor estático, como **Live Server**. Alternativamente, abra `pages/index.html` diretamente no navegador.
4. Navegue pelos módulos usando o menu lateral.

O servidor estático é recomendado para uma execução local consistente. O projeto não requer Node.js nem instalação de pacotes para servir os arquivos existentes.

## Escopo e limitações

- **Sem backend:** não há API, servidor de aplicação ou banco de dados remoto. As informações ficam no armazenamento local do navegador e não são sincronizadas entre dispositivos.
- **Dados demonstrativos:** o estado inicial inclui registros fictícios para permitir explorar as telas. Evite inserir informações pessoais ou dados reais de clientes.
- **Login demonstrativo:** qualquer usuário e senha não vazios permitem avançar; as credenciais não são comparadas com uma conta. O identificador `auxiliar` ou `auxiliar@example.com` seleciona o perfil auxiliar, e os demais identificadores selecionam o perfil de proprietária. As permissões são verificações no próprio JavaScript e não constituem controle de acesso seguro.
- **Recuperação e redefinição demonstrativas:** não há envio de e-mail nem persistência de uma nova senha.
- **Relatórios:** os valores calculados são referências operacionais locais; o resultado após insumos não equivale a lucro líquido ou demonstração contábil completa.
- **Persistência local:** limpeza dos dados do navegador, restrições de armazenamento ou uso em outro perfil/dispositivo podem tornar os registros indisponíveis. O histórico local não substitui auditoria inviolável.

Portanto, o repositório deve ser entendido como protótipo acadêmico de frontend, não como sistema pronto para operação comercial com dados reais.

## Equipe e créditos

Dados institucionais abaixo transcritos da capa da documentação oficial do projeto:

- **Instituição:** Faculdade de Tecnologia de Mogi das Cruzes (FATEC Mogi das Cruzes)
- **Curso:** Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas
- **Disciplina:** Projeto Integrador II
- **Ano:** 2026
- **Orientadora indicada na capa:** Profa. Ana Rosa Coiahy Tonão
- **Discentes indicados na capa:**
  - Ivanir de Almeida Madjarof
  - Rafael do Prado Teixeira
  - Victor Riki Macedo Koti
- **Cliente/stakeholder:** Gabrielly Martins — Maria Formiga Doces Gourmet, Biritiba-Mirim

**Nota sobre a fonte:** a documentação fornecida apresenta divergências entre a capa e a seção introdutória quanto à disciplina, à composição da equipe e à orientação. Este README utiliza os dados da capa para identificar o projeto e evita atribuir títulos acadêmicos não confirmados por ela.
