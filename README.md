# 🛠️ Sistema de Gestão de Chamados e Rotinas Técnicas

Um ecossistema robusto e responsivo desenvolvido para gerenciamento, monitoramento e automação de chamados técnicos. O sistema possui dois níveis de acesso (Administrador e Portal do Cliente), painel de métricas em tempo real e um motor de disparo automático para tarefas de rotina estruturadas.

---

## 🚀 Funcionalidades Principais

*   **Portal do Cliente:** Área restrita para usuários comuns abrirem solicitações de requisição e acompanharem o histórico de seus chamados em tempo real de forma isolada.
*   **Atendimento Administrativo:** Interface para triagem de chamados, alteração de status e registro de atendimentos (como solicitações recebidas via telefone).
*   **Painel de Métricas Dinâmico:** Gráficos de progresso em anel (`progress-ring`) integrados à biblioteca *Flatpickr* para análise de volumetria por intervalo de datas personalizado.
*   **Motor de Rotinas Automáticas:** Agendamento de tarefas diárias ou mensais que geram chamados automaticamente na planilha principal baseados na sessão do usuário responsável.
*   **Responsividade Ultra-Rígida:** Layout adaptável otimizado tanto para desktops quanto para dispositivos móveis (visual slim compacto estilo Android).

---

## 📊 Arquitetura do Banco de Dados

O sistema utiliza o **Google Sheets** como banco de dados relacional e motor de persistência. Certifique-se de ter uma planilha com as seguintes abas (sheets) estruturadas:

1.  `main`: Registro geral de chamados.
    *   *Colunas:* ID | Tipo do Chamado | Solicitante | Função | Status Chamado | Descrição | Informação Extra | Hora | Data
2.  `users`: Cadastro de colaboradores e níveis de acesso.
    *   *Colunas:* ID | Nome | Sobrenome | Função | Cargo | Usuario | Ramal | Permissão | Senha
3.  `tasks`: Agendamento de rotinas automatizadas.
    *   *Colunas:* ID | Descrição | Tipo Repetição | Data | Hora | Responsável

---

## 📦 Como Instalar e Configurar

Como o projeto é executado através da infraestrutura do **Google Apps Script**, o deploy é feito diretamente na nuvem:

1.  **Criar o projeto no Apps Script:**
    *   Acesse o [Google Apps Script](https://script.google.com/) com sua conta Google.
    *   Crie um **Novo Projeto**.

2.  **Organizar os Arquivos:**
    *   Crie os arquivos de código backend (`.gs`) contendo as funções do arquivo `post.gs` (roteador, lógica de autenticação, inserções na planilha e motor de repetição).
    *   Crie os arquivos de interface (`.html`) para a tela de `Login` e o dashboard (`Sistema`), colando a estrutura HTML, as tags `<style>` de estilização e as tags `<script>` do JavaScript front-end.

3.  **Vincular o ID da sua Planilha:**
    *   Abra o seu arquivo de backend (`.gs`) e localize a linha que realiza a conexão:
```javascript
        SpreadsheetApp.openById("SEU_ID_DA_PLANILHA_AQUI");
        ```
    *   Substitua o texto pelo ID real da sua planilha Google (encontrado na URL do seu navegador entre `/d/` e `/edit`).

4.  **Configurar o Gatilho do Motor de Rotinas:**
    *   No painel esquerdo do Google Apps Script, clique no ícone de **Relógio** (Gatilhos/Triggers).
    *   Clique em **Adicionar gatilho** no canto inferior direito.
    *   Selecione a função `verificarEGerarChamadosAutomaticos`.
    *   Defina a fonte de evento como **Baseado no tempo** e configure o intervalo desejado (ex: a cada 15 minutos ou por hora) para que o processador procure tarefas agendadas em background.

5.  **Implantar como Web App:**
    *   Clique no botão azul **Implantar** (canto superior direito) > **Nova implantação**.
    *   Selecione o tipo de configuração como **App da Web**.
    *   Em *Executar como*, defina **"Eu"** (sua conta).
    *   Em *Quem tem acesso*, defina **"Qualquer pessoa"**.
    *   Clique em **Implantar**, autorize as permissões da conta e copie a URL gerada pelo sistema.

---

## ⚙️ Como Funciona o Fluxo do Sistema

1.  **Autenticação Eficiente:**
    O usuário informa suas credenciais na tela de login. O JavaScript front-end faz uma chamada assíncrona ao servidor (`google.script.run`) que valida os dados na aba `users`. O servidor devolve um objeto estruturado contendo o Nome Completo, Função e Nível de Permissão (`admin` ou `cliente`).

2.  **Segurança de Escopo de Visualização:**
    Assim que o login é aprovado, a função `configurarPermissoes(nivel)` entra em ação. Se o nível for `cliente`, o menu lateral oculta todas as ferramentas administrativas (Métricas, Pesquisa, Cadastro de Usuários e Tarefas) e força a visualização exclusiva do Portal do Cliente.

3.  **Interface Fluida e Sem Cache:**
    As tabelas e cadastros possuem travas de segurança isoladas por blocos `try/catch`. Cliques nas linhas das tabelas administrativas usam mecanismos de blindagem que reconstroem dados relacionais dinamicamente, impedindo que seletores ou campos de formulário fiquem em branco na tela.

---

## 💻 Como Usar

### Criando Usuários (Modo Admin)
*   Navegue até a aba de Gerenciamento de Usuários.
*   Preencha os dados cadastrais do colaborador. Ao selecionar a permissão como `admin` ou `cliente`, o campo de senha surgirá de forma dinâmica para que você defina a credencial de acesso.

### Atendimento e Alteração de Chamados
*   Na aba principal de chamados, clique em qualquer linha da tabela de registros para carregar instantaneamente as informações de volta aos inputs superiores.
*   Modifique o campo **Status** (que fica estrategicamente posicionado logo após o ID para facilitar a leitura rápida) para *Em Andamento* ou *Concluído* e clique em **Alterar Chamado** para atualizar a planilha principal.

### Agendando Rotinas Inteligentes
*   Acesse o módulo de **Lista de Tarefas** e clique em **Criar Tarefa**.
*   Defina os critérios de repetição (Diária ou Mensal), o Horário e o Responsável. 
*   Ao salvar, o sistema captura automaticamente os dados do usuário logado na sessão e cria uma auditoria transparente na planilha, gerando uma informação extra padronizada: `Gerado automaticamente pela Rotina #ID`.

---

## 🎨 Tecnologias Utilizadas

*   [Google Apps Script](https://developers.google.com/apps-script) (V8 Engine Backend)
*   HTML5 / CSS3 Puro (Variáveis nativas e arquitetura CSS Grid/Flexbox)
*   JavaScript (ES6+)
*   [Bootstrap Icons](https://icons.getbootstrap.com/) (Biblioteca de ícones)
*   [Flatpickr](https://flatpickr.js.org/) (Seletor avançado de intervalo de datas)

---
Desvolvido por [simao-dev](https://github.com/Simao-dev) 🚀