function updateFileName() {
  const fileInput = document.getElementById("fileUpload");
  const fileNameSpan = document.getElementById("file-name");
  if (fileInput.files.length > 0) {
    fileNameSpan.textContent = fileInput.files[0].name;
  } else {
    fileNameSpan.textContent = "";
  }
}

function updateFileName() {
  const input = document.getElementById("fileUpload");
  const fileName = input.files.length > 0 ? input.files[0].name : "";
  document.getElementById("file-name").textContent = fileName;
}

function enviaAoClicar() {
  const dados = {
    qualFuncao: "entradaDeInformacoes",
    idchamado: document.getElementById("idDoChamado").value,
    tipoDoChamado: document.getElementById("tipoDoChamado").value,
    solicitante: document.getElementById("solicitante").value,
    statusChamado: document.getElementById("statusChamado").value,
    descricao: document.getElementById("descricao").value,
    informacaoExtra: document.getElementById("informacaoExtra").value,
  };

  google.script.run
    .withSuccessHandler(function (resposta) {
      //alert(resposta);
      document.getElementById("idDoChamado").value = "";
      document.getElementById("tipoDoChamado").value = "";
      document.getElementById("solicitante").value = "";
      document.getElementById("statusChamado").value = "";
      document.getElementById("descricao").value = "";
      document.getElementById("informacaoExtra").value = "";
      document.getElementById("file-name").textContent = "";

      lerDadosDaTabela(); // Atualiza tabela após envio
    })
    .roteadorChamado(dados);
}
//função que faz requisição dos dados
function lerDadosDaTabela() {
  const dados = {
    qualFuncao: "lerChamados",
  };
  google.script.run
    .withSuccessHandler(function (resposta) {
      console.log("Dados recebidos (sucesso):", resposta);
      preencherTabela(resposta);
    })
    .roteadorChamado(dados);
}
//preenche tabela com os dados vindo do back
// ... outras funções ...

//preenche tabela com os dados vindo do back
function preencherTabela(dados) {
  console.log("Dados para tabela:", dados);

  if (!Array.isArray(dados) || dados.length === 0) {
    console.warn("Nenhum dado para exibir");
    return;
  }

  if ($.fn.DataTable.isDataTable("#tabela")) {
    $("#tabela").DataTable().clear().destroy();
  }

  $("#tabela tbody").empty();

  $("#tabela").DataTable({
    data: dados,
    columns: [
      { title: "ID", data: "id" },
      { title: "Tipo do chamado", data: "tipoDoChamado" },
      { title: "Solicitante", data: "solicitante" },
      { title: "Status Chamado", data: "statusChamado" },
      { title: "Descrição", data: "descricao" },
      { title: "Informação Extra", data: "informacaoExtra" },
      { title: "Hora", data: "hora" },
      { title: "Data", data: "data" },
    ],
    scrollY: 300,
    scroller: true,
  });

  const table = $("#tabela").DataTable();
  $("#tabela tbody").on("click", "tr", function () {
    const data = table.row(this).data();
    // Lógica de clique aqui, se quiser
  });
}

// Chama a função ao carregar a página
window.onload = function () {
  lerDadosDaTabela();
};
