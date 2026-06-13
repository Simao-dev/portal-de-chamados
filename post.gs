/**  CONFIGURAÇÕES INICIAIS DA PÁGINA */

function doGet(e) {
  /**O template limpa qualquer renderização estática anterior */
  var html = HtmlService.createTemplateFromFile('Login');
  
  return html.evaluate()
      .setTitle('Portal de Chamados')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** FUNÇÃO PARA PERMITIR IMPORTAÇÃO DE CSS/JS */

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


/** INDETIFICA QUAL O TIPO DE SOLICITAÇÃO E DESTINA A FUNÇÃO CORRESPONDENTE */

function roteadorChamado(data) {
  if (!data || !data.qualFuncao) {
    return { status: "erro", mensagem: "Parâmetros inválidos" };
  }

  switch (data.qualFuncao) {
    case "entradaDeInformacoes":
      return entradaDeInformacoes(data);

    case "autenticarUsuario":
      return autenticarUsuario(data.matricula, data.senha);

    case "lerChamados":
      return lerChamados(data);

    case "excluirEsteId":
      return removerFuncionario(data);

    case "cadastraUsuario":
      return cadastraUsuario(data);

    case "listarNomeCargo":
      return listarNomeCargo(data);
    
    case "lerUsuarios":
      return lerUsuarios(data);
    
    case "deletarUsuarios":
      return deletarUsuario(data);
    
    case "metricas":
      return buscarChamadosPorPeriodo(data);

    case "buscarUnicoChamado":
      return buscarUnicoChamado(data.idChamado);

    case "cadastraTarefa":
      return cadastraTarefa(data);

    case "lerTarefas":
      return lerTarefas(data);

    case "buscarUnicaTarefa":
      return buscarUnicaTarefa(data);

    case "deletarTarefa":
      return deletarTarefa(data);

    default:
      return { status: "erro", mensagem: "Função não reconhecida." };
  }
}

/** LÓGICA DE AUTENTICAÇÃO E BANCO DE DADOS */ 

function autenticarUsuario(matricula, senha) {
  const ss = SpreadsheetApp.openById("");
  const sheet = ss.getSheetByName("users"); 
  
  if (!sheet) {
    throw new Error("Aba 'users' não encontrada.");
  }
  
  SpreadsheetApp.flush();
  const dados = sheet.getDataRange().getValues();
  
  const matDigitada = String(matricula).trim();
  const senhaDigitada = String(senha).trim();
  
  for (let i = 1; i < dados.length; i++) {
    let usuarioPlanilha = dados[i][5] ? String(dados[i][5]).trim() : "";
    let senhaPlanilha = dados[i][8] ? String(dados[i][8]).trim() : "";
    
    let nome = dados[i][1] ? String(dados[i][1]).trim() : "";
    let sobrenome = dados[i][2] ? String(dados[i][2]).trim() : "";
    let nomeCompleto = nome + " " + sobrenome;
    
    let funcaoSetor = dados[i][3] ? String(dados[i][3]).trim() : "Geral";
    let nivelPermissao = dados[i][7] ? String(dados[i][7]).toLowerCase().trim() : "cliente";

    if (usuarioPlanilha === matDigitada && senhaPlanilha === senhaDigitada) {
      
      return {
        nivel: nivelPermissao,
        nomeCompleto: nomeCompleto,
        funcao: funcaoSetor
      };
    }
  }
  
  return null; 
}

function carregarPaginaSistema() {
  return HtmlService.createHtmlOutputFromFile('Sistema').getContent();
}

/** AREA DE CHAMADOS / CADASTRA /ALTERA / REQUISIÇÃO / ATUALIZAÇÃO */

function entradaDeInformacoes(data) {
  const ss = SpreadsheetApp.openById("");
  const main = ss.getSheetByName("main");

  if (main.getLastRow() === 0) {
    main.appendRow(["ID", "Tipo do Chamado", "Solicitante", "Função", "Status Chamado", "Descrição", "Informação Extra", "Hora", "Data"]);
  }

  const idChamado = data.idDoChamado; 

  /** Se não houver ID, é um novo registro. */
  if (!idChamado || idChamado === "") {
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
      data.funcao,
      data.statusChamado,
      data.descricao,
      data.informacaoExtra,
      Utilities.formatDate(agora, Session.getScriptTimeZone(), "HH:mm:ss"),
      Utilities.formatDate(agora, Session.getScriptTimeZone(), "dd/MM/yyyy")
    ]);
    return "Chamado cadastrado com sucesso!";

  } else {
    
    /** Se houver um ID, é uma atualização. */
    const dadosPlanilha = main.getDataRange().getValues();
    const idNumero = Number(idChamado);
    let linhaParaEditar;
    
    /**  Busca a linha pelo ID */
    for (let i = 0; i < dadosPlanilha.length; i++) {
      if (Number(dadosPlanilha[i][0]) === idNumero) {
        linhaParaEditar = i + 1;
        break;
      }
    }

    if (linhaParaEditar) {
      
      /** Pega os dados da linha para manter os valores originais de Hora e Data */ 
      const linhaOriginal = main.getRange(linhaParaEditar, 1, 1, main.getLastColumn()).getValues()[0];

      /** Atualiza os dados que vieram do formulário */ 
      const novaLinhaDeDados = [
        idNumero,
        data.tipoDoChamado,
        data.solicitante,
        data.funcao,
        data.statusChamado,
        data.descricao,
        data.informacaoExtra,
        linhaOriginal[7], 
        linhaOriginal[8]  
      ];

      main.getRange(linhaParaEditar, 1, 1, novaLinhaDeDados.length).setValues([novaLinhaDeDados]);
      return "Chamado updated com sucesso!";
      
    } else {
      return "Erro: Chamado não encontrado.";
    }
  }
}
 
