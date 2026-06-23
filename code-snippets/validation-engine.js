/**
 * =========================================================================
 * 🧠 ADVANCED VALIDATION ENGINE & MACHINE LEARNING FEEDBACK LOOP
 * =========================================================================
 * Este módulo demonstra a inteligência algorítmica da plataforma. Ele combina
 * um motor de avaliação estática no Front-end (baseado em correspondência de
 * strings e higienização via Regex) com uma API de retroalimentação no Back-end,
 * permitindo que o sistema aprenda novas regras de validação em tempo real.
 */

// ============================================================================
// 📊 FRONT-END STRATEGY PATTERN: VALIDADO RES DE ITENS
// ============================================================================
const QuestionValidator = {
  dropdown: function(qDados, inputsNoBloco) {
    var todosAcertaram = true;
    var gabaritosLacunas = qDados.gabarito.split(';').map(g => g.trim());
    
    inputsNoBloco.forEach(function(drop) {
      var subIdx = parseInt(drop.getAttribute('data-subidx')) || 0;
      var valorEscolhido = drop.value.trim();
      var gabaritoDaLacuna = gabaritosLacunas[subIdx] || gabaritosLacunas[0];
      var subOpcoesGabarito = gabaritoDaLacuna.split('|').map(x => x.trim());
      
      if (valorEscolhido === "" || subOpcoesGabarito.indexOf(valorEscolhido) === -1) {
        todosAcertaram = false;
      }
    });
    
    if (todosAcertaram) return { correct: true, html: "🎉 Correct!" };
    return { correct: false, html: `❌ Incorrect. <br><span class='teacher-tip'>Correct answer: <strong>${qDados.gabarito.replace(/;/g, " and ")}</strong></span>` };
  },

  short_answer: function(qDados, inputsNoBloco) {
    var todosAcertaram = true;
    var htmlFeedback = "";
    var listaRegras = qDados.regrasValidacao ? qDados.regrasValidacao.split(';') : [];
    var listaGabaritos = qDados.gabarito ? qDados.gabarito.split(';') : [];
    
    inputsNoBloco.forEach(function(inputElement, subIdx) {
      var inputVal = inputElement.value.trim();
      var respondidoLimpo = cleanString(inputVal);
      
      // Sanitização de fronteira por espaçamento para mitigar falsos acertos em substrings
      // (Previne que o token 'is' seja validado incorretamente dentro de 'this')
      var textoEspacado = " " + respondidoLimpo + " ";
      
      var regraLacuna = listaRegras[subIdx] ? listaRegras[subIdx].trim() : "";
      var gabaritoLacuna = listaGabaritos[subIdx] ? listaGabaritos[subIdx].trim() : qDados.gabarito;
      
      var acertouLacuna = false;
      var indiceAcerto = 0; 
      var alternativasRegras = regraLacuna.split('|').map(alt => alt.trim());
      var alternativasGabaritos = gabaritoLacuna.split('|').map(g => g.trim());
      
      if (regraLacuna === "") {
        if (respondidoLimpo === cleanString(gabaritoLacuna) && respondidoLimpo !== "") {
          acertouLacuna = true;
        }
      } else {
        for (var a = 0; a < alternativasRegras.length; a++) {
          // Mapeia e isola as palavras-chave obrigatórias unidas pelo operador '+'
          var keywords = alternativasRegras[a].split('+').map(k => " " + cleanString(k) + " ");
          var passouChaves = keywords.every(palavraExata => textoEspacado.includes(palavraExata));
          
          if (passouChaves && respondidoLimpo !== "") { 
            acertouLacuna = true; 
            indiceAcerto = a; 
            break; 
          }
        }
      }
      
      var prefixoLinha = inputsNoBloco.length > 1 ? `<strong>Line ${subIdx + 1}:</strong> ` : "";
      var gabaritoDefinitivo = alternativasGabaritos[indiceAcerto] || alternativasGabaritos[0];
      
      if (acertouLacuna) {
        let precisaDica = (cleanString(inputVal) !== cleanString(gabaritoDefinitivo));
        htmlFeedback += `🟢 ${prefixoLinha}Correct!`;
        if (precisaDica) htmlFeedback += ` <span class='teacher-tip'>Structure: "${gabaritoDefinitivo}"</span>`;
        htmlFeedback += "<br>";
      } else {
        todosAcertaram = false;
        var erroPadrao = alternativasGabaritos[0];
        if (inputVal === "") htmlFeedback += `❌ ${prefixoLinha}Unanswered. <span class='teacher-tip'>Expected: "${erroPadrao}"</span><br>`;
        else htmlFeedback += `❌ ${prefixoLinha}Incorrect. <span class='teacher-tip'>Try: "${erroPadrao}"</span><br>`;
      }
    });
    return { correct: todosAcertaram, html: htmlFeedback };
  },

  paragraph_answer: function(qDados, inputsNoBloco, respostaTexto) {
    if(respostaTexto.trim() === "") return { correct: false, html: "⚠️ Unanswered. The teacher will review." };
    return { correct: true, html: "🟢 Saved! The teacher will review your response. <br><span class='teacher-tip'>Expected: Personal Answer</span>" };
  }
};

