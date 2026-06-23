/**
 * =========================================================================
 * 🏭 FRONT-END UI FACTORY & DOM ORCHESTRATOR
 * =========================================================================
 * Este módulo implementa o padrão de projeto Factory para renderização
 * polimórfica de componentes de interface (UI) e o Strategy Pattern para
 * a lógica de validação. Ele reconstrói dinamicamente o DOM com base nos 
 * metadados recebidos assincronamente do banco de dados NoSQL.
 */

// ============================================================================
// 🧱 RENDERIZADORES COMPONENTIZADOS (UI Factory Pattern)
// ============================================================================
const QuestionRenderer = {
  dropdown: function(q, itemTextoFormatado) {
    var opcoesArray = q.opcoes.split(';').map(o => o.trim());
    var partes = itemTextoFormatado.split('___');
    var gabaritos = q.gabarito ? q.gabarito.split(';') : [];
    var sentencaMontada = "";
    var qtdLacunas = partes.length === 1 ? 1 : partes.length - 1;
    
    partes.forEach(function(paco, pIdx) {
      sentencaMontada += paco;
      if (pIdx < partes.length - 1) {
        var valSalvo = getSavedAnswer(q, pIdx, qtdLacunas);
        var valorExemplo = q.exemplo ? (gabaritos[pIdx] ? gabaritos[pIdx].trim() : "") : valSalvo;
        var inputHtml = `<select class="answer-input" ${q.exemplo ? 'disabled' : ''} data-subidx="${pIdx}" style="min-width: 180px; width: auto; padding: 8px 12px; margin: 0 5px; display: inline-block;"><option value="">-- Select --</option>`;
        opcoesArray.forEach(function(op) { 
          var isSelected = (op.trim().toLowerCase() === valorExemplo.toLowerCase()) ? 'selected' : '';
          inputHtml += `<option value="${escapeHTML(op.trim())}" ${isSelected}>${escapeHTML(op.trim())}</option>`; 
        });
        inputHtml += '</select>';
        sentencaMontada += inputHtml;
      }
    });

    if (partes.length === 1) {
      var valSalvo = getSavedAnswer(q, 0, qtdLacunas);
      var valorExemplo = q.exemplo ? (gabaritos[0] ? gabaritos[0].trim() : "") : valSalvo;
      var inputHtml = `<select class="answer-input" ${q.exemplo ? 'disabled' : ''} data-subidx="0" style="min-width: 180px; width: auto; padding: 8px 12px; margin: 0 5px; display: inline-block;"><option value="">-- Select --</option>`;
      opcoesArray.forEach(function(op) { 
        var isSelected = (op.trim().toLowerCase() === valorExemplo.toLowerCase()) ? 'selected' : '';
        inputHtml += `<option value="${escapeHTML(op.trim())}" ${isSelected}>${escapeHTML(op.trim())}</option>`; 
      });
      inputHtml += '</select>';
      sentencaMontada = itemTextoFormatado + " " + inputHtml;
    }
    return `<span class="inline-sentence">${sentencaMontada}</span></div>`;
  },
  
  sentence_answer: function(q, itemTextoFormatado) {
    var partes = itemTextoFormatado.split('___');
    var sentencaMontada = "";
    var gabaritos = q.gabarito ? q.gabarito.split(';') : [];
    var qtdLacunas = partes.length === 1 ? 1 : partes.length - 1;
    
    partes.forEach(function(paco, pIdx) {
      sentencaMontada += paco;
      if (pIdx < partes.length - 1) {
        var valSalvo = getSavedAnswer(q, pIdx, qtdLacunas);
        var valorExemplo = q.exemplo ? (gabaritos[pIdx] ? gabaritos[pIdx] : "") : valSalvo;
        sentencaMontada += `<input type="text" class="answer-input" data-subidx="${pIdx}" value="${escapeHTML(valorExemplo)}" ${q.exemplo ? 'disabled' : ''} style="width: 100%; margin-top: 8px; margin-bottom: 12px; display: block; padding: 12px; box-sizing: border-box; border: 2px solid #cbd5e1; border-radius: 8px;" placeholder="Type the full sentence here...">`;
      }
    });

    if (partes.length === 1) {
      var valSalvo = getSavedAnswer(q, 0, qtdLacunas);
      var valorExemplo = q.exemplo ? (gabaritos[0] ? gabaritos[0] : "") : valSalvo;
      return itemTextoFormatado + `</div><input type="text" class="answer-input" data-subidx="0" value="${escapeHTML(valorExemplo)}" ${q.exemplo ? 'disabled' : ''} style="width: 100%; margin-top: 10px; padding: 12px; box-sizing: border-box; border: 2px solid #cbd5e1; border-radius: 8px;" placeholder="Type the full sentence here...">`;
    }
    return sentencaMontada + "</div>";
  },
  
  short_answer: function(q, itemTextoFormatado) {
    var partes = itemTextoFormatado.split('___');
    var sentencaMontada = "";
    var gabaritos = q.gabarito ? q.gabarito.split(';') : [];
    var qtdLacunas = partes.length === 1 ? 1 : partes.length - 1;
    
    partes.forEach(function(paco, pIdx) {
      sentencaMontada += paco;
      if (pIdx < partes.length - 1) {
        var valSalvo = getSavedAnswer(q, pIdx, qtdLacunas);
        var valorExemplo = q.exemplo ? (gabaritos[pIdx] ? gabaritos[pIdx] : "") : valSalvo;
        sentencaMontada += `<input type="text" class="answer-input" data-subidx="${pIdx}" value="${escapeHTML(valorExemplo)}" ${q.exemplo ? 'disabled' : ''} style="width: 200px; display: inline-block; margin: 0 5px; padding: 8px 12px; border: 2px solid #cbd5e1; border-radius: 8px; text-align: center;" placeholder="...">`;
      }
    });

    if (partes.length === 1) {
      var valSalvo = getSavedAnswer(q, 0, qtdLacunas);
      var valorExemplo = q.exemplo ? (gabaritos[0] ? gabaritos[0] : "") : valSalvo;
      sentencaMontada = itemTextoFormatado + ` <input type="text" class="answer-input" data-subidx="0" value="${escapeHTML(valorExemplo)}" ${q.exemplo ? 'disabled' : ''} style="width: 200px; display: inline-block; padding: 8px 12px; border: 2px solid #cbd5e1; border-radius: 8px; text-align: center;" placeholder="...">`;
    }
    return `<span class="inline-sentence">${sentencaMontada}</span></div>`;
  },
  
  paragraph_answer: function(q, itemTextoFormatado) {
    var valSalvo = getSavedAnswer(q, 0, 1);
    var valorExemplo = q.exemplo ? (q.gabarito ? q.gabarito.trim() : "") : valSalvo;
    return itemTextoFormatado + `</div><textarea class="answer-input" data-subidx="0" rows="5" style="width: 100%; margin-top: 10px; box-sizing: border-box; padding: 12px; border-radius: 8px; border: 2px solid #cbd5e1;" placeholder="Type your paragraph response here...">${escapeHTML(valorExemplo)}</textarea>`;
  },
  
  warm_up: function(q, itemTextoFormatado, container, ultimoEnunciadoHtml) {
    if (!caixaWarmUpAtiva || ultimoEnunciadoHtml !== q.enunciado) {
      caixaWarmUpAtiva = document.createElement('div');
      caixaWarmUpAtiva.className = 'warmup-box';
      caixaWarmUpAtiva.innerHTML = "<div class='warmup-title'>🗣️ Warm-Up / Conversation</div>";
      if (q.enunciado) caixaWarmUpAtiva.innerHTML += `<div style='font-size: 17px; font-weight: 700; margin-bottom: 15px; color: var(--primary);'>${q.enunciado}</div>`;
      caixaWarmUpAtiva.innerHTML += "<ul class='warmup-list' style='padding-left: 20px; font-size: 16px; line-height: 1.8; color: var(--text);'></ul>";
      container.appendChild(caixaWarmUpAtiva);
    }
    var ul = caixaWarmUpAtiva.querySelector('.warmup-list');
    var li = document.createElement('li');
    li.style.marginBottom = '6px';
    li.innerHTML = itemTextoFormatado.replace(/^\d+[\.\s\-]+/g, ""); 
    ul.appendChild(li);
    return null; 
  }
};

