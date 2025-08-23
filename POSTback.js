
function roteadorChamado(data) {
  if (!data || !data.qualFuncao) {
    return { status: "erro", mensagem: "Parâmetros inválidos" };
  }

  switch (data.qualFuncao) {
    case "entradaDeInformacoes":
      return entradaDeInformacoes(data);

    case "lerChamados":
      return lerChamados(data);

    case "excluirEsteId":
      return removerFuncionario(data);

    case "cadastraUsuario":
      return cadastraUsuario(data);

    case "listarNomeCargo":
      return listarNomeCargo(data);
    
    case "fazLogin":
      return verificarUsuario(data);

    default:
      return { status: "erro", mensagem: "Função não reconhecida." };
  }
}
/**   AREA DE CHAMADOS / CADASTRO / REQUISIÇÃO / ATUALIZAÇÃO */

/**Cadastra novos chamados */
function entradaDeInformacoes(data) {
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
  const main = ss.getSheetByName("main");

  /**Garante cabeçalho */
  if (main.getLastRow() === 0) {
    main.appendRow(["ID", "Tipo do Chamado", "Solicitante", "Status Chamado", "Descrição", "informação Extra", "Hora", "Data"]);
  }

  const id = data.idchamado;

  // Novo registro
  if (!id || id === "") {
    const ultimaLinha = main.getLastRow();
    let maiorId = 0;

    if (ultimaLinha > 1) {
      const idsExistentes = main.getRange(2, 1, ultimaLinha - 1).getValues().flat();
      maiorId = idsExistentes.length > 0 ? Math.max(...idsExistentes.map(Number)) : 0;
    }

    const novoId = maiorId + 1;

  const agora = new Date();

    main.appendRow([
      novoId,
    data.tipoDoChamado,
    data.solicitante,
    data.statusChamado,
    data.descricao,
    data.informacaoExtra,
    Utilities.formatDate(agora, Session.getScriptTimeZone(), "HH:mm:ss"),
    Utilities.formatDate(agora, Session.getScriptTimeZone(), "dd/MM/yyyy")
]);

    return "Chamado cadastrado com sucesso!";
  }

  /**Atualização de chamado existente */
  const idNumero = Number(id);
  if (!isNaN(idNumero)) {
    for (let i = 2; i <= main.getLastRow(); i++) {
      const idLinha = Number(main.getRange(i, 1).getValue());
      if (idLinha === idNumero) {
        main.getRange(i, 2).setValue(data.tipoDoChamado);
        main.getRange(i, 3).setValue(data.solicitante);
        main.getRange(i, 4).setValue(data.statusChamado);
        main.getRange(i, 5).setValue(data.descricao);
        main.getRange(i, 6).setValue(data.informacaoExtra);
        main.getRange(i, 7).setValue(data.hora);
        main.getRange(i, 8).setValue(data.dataChamado);


        return "Chamado atualizado com sucesso!";
      }
    }
    return "ID informado não encontrado.";
  }

  return "Erro no formulário: ID inválido.";
}
 
 /** Busca os dados do banco para exibir na tabela */
function lerChamados(data) {
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
  const main = ss.getSheetByName("main");

  /**converte dada e hora pra texto */
  main.getRange("G:H").activate();
  main.getActiveRangeList().setNumberFormat("@");
  

  const linhas = main.getDataRange().getValues();

  /**Remove cabeçalho */
  linhas.shift();

  linhas.sort((a, b) => b[0] - a[0]);

  // Transforma em array de objetos
  return linhas.map(l => ({
    id: l[0],
    tipoDoChamado: l[1],
    solicitante: l[2],
    statusChamado: l[3],
    descricao: l[4],
    informacaoExtra: l[5],
    hora: l[6],
    data: l[7],
    
  }));
  
}

/** AREA DE CASTRO DE USUARIOS */

/**Cadastra usuarios */
function cadastraUsuario(data) {
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
  const main = ss.getSheetByName("users");
  
  /**faz a conferencia da senha e confirmeSenha */
  if(data.senha !== data.confimeSenha){
    return "senha não conferem";
  }

  /**Garante cabeçalho */
  if (main.getLastRow() === 0) {
    main.appendRow(["ID", "Nome", "Sobrenome", "Cargo", "Senha"]);
  }

  const id = data.idsenha;

  /**Novo registro */ 
  if (!id || id === "") {
    const ultimaLinha = main.getLastRow();
    let maiorId = 0;

    if (ultimaLinha > 1) {
      const idsExistentes = main.getRange(2, 1, ultimaLinha - 1).getValues().flat();
      maiorId = idsExistentes.length > 0 ? Math.max(...idsExistentes.map(Number)) : 0;
    }

    const novoId = maiorId + 1;


    main.appendRow([
      novoId,
    data.nome,
    data.sobrenome,
    data.cargo,
    data.senha,
]);

    return "Usuario criado com sucesso";
  }

  /**  Atualiza usuario existente */
  const idNumero = Number(id);
  if (!isNaN(idNumero)) {
    for (let i = 2; i <= main.getLastRow(); i++) {
      const idLinha = Number(main.getRange(i, 1).getValue());
      if (idLinha === idNumero) {
        main.getRange(i, 2).setValue(data.nome);
        main.getRange(i, 3).setValue(data.sobrenome);
        main.getRange(i, 4).setValue(data.cargo)
        main.getRange(i, 5).setValue(data.senha);
        return "Usuario atualizado com sucesso!";
      }
    }
    return "ID informado não encontrado.";
  }

  return "Erro no formulário: ID inválido.";
}


/**
   Obtém os nomes e cargos da planilha de usuários e os retorna como um array de objetos.
  @returns {Array<Object>} Um array de objetos, onde cada objeto tem as propriedades 'nome' e 'cargo'.
 */
function listarNomeCargo() {
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
  const main = ss.getSheetByName("users"); /**Acessa a aba "users"*/
  
  /** Obtém todos os dados da planilha */
  const dados = main.getDataRange().getValues();
  
  /** A primeira linha (cabeçalho) é removida para que os dados possam ser processados*/
  const cabecalho = dados.shift(); 
  
  /**  Encontra os índices das colunas 'Nome' e 'Cargo'*/
  const indiceNome = cabecalho.indexOf("Nome");
  const indiceCargo = cabecalho.indexOf("Cargo");
  
  /**  Retorna um array de objetos, cada um com o nome e o cargo*/
  return dados.map(l => ({
    nome: l[indiceNome],
    cargo: l[indiceCargo]
  }));
}

/**function testeVerificarUsuario() {
  const dadosTeste = {
    nome: "pedro",   // coloque um nome que existe na aba "users"
    senha: "pedro1030"   // coloque a senha correspondente
  };

  const resultado = verificarUsuario(dadosTeste);
  Logger.log("Resultado do teste: " + resultado);
}*/


function verificarUsuario(dados) {
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
  const main = ss.getSheetByName("users");
  
  // Pega todos os dados da planilha
  const valores = main.getDataRange().getValues(); 
  
  const nome = dados.nome;
  const senha = dados.senha;
  
  let autenticado = false;
  
  // começa da linha 2 (índice 1) para pular cabeçalho
  for (let i = 1; i < valores.length; i++) {
    const nomePlanilha = valores[i][1]; // coluna 2 (B)
    const senhaPlanilha = valores[i][4]; // coluna 5 (E)
    
    if (nome === nomePlanilha && senha === senhaPlanilha) {
      autenticado = true;
      break;
    }
  }
  
  return autenticado;
}