# Controle Melhorado

Sistema de controle de estoque, clientes e vendas. Construído com **Next.js 16**, **TypeScript** e **Tailwind CSS**.

---

## 🚀 Instalação (qualquer máquina)

```bash
# 1. Clone ou extraia o projeto
git clone <repositório> && cd controle-melhorado

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local e preencha AUTH_SECRET com uma chave aleatória:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Execute em modo de desenvolvimento
npm run dev
```

> Os arquivos `src/data/*.json` são criados **automaticamente** na primeira inicialização, caso não existam. Nenhuma configuração extra de banco de dados é necessária.

---

## 🔐 Segurança

### Variável `AUTH_SECRET`
Usada para assinar os tokens de sessão com HMAC-SHA256. **Nunca** use o valor padrão em produção. Gere uma chave segura:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Senhas
- Armazenadas com **PBKDF2** (100.000 iterações, salt aleatório)
- Senhas em texto plano existentes são migradas automaticamente no primeiro login
- O campo `password` **nunca** é retornado pelas rotas de API

### Sessão
- Cookie `auth_session` assinado com HMAC — não pode ser forjado
- Expira em **8 horas**
- Flags: `httpOnly`, `sameSite=lax`, `secure=true` em produção

### Rate Limiting
- Máximo de **10 tentativas de login** por IP em 15 minutos
- Bloqueio de **30 minutos** após exceder o limite

---

## 📁 Estrutura de Dados

Os arquivos abaixo são criados automaticamente em `src/data/` se não existirem:

| Arquivo | Descrição |
|---|---|
| `users.json` | Usuários do sistema (com senhas hasheadas) |
| `products.json` | Produtos do estoque |
| `customers.json` | Clientes |
| `sales.json` | Registro de vendas |

---

## 🖥️ Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (acessível na rede local) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |

---

## 📡 Acesso em Rede Local

O servidor já está configurado para ouvir em `0.0.0.0`, tornando-o acessível por outros dispositivos na rede. Descubra seu IP local e acesse `http://<SEU_IP>:3000` de qualquer dispositivo na mesma rede.
