# ✅ CHECKLIST CI/CD — Automação e Validação
**Versão**: 1.0  
**Data**: 28 de maio de 2026  
**Escopo**: Verificações automáticas recomendadas

---

## 🚀 PRÉ-COMMIT (Local)

Executar antes de `git push`:

### Linting
```bash
# ✅ ESLint (se configurado em package.json)
npm run lint

# ⚠️ Se falhar — corrigir antes de commit
# npm run lint -- --fix
```

### Formatação
```bash
# ✅ Prettier (se configurado em package.json - opcional mas recomendado)
npm run format

# Verificar
npm run format -- --check
```

### Testes
```bash
# ✅ Vitest local (verificar comando em package.json)
npm run test

# ⚠️ Esperado: Testes passando (cobertura > 70%)
# ⚠️ Se falhar: não commitar
```

**Nota**: Comandos baseados em convenção. Verificar `package.json` scripts para comandos específicos do projeto.

### Checklist Manual
- [ ] Nomes seguem padrão (PascalCase components, camelCase utils)
- [ ] Sem `console.log` esquecido
- [ ] Sem imports não utilizados
- [ ] Sem código comentado morto
- [ ] Imports usam `@/` alias
- [ ] Novos componentes têm testes
- [ ] Comentários úteis (não óbvios)

---

## 🔄 CI/CD Pipeline (Recomendado)

### Stage 1: Install Dependencies
```bash
npm ci
```
- ✅ Reproduzível entre CI e local
- ⚠️ Falha se package-lock.json desatualizado

### Stage 2: Lint
```bash
npm run lint
```
- ✅ Verifica ESLint rules
- ✅ Detecta imports não utilizados
- ⚠️ Falha se houver erros

### Stage 3: Type Check (Opcional)
```bash
# Se usar TypeScript/JSDoc (verificar em package.json)
npm run type-check
```

### Stage 4: Test
```bash
npm run test
```
- ✅ Vitest com coverage
- ✅ Esperado: Testes passando (cobertura > 70%)
- ⚠️ Falha se < 70% coverage (atual: baseado em vitest.config.js)
- ⚠️ Falha se algum teste falha

### Stage 5: Build
```bash
npm run build
```
- ✅ Vite build (produção)
- ✅ Detecta erros de build
- ⚠️ Falha se houver erros

### Stage 6: Pre-deployment Check (Opcional)
```bash
# Verificações customizadas
- Nenhum console.log em prod
- Nenhum TODO critical em código
- Documentação atualizada para mudanças públicas
```

---

## 📋 Exemplo de GitHub Actions

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run lint
        # Nota: verificar comando exato em package.json scripts
      
      - run: npm run test
        # Nota: verificar comando exato em package.json scripts
      
      - run: npm run build
        # Nota: verificar comando exato em package.json scripts
      
      - name: Archive build artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/
```

**Nota**: Este exemplo usa comandos convencionais. Adaptar conforme `package.json` do seu projeto.

---

## 📊 Métricas de Qualidade

| Métrica | Alvo | Crítico se |
|---|---|---|
| Tests Passing | 100% | < 100% |
| Test Coverage | > 70% | < 60% |
| ESLint | 0 errors | > 0 |
| Build Time | < 30s | > 60s |
| Bundle Size | < 500KB | > 1MB |

---

## 🚨 Alertas Críticos

| Alerta | Ação |
|---|---|
| Falha em testes | 🔴 Bloqueia merge |
| Console.log em prod | 🟡 Manual review |
| Imports não utilizados | 🟡 Manual review |
| Código comentado morto | 🟡 Manual review |
| Sem documentação para mudanças públicas | 🟡 Manual review |
| package-lock.json desatualizado | 🔴 Bloqueia merge |

---

## 🔐 Segurança

### Verificações Recomendadas
```bash
# ✅ Audit dependencies
npm audit

# ✅ Verificar secrets
# Nenhuma chave de API em arquivos

# ✅ Verificar envs
# Usar .env.example, não .env no repo
```

### Políticas
- ❌ Secrets nunca em repo
- ❌ Console.log de dados sensíveis
- ✅ Base44 SDK calls com try/catch
- ✅ Validação de inputs

---

## 📝 Documentação para Merge

Ao fazer PR, incluir (referenciar PADROES_CODIGO.md e DECISOES_ARQUITETURAIS.md):

```markdown
## Descrição
O que muda?

## Tipo de Mudança
- [ ] Novo componente
- [ ] Refatoração
- [ ] Bug fix
- [ ] Feature
- [ ] Documentação

## Padrões
- [ ] Segue PADROES_CODIGO.md
- [ ] Testes adicionados/atualizados
- [ ] Sem console.log
- [ ] Sem breaking changes

## Checklist
- [ ] Código revisado
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] Sem issues de performance
```

---

## 🔄 Processo de Deploy

### Pre-Deploy
1. ✅ Todos os testes passando
2. ✅ Build sem erros
3. ✅ Documentação atualizada
4. ✅ Sem alertas de segurança

### Deploy
1. Merge para `main`
2. CI/CD pipeline executa
3. Artefatos prontos
4. Deploy para staging (optional)
5. Deploy para produção

### Post-Deploy
1. ✅ Verificar build de produção
2. ✅ Smoke tests básicos
3. ✅ Monitorar logs
4. ⚠️ Se erro → rollback

---

## 🎯 SLA de Qualidade

| Métrica | Meta | Consequência |
|---|---|---|
| Testes Passando | 100% | Rejeita merge |
| Coverage | > 70% | Rejeita merge |
| Linting | 0 errors | Rejeita merge |
| Build Time | < 30s | Aviso |
| Bundle Size | < 500KB | Aviso |

---

## 🚀 Próximos Passos

1. **Configurar GitHub Actions** com pipeline acima
2. **Adicionar branch protection** (require PR reviews)
3. **Configurar ESLint** se não houver
4. **Expandir testes** para 80%+ coverage
5. **Monitorar** performance em produção

---

**Mantido por**: Arquitetura Automática Base44  
**Próxima revisão**: 28/08/2026