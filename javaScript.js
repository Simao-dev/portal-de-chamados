/*<script>*/

document.addEventListener("DOMContentLoaded", function() {

  // A função login agora não precisa ser global, ela pode ficar aqui dentro.
  function login(event) {
    // Isso é importante para evitar que a página recarregue.
    event.preventDefault(); 

    const nome = document.getElementById("usuarioLogin").value.trim();
    const senha = document.getElementById("senhaLogin").value.trim();

    if (!nome || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    const dados = {
      qualFuncao: "fazLogin",
      nome: nome,
      senha: senha
    };

    google.script.run
      .withSuccessHandler(function(resposta) {
        const mainLogin = document.getElementById("main-login");
        const loginContainer = document.getElementById("login-container");

        if (resposta === true) {
          alert("Login realizado com sucesso!");
          mainLogin.style.display = "block";
          loginContainer.style.display = "none";
        } else {
          alert("Usuário ou senha inválidos.");
          loginContainer.style.display = "block";
          mainLogin.style.display = "none";
        }
      })
      .roteadorChamado(dados);
  }

  // Agora, a gente busca o botão e adiciona o evento de clique.
  // Usamos 'type="button"' para garantir que ele não envie o formulário.
  const loginButton = document.querySelector('button[type="button"]');
  
  // Verificamos se o botão existe antes de adicionar o evento.
  if (loginButton) {
    loginButton.addEventListener('click', login);
  } else {
    console.error("Botão de login não encontrado.");
  }

});

  /** Muda o estilo padrão do botão de envio de aquivos */
function updateFileName() {
    const input = document.getElementById('fileUpload');
    const fileName = input.files.length > 0 ? input.files[0].name : '';
    document.getElementById('file-name').textContent = fileName;
    if (fileInput.files.length > 0) {
    fileNameSpan.textContent = fileInput.files[0].name;
    } else {
    fileNameSpan.textContent = "";
    }
  }

  /** NAVEGAÇÃO ENTRE MENUS */
/** MUDA A PROPRIEDADE DO DISPLAY DA DIV ENTRE DISPLAY NONE E DISPLAY BLOCK */

/** Seleciona todos os botões com a classe 'menu-navegação' */
const botoes = document.querySelectorAll(".menu-navegação");

/** Seleciona todos os conteúdos com a classe 'form-area' */
const telasFuncoes = document.querySelectorAll(".form-area");

/** Adiciona um 'ouvinte de evento' de clique a cada botão */
botoes.forEach(botao => {
  botao.addEventListener("click", () => {
    /** Oculta todos os conteúdos removendo a classe */
    telasFuncoes.forEach(conteudo => {
      conteudo.classList.remove("conteudo-ativo");
    });

    /** Em seguida, pega o valor do atributo 'data-alvo' do botão clicado */
    const alvo = botao.dataset.alvo;

    /** encontra o elemento com o ID correspondente*/
    const conteudoParaMostrar = document.getElementById(alvo);

    /**  Adiciona a classe para mostrá-lo (verificando se o elemento existe) */
    if (conteudoParaMostrar) {
      conteudoParaMostrar.classList.add("conteudo-ativo");
    }
  });
});

/** Mostrar o primeiro menu ao carregar a página */
document.getElementById('metricas').classList.add('conteudo-ativo');

function enviaAoClicar() {
    const dados = {
      qualFuncao: "entradaDeInformacoes",
      idchamado: document.getElementById('idDoChamado').value,
      tipoDoChamado: document.getElementById('tipoDoChamado').value,
      solicitante: document.getElementById('solicitante').value,
      statusChamado: document.getElementById('statusChamado').value,
      descricao: document.getElementById('descricao').value,
      informacaoExtra: document.getElementById('informacaoExtra').value
    };

    google.script.run
      .withSuccessHandler(function (resposta) {
        alert(resposta);
        document.getElementById('idDoChamado').value = '';
        document.getElementById('tipoDoChamado').value = '';
        document.getElementById('solicitante').value = '';
        document.getElementById('statusChamado').value = '';
        document.getElementById('descricao').value = '';
        document.getElementById('informacaoExtra').value = '';
        document.getElementById('file-name').textContent = '';

        lerDadosDaTabela(); /** Atualiza tabela após envio */
      })
      .roteadorChamado(dados);
}
  /**função que faz requisição dos dados */
function lerDadosDaTabela() {
    const dados = {
      qualFuncao: "lerChamados"
    };
    google.script.run
    .withSuccessHandler(function (resposta) {
      //console.log("Dados recebidos (sucesso):", resposta);
      preencherTabela(resposta);
    })
    .roteadorChamado(dados);
}

/**preenche tabela com os dados vindo do back */
function preencherTabela(dados) {
  // console.log('Dados para tabela:', dados); 

  if (!Array.isArray(dados) || dados.length === 0) {
    console.warn('Nenhum dado para exibir');
    return;
  }

  if ($.fn.DataTable.isDataTable('#tabela')) {
    $('#tabela').DataTable().clear().destroy();
  }

  $('#tabela tbody').empty();

  $('#tabela').DataTable({
    data: dados,
    columns: [
      { title: "ID", data: "id" },
      { title: "Tipo do chamado", data: "tipoDoChamado" },
      { title: "Solicitante", data: "solicitante" },
      { title: "Status Chamado", data: "statusChamado" },
      { title: "Descrição", data: "descricao" },
      { title: "Informação Extra", data: "informacaoExtra" },
      { title: "Hora", data: "hora" },
      { title: "Data", data: "data" }
    ],
    order: [[0, 'desc']],
    scrollY: 300,
    scroller: true
  });

  const table = $('#tabela').DataTable();
  $('#tabela tbody').on('click', 'tr', function () {
    const data = table.row(this).data();
    // Lógica de clique aqui, se quiser
    console.log(data)
  });
}

  /** Chama a função ao carregar a página */
  window.onload = function () {
    lerDadosDaTabela();
    preencherSelectSolicitante();
  };

  /**Cadastro de usuarios/envia usuarios */

function enviaUsuario() {
  /**Confere se senha e confimeSenha são iguais */
  const senha = document.getElementById("senha").value
  const confirmeSenha =document.getElementById("confirmeSenha").value

  if(senha !== confirmeSenha){
    alert ("As senhas não conferem");
    return;
  }
  /**Envia os dados para o backend */
  const dados = {
    qualFuncao: "cadastraUsuario",
    nome: document.getElementById('nome').value,
    sobrenome: document.getElementById('sobrenome').value,
    cargo: document.getElementById('cargo').value,
    senha: document.getElementById('senha').value,
    confimeSenha: document.getElementById ('confirmeSenha').value,
  };

  /**Limpa formulario apos envio */
  google.script.run
    .withSuccessHandler(function (resposta) {
      alert(resposta);
      document.getElementById('nome').value = '';
      document.getElementById('sobrenome').value = '';
      document.getElementById('cargo').value = '';
      document.getElementById('senha').value = '';
      document.getElementById('confirmeSenha').value = '';
      //lerDadosDaTabela(); // Atualiza tabela após envio
      preencherSelectSolicitante();
    })
    .roteadorChamado(dados);
}


 /** Pega os dados do backend e preenche o select de solicitantes. */

function preencherSelectSolicitante() {
  const selectElement = document.getElementById('solicitante');
  
  const dados = {
    qualFuncao: "listarNomeCargo"
  };

  google.script.run
    .withSuccessHandler(function(resposta) {
      /** Limpa as opções existentes (mantém a opção de 'Carregando' até a resposta chegar) */
      selectElement.innerHTML = '<option value="">Solicitante...</option>';
      
      /** Itera sobre a resposta e adiciona cada item como uma nova opção */
      resposta.forEach(item => {
        const option = document.createElement('option');
        option.value = item.nome;
        option.textContent = `${item.nome} - ${item.cargo}`;
        selectElement.appendChild(option);
      });
    })
    .withFailureHandler(function(erro) {
      console.error("Erro ao carregar solicitantes:", erro);
      selectElement.innerHTML = '<option value="">Erro ao carregar</option>';
    })
    .roteadorChamado(dados);
}



/*</script>*/