# teachergiovannaguarnieri
Serverless Learning Management System (LMS) featuring a Student Dashboard and a Teacher CMS, built with JavaScript, HTML/CSS, and Google Apps Script.

# 🚀 JavaScript Serverless LMS: Plataforma EdTech Full-Stack

**Status:** Em desenvolvimento | **Área:** EdTech (Educação & Tecnologia)

---

## 🎯 Contexto e Impacto (O Problema e a Solução)

A gestão de alunos particulares e turmas independentes geralmente exige múltiplas ferramentas pagas e fragmentadas (plataformas de exercícios, drives de materiais, agendadores de aula e planilhas de notas). 

Este projeto resolve esse problema unificando toda a jornada educacional. Trata-se de um **Learning Management System (LMS) Serverless** construído 100% no ecossistema Google Workspace. A plataforma elimina custos de hospedagem e centraliza o painel do aluno (Front-end) e a mesa de gestão da professora (CMS/Back-end) em uma única arquitetura inteligente e escalável.

---

## 💻 Tech Stack e Palavras-Chave

O desenvolvimento desta plataforma priorizou performance, componentização e ausência de frameworks pesados para garantir fluidez extrema (Vanilla Focus).

* **Front-end:** JavaScript (ES6+), HTML5, CSS3, Bootstrap 5, jQuery.
* **Back-end / API:** Google Apps Script (RESTful API via `doGet` e `doPost`).
* **Banco de Dados:** Google Sheets (NoSQL/Document-like approach).
* **Integrações Nativas:** Google Drive API (Upload e manipulação de arquivos em Base64).
* **Bibliotecas Externas:** TinyMCE (Rich Text Editor), Select2.
* **Padrões de Projeto (Design Patterns):** MVC, Factory Pattern (Renderização de interfaces camaleão), State Management.

---

## ⚙️ Arquitetura e Módulos do Sistema

A infraestrutura foi dividida em dois grandes ecossistemas que se comunicam via requisições assíncronas (`fetch`).

| Módulo | Tipo | Funcionalidade Principal |
| :--- | :--- | :--- |
| **Autenticação & Segurança** | Front/Back | Gateway de login, cadastro, recuperação de senha e encriptação (Hash SHA-256). |
| **Student Dashboard** | Front-end | Timeline interativa de aulas, acesso a slides nativos, notas e revisão de materiais. |
| **Motor de Worksheets** | Front-end | Renderização dinâmica de provas com validação algorítmica de respostas via Regex. |
| **Machine Learning Loop** | Back-end | Sistema de retroalimentação onde a professora adiciona regras de validação ao banco em tempo real. |
| **Lesson Planner CMS** | Back-end | Ferramenta administrativa para agendamento de aulas, atrelando slides e exercícios ao currículo. |
| **Construtor de Slides** | Back-end | Interface Master-Detail com TinyMCE para criação e armazenamento dinâmico de apresentações no banco. |

---

## 📺 Demonstração Prática (Pitch Deck)

> ⚠️ **Nota aos Recrutadores:** Para garantir a segurança dos dados e a integridade do banco de dados real, o código-fonte completo do Back-end não está publicado neste repositório público. 

Para visualizar o sistema operando ponta a ponta, assista ao screencast de demonstração abaixo:

[![Demonstração do Sistema](https://img.youtube.com/vi/SEU_LINK_DO_YOUTUBE_AQUI/0.jpg)](https://www.youtube.com/watch?v=SEU_LINK_DO_YOUTUBE_AQUI)

*(Clique na imagem acima para abrir o vídeo demonstrativo no YouTube)*

---

## 🔐 Direitos Autorais e Licença

© 2024. Todos os Direitos Reservados.
Este repositório atua exclusivamente como portfólio de arquitetura de software e design de interfaces. O uso, reprodução, cópia ou distribuição dos trechos de código aqui exibidos, sem autorização prévia, é estritamente proibido.