// Mapeamento polimórfico de aliases para os renderizadores core
QuestionRenderer.multipla_escolha = QuestionRenderer.dropdown;
QuestionRenderer.aberta_curta = QuestionRenderer.short_answer;
QuestionRenderer.aberta_pessoal = QuestionRenderer.paragraph_answer;


// ============================================================================
// 🧠 DICIONÁRIO DINÂMICO DE VALIDAÇÃO VISUAL (Strategy Pattern)
// ============================================================================
const QuestionValidator = {
  paragraph_answer: function(qDados, inputsNoBloco, respostaTexto) {
    if(respostaTexto.trim() === "") return { correct: false, html: "⚠️ Unanswered. The teacher will review." };
    return { correct: true, html: "🟢 Saved! The teacher will review your response. <br><span class='teacher-tip'>Expected: Personal Answer</span>" };
  },

  dropdown: function(qDados, inputsNoBloco) {
    var todosAcertaram = true;
    var gabaritosLacunas = qDados.gabarito.split(';').map(g => g.trim());
    inputsNoBloco.forEach(function(drop) {
      var subIdx = parseInt(drop.getAttribute('data-subidx')) || 0;
      var valorEscolhido = drop.value.trim();
      var gabaritoDaLacuna = gabaritosLacunas[subIdx] || gabaritosLacunas[0];
      var subOpcoesGabarito = gabaritoDaLacuna.split('|').map(x => x.trim());
      if (valorEscolhido === "" || subOpcoesGabarito.indexOf(valorEscolhido) === -1) todosAcertaram = false;
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
      var textoEspacado = " " + respondidoLimpo + " ";
      
      var regraLacuna = listaRegras[subIdx] ? listaRegras[subIdx].trim() : "";
      var gabaritoLacuna = listaGabaritos[subIdx] ? listaGabaritos[subIdx].trim() : qDados.gabarito;
      
      var acertouLacuna = false;
      var indiceAcerto = 0; 
      var alternativasRegras = regraLacuna.split('|').map(alt => alt.trim());
      var alternativasGabaritos = gabaritoLacuna.split('|').map(g => g.trim());
      
      if (regraLacuna === "") {
        if (respondidoLimpo === cleanString(gabaritoLacuna) && respondidoLimpo !== "") acertouLacuna = true;
      } else {
        for (var a = 0; a < alternativasRegras.length; a++) {
          var keywords = alternativasRegras[a].split('+').map(k => " " + cleanString(k) + " ");
          var passouChaves = keywords.every(palavraExata => textoEspacado.includes(palavraExata));
          
          if (passouChaves && respondidoLimpo !== "") { acertouLacuna = true; indiceAcerto = a; break; }
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
  }
};

// Aliases de validação
QuestionValidator.multipla_escolha = QuestionValidator.dropdown;
QuestionValidator.sentence_answer = QuestionValidator.short_answer;
QuestionValidator.aberta_curta = QuestionValidator.short_answer;
QuestionValidator.aberta_pessoal = QuestionValidator.paragraph_answer;


// ============================================================================
// 🖥️ ORQUESTRAÇÃO DE RENDERIZAÇÃO CENTRAL DO DOM (Controller Layer)
// ============================================================================
function renderizarWorksheetCentral(dados) {
  dadosGlobais = dados;
  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  
  document.getElementById('header-title').innerText = dados.nome;
  document.getElementById('header-student').innerText = `Student: ${nameSession} (${emailSession})`;
  
  var container = document.getElementById('worksheet-content');
  var ultimaHabilidade = "";
  var ultimoEnunciadoHtml = "";

  // Varredura primária: Mapeamento de imagens duplicadas para agrupamento visual
  dados.questoes.forEach(function(q) {
    if (!mapeamentoImagensPorId[q.id]) mapeamentoImagensPorId[q.id] = { lista: [], todasIguais: true };
    if (q.imagem && q.imagem.trim() !== "") {
      mapeamentoImagensPorId[q.id].lista.push(q.imagem);
      if (mapeamentoImagensPorId[q.id].lista.length > 1 && q.imagem !== mapeamentoImagensPorId[q.id].lista[0]) mapeamentoImagensPorId[q.id].todasIguais = false;
    }
  });
  
  // Varredura secundária: Construção do DOM e injeção de componentes
  dados.questoes.forEach(function(q, index) {
    if(index === 0) document.getElementById('header-level').innerText = q.nivel;
    
    if (q.habilidade !== ultimaHabilidade && q.titulo_topico) {
      container.innerHTML += `<h2 class='section-title'>${q.titulo_topico}</h2>`;
      ultimaHabilidade = q.habilidade;
    }
    
    if (q.enunciado && q.enunciado.trim() !== "" && q.enunciado !== ultimoEnunciadoHtml && q.tipo !== 'warm_up') {
      if (q.enunciado.includes('|||')) {
        var partes = q.enunciado.split('|||');
        container.innerHTML += `<div class='enunciado-block'>${partes[0].trim()}</div><div class='texto-corrido-block'>${partes[1].trim()}</div>`;
      } else {
        container.innerHTML += `<div class='enunciado-block'>${q.enunciado}</div>`;
      }
      if (q.assunto && dados.assuntosDisponiveis && dados.assuntosDisponiveis.includes(q.assunto.toString().trim().toLowerCase())) {
        container.innerHTML += `<div class='link-apoio-wrapper'><a href='material.html?assunto=${encodeURIComponent(q.assunto)}' target='_blank' class='link-apoio'>📖 Review Material</a></div>`;
      }
      var infoImg = mapeamentoImagensPorId[q.id];
      if (q.imagem && infoImg && infoImg.todasIguais) container.innerHTML += `<img src='${getDriveImageUrl(q.imagem)}' class='block-image'>`;
      ultimoEnunciadoHtml = q.enunciado;
    }
    
    var divQuestao = document.createElement('div');
    divQuestao.className = 'question-block' + (q.exemplo ? ' example-block' : '');
    divQuestao.setAttribute('data-tipo', q.tipo);
    divQuestao.setAttribute('data-index', index);
    divQuestao.setAttribute('data-id-questao', q.id); 
    divQuestao.setAttribute('data-assunto', q.assunto); 
    if (q.exemplo) divQuestao.setAttribute('data-exemplo', 'true'); 
    
    var htmlConstrucido = `<div class='question-title'>${q.exemplo ? "<strong>Example:</strong> " : (qCounter + ". ")}`;
    if (!q.exemplo) qCounter++;
    
    var infoImg = mapeamentoImagensPorId[q.id];
    if (q.imagem && infoImg && !infoImg.todasIguais) htmlConstrucido += `<img src='${getDriveImageUrl(q.imagem)}' class='item-image'>`;

    var textoLimpo = q.item.replace(/<\/?(p|div|section|br)[^>]*>/gi, "").trim();
    var itemTextoFormatado = textoLimpo.replace(/\(([^)]+)\)/g, '<span class="verb-highlight">($1)</span>');
    
    if (QuestionRenderer[q.tipo]) {
      var factoryResult = QuestionRenderer[q.tipo](q, itemTextoFormatado, container, ultimoEnunciadoHtml);
      if (factoryResult !== null) {
         htmlConstrucido += factoryResult;
         divQuestao.setAttribute('data-index-unico', index); 
         htmlConstrucido += `<div class='feedback-box' id='feed-${index}'></div>`;
         divQuestao.innerHTML = htmlConstrucido;
         container.appendChild(divQuestao);
      } else {
         ultimoEnunciadoHtml = q.enunciado; 
      }
    } else {
       divQuestao.innerHTML = htmlConstrucido + `⚠️ Unrecognized question type: ${q.tipo}</div>`;
       container.appendChild(divQuestao);
    }
  });
}
