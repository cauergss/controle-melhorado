# Scripts de Verificação e Configuração de Firewall

## Windows Firewall - Permitir Porta 3000

Se você não conseguir acessar via rede, execute este comando no PowerShell como **Administrador**:

```powershell
# Permitir Node.js na porta 3000
netsh advfirewall firewall add rule name="Node.js port 3000" dir=in action=allow protocol=tcp localport=3000

# Verificar se a regra foi adicionada
netsh advfirewall firewall show rule name="Node.js port 3000"
```

### Via GUI (Graphical User Interface)

1. Abra **Windows Defender Firewall** (ou seu firewall)
2. Clique em **Permitir um aplicativo através do firewall**
3. Clique em **Alterar configurações** (se necessário)
4. Clique em **Permitir outro aplicativo**
5. Navegue até sua instalação do Node.js e selecione `node.exe`
6. Clique em **Adicionar**

## Linux/Mac - UFW (Uncomplicated Firewall)

```bash
# Permitir porta 3000
sudo ufw allow 3000/tcp

# Verificar status
sudo ufw status
```

## Teste de Conectividade

### Windows (PowerShell)

```powershell
# Testar conexão com seu IP local
$IP = (Get-NetIPConfiguration | Where-Object {$_.IPv4DefaultGateway -ne $null} | Select-Object -ExpandProperty IPv4Address).IPAddress
Test-NetConnection -ComputerName $IP -Port 3000
```

### Linux/Mac

```bash
# Obter seu IP
ifconfig | grep "inet "

# Testar conexão (substitua 192.168.1.100 com seu IP)
nc -zv 192.168.1.100 3000
```

## Solução de Problemas

### "Connection refused"
- O servidor não está rodando, execute `npm run dev`
- A porta pode estar ocupada, mude a porta em `package.json`

### "Connection timeout"
- Firewall está bloqueando a porta
- Os computadores não estão na mesma rede
- IP está incorreto

### "Host unreachable"
- Verifique se ambos os computadores estão conectados à mesma rede
- Tente fazer ping: `ping 192.168.1.100` (Windows) ou `ping -c 4 192.168.1.100` (Mac/Linux)
