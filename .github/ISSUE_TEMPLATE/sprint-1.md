---
name: Sprint 1 — Identidade e Login
about: Login com Google (padrão para as 12 equipes do Campus App). Crie 4 issues com este template, uma por tarefa.
title: "XXX-0N · "
labels: ["must-have", "sprint-1"]
---

<!--
COMO USAR ESTE TEMPLATE
Crie 4 issues, uma para cada tarefa do Sprint 1. Em cada uma:
1. Troque XXX pelo prefixo do seu projeto (RND, EAA, SIN, ANB, MON, FLW, AVI, IFI, IHP, IFA, STD, MIF).
2. No título, coloque o número (01 a 04) e o nome da tarefa.
3. Apague as tarefas que não forem daquela issue, deixando só o bloco correspondente.
4. Adicione a label `setup` nas issues 01 e 02.
5. Associe ao milestone "Sprint 1 — Identidade e Login".

O Sprint 1 é IGUAL para as 12 equipes. Ambiente: build nativo (expo prebuild + run:android), não Expo Go.
Papéis de usuário (aluno/monitor, cliente/prestador, etc.) só no Sprint 2.
-->

## 🔐 Sprint 1 — Identidade e Login (padrão)

Baseado no codelab *Autenticação Firebase/Google*. Marque abaixo apenas o bloco desta issue.

---

### XXX-01 · Configurar Firebase e ativar login com Google
> Labels: `must-have` `sprint-1` `setup`

**História de usuário**
Como equipe, queremos o Firebase configurado com autenticação Google ativada, para que o app possa autenticar usuários.

**Critérios de aceite**
- [ ] Projeto criado no console do Firebase
- [ ] Provedor de login **Google** ativado na aba Authentication
- [ ] App Android registrado no Firebase com o nome de pacote definido
- [ ] `google-services.json` baixado e colocado na raiz do projeto
- [ ] Certificado **SHA-1** gerado (`gradlew signingReport`) e cadastrado no Firebase

---

### XXX-02 · Criar o app React Native e integrar as bibliotecas
> Labels: `must-have` `sprint-1` `setup`

**História de usuário**
Como equipe, queremos o projeto React Native criado e as bibliotecas de autenticação instaladas, para começar a programar o login.

**Critérios de aceite**
- [ ] Projeto Expo criado e aberto no VS Code
- [ ] Biblioteca instalada: `npx expo install @react-native-google-signin/google-signin`
- [ ] `app.json` configurado com `googleServicesFile` e o plugin do google-signin
- [ ] `npx expo prebuild` executado sem erro (pasta `android` criada)
- [ ] App roda no dispositivo com `npx expo run:android`

---

### XXX-03 · Implementar login e logout com Google
> Labels: `must-have` `sprint-1`

**História de usuário**
Como usuário, quero entrar com minha conta Google e poder sair, para acessar o app com minha identidade.

**Critérios de aceite**
- [ ] `GoogleSignin.configure()` com o `webClientId` correto (do `google-services.json`)
- [ ] Botão "Entrar" chama `GoogleSignin.signIn()` e obtém o objeto `user`
- [ ] Indicador de carregamento (`ActivityIndicator`) durante o login
- [ ] Botão "Sair" chama `GoogleSignin.signOut()` e volta à tela de login
- [ ] Valida domínio `iftm.edu.br` do usuário logado. Em caso de outro domínio, retornar à tela de login e informe a restrição de acesso aos usuários Google no domínio iftm.edu.br

---

### XXX-04 · Rotas protegidas + Home com usuário logado + sessão persistente
> Labels: `must-have` `sprint-1`

**História de usuário**
Como usuário, quero que o app me leve à Home ao logar, mostre meu nome e foto, e lembre que estou logado ao reabrir o app.

**Critérios de aceite**
- [ ] Renderização condicional: sem usuário → Login; com usuário → Home
- [ ] Home exibe nome e foto do objeto `user` do Google
- [ ] Objeto `user` em estado global (Context) acessível a todas as telas
- [ ] Sessão persiste: fechar e reabrir o app mantém o login
- [ ] Logout limpa a sessão e retorna ao Login

---

## ✅ Definição de Pronto do Sprint 1 (checar no celular)

1. Abre o app → vê a tela de Login.
2. Toca em "Entrar" → escolhe a conta Google → cai na Home.
3. A Home mostra o nome e a foto corretos.
4. Toca em "Sair" → volta ao Login.
5. Faz login de novo, **fecha o app e reabre** → continua logado.

> Lembrete de código: importe hooks direto de `'react'` (`import { useState } from 'react'`) — nunca `import React from 'react'`.
