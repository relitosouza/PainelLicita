# Story 1: Monitoramento Dashboard - Prefeitura de Osasco

## Descrição
Desenvolver um Painel de Monitoramento Geral (Dashboard) para a Secretaria de Compras da Prefeitura de Osasco. O painel deve seguir um layout 16:9 rígido (1920x1080) e integrar dados em tempo real de uma planilha do Google Sheets.

## Contexto
- **Projeto**: PortalLicita / Painel de Monitoramento
- **Fase**: Greenfield - MVP
- **Layout**: Fornecido via HTML/Tailwind pelo usuário.

## Tarefas
- [ ] Criar estrutura base do projeto (Next.js + Tailwind)
- [ ] Implementar o Layout 16:9 rígido
- [ ] Criar componentes de cartões (Destaque e Grid Geral)
- [ ] Implementar integração com Google Sheets API
- [ ] Mapear colunas da planilha para os campos do dashboard
- [ ] Adicionar atualização automática (Polling ou SWR)
- [ ] Validar design (Cores, Fontes Public Sans/Inter)

## Critérios de Aceitação
- [ ] O painel ocupa exatamente 1920x1080px sem barras de rolagem.
- [ ] Os dados são carregados dinamicamente do Google Sheets.
- [ ] O visual é idêntico ao layout fornecido.
- [ ] O status dos pregões (Aguardando, Em Andamento, Suspenso, etc.) é refletido por cores corretas.

## Arquivos Criados/Modificados
- `app/page.tsx`
- `app/layout.tsx`
- `lib/google-sheets.ts`
- `tailwind.config.ts`

## Histórico de Mudanças
- **2026-03-26**: Criação da story por Antigravity.
