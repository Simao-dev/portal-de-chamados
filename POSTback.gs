
/** INDETIFICA QUAL O TIPO DE SOLICITAÇÃO E DESTINA A FUNÇÃO CORRESPONDENTE */
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
    
    case "lerUsuarios":
      return lerUsuarios(data);
    
    case "deletarUsuarios":
      return deletarUsuario(data);
    
        case "metricas":
    return buscarChamadosPorPeriodo(data);

      case "buscarUnicoChamado":
    return buscarUnicoChamado(data);

    default:
      return { status: "erro", mensagem: "Função não reconhecida." };
  }
}
/**   AREA DE CHAMADOS / CADASTRO / REQUISIÇÃO / ATUALIZAÇÃO */

/**CADASTRA/ALTERA novos chamados */
function entradaDeInformacoes(data) {
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
  const main = ss.getSheetByName("main");

  /** Garante cabeçalho */
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
    
    // Busca a linha pelo ID
    for (let i = 0; i < dadosPlanilha.length; i++) {
      if (Number(dadosPlanilha[i][0]) === idNumero) {
        linhaParaEditar = i + 1;
        break;
      }
    }

    if (linhaParaEditar) {
      
      // Pega os dados da linha para manter os valores originais de Hora e Data
      const linhaOriginal = main.getRange(linhaParaEditar, 1, 1, main.getLastColumn()).getValues()[0];

      // Atualiza os dados que vieram do formulário
      const novaLinhaDeDados = [
        idNumero,
        data.tipoDoChamado,
        data.solicitante,
        data.funcao,
        data.statusChamado,
        data.descricao,
        data.informacaoExtra,
        linhaOriginal[7], // Hora (coluna 8, índice 7)
        linhaOriginal[8]  // Data (coluna 9, índice 8)
      ];

      main.getRange(linhaParaEditar, 1, 1, novaLinhaDeDados.length).setValues([novaLinhaDeDados]);
      return "Chamado atualizado com sucesso!";
      
    } else {
      return "Erro: Chamado não encontrado.";
    }
  }
}
 
 /** Faz a REQUISIÇÃO dos dados no banco para exibir na tabela */
function lerChamados(data) {
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
  const main = ss.getSheetByName("main");

  /**converte dada e hora pra texto */
  main.getRange("H:I").activate();
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
    funcao: l[3],
    statusChamado: l[4],
    descricao: l[5],
    informacaoExtra: l[6],
    hora: l[7],
    data: l[8],
    
  }));
  
}

/** AREA DE CASTRO/ALTERAÇÃO/EXCLUSÃO e EXIBIÇÃO DE USUARIOS */

/**CADASTRA/ALTERA os usuarios */
function cadastraUsuario(data) {
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
  const main = ss.getSheetByName("users");

  /** Garante cabeçalho */
  if (main.getLastRow() === 0) {
    main.appendRow(["ID", "Nome", "Sobrenome", "Função", "Cargo", "Usuario", "Ramal"]);
  }

  const id = data.idUsuario; // Ou data.idUsuario, dependendo do que você envia do frontend

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
    ]);
    return "Usuário cadastrado com sucesso!";

  } else {

    /** Altera caso tenha ID */
    const dados = main.getDataRange().getValues();
    
    // Busca a linha pelo ID
    let linhaParaEditar;
    for (let i = 0; i < dados.length; i++) {
      if (dados[i][0] == id) {
        linhaParaEditar = i + 1; // Soma 1 pois a função getRange usa índices baseados em 1
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
        data.ramal
      ];

      // Altera os dados na planilha na linha encontrada
      main.getRange(linhaParaEditar, 1, 1, novaLinha.length).setValues([novaLinha]);
      
      return "Usuário atualizado com sucesso!";

    } else {
      return "Erro: Usuário não encontrado.";
    }
  }
}

/** REMOVE usuario */

function deletarUsuario(data) {
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
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
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
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
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
  const main = ss.getSheetByName("users");
  

  const linhas = main.getDataRange().getValues();

  /**Remove cabeçalho */
  linhas.shift();

  linhas.sort((a, b) => b[0] - a[0]);

  // Transforma em array de objetos
  return linhas.map(l => ({
    id: l[0],
    nome: l[1],
    sobrenome: l[2],
    funcao: l[3],
    cargo: l[4],
    usuario: l[5],
    ramal: l[6],
  }));
  
}

