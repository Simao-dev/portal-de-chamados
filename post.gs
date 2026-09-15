/** HELPER PARA OBTER A PLANILHA ATIVA REUTILIZANDO A REFERÊNCIA COM MÁXIMO DESEMPENHO */
function getAppSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Não foi possível acessar a planilha ativa.");
  }
  return ss;
}

/** CONFIGURAÇÕES INICIAIS DA PÁGINA */
function doGet(e) {
  var tentativas = ['Login', 'login', 'Login.html', 'login.html'];
  var html;
  
  for (var i = 0; i < tentativas.length; i++) {
    try {
      html = HtmlService.createTemplateFromFile(tentativas[i]);
      if (html) break;
    } catch (err) {}
  }
  
  if (!html) {
    throw new Error("Não foi possível carregar a página de Login.");
  }
  
  return html.evaluate()
      .setTitle('Portal de Chamados')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** FUNÇÃO PARA PERMITIR IMPORTAÇÃO DE CSS/JS COM TRATAMENTO DE CASE-SENSITIVITY E EXTENSÕES NO GOOGLE APPS SCRIPT */
function include(filename) {
  if (!filename) return "";
  
  var base = String(filename).trim();
  var baseSemExt = base.replace(/\.html$/i, "");
  
  var tentativas = [
    base,
    baseSemExt,
    baseSemExt + ".html",
    baseSemExt.toLowerCase(),
    baseSemExt.toLowerCase() + ".html",
    baseSemExt.toUpperCase(),
    baseSemExt.toUpperCase() + ".html",
    baseSemExt.charAt(0).toUpperCase() + baseSemExt.slice(1),
    (baseSemExt.charAt(0).toUpperCase() + baseSemExt.slice(1)) + ".html",
    baseSemExt.charAt(0).toLowerCase() + baseSemExt.slice(1),
    (baseSemExt.charAt(0).toLowerCase() + baseSemExt.slice(1)) + ".html",
    "javaScript",
    "javaScript.html",
    "JavaScript",
    "JavaScript.html",
    "javascript",
    "javascript.html",
    "style",
    "style.html",
    "Style",
    "Style.html",
    "Login",
    "Login.html",
    "login",
    "login.html",
    "Sistema",
    "Sistema.html",
    "sistema",
    "sistema.html"
  ];
  
  for (var i = 0; i < tentativas.length; i++) {
    try {
      var output = HtmlService.createHtmlOutputFromFile(tentativas[i]);
      if (output) return output.getContent();
    } catch(e) {}
  }
  
  return "";
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

    case "consultarStatusRotina":
      return consultarStatusRotina(data);

    case "consultarHistoricoRotinas":
      return consultarHistoricoRotinas(data);

    case "obterEquipamentos":
      return obterEquipamentos(data);

    case "salvarEquipamento":
      return salvarEquipamento(data);

    case "atualizarEquipamento":
      return atualizarEquipamento(data);

    case "deletarEquipamento":
      return deletarEquipamento(data);

    case "processarPedidoNfe":
      return processarPedidoNfe(data);

    default:
      return { status: "erro", mensagem: "Função não reconhecida." };
  }
}

/** LÓGICA DE AUTENTICAÇÃO E BANCO DE DADOS */ 