/** Faz a REQUISIÇÃO dos dados no banco para exibir na tabela */
function lerChamados(data) {
  const ss = SpreadsheetApp.openById("");
  const main = ss.getSheetByName("main");

  /**converte dada e hora pra texto */
  main.getRange("H:I").activate();
  main.getActiveRangeList().setNumberFormat("@");
  
  const lines = main.getDataRange().getValues();

  /**Remove cabeçalho */
  lines.shift();

  lines.sort((a, b) => b[0] - a[0]);

  /** Transforma em array de objetos */
  return lines.map(l => ({
    id: l[0],
    tipoDoChamado: l[1],
    solicitante: l[2],
    funcao: l[3],
    statusChamado: l[4],
    descricao: l[5],
    informacaoExtra: l[6],
    hora: l[7],
    data: l[8],
  }));
}

/** AREA DE CASTRO/ALTERAÇÃO/EXCLUSÃO e EXIBIÇÃO DE USUARIOS */

function cadastraUsuario(data) {
  const ss = SpreadsheetApp.openById("");
  const main = ss.getSheetByName("users");

  /** Garante cabeçalho com as novas colunas */
  if (main.getLastRow() === 0) {
    main.appendRow(["ID", "Nome", "Sobrenome", "Função", "Cargo", "Usuario", "Ramal", "Permissão", "Senha"]);
  }

  const id = data.idUsuario;

  /** Adiciona um novo caso id seja vazio */
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
      data.funcao,
      data.cargo,
      data.usuario,
      data.ramal,
      data.permissao,
      data.senha
    ]);
    return "Usuário cadastrado com sucesso!";

  } else {

    /** Altera caso tenha ID */
    const dados = main.getDataRange().getValues();
    let linhaParaEditar;
    
    for (let i = 0; i < dados.length; i++) {
      if (dados[i][0] == id) {
        linhaParaEditar = i + 1;
        break;
      }
    }

    if (linhaParaEditar) {
      const novaLinha = [
        id,
        data.nome,
        data.sobrenome,
        data.funcao,
        data.cargo,
        data.usuario,
        data.ramal,
        data.permissao,
        data.senha
      ];

      main.getRange(linhaParaEditar, 1, 1, novaLinha.length).setValues([novaLinha]);
      return "Usuário atualizado com sucesso!";

    } else {
      return "Erro: Usuário não encontrado.";
    }
  }
}

/** REMOVE USUÁRIO */
function deletarUsuario(data) {
  const ss = SpreadsheetApp.openById("");
  const main = ss.getSheetByName("users");
  const ultimaLinha = main.getLastRow();

  if (data.idUsuario === ""){
    return "Nenhum id encontrado"
  }
  for (let i = 1; i <= ultimaLinha; i++) {
    let idLinha = main.getRange(i, 1).getValue();
    if (data.idUsuario == idLinha) {
      main.deleteRow(i);
      return "Usuário deletado";
    }
  }
  return "ID do usuário não encontrado na planilha";
}