/** METRICAS */

/** Busca e conta a quantidade de chamados em um período de tempo.*/
/**
 * Busca e conta chamados, identifica o maior solicitante e o total geral.
 */

function buscarChamadosPorPeriodo(dados) {
  try {
    const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
    const planilha = ss.getSheetByName('main');

    // Mapeamento das colunas para facilitar a leitura.
    const colunas = { solicitante: 2, data: 8 }; // Coluna C é a de índice 2, e I é a 8.

    // Obtém todos os valores das colunas de Solicitante e Data
    // Usamos A:I para pegar todas as colunas até I. Se for mais eficiente, você pode pegar somente C e I.
    const todosOsValores = planilha.getRange('A2:I').getValues();

    // Filtra apenas as linhas com dados válidos na coluna de data (I)
    const dadosValidos = todosOsValores.filter(row => row[colunas.data] !== '');

    // Calcula o total geral de chamados
    const totalGeral = dadosValidos.length;

    const dataInicial = new Date(dados.dataInicial + 'T00:00:00Z');
    const dataFinal = new Date(dados.dataFinal + 'T00:00:00Z');
    dataFinal.setDate(dataFinal.getDate() + 1);

    let contadorPeriodo = 0;
    const contagemPorSolicitante = {};

    dadosValidos.forEach(row => {
      const nomeSolicitante = row[colunas.solicitante];
      const dataNaCelula = row[colunas.data];
      
      const partes = dataNaCelula.split('/');
      const dataDoRegistro = new Date(partes[2], partes[1] - 1, partes[0]);
      dataDoRegistro.setHours(0, 0, 0, 0);

      // Lógica principal: contagem do período e por solicitante
      if (dataDoRegistro >= dataInicial && dataDoRegistro < dataFinal) {
        contadorPeriodo++;
        if (nomeSolicitante && typeof nomeSolicitante === 'string') {
          const nomeNormalizado = nomeSolicitante.trim();
          contagemPorSolicitante[nomeNormalizado] = (contagemPorSolicitante[nomeNormalizado] || 0) + 1;
        }
      }
    });

    // Encontra o solicitante mais ativo
    let solicitanteMaisAtivo = "N/A";
    let chamadosDoMaisAtivo = 0;

    for (const solicitante in contagemPorSolicitante) {
      if (contagemPorSolicitante[solicitante] > chamadosDoMaisAtivo) {
        chamadosDoMaisAtivo = contagemPorSolicitante[solicitante];
        solicitanteMaisAtivo = solicitante;
      }
    }

    // Calcula as porcentagens
    const porcentagemPeriodo = totalGeral > 0 ? (contadorPeriodo / totalGeral) * 100 : 0;
    const porcentagemSolicitante = totalGeral > 0 ? (chamadosDoMaisAtivo / totalGeral) * 100 : 0;
    
    // Retorna todas as métricas em um único objeto
    return {
      total: contadorPeriodo,
      totalGeral: totalGeral,
      porcentagem: porcentagemPeriodo.toFixed(2),
      solicitanteMaisAtivo: solicitanteMaisAtivo,
      chamadosDoMaisAtivo: chamadosDoMaisAtivo,
      porcentagemSolicitante: porcentagemSolicitante.toFixed(2),
      periodoInicial: dados.dataInicial,
      periodoFinal: dados.dataFinal
    };

  } catch (e) {
      return { status: 'erro', mensagem: e.message };
  }
}

function buscarUnicoChamado(data) {
  try {
    const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
    const main = ss.getSheetByName("main");
    const dadosPlanilha = main.getDataRange().getValues();
    
    const idProcurado = Number(data.idChamado);
    let linhaEncontrada = null;
    
    // Varre as linhas procurando o ID (Coluna 0)
    for (let i = 1; i < dadosPlanilha.length; i++) {
      if (Number(dadosPlanilha[i][0]) === idProcurado) {
        linhaEncontrada = dadosPlanilha[i];
        break;
      }
    }
    
    if (linhaEncontrada) {
      // Retorna o objeto mapeado igualzinho ao lerChamados, mas de uma única linha
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
    } else {
      return { status: "erro", mensagem: "Chamado #" + idProcurado + " não foi localizado no banco de dados." };
    }
    
  } catch(e) {
    return { status: "erro", mensagem: "Erro interno no servidor: " + e.message };
  }
}

