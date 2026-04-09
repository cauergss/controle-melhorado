# Acesso via Rede

## Como Acessar o Projeto em Outros Computadores da Rede

O projeto foi configurado para ser acessível em qualquer computador da rede local usando o endereço IP da máquina host.

### Passos para Acessar:

#### 1. **Descobrir o IP Local do Host**

No computador que está rodando o servidor, execute um dos seguintes comandos:

**Windows (PowerShell):**
```powershell
ipconfig
```
Procure por "IPv4 Address" na seção da sua rede ativa.

**Linux/Mac:**
```bash
ifconfig
# ou
hostname -I
```

Exemplo de IP: `192.168.1.100`

#### 2. **Iniciar o Servidor em Desenvolvimento**

No computador host, execute:
```bash
npm run dev
```

O servidor estará disponível em:
- **Local:** `http://localhost:3000`
- **Rede local:** `http://192.168.1.100:3000` (substitua com seu IP real)

#### 3. **Acessar de Outro Computador**

Em qualquer outro computador da rede, abra o navegador e acesse:
```
http://[IP_DO_HOST]:3000
```

Exemplo:
```
http://192.168.1.100:3000
```

### Produção

Para fazer build e rodar em produção na rede:

```bash
npm run build
npm start
```

O servidor estará disponível na mesma forma que no desenvolvimento.

### Verificação de Conectividade

Para verificar se o servidor está respondendo na rede:

**Windows (PowerShell):**
```powershell
Test-NetConnection -ComputerName 192.168.1.100 -Port 3000
```

**Linux/Mac:**
```bash
nc -zv 192.168.1.100 3000
```

### Troubleshooting

#### Não consegue conectar pelo IP?

1. **Firewall:** Verifique se o Windows Firewall (ou outro firewall) está bloqueando a porta 3000
   - Windows: Permita o Node.js/npm através do Firewall
   - Linux: `sudo ufw allow 3000`

2. **IP Diferente:** Certifique-se de que está usando o IP correto
   - O IP pode mudar se você reiniciar o roteador
   - Use sempre o IP mostrado em `ipconfig` ou `ifconfig`

3. **Mesma Rede:** Ambos os computadores devem estar na mesma rede (WiFi ou Ethernet)

4. **Porta Ocupada:** Se a porta 3000 já está em uso, você pode especificar outra porta:
   - Edite `package.json` e altere `-p 3000` para `-p 3001` (ou outra porta)