/** Obtém os nomes e cargos da planilha de usuários e os retorna como um array de objetos para preencher o select solicitante.*/
function listarNomeCargo() {
  const ss = SpreadsheetApp.openById("");
  const main = ss.getSheetByName("users");

  const dados = main.getDataRange().getValues();
  const cabecalho = dados.shift();
  const indiceNome = cabecalho.indexOf("Nome");
  const indiceFuncao = cabecalho.indexOf("Função");

  /** Retorna um array de strings no formato "Nome - Cargo" para o <select> */
  return dados.map(l => ({
    nome: l[indiceNome],
    cargo: l[indiceFuncao]
  }));
}

/** EXIBE as infomações de usuarios na aba castro de usuarios */
function lerUsuarios(data) {
  const ss = SpreadsheetApp.openById("");
  const main = ss.getSheetByName("users");
  
  const lines = main.getDataRange().getValues();
  lines.shift(); 

  lines.sort((a, b) => b[0] - a[0]);

  /** Transforma em array de objetos mapeando até os índices 7 (H) e 8 (I) */ 
  return lines.map(l => ({
    id: l[0],
    nome: l[1],
    sobrenome: l[2],
    funcao: l[3],
    cargo: l[4],
    usuario: l[5],
    ramal: l[6],
    permissao: l[7] // Coluna H
  }));
}

/** PÁGINAS DE METRICAS */
function buscarChamadosPorPeriodo(dados) {
  try {
    const ss = SpreadsheetApp.openById("");
    const planilha = ss.getSheetByName('main');
    if (!planilha) return { status: 'erro', mensagem: 'Aba main não localizada.' };

    const colunas = { tipo: 1, solicitante: 2, data: 8 };

    const ultimaLinha = planilha.getLastRow();
    if (ultimaLinha <= 1) {
      return { total: 0, totalGeral: 0, porcentagem: "0.00", solicitanteMaisAtivo: "N/A", chamadosDoMaisAtivo: 0, porcentagemSolicitante: "0.00", tipoMaisAtivo: "N/A", chamadosDoTipoMaisAtivo: 0, periodoInicial: dados.dataInicial, periodoFinal: dados.dataFinal };
    }

    const todosOsValores = planilha.getRange(2, 1, ultimaLinha - 1, 9).getValues();
    const totalGeral = todosOsValores.length;

    /** Configura o limite de busca de forma segura (ignora horas na comparação) */ 
    const dataInicial = new Date(dados.dataInicial + 'T00:00:00');
    const dataFinal = new Date(dados.dataFinal + 'T23:59:59');

    let contadorPeriodo = 0;
    const contagemPorSolicitante = {};
    const contagemPorTipo = {};

    todosOsValores.forEach(row => {
      let dataNaCelula = row[colunas.data];
      if (!dataNaCelula) return;

      let dataDoRegistro;

      /** Se a célula já for um objeto Date nativo do Google Sheets */ 
      if (dataNaCelula instanceof Date) {
        dataDoRegistro = new Date(dataNaCelula.getTime());
      } else {
        /** Se for string no formato "dd/MM/yyyy" */ 
        const partes = String(dataNaCelula).split('/');
        if (partes.length === 3) {
          dataDoRegistro = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
        }
      }

      if (dataDoRegistro && dataDoRegistro >= dataInicial && dataDoRegistro <= dataFinal) {
        contadorPeriodo++;

        /** Contagem de Solicitantes */ 
        const nomeSolicitante = row[colunas.solicitante];
        if (nomeSolicitante) {
          const nomeNormalizado = String(nomeSolicitante).trim();
          contagemPorSolicitante[nomeNormalizado] = (contagemPorSolicitante[nomeNormalizado] || 0) + 1;
        }

        /** Contagem de Tipos de Chamado */ 
        const tipoChamado = row[colunas.tipo];
        if (tipoChamado) {
          const tipoNormalizado = String(tipoChamado).trim();
          contagemPorTipo[tipoNormalizado] = (contagemPorTipo[tipoNormalizado] || 0) + 1;
        }
      }
    });

    /** Encontra o solicitante mais ativo */ 
    let solicitanteMaisAtivo = "N/A";
    let chamadosDoMaisAtivo = 0;
    for (const s in contagemPorSolicitante) {
      if (contagemPorSolicitante[s] > chamadosDoMaisAtivo) {
        chamadosDoMaisAtivo = contagemPorSolicitante[s];
        solicitanteMaisAtivo = s;
      }
    }

    /** Encontra o tipo de chamado mais ativo */ 
    let tipoMaisAtivo = "N/A";
    let chamadosDoTipoMaisAtivo = 0;
    for (const t in contagemPorTipo) {
      if (contagemPorTipo[t] > chamadosDoTipoMaisAtivo) {
        chamadosDoTipoMaisAtivo = contagemPorTipo[t];
        tipoMaisAtivo = t;
      }
    }

    /** Calcula as porcentagens com base no volume encontrado */ 
    const porcentagemPeriodo = totalGeral > 0 ? (contadorPeriodo / totalGeral) * 100 : 0;
    const porcentagemSolicitante = contadorPeriodo > 0 ? (chamadosDoMaisAtivo / contadorPeriodo) * 100 : 0;
    const porcentagemTipo = contadorPeriodo > 0 ? (chamadosDoTipoMaisAtivo / contadorPeriodo) * 100 : 0;
    
    return {
      total: contadorPeriodo,
      totalGeral: totalGeral,
      porcentagem: porcentagemPeriodo.toFixed(2),
      solicitanteMaisAtivo: solicitanteMaisAtivo,
      chamadosDoMaisAtivo: chamadosDoMaisAtivo,
      porcentagemSolicitante: porcentagemSolicitante.toFixed(2),
      tipoMaisAtivo: tipoMaisAtivo,
      chamadosDoTipoMaisAtivo: chamadosDoTipoMaisAtivo,
      porcentagemTipo: porcentagemTipo.toFixed(2),
      periodoInicial: dados.dataInicial,
      periodoFinal: dados.dataFinal
    };

  } catch (e) {
      return { status: 'erro', mensagem: 'Falha no cálculo métrico: ' + e.message };
  }
}
  /** FUNÇÃO QUE BUSCA CHAMADO POR ID */
