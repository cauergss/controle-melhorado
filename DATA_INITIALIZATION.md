# Sistema de Inicialização Automática de Dados JSON

## 📋 Visão Geral

O sistema agora cria automaticamente os arquivos JSON necessários caso eles não existam. Isso evita erros de "arquivo não encontrado" na primeira execução da aplicação.

## 🚀 Como Funciona

### 1. **Inicialização Automática na Primeira Renderização**
   - Quando a aplicação é carregada, o componente `DataInitializer` chama a rota `/api/init`
   - A rota executa `initializeDataFiles()` que verifica se os arquivos existem
   - Se não existirem, cria os arquivos com dados padrão (templates)

### 2. **Garantia de Existência em Toda Leitura/Escrita**
   - As funções `readData()` e `writeData()` em `src/lib/store.ts` chamam `ensureDataFileExists()`
   - Isso garante que o arquivo existe antes de qualquer operação

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
- **`src/lib/initializeData.ts`** - Define templates e funções de inicialização
- **`src/components/DataInitializer.tsx`** - Componente que inicializa na primeira renderização
- **`src/app/api/init/route.ts`** - Endpoint para inicializar dados

### Arquivos Modificados:
- **`src/lib/store.ts`** - Integra sistema de inicialização
- **`src/app/layout.tsx`** - Adiciona componente DataInitializer
- **`src/app/api/sales/route.ts`** - Usa readData/writeData

## 📊 Estrutura dos Templates Padrão

### `users.json`
```json
[
  {
    "id": "admin-default",
    "name": "Administrador",
    "email": "admin@system.local",
    "password": "admin123",
    "role": "admin"
  }
]
```

### `products.json`
```json
[
  {
    "id": "p-default-1",
    "name": "Produto Exemplo",
    "quantity": 10,
    "cost": 50,
    "image": "https://via.placeholder.com/150"
  }
]
```

### `customers.json`
```json
[]
```

### `sales.json`
```json
[]
```

## 🔧 Personalizando Templates

Para mudar os dados padrão, edite `src/lib/initializeData.ts`:

```typescript
const defaultTemplates: Record<DataType, any[]> = {
  users: [
    {
      id: "seu-id",
      name: "Seu Nome",
      email: "seu-email@example.com",
      password: "senha",
      role: "admin",
    },
  ],
  // ... outros templates
};
```

## 🔄 Endpoints Disponíveis

### Inicializar Dados Manualmente
```bash
GET /api/init
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Arquivos de dados inicializados com sucesso"
}
```

## ✨ Benefícios

✅ Não há mais erro sobre arquivos não encontrados  
✅ Aplicação sempre começa com estrutura de dados válida  
✅ Dados padrão (admin) disponibilizados automaticamente  
✅ Fácil de personalizar os dados iniciais  
✅ Sistema funciona tanto no primeiro launch como em restaurações  

## 📝 Logs do Sistema

Quando os arquivos são criados, você verá logs no console:
```
✓ Arquivo criado: users.json
✓ Arquivo criado: products.json
✓ Arquivo criado: customers.json
✓ Arquivo criado: sales.json
✓ Sistema de dados inicializado
```

## 🚨 Troubleshooting

### Arquivos não são criados
1. Verifique permissões de escrita na pasta `src/data/`
2. Confirme que o middleware não está bloqueando `/api/init`
3. Veja os erros no console do servidor

### Quer resetar dados padrão
1. Delete os arquivos em `src/data/`
2. Recarregue a aplicação
3. Os arquivos serão recriados com templates padrão
