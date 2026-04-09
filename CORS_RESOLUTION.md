# Resolução de Erro CORS - allowedDevOrigins

## Erro Resolvido ✅

O erro que você estava recebendo era:
```
Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from "10.0.0.55"
```

Isso ocorre porque Next.js bloqueia requisições de CORS (cross-origin) por segurança quando você está rodando em modo desenvolvimento.

## Solução Implementada

Adicionei a configuração `allowedDevOrigins` no `next.config.ts` com:

```typescript
allowedDevOrigins: [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '10.0.0.55', // IP específico do cliente
],
```

Agora o servidor Next.js permitirá conexões WebSocket do Hot Module Reload (HMR) desde esses hosts.

## Como Usar

### 1. Reinicie o servidor de desenvolvimento
```bash
npm run dev
# ou
npm run start
```

### 2. Acesse novamente de outro computador
```
http://10.0.0.55:3000
```

ou use o IP do servidor (não do cliente):
```
http://[IP_DO_SERVIDOR]:3000
```

## Adicionando Mais IPs

Se outros computadores tiverem problemas para conectar, você pode:

### Opção 1: Adicionar IPs Específicos
Edite `next.config.ts` e adicione os IPs dentro de `allowedDevOrigins`:

```typescript
allowedDevOrigins: [
  'localhost',
  '127.0.0.1',
  '10.0.0.55',
  '10.0.0.100', // novo IP
  '10.0.0.101', // novo IP
],
```

### Opção 2: Permitir Qualquer Host em Desenvolvimento (Menos Seguro)

Se quiser permitir todos os hosts em desenvolvimento (não recomendado em produção), use:

```typescript
allowedDevOrigins: process.env.NODE_ENV === 'development' ? ['*'] : [],
```

**⚠️ Aviso:** Isso é menos seguro. Use apenas em ambiente de desenvolvimento privado.

### Opção 3: Usar Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_ALLOWED_ORIGINS=10.0.0.55,10.0.0.56,10.0.0.57
```

E configure em `next.config.ts`:

```typescript
allowedDevOrigins: (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || '')
  .split(',')
  .filter(Boolean)
  .concat(['localhost', '127.0.0.1']),
```

## Verificação

Se o erro ainda persistir:

1. **Verifique se o servidor foi reiniciado:**
   ```bash
   npm run dev
   ```

2. **Verifique o IP correto:**
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`

3. **Teste de conectividade:**
   ```bash
   # Windows
   Test-NetConnection -ComputerName [IP_DO_SERVIDOR] -Port 3000
   
   # Mac/Linux
   nc -zv [IP_DO_SERVIDOR] 3000
   ```

4. **Verifique se a porta não está bloqueada pelo firewall** (veja `FIREWALL_CONFIG.md`)

## Diferença de IPs

- **10.0.0.55**: IP do cliente (computador que está tentando acessar)
- **IP do servidor**: IP do computador que está rodando `npm run dev`

Certifique-se de acessar usando o IP do servidor, não do cliente!