function buscarUnicoChamado(idBusca) {
  try {
    var planilha = SpreadsheetApp.openById("");
    var aba = planilha.getSheetByName("main"); 
    
    if (!aba) {
      return { status: "erro", mensagem: "Erro interno: Aba 'main' não localizada." };
    }
    
    var dadosPlanilha = aba.getDataRange().getValues();
    var linhaEncontrada = null; 
    
    for (var i = 1; i < dadosPlanilha.length; i++) {
      if (String(dadosPlanilha[i][0]).trim() === String(idBusca).trim()) {
        linhaEncontrada = dadosPlanilha[i];
        break; 
      }
    }
    
    if (!linhaEncontrada) {
      return { status: "erro", mensagem: "Chamado com o ID #" + idBusca + " não foi localizado." };
    }
    
    return {
      status: "sucesso",
      id: linhaEncontrada[0],           
      tipoDoChamado: linhaEncontrada[1],  
      solicitante: linhaEncontrada[2],    
      funcao: linhaEncontrada[3],        
      statusChamado: linhaEncontrada[4],  
      descricao: linhaEncontrada[5],      
      informacaoExtra: linhaEncontrada[6],
      hora: linhaEncontrada[7],           
      data: linhaEncontrada[8]            
    };

  } catch (erro) {
    return { status: "erro", mensagem: "Erro interno no servidor: " + erro.message };
  }
}