function autenticarUsuario(matricula, senha) {
  try {
    const ss = getAppSpreadsheet();
    const sheet = ss.getSheetByName("users"); 
    
    if (!sheet) {
      throw new Error("Aba 'users' não encontrada.");
    }
    
    const dados = sheet.getDataRange().getValues();
    
    const matDigitada = String(matricula || "").trim();
    const senhaDigitada = String(senha || "").trim();
    
    for (let i = 1; i < dados.length; i++) {
      let usuarioPlanilha = dados[i][5] !== undefined && dados[i][5] !== null ? String(dados[i][5]).trim() : "";
      let senhaPlanilha = dados[i][8] !== undefined && dados[i][8] !== null ? String(dados[i][8]).trim() : "";
      
      let nome = dados[i][1] ? String(dados[i][1]).trim() : "";
      let sobrenome = dados[i][2] ? String(dados[i][2]).trim() : "";
      let nomeCompleto = (nome + " " + sobrenome).trim();
      
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
  } catch (erro) {
    return { status: "erro", mensagem: erro.message };
  }
}

function carregarPaginaSistema() {
  var tentativas = ['Sistema', 'sistema', 'Sistema.html', 'sistema.html'];
  for (var i = 0; i < tentativas.length; i++) {
    try {
      return HtmlService.createTemplateFromFile(tentativas[i]).evaluate().getContent();
    } catch (e1) {}
    try {
      return HtmlService.createHtmlOutputFromFile(tentativas[i]).getContent();
    } catch (e2) {}
  }
  throw new Error("Não foi possível carregar o arquivo do Sistema.");
}

/** AREA DE CHAMADOS / CADASTRA /ALTERA / REQUISIÇÃO / ATUALIZAÇÃO */

function entradaDeInformacoes(data) {
  const ss = getAppSpreadsheet();
  const main = ss.getSheetByName("main");

  if (main.getLastRow() === 0) {
    main.appendRow(["ID", "Tipo do Chamado", "Solicitante", "Função", "Status Chamado", "Descrição", "Informação Extra", "Hora", "Data", "Tipo Repetição", "Comando/Instrução"]);
  }

  const idChamado = data.idDoChamado; 
  const agora = new Date();
  const horaStr = Utilities.formatDate(agora, Session.getScriptTimeZone(), "HH:mm:ss");
  const dataStr = Utilities.formatDate(agora, Session.getScriptTimeZone(), "dd/MM/yyyy");

  if (!idChamado || idChamado === "") {
    const ultimaLinha = main.getLastRow();
    let maiorId = 0;

    if (ultimaLinha > 1) {
      const idsExistentes = main.getRange(2, 1, ultimaLinha - 1).getValues().flat();
      maiorId = idsExistentes.length > 0 ? Math.max(...idsExistentes.map(Number).filter(n => !isNaN(n))) : 0;
    }

    const novoId = maiorId + 1;

    main.appendRow([
      novoId,
      data.tipoDoChamado,
      data.solicitante,
      data.funcao,
      data.statusChamado,
      data.descricao,
      data.informacaoExtra,
      horaStr,
      dataStr,
      data.tipoRepeticao || "", // Coluna J
      data.comando || ""        // Coluna K
    ]);
    return {
      status: "sucesso",
      mensagem: "Chamado cadastrado com sucesso!",
      id: novoId,
      hora: horaStr,
      data: dataStr
    };

  } else {
    const dadosPlanilha = main.getDataRange().getValues();
    const idNumero = Number(idChamado);
    let linhaParaEditar;
    
    for (let i = 0; i < dadosPlanilha.length; i++) {
      if (Number(dadosPlanilha[i][0]) === idNumero) {
        linhaParaEditar = i + 1;
        break;
      }
    }

    if (linhaParaEditar) {
      const linhaOriginal = dadosPlanilha[linhaParaEditar - 1];

      const novaLinhaDeDados = [
        idNumero,
        data.tipoDoChamado,
        data.solicitante,
        data.funcao,
        data.statusChamado,
        data.descricao,
        data.informacaoExtra,
        linhaOriginal[7] || horaStr, 
        linhaOriginal[8] || dataStr,
        data.tipoRepeticao !== undefined ? data.tipoRepeticao : (linhaOriginal[9] || ""),
        data.comando !== undefined ? data.comando : (linhaOriginal[10] || "")
      ];

      main.getRange(linhaParaEditar, 1, 1, novaLinhaDeDados.length).setValues([novaLinhaDeDados]);
      return {
        status: "sucesso",
        mensagem: "Chamado atualizado com sucesso!",
        id: idNumero,
        hora: linhaOriginal[7] || horaStr,
        data: linhaOriginal[8] || dataStr
      };
      
    } else {
      return { status: "erro", mensagem: "Erro: Chamado não encontrado." };
    }
  }
}
 
/** Faz a REQUISIÇÃO dos dados no banco para exibir na tabela */
function lerChamados(data) {
  const ss = getAppSpreadsheet();
  const main = ss.getSheetByName("main");
  if (!main) return [];

  const lines = main.getDataRange().getValues();
  if (lines.length <= 1) return [];

  lines.shift();
  lines.sort((a, b) => Number(b[0]) - Number(a[0]));

  const fusoHorario = Session.getScriptTimeZone();

  return lines.map(l => {
    let horaVal = l[7];
    let dataVal = l[8];

    if (horaVal instanceof Date) {
      horaVal = Utilities.formatDate(horaVal, fusoHorario, "HH:mm:ss");
    } else {
      horaVal = String(horaVal || "").trim();
    }

    if (dataVal instanceof Date) {
      dataVal = Utilities.formatDate(dataVal, fusoHorario, "dd/MM/yyyy");
    } else {
      dataVal = String(dataVal || "").trim();
    }

    return {
      id: l[0],
      tipoDoChamado: l[1],
      solicitante: l[2],
      funcao: l[3],
      statusChamado: l[4],
      descricao: l[5],
      informacaoExtra: l[6],
      hora: horaVal,
      data: dataVal,
      tipoRepeticao: l[9] || "",
      comando: l[10] || ""
    };
  });
}

/** AREA DE CADASTRO/ALTERAÇÃO/EXCLUSÃO e EXIBIÇÃO DE USUARIOS */

function cadastraUsuario(data) {
  const ss = getAppSpreadsheet();
  const main = ss.getSheetByName("users");

  if (main.getLastRow() === 0) {
    main.appendRow(["ID", "Nome", "Sobrenome", "Função", "Cargo", "Usuario", "Ramal", "Permissão", "Senha"]);
  }

  const id = data.idUsuario;

  if (!id || id === "") {
    const ultimaLinha = main.getLastRow();
    let maiorId = 0;

    if (ultimaLinha > 1) {
      const idsExistentes = main.getRange(2, 1, ultimaLinha - 1).getValues().flat();
      maiorId = idsExistentes.length > 0 ? Math.max(...idsExistentes.map(Number).filter(n => !isNaN(n))) : 0;
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
    return { status: "sucesso", mensagem: "Usuário cadastrado com sucesso!", id: novoId };

  } else {
    const dados = main.getDataRange().getValues();
    let linhaParaEditar;
    
    for (let i = 0; i < dados.length; i++) {
      if (Number(dados[i][0]) == Number(id)) {
        linhaParaEditar = i + 1;
        break;
      }
    }

    if (linhaParaEditar) {
      const novaLinha = [
        Number(id),
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
      return { status: "sucesso", mensagem: "Usuário atualizado com sucesso!", id: Number(id) };

    } else {
      return { status: "erro", mensagem: "Erro: Usuário não encontrado." };
    }
  }
}

/** REMOVE USUÁRIO */
function deletarUsuario(data) {
  const ss = getAppSpreadsheet();
  const main = ss.getSheetByName("users");

  if (!data || data.idUsuario === "" || data.idUsuario === undefined) {
    return { status: "erro", mensagem: "Nenhum id encontrado" };
  }
  
  const idProcurado = Number(data.idUsuario);
  const dados = main.getDataRange().getValues();

  for (let i = 1; i < dados.length; i++) {
    if (Number(dados[i][0]) === idProcurado) {
      main.deleteRow(i + 1);
      return { status: "sucesso", mensagem: "Usuário deletado", id: idProcurado };
    }
  }
  return { status: "erro", mensagem: "ID do usuário não encontrado na planilha" };
}

function listarNomeCargo() {
  const ss = getAppSpreadsheet();
  const main = ss.getSheetByName("users");
  if (!main) return [];

  const dados = main.getDataRange().getValues();
  if (dados.length <= 1) return [];

  const cabecalho = dados.shift();
  const indiceNome = cabecalho.indexOf("Nome");
  const indiceFuncao = cabecalho.indexOf("Função");

  return dados.map(l => ({
    nome: l[indiceNome !== -1 ? indiceNome : 1],
    cargo: l[indiceFuncao !== -1 ? indiceFuncao : 3]
  }));
}

function lerUsuarios(data) {
  const ss = getAppSpreadsheet();
  const main = ss.getSheetByName("users");
  if (!main) return [];

  const lines = main.getDataRange().getValues();
  if (lines.length <= 1) return [];

  lines.shift(); 
  lines.sort((a, b) => Number(b[0]) - Number(a[0]));

  return lines.map(l => ({
    id: l[0],
    nome: l[1],
    sobrenome: l[2],
    funcao: l[3],
    cargo: l[4],
    usuario: l[5],
    ramal: l[6],
    permissao: l[7],
    senha: l[8] || ""
  }));
}

/** PÁGINAS DE METRICAS */
function buscarChamadosPorPeriodo(dados) {
  try {
    const ss = getAppSpreadsheet();
    const planilha = ss.getSheetByName('main');
    if (!planilha) return { status: 'erro', mensagem: 'Aba main não localizada.' };

    const colunas = { tipo: 1, solicitante: 2, data: 8 };

    const ultimaLinha = planilha.getLastRow();
    if (ultimaLinha <= 1) {
      return { total: 0, totalGeral: 0, porcentagem: "0.00", solicitanteMaisAtivo: "N/A", chamadosDoMaisAtivo: 0, porcentagemSolicitante: "0.00", tipoMaisAtivo: "N/A", chamadosDoTipoMaisAtivo: 0, periodoInicial: dados.dataInicial, periodoFinal: dados.dataFinal };
    }

    const todosOsValores = planilha.getRange(2, 1, ultimaLinha - 1, 9).getValues();
    const totalGeral = todosOsValores.length;

    const dataInicial = new Date(dados.dataInicial + 'T00:00:00');
    const dataFinal = new Date(dados.dataFinal + 'T23:59:59');

    let contadorPeriodo = 0;
    const contagemPorSolicitante = {};
    const contagemPorTipo = {};

    todosOsValores.forEach(row => {
      let dataNaCelula = row[colunas.data];
      if (!dataNaCelula) return;

      let dataDoRegistro;

      if (dataNaCelula instanceof Date) {
        dataDoRegistro = new Date(dataNaCelula.getTime());
      } else {
        const partes = String(dataNaCelula).split('/');
        if (partes.length === 3) {
          dataDoRegistro = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
        }
      }

      if (dataDoRegistro && dataDoRegistro >= dataInicial && dataDoRegistro <= dataFinal) {
        contadorPeriodo++;

        const nomeSolicitante = row[colunas.solicitante];
        if (nomeSolicitante) {
          const nomeNormalizado = String(nomeSolicitante).trim();
          contagemPorSolicitante[nomeNormalizado] = (contagemPorSolicitante[nomeNormalizado] || 0) + 1;
        }

        const tipoChamado = row[colunas.tipo];
        if (tipoChamado) {
          const tipoNormalizado = String(tipoChamado).trim();
          contagemPorTipo[tipoNormalizado] = (contagemPorTipo[tipoNormalizado] || 0) + 1;
        }
      }
    });

    let solicitanteMaisAtivo = "N/A";
    let chamadosDoMaisAtivo = 0;
    for (const s in contagemPorSolicitante) {
      if (contagemPorSolicitante[s] > chamadosDoMaisAtivo) {
        chamadosDoMaisAtivo = contagemPorSolicitante[s];
        solicitanteMaisAtivo = s;
      }
    }

    let tipoMaisAtivo = "N/A";
    let chamadosDoTipoMaisAtivo = 0;
    for (const t in contagemPorTipo) {
      if (contagemPorTipo[t] > chamadosDoTipoMaisAtivo) {
        chamadosDoTipoMaisAtivo = contagemPorTipo[t];
        tipoMaisAtivo = t;
      }
    }

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

function buscarUnicoChamado(idBusca) {
  try {
    var planilha = getAppSpreadsheet();
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
      data: linhaEncontrada[8],
      tipoRepeticao: linhaEncontrada[9] || "",
      comando: linhaEncontrada[10] || ""
    };

  } catch (erro) {
    return { status: "erro", mensagem: "Erro interno no servidor: " + erro.message };
  }
}

function cadastraTarefa(data) {
  const ss = getAppSpreadsheet();
  let sheet = ss.getSheetByName("tasks");
  const mainSheet = ss.getSheetByName("main");
  
  if (!sheet) {
    sheet = ss.insertSheet("tasks");
    sheet.appendRow(["ID", "Descrição", "Tipo Repetição", "Data", "Hora", "Responsável"]);
  }

  const id = data.idTarefa;
  let novoId;
  let mensagemRetorno;

  const descricaoCombinada = data.rotina + " // " + data.comando + " // " + data.descricao;

  if (!id || id === "") {
    const ultimaLinha = sheet.getLastRow();
    let maiorId = 0;
    if (ultimaLinha > 1) {
      const ids = sheet.getRange(2, 1, ultimaLinha - 1).getValues().flat();
      maiorId = Math.max(...ids.map(Number).filter(n => !isNaN(n)));
    }
    novoId = maiorId + 1;

    sheet.appendRow([
      novoId,
      descricaoCombinada,
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
        descricaoCombinada,
        data.tipoRepeticao,
        data.tipoRepeticao === "Diaria" ? "Todos os dias" : data.data,
        data.hora,
        data.responsavel
      ]]);
      mensagemRetorno = "Tarefa de rotina atualizada!";
    } else {
      return { status: "erro", mensagem: "Erro: Tarefa não encontrada." };
    }
  }

  if ((!id || id === "") && mainSheet) {
    const ultimaLinhaMain = mainSheet.getLastRow();
    let maiorIdMain = 0;
    if (ultimaLinhaMain > 1) {
      const idsMain = mainSheet.getRange(2, 1, ultimaLinhaMain - 1).getValues().flat();
      maiorIdMain = Math.max(...idsMain.map(Number).filter(n => !isNaN(n)));
    }
    
    const agora = new Date();
    const dataAtualStr = Utilities.formatDate(agora, Session.getScriptTimeZone(), "dd/MM/yyyy");
    const horaAtualStr = Utilities.formatDate(agora, Session.getScriptTimeZone(), "HH:mm:ss");

    let solicitanteOriginal = data.solicitanteLogado || "Sistema";
    let partesDoNome = solicitanteOriginal.split(" ");
    let solicitanteCurto = partesDoNome[0] + (partesDoNome[1] ? " " + partesDoNome[1] : "");

    mainSheet.appendRow([
      maiorIdMain + 1,
      "Rotina do setor",
      solicitanteCurto,
      data.funcaoLogada || "Geral",
      "Pendente",
      data.descricao,
      data.rotina,
      horaAtualStr,
      dataAtualStr,
      data.tipoRepeticao,
      data.comando
    ]);
  }

  return { status: "sucesso", mensagem: mensagemRetorno, id: novoId };
}

function lerTarefas() {
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName("tasks");
  if (!sheet) return [];
  
  const linhas = sheet.getDataRange().getValues();
  if (linhas.length <= 1) return [];
  linhas.shift(); 
  
  const fusoHorario = Session.getScriptTimeZone();
  
  return linhas.map(l => {
    let dataFormatada = l[3];
    let horaFormatada = l[4];
    
    if (dataFormatada instanceof Date) {
      dataFormatada = Utilities.formatDate(dataFormatada, fusoHorario, "dd/MM/yyyy");
    }
    
    if (horaFormatada instanceof Date) {
      horaFormatada = Utilities.formatDate(horaFormatada, fusoHorario, "HH:mm");
    }
    
    return {
      id: l[0],
      descricao: l[1],
      tipoRepeticao: l[2],
      data: dataFormatada,
      hora: horaFormatada,
      responsavel: l[5]
    };
  });
}

function buscarUnicaTarefa(data) {
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName("tasks");
  if (!sheet) return null;
  const dados = sheet.getDataRange().getValues();
  
  const fusoHorario = Session.getScriptTimeZone();
  const idProcurado = Number(data.idTarefa);
  
  for (let i = 1; i < dados.length; i++) {
    if (Number(dados[i][0]) === idProcurado) {
      let dataFormatada = dados[i][3];
      let horaFormatada = dados[i][4];
      
      if (dataFormatada instanceof Date) { dataFormatada = Utilities.formatDate(dataFormatada, fusoHorario, "dd/MM/yyyy"); }
      if (horaFormatada instanceof Date) { horaFormatada = Utilities.formatDate(horaFormatada, fusoHorario, "HH:mm"); }
      
      let textoCel = String(dados[i][1]);
      let rotinaParte = "";
      let comandoParte = "";
      let descParte = textoCel;
      
      if(textoCel.includes(" // ")) {
        let partesTexto = textoCel.split(" // ");
        if(partesTexto.length >= 3) {
          rotinaParte = partesTexto[0];
          comandoParte = partesTexto[1];
          descParte = partesTexto[2];
        } else {
          rotinaParte = partesTexto[0];
          descParte = partesTexto[1];
        }
      }
      
      return {
        id: dados[i][0],
        rotina: rotinaParte,
        comando: comandoParte,
        descricao: descParte,
        tipoRepeticao: dados[i][2],
        data: dataFormatada,
        hora: horaFormatada,
        responsavel: dados[i][5]
      };
    }
  }
  return null;
}

function deletarTarefa(data) {
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName("tasks");
  if (!sheet) return { status: "erro", mensagem: "Aba tasks não encontrada." };

  const idProcurado = Number(data.idTarefa);
  const dados = sheet.getDataRange().getValues();
  for (let i = 1; i < dados.length; i++) {
    if (Number(dados[i][0]) === idProcurado) {
      sheet.deleteRow(i + 1);
      return { status: "sucesso", mensagem: "Tarefa removida com sucesso.", id: idProcurado };
    }
  }
  return { status: "erro", mensagem: "Erro ao remover tarefa." };
}

function verificarEGerarChamadosAutomaticos() {
  const ss = getAppSpreadsheet();
  const taskSheet = ss.getSheetByName("tasks");
  const mainSheet = ss.getSheetByName("main");
  const userSheet = ss.getSheetByName("users");
  
  if (!taskSheet || !mainSheet) return;
  
  const tarefas = taskSheet.getDataRange().getValues();
  if (tarefas.length <= 1) return;
  tarefas.shift();
  
  const fusoHorario = ss.getSpreadsheetTimeZone();
  const agora = new Date();
  
  const horaAtualStr = Utilities.formatDate(agora, fusoHorario, "HH:mm");
  const dataAtualStr = Utilities.formatDate(agora, fusoHorario, "dd/MM/yyyy");
  
  const [hAtual, mAtual] = horaAtualStr.split(":").map(Number);
  const minutosAtuaisTotais = hAtual * 60 + mAtual;

  const dadosUsuarios = userSheet ? userSheet.getDataRange().getValues() : [];
  const mapeamentoFuncoes = {};
  for (let i = 1; i < dadosUsuarios.length; i++) {
    let nomeCompleto = (String(dadosUsuarios[i][1]).trim() + " " + String(dadosUsuarios[i][2]).trim()).trim();
    mapeamentoFuncoes[nomeCompleto] = dadosUsuarios[i][3] ? String(dadosUsuarios[i][3]).trim() : "Geral";
  }

  const chamadosMain = mainSheet.getDataRange().getValues();

  tarefas.forEach(tarefa => {
    let textoCel = String(tarefa[1] || "");
    const tipo = String(tarefa[2] || "").trim();
    const dataAgendada = tarefa[3];
    let horaAgendada = tarefa[4];
    const responsavel = tarefa[5] ? String(tarefa[5]).trim() : "";
    
    if (!horaAgendada) return;

    let rotinaNome = "Rotina Agendada";
    let comandoDiretriz = "Executar padrão";
    let descricaoReal = textoCel;

    if (textoCel.includes(" // ")) {
      let partes = textoCel.split(" // ");
      if (partes.length >= 3) {
        rotinaNome = partes[0];
        comandoDiretriz = partes[1];
        descricaoReal = partes[2];
      } else {
        rotinaNome = partes[0];
        descricaoReal = partes[1];
      }
    }

    if (horaAgendada instanceof Date) { 
      horaAgendada = Utilities.formatDate(horaAgendada, fusoHorario, "HH:mm"); 
    } else { 
      horaAgendada = String(horaAgendada).trim(); 
    }
    
    if (!horaAgendada.includes(":")) return;
    
    const [hTask, mTask] = horaAgendada.split(":").map(Number);
    const minutosTaskTotais = hTask * 60 + mTask;
    
    const diferencaMinutos = Math.abs(minutosAtuaisTotais - minutosTaskTotais);

    if (diferencaMinutos <= 15) {
      let precisaCriar = false;
      
      let dataAgendadaStr = "";
      if (dataAgendada instanceof Date) { 
        dataAgendadaStr = Utilities.formatDate(dataAgendada, fusoHorario, "dd/MM/yyyy"); 
      } else { 
        dataAgendadaStr = String(dataAgendada || "").trim(); 
      }
      
      if (tipo.toLowerCase() === "diaria" || tipo.toLowerCase() === "diária") { 
        precisaCriar = true; 
      } else if (tipo.toLowerCase() === "mensal" && dataAgendadaStr === dataAtualStr) { 
        precisaCriar = true; 
      }
      
      if (precisaCriar) {
        const jaExiste = chamadosMain.some(c => {
          let tipoChamado = String(c[1] || "").trim();
          let descChamado = String(c[5] || "").trim();
          
          let dataChamadoStr = "";
          if (c[8] instanceof Date) {
            dataChamadoStr = Utilities.formatDate(c[8], fusoHorario, "dd/MM/yyyy");
          } else {
            dataChamadoStr = String(c[8] || "").trim();
          }

          return tipoChamado === "Rotina do setor" && descChamado === descricaoReal && dataChamadoStr === dataAtualStr;
        });
        
        if (!jaExiste) {
          const ultimaLinha = mainSheet.getLastRow();
          let maiorId = 0;
          if (ultimaLinha > 1) {
            const ids = mainSheet.getRange(2, 1, ultimaLinha - 1).getValues().flat();
            maiorId = Math.max(...ids.map(Number).filter(n => !isNaN(n)));
          }
          
          const funcaoRealDoResponsavel = mapeamentoFuncoes[responsavel] || "Geral";
          
          let partesResp = responsavel.split(" ");
          let responsavelCurto = partesResp[0] + (partesResp[1] ? " " + partesResp[1] : "");

          mainSheet.appendRow([
            maiorId + 1,
            "Rotina do setor",
            responsavelCurto,
            funcaoRealDoResponsavel,
            "Pendente", 
            descricaoReal,
            rotinaNome, 
            horaAgendada + ":00",
            dataAtualStr,
            tipo, 
            comandoDiretriz 
          ]);
        }
      }
    }
  });
}

function consultarStatusRotina(data) {
  const ss = getAppSpreadsheet();
  const main = ss.getSheetByName("main");
  if (!main) return { encontrado: false };

  const dados = main.getDataRange().getValues();
  const fuso = Session.getScriptTimeZone();
  const hojeStr = Utilities.formatDate(new Date(), fuso, "dd/MM/yyyy");
  
  const nomeRotinaAlvo = String(data.nomeRotina).trim().toLowerCase(); 
  
  let tarefasDaRotina = [];
  let temPendente = false;
  let operadoresSet = new Set();
  let dataRotina = hojeStr;

  for (let i = 1; i < dados.length; i++) {
    let infoExtra = String(dados[i][6]).trim().toLowerCase(); 
    let dataChamado = String(dados[i][8]).trim();             

    if (infoExtra === nomeRotinaAlvo && dataChamado === hojeStr) {
      let statusChamado = String(dados[i][4]).trim(); 
      let operadorNome = String(dados[i][2]).trim();
      
      if (statusChamado.toLowerCase() === "pendente") {
        temPendente = true;
      }
      
      if (operadorNome) operadoresSet.add(operadorNome);
      dataRotina = dataChamado;

      tarefasDaRotina.push({
        descricao: dados[i][5],         
        status: statusChamado,          
        quando: dados[i][9] || "Diariamente", 
        comando: dados[i][10] || "---"  
      });
    }
  }

  const listaOperadores = Array.from(operadoresSet);

  if (tarefasDaRotina.length > 0) {
    return {
      encontrado: true,
      nomeRotina: data.nomeRotina,
      data: dataRotina,
      solicitante: listaOperadores.join(" / "),
      operadores: listaOperadores,
      statusGeral: temPendente ? "Pendente" : "Concluído",
      tarefas: tarefasDaRotina
    };
  }

  return { encontrado: false };
}

function consultarHistoricoRotinas(data) {
  const ss = getAppSpreadsheet();
  const main = ss.getSheetByName("main");
  if (!main) return { historico: [] };

  const dados = main.getDataRange().getValues();
  const fuso = Session.getScriptTimeZone();
  const hojeStr = Utilities.formatDate(new Date(), fuso, "dd/MM/yyyy");
  
  const nomeRotinaAlvo = String(data.nomeRotina || "Abertura").trim().toLowerCase();
  const dataBusca = data.dataBusca ? String(data.dataBusca).trim() : null;

  const agrupadoPorData = {};

  for (let i = 1; i < dados.length; i++) {
    let infoExtra = String(dados[i][6]).trim().toLowerCase();
    let dataChamado = String(dados[i][8]).trim();

    if (infoExtra === nomeRotinaAlvo && dataChamado) {
      if (!agrupadoPorData[dataChamado]) {
        agrupadoPorData[dataChamado] = {
          data: dataChamado,
          nomeRotina: dados[i][6] || "Abertura",
          operadores: new Set(),
          temPendente: false,
          tarefas: []
        };
      }

      let statusChamado = String(dados[i][4]).trim();
      let operadorNome = String(dados[i][2]).trim();

      if (statusChamado.toLowerCase() === "pendente") {
        agrupadoPorData[dataChamado].temPendente = true;
      }
      if (operadorNome) agrupadoPorData[dataChamado].operadores.add(operadorNome);

      agrupadoPorData[dataChamado].tarefas.push({
        descricao: dados[i][5],
        status: statusChamado,
        quando: dados[i][9] || "Diariamente",
        comando: dados[i][10] || "---"
      });
    }
  }

  if (dataBusca) {
    const item = agrupadoPorData[dataBusca];
    if (item) {
      const listaOperadores = Array.from(item.operadores);
      return {
        buscaResultado: {
          encontrado: true,
          nomeRotina: item.nomeRotina,
          data: item.data,
          solicitante: listaOperadores.join(" / "),
          operadores: listaOperadores,
          statusGeral: item.temPendente ? "Pendente" : "Concluído",
          tarefas: item.tarefas
        }
      };
    } else {
      return { buscaResultado: { encontrado: false, data: dataBusca } };
    }
  }

  const datasOrdenadas = Object.keys(agrupadoPorData)
    .filter(d => d !== hojeStr)
    .sort((a, b) => {
      const [dA, mA, yA] = a.split("/").map(Number);
      const [dB, mB, yB] = b.split("/").map(Number);
      return new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA);
    })
    .slice(0, 5);

  const historico = datasOrdenadas.map(d => {
    const item = agrupadoPorData[d];
    const listaOperadores = Array.from(item.operadores);
    return {
      encontrado: true,
      nomeRotina: item.nomeRotina,
      data: item.data,
      solicitante: listaOperadores.join(" / "),
      operadores: listaOperadores,
      statusGeral: item.temPendente ? "Pendente" : "Concluído",
      tarefas: item.tarefas
    };
  });

  return { historico: historico };
}

const equipamentos = "equipamentos";

function obterAbaEquipamentos() {
  const ss = getAppSpreadsheet();
  let aba = ss.getSheetByName("equipamentos");
  if (!aba) {
    aba = ss.insertSheet(equipamentos);
    aba.appendRow(["ID", "Numero", "Nome", "Modelo", "Tipo", "Local", "Status", "DataAdd", "Observacao"]);
  }
  return aba;
}

function obterEquipamentos(data) {
  const aba = obterAbaEquipamentos();
  const dados = aba.getDataRange().getValues();
  if (dados.length <= 1) return [];

  const fuso = "GMT-3";
  const resultado = [];
  for (let i = 1; i < dados.length; i++) {
    const row = dados[i];
    let dataAddStr = row[7];
    if (dataAddStr instanceof Date) {
      dataAddStr = Utilities.formatDate(dataAddStr, fuso, "dd/MM/yyyy");
    } else {
      dataAddStr = String(dataAddStr || "").trim();
    }

    resultado.push({
      id: row[0],
      numero: String(row[1] || ""),
      nome: String(row[2] || ""),
      modelo: String(row[3] || ""),
      tipo: String(row[4] || ""),
      local: String(row[5] || ""),
      status: String(row[6] || ""),
      dataAdd: dataAddStr,
      obs: String(row[8] || "")
    });
  }
  return resultado;
}

function salvarEquipamento(data) {
  const aba = obterAbaEquipamentos();
  const ultLinha = aba.getLastRow();
  
  let novoId = 1;
  if (ultLinha > 1) {
    const ids = aba.getRange(2, 1, ultLinha - 1, 1).getValues();
    const maxId = Math.max(...ids.map(r => Number(r[0]) || 0));
    novoId = maxId + 1;
  }

  const dataHoje = Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy");

  aba.appendRow([
    novoId,
    data.numero,
    data.nome,
    data.modelo,
    data.tipo,
    data.local,
    data.status,
    dataHoje,
    data.obs || ""
  ]);

  return { status: "sucesso", mensagem: "Equipamento cadastrado com sucesso!", id: novoId, dataAdd: dataHoje };
}

function atualizarEquipamento(data) {
  const aba = obterAbaEquipamentos();
  const valores = aba.getDataRange().getValues();
  const targetId = Number(data.id);

  for (let i = 1; i < valores.length; i++) {
    if (Number(valores[i][0]) === targetId) {
      const linha = i + 1;
      const dataAddOriginal = valores[i][7];
      aba.getRange(linha, 1, 1, 9).setValues([[
        targetId,
        data.numero,
        data.nome,
        data.modelo,
        data.tipo,
        data.local,
        data.status,
        dataAddOriginal,
        data.obs || ""
      ]]);
      break;
    }
  }
  return { status: "sucesso", mensagem: "Equipamento atualizado com sucesso!", id: targetId };
}

function deletarEquipamento(data) {
  const aba = obterAbaEquipamentos();
  const valores = aba.getDataRange().getValues();
  const targetId = Number(data.id);

  for (let i = 1; i < valores.length; i++) {
    if (Number(valores[i][0]) === targetId) {
      aba.deleteRow(i + 1);
      break;
    }
  }
  return { status: "sucesso", mensagem: "Equipamento deletado com sucesso!", id: targetId };
}

const intenspedidos = "pedidosRefeitorio";
const emailcliente = "pedrosimaocontato@gmail.com";

function obterAbaNfe() {
  const ss = getAppSpreadsheet();
  let aba = ss.getSheetByName("pedidosRefeitorio");
  if (!aba) {
    aba = ss.insertSheet("pedidosRefeitorio");
    aba.appendRow(["ID Pedido", "Data", "Hora", "Solicitante", "Codigo de Barras", "Quantidade"]);
  }
  return aba;
}

function processarPedidoNfe(data) {
  try {
    if (!data.itens || data.itens.length === 0) {
      return { status: "erro", mensagem: "Lista de itens vazia." };
    }

    const aba = obterAbaNfe();
    const ultLinha = aba.getLastRow();
    
    let idPedidoNum = 1;
    if (ultLinha > 1) {
      const idsExistentes = aba.getRange(2, 1, ultLinha - 1, 1).getValues();
      const maxId = Math.max(...idsExistentes.map(r => Number(r[0]) || 0));
      idPedidoNum = maxId + 1;
    }

    const dataHoje = Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy");
    const horaHoje = Utilities.formatDate(new Date(), "GMT-3", "HH:mm:ss");
    
    const solicitante = (data.solicitante && data.solicitante !== "---" && data.solicitante !== "") 
                        ? data.solicitante 
                        : "Usuário Não Identificado";

    let linhasParaInserir = [];
    let tabelaHtmlItens = "";

    data.itens.forEach(function(item, index) {
      linhasParaInserir.push([
        idPedidoNum,
        dataHoje,
        horaHoje,
        solicitante,
        "'" + item.codigo,
        item.quantidade
      ]);

      tabelaHtmlItens += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${item.codigo}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${item.quantidade}</td>
        </tr>`;
    });

    aba.getRange(ultLinha + 1, 1, linhasParaInserir.length, 6).setValues(linhasParaInserir);

    const assuntoEmail = `[Portal S.I] Solicitação de NFe Pedido #${idPedidoNum} - Solicitante: ${solicitante}`;
    
    const corpoHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #8b5cf6; margin-top: 0;">Nova Solicitação de NFe (#${idPedidoNum})</h2>
        <p><strong>Solicitante:</strong> ${solicitante}</p>
        <p><strong>Data/Hora:</strong> ${dataHoje} às ${horaHoje}</p>
        <p><strong>Total de Itens:</strong> ${data.itens.length}</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <h3>Relação de Produtos para Emissão:</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #f8fafc; text-align: left;">
              <th style="padding: 8px; border: 1px solid #ddd; width: 10%;">#</th>
              <th style="padding: 8px; border: 1px solid #ddd; width: 65%;">Código de Barras</th>
              <th style="padding: 8px; border: 1px solid #ddd; width: 25%; text-align: center;">Qtd</th>
            </tr>
          </thead>
          <tbody>
            ${tabelaHtmlItens}
          </tbody>
        </table>
        
        <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">E-mail gerado automaticamente pelo Portal de Chamados (simao.dev).</p>
      </div>
    `;

    MailApp.sendEmail({
      to: emailcliente,
      subject: assuntoEmail,
      htmlBody: corpoHtml
    });

    return { status: "sucesso", mensagem: "Pedido #" + idPedidoNum + " processado com sucesso!" };

  } catch (erro) {
    return { status: "erro", mensagem: "Erro no servidor: " + erro.toString() };
  }
}