// Mapeamento polimórfico de tipos de questões para seus respectivos validadores
QuestionValidator.multipla_escolha = QuestionValidator.dropdown;
QuestionValidator.sentence_answer = QuestionValidator.short_answer;
QuestionValidator.aberta_curta = QuestionValidator.short_answer;
QuestionValidator.aberta_pessoal = QuestionValidator.paragraph_answer;


// ============================================================================
// 🧠 BACK-END INTERFACE: MACHINE LEARNING LOOP (Google Apps Script)
// ============================================================================
function apiAddNovaRegra(idQuestaoTarget, itemTarget, novaRegraInput) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetBanco = ss.getSheetByName("banco_questoes");
  if (!sheetBanco) return { sucesso: false, erro: "Aba administrativa não localizada." };
  
  var values = sheetBanco.getDataRange().getValues();
  var headers = values[0].map(function(h) { return h.toString().toLowerCase().trim(); });
  
  var colId = headers.indexOf("id_questao");
  var colItem = headers.indexOf("item");
  var colRegra = headers.indexOf("regras_validacao") + 1;
  var colExemplo = headers.indexOf("exemplo");
  
  var idTargetNorm = (idQuestaoTarget || "").toString().trim().toUpperCase();
  var itemTargetNorm = (itemTarget || "").toString().trim().toLowerCase();
  
  // Normalização agressiva via Regex para correspondência de strings imune a pontuações estranhas
  var itemTargetClean = itemTargetNorm.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s+/g,"");
  var regraFormatada = (novaRegraInput || "").toString().trim();
  
  for (var i = 1; i < values.length; i++) {
    // Proteção de integridade: Ignora linhas marcadas como exemplos pedagógicos
    if (colExemplo > -1) {
      var isExemplo = values[i][colExemplo];
      if (isExemplo === true || (typeof isExemplo === 'string' && isExemplo.toUpperCase() === "TRUE")) {
        continue; 
      }
    }
    
    var rowId = values[i][colId] ? values[i][colId].toString().trim().toUpperCase() : "";
    var rowItemRaw = values[i][colItem] ? values[i][colItem].toString().trim().toLowerCase() : "";
    var rowItemClean = rowItemRaw.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s+/g,"");
    
    // Identificação do registro exato no banco relacional (Sheets)
    if (rowId === idTargetNorm && rowItemClean === itemTargetClean) {
      var regraAtual = values[i][colRegra - 1] ? values[i][colRegra - 1].toString().trim() : "";
      
      // Injeta o operador lógico pipe '|' expandindo a Árvore de Decisão do validador estático
      var novaStringRegra = (regraAtual === "") ? regraFormatada : (regraAtual + " | " + regraFormatada);
      
      sheetBanco.getRange(i + 1, colRegra).setValue(novaStringRegra);
      return { sucesso: true, mensagem: "Engine pipeline dynamically updated!" };
    }
  }
  
  return { sucesso: false, erro: "Falha na indexação do item alvo." };
}

// Helper de sanitização de strings utilizando expressões regulares corporativas
function cleanString(str) {
    if (!str) return "";
    return str.toString().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").replace(/\s+/g," ").trim();
  }