/** CADASTRA OU EDITA TAREFAS DE ROTINA */
function cadastraTarefa(data) {
  const ss = SpreadsheetApp.openById("");
  let sheet = ss.getSheetByName("tasks");
  const mainSheet = ss.getSheetByName("main");
  
  if (!sheet) {
    sheet = ss.insertSheet("tasks");
    sheet.appendRow(["ID", "Descrição", "Tipo Repetição", "Data", "Hora", "Responsável"]);
  }

  const id = data.idTarefa;
  let novoId;
  let mensagemRetorno;

  if (!id || id === "") {
    const ultimaLinha = sheet.getLastRow();
    let maiorId = 0;
    if (ultimaLinha > 1) {
      const ids = sheet.getRange(2, 1, ultimaLinha - 1).getValues().flat();
      maiorId = Math.max(...ids.map(Number));
    }
    novoId = maiorId + 1;

    sheet.appendRow([
      novoId,
      data.descricao,
      data.tipoRepeticao,
      data.tipoRepeticao === "Diaria" ? "Todos os dias" : data.data,
      data.hora,
      data.responsavel
    ]);
    mensagemRetorno = "Tarefa agendada com sucesso!";
  } else {
    novoId = Number(id);
    const dados = sheet.getDataRange().getValues();
    let linhaEditar = null;
    for (let i = 1; i < dados.length; i++) {
      if (Number(dados[i][0]) === novoId) {
        linhaEditar = i + 1;
        break;
      }
    }
    if (linhaEditar) {
      sheet.getRange(linhaEditar, 1, 1, 6).setValues([[
        novoId,
        data.descricao,
        data.tipoRepeticao,
        data.tipoRepeticao === "Diaria" ? "Todos os dias" : data.data,
        data.hora,
        data.responsavel
      ]]);
      mensagemRetorno = "Tarefa de rotina atualizada!";
    } else {
      return "Erro: Tarefa não encontrada.";
    }
  }

  /** Gera o registro imediato na planilha principal 'main' se for uma nova tarefa */ 
  if ((!id || id === "") && mainSheet) {
    const ultimaLinhaMain = mainSheet.getLastRow();
    let maiorIdMain = 0;
    if (ultimaLinhaMain > 1) {
      const idsMain = mainSheet.getRange(2, 1, ultimaLinhaMain - 1).getValues().flat();
      maiorIdMain = Math.max(...idsMain.map(Number));
    }
    
    const agora = new Date();
    const dataAtualStr = Utilities.formatDate(agora, Session.getScriptTimeZone(), "dd/MM/yyyy");
    const horaAtualStr = Utilities.formatDate(agora, Session.getScriptTimeZone(), "HH:mm:ss");

    mainSheet.appendRow([
      maiorIdMain + 1,                                            
      "Rotina do setor",                                          
      data.solicitanteLogado || "Sistema",                        
      data.funcaoLogada || "Geral",                               
      "Pendente",                                                 
      data.descricao,                                             
      "Gerado automaticamente pela Rotina #" + novoId,            
      horaAtualStr,                                               
      dataAtualStr                                                
    ]);
  }

  return mensagemRetorno;
}

/** RETORNA TODAS AS TAREFAS CADASTRADAS */
function lerTarefas() {
  const ss = SpreadsheetApp.openById("");
  const sheet = ss.getSheetByName("tasks");
  if (!sheet) return [];
  
  const linhas = sheet.getDataRange().getValues();
  linhas.shift(); 
  
  const fusoHorario = Session.getScriptTimeZone();
  
  return linhas.map(l => {
    let dataFormatada = l[3];
    let horaFormatada = l[4];
    
    /**  formata a data para texto*/
    if (dataFormatada instanceof Date) {
      dataFormatada = Utilities.formatDate(dataFormatada, fusoHorario, "dd/MM/yyyy");
    }
    
    /**  extrai apenas HH:mm*/ 
    if (horaFormatada instanceof Date) {
      horaFormatada = Utilities.formatDate(horaFormatada, fusoHorario, "HH:mm");
    }
    
    return {
      id: l[0],
      descricao: l[1],
      tipoRepeticao: l[2],
      data: dataFormatada,
      hora: horaFormatada,
      responsavel: l[6] // Ajustado para o índice correto da sua coluna de Responsável
    };
  });
}

/** BUSCA UMA TAREFA ISOLADA PARA EDIÇÃO  */
function buscarUnicaTarefa(data) {
  const ss = SpreadsheetApp.openById("");
  const sheet = ss.getSheetByName("tasks");
  const dados = sheet.getDataRange().getValues();
  
  const fusoHorario = Session.getScriptTimeZone();
  const idProcurado = Number(data.idTarefa);
  
  for (let i = 1; i < dados.length; i++) {
    if (Number(dados[i][0]) === idProcurado) {
      let dataFormatada = dados[i][3];
      let horaFormatada = dados[i][4];
      
      if (dataFormatada instanceof Date) {
        dataFormatada = Utilities.formatDate(dataFormatada, fusoHorario, "dd/MM/yyyy");
      }
      
      if (horaFormatada instanceof Date) {
        horaFormatada = Utilities.formatDate(horaFormatada, fusoHorario, "HH:mm");
      }
      
      return {
        id: dados[i][0],
        descricao: dados[i][1],
        tipoRepeticao: dados[i][2],
        data: dataFormatada,
        hora: horaFormatada,
        responsavel: dados[i][5]
      };
    }
  }
}

/**FUNÇÃO PARA DELETAR TAREFAS PELO ID */

