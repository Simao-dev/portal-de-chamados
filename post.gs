function roteadorChamado(data) {
  //Logger.log("Função solicitada: " + data.qualFuncao);

  if (data.qualFuncao == "entradaDeInformacoes") {
    const resultado = entradaDeInformacoes(data);
    //Logger.log("Resultado entradaDeInformacoes: " + JSON.stringify(resultado));
    return resultado;

  } else if (data.qualFuncao == "lerChamados") {
    return lerChamados(data);

  } else if (data.qualFuncao == "excluirEsteId") {
    const resultado = removerFuncionario(data);
    //Logger.log("Resultado removerFuncionario: " + JSON.stringify(resultado));
    return resultado;

  } else {
    //Logger.log("Função não reconhecida.");
    return "Função não reconhecida.";
  }
}


function entradaDeInformacoes(data) {
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
  const main = ss.getSheetByName("main");

  // Garante cabeçalho
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

  // Atualização de chamado existente
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

function lerChamados(data) {
  const ss = SpreadsheetApp.openById("1BFIg81PcQXN29nKRMoWpYGYygpy16WA1Xz8Z-mWMUkM");
  const main = ss.getSheetByName("main");

  //converte dada e hora pra texto
  main.getRange("G:H").activate();
  main.getActiveRangeList().setNumberFormat("@");
  

  const linhas = main.getDataRange().getValues();

  // Remove cabeçalho
  linhas.shift();

  // Transforma em array de objetos
  return linhas.map(l => ({
    id: l[0],
    tipoDoChamado: l[1],
    solicitante: l[2],
    statusChamado: l[3],
    descricao: l[4],
    informacaoExtra: l[5],
    hora: l[6],
    data: l[7]
  }));
}
