/**
 * =========================================================================
 * 🚀 SERVERLESS REST API GATEWAY (Google Apps Script)
 * =========================================================================
 * Este módulo atua como o roteador central do sistema, recebendo requisições
 * HTTP (GET/POST) do Front-end e direcionando para os controladores 
 * específicos de banco de dados (NoSQL).
 */

function doGet(e) {
  var action = e.parameter.action;

  // ---------------------------------------------------
  // 🔗 ROTAS DE API (Endpoints JSON)
  // ---------------------------------------------------

  if (action) {
    var resultadoApi = {};
    try {
      if (action === "login") {
        resultadoApi = apiLogin(e.parameter.email, e.parameter.password);
      } else if (action === "signup") {
        resultadoApi = apiSignup(e.parameter.name, e.parameter.email, e.parameter.password);
      } else if (action === "getDashboard") {
        resultadoApi = apiGetDashboard(e.parameter.email);
      } else if (action === "getWorksheet") {
        resultadoApi = obterDadosDaWorksheet(e.parameter.ws, e.parameter.email);
      } else if (action === "getMaterial") {
        resultadoApi = obterMaterialApoio(e.parameter.assunto);
      } else if (action === "getDeck") {
        resultadoApi = buscarSlidesBackend(e.parameter.idDeck) || { erro: "Apresentação não encontrada." };
      } else if (action === "salvarRespostas") {
        var listaRespostasParsed = JSON.parse(e.parameter.listaRespostas || "[]");
        resultadoApi = apiSalvarRespostas(
          e.parameter.wsId, 
          e.parameter.email, 
          e.parameter.nomeAluno, 
          e.parameter.idTentativa, 
          e.parameter.statusAtividade, 
          listaRespostasParsed
        );
      } else if (action === "changePassword") {
        resultadoApi = apiChangePassword(e.parameter.email, e.parameter.currentPassword, e.parameter.newPassword);
      } else if (action === "forgotPassword") {
        resultadoApi = apiForgotPassword(e.parameter.email); 
      } else if (action === "getListaAlunos") {
        resultadoApi = apiGetListaAlunos();
      } else if (action === "getWorksheetsParaCorrigir") {
        resultadoApi = apiGetWorksheetsParaCorrigir();
      } else if (action === "addNovaRegra") {
        // Garante a correspondência exata do item para evitar falsos positivos na atualização da regra de Machine Learning
        resultadoApi = apiAddNovaRegra(e.parameter.idQuestao, e.parameter.itemQuestao, e.parameter.novaRegra);
      } else {
        resultadoApi = { erro: "Ação de API não reconhecida pelo sistema." };
      }
    } catch (err) {
      resultadoApi = { erro: "Falha interna no servidor: " + err.toString() };
    }

    return ContentService.createTextOutput(JSON.stringify(resultadoApi))
                         .setMimeType(ContentService.MimeType.JSON);
  }

  // ---------------------------------------------------
  // 🖥️ SERVER-SIDE RENDERING (SSR) E VIEWS
  // ---------------------------------------------------

  if (e.parameter.assunto) {
    var template = HtmlService.createTemplateFromFile('Material');
    template.assunto = e.parameter.assunto;
    return template.evaluate()
        .setTitle('Review Material')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  if (e.parameter.deck) {
    var template = HtmlService.createTemplateFromFile('Presentation');
    template.deck = e.parameter.deck;
    return template.evaluate()
        .setTitle('Class Presentation')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  var template = HtmlService.createTemplateFromFile('Index');
  var wsId = e.parameter.ws || "";
  template.wsId = wsId;
  
  return template.evaluate()
      .setTitle('English Interactive Worksheet')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * =========================================================================
 * 🚀 ROTEADOR DE CARGA PESADA (doPost)
 * =========================================================================
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    
    if (payload.action === "salvarRespostas") {
      var resultadoApi = apiSalvarRespostas(payload.wsId, payload.email, payload.nomeAluno, payload.idTentativa, payload.statusAtividade, payload.listaRespostas);
      return ContentService.createTextOutput(JSON.stringify(resultadoApi)).setMimeType(ContentService.MimeType.JSON);
    }
    else if (payload.action === "salvarCorrecaoProfessora") {
      var resultadoApi = apiSalvarCorrecaoProfessor(payload.idTentativa, payload.notaFinal, payload.pacoteCorrecao);
      return ContentService.createTextOutput(JSON.stringify(resultadoApi)).setMimeType(ContentService.MimeType.JSON);
    }
    else if (payload.action === "addNovaRegra") {
      // Endpoint isolado via método POST para blindar caracteres especiais (ex: operador lógico '|') durante o tráfego da nova regra
      var resultadoApi = apiAddNovaRegra(payload.idQuestao, payload.itemQuestao, payload.novaRegra);
      return ContentService.createTextOutput(JSON.stringify(resultadoApi)).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({erro: "Ação POST não reconhecida."})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({erro: "Falha interna no servidor: " + err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