function deletarTarefa(data) {
  const ss = SpreadsheetApp.openById("");
  const sheet = ss.getSheetByName("tasks");
  const dados = sheet.getDataRange().getValues();
  for (let i = 1; i < dados.length; i++) {
    if (Number(dados[i][0]) === Number(data.idTarefa)) {
      sheet.deleteRow(i + 1);
      return "Tarefa removida com sucesso.";
    }
  }
  return "Erro ao remover tarefa.";
}


/** FUNÇÃO DE PROCESSAMENTO AUTOMÁTICO */

function verificarEGerarChamadosAutomaticos() {
  const ss = SpreadsheetApp.openById("");
  const taskSheet = ss.getSheetByName("tasks");
  const mainSheet = ss.getSheetByName("main");
  const userSheet = ss.getSheetByName("users");
  
  if (!taskSheet || !mainSheet) return;
  
  const tarefas = taskSheet.getDataRange().getValues();
  tarefas.shift();
  
  /** Cria um dicionário com os usuários e suas respectivas funções para consulta ultra rápida */ 
  const dadosUsuarios = userSheet ? userSheet.getDataRange().getValues() : [];
  const mapeamentoFuncoes = {};
  for (let i = 1; i < dadosUsuarios.length; i++) {
    let nomeCompleto = (String(dadosUsuarios[i][1]).trim() + " " + String(dadosUsuarios[i][2]).trim()).trim();
    mapeamentoFuncoes[nomeCompleto] = dadosUsuarios[i][3] ? String(dadosUsuarios[i][3]).trim() : "Geral";
  }
  
  const agora = new Date();
  const fusoHorario = Session.getScriptTimeZone();
  const horaAtualStr = Utilities.formatDate(agora, fusoHorario, "HH:mm");
  const dataAtualStr = Utilities.formatDate(agora, fusoHorario, "dd/MM/yyyy");
  
  const [hAtual, mAtual] = horaAtualStr.split(":").map(Number);
  
  tarefas.forEach(tarefa => {
    const id = tarefa[0];
    const descricao = tarefa[1];
    const tipo = tarefa[2];
    const dataAgendada = tarefa[3];
    let horaAgendada = tarefa[4];
    const responsavel = tarefa[5] ? String(tarefa[5]).trim() : "";
    
    if (!horaAgendada) return;

    if (horaAgendada instanceof Date) {
      horaAgendada = Utilities.formatDate(horaAgendada, fusoHorario, "HH:mm");
    } else {
      horaAgendada = String(horaAgendada).trim();
    }
    
    if (!horaAgendada.includes(":")) return;
    
    const [hTask, mTask] = horaAgendada.split(":").map(Number);
    
    /**  Verifica se o horário bate dentro da janela de execução */
    if (hAtual === hTask && Math.abs(mAtual - mTask) <= 16) {
      let precisaCriar = false;
      
      let dataAgendadaStr = dataAgendada;
      if (dataAgendadaStr instanceof Date) {
        dataAgendadaStr = Utilities.formatDate(dataAgendadaStr, fusoHorario, "dd/MM/yyyy");
      } else {
        dataAgendadaStr = String(dataAgendadaStr).trim();
      }
      
      if (tipo === "Diaria") {
        precisaCriar = true;
      } else if (tipo === "Mensal" && dataAgendadaStr === dataAtualStr) {
        precisaCriar = true;
      }
      
      if (precisaCriar) {
        /** Valida duplicidade usando a nova regra de Tipo: "Rotina do setor */ 
        const chamadosHoje = mainSheet.getDataRange().getValues();
        const jaExiste = chamadosHoje.some(c => c[1] === "Rotina do setor" && c[5] === descricao && c[8] === dataAtualStr);
        
        if (!jaExiste) {
          const ultimaLinha = mainSheet.getLastRow();
          let maiorId = 0;
          if (ultimaLinha > 1) {
            const ids = mainSheet.getRange(2, 1, ultimaLinha - 1).getValues().flat();
            maiorId = Math.max(...ids.map(Number));
          }
          
          /** Captura a função real mapeada do usuário ou assume "Geral" se não achar */ 
          const funcaoRealDoResponsavel = mapeamentoFuncoes[responsavel] || "Geral";
          
          // Lógica Idealizada Ativa!
          mainSheet.appendRow([
            maiorId + 1,
            "Rotina do setor",
            responsavel,
            funcaoRealDoResponsavel,
            "Pendente", 
            descricao,
            "Gerado automaticamente pela Rotina #" + id,
            horaAgendada + ":00",
            dataAtualStr
          ]);
        }
      }
    }
  });
}