## ⚙️ Como rodar o projeto

### 📌 Pré-requisitos

Antes de começar, você precisa ter instalado:

* **Node.js** (recomendado versão LTS)
* **npm** ou yarn
* **Expo CLI** (`npm install -g expo-cli`)
* **EAS CLI** (`npm install -g eas-cli`) - para builds nativos
* **Java JDK** (versão 11 ou superior) - para build de APK
* **Android SDK** - para emular Android

---

### 📦 Instalação de dependências

```bash
# Clonar o repositório
git clone https://github.com/TW-TECH-SP2/InfraCow-Mobile.git
# Entrar na pasta
cd InfraCow-Mobile

# Instalar todas as dependências (npm install é suficiente)
npm install
```

> ✅ O `npm install` instala automaticamente todas as dependências, incluindo os módulos nativos do React Native.

---

### 🔐 Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```
API_URL=http://localhost:3000
```

---

### 📱 Executando o app

Este projeto utiliza módulos nativos avançados (como animações otimizadas, gestos e componentes de data picker) que requerem uma build nativa completa. Por isso, oferecemos **duas opções de execução**:

---

#### **Opção 1: Executar via Web (Recomendado para desenvolvimento)**

```bash
# Inicie o servidor Expo
npx expo start
```

Na interface que aparecer, pressione:
- **`w`** para abrir a versão **web no navegador** (localhost)
- A aplicação abrirá em `http://localhost:19006` (ou similar)

**Vantagens:**
- Recarregamento instantâneo (hot reload)
- Desenvolvimento rápido e iterativo
- Acessa via navegador em qualquer dispositivo

---

#### **Opção 2: Build de APK (Para testes nativos completos)**

Se precisar testar funcionalidades específicas do Android ou preparar para distribuição:

```bash
# Fazer build do APK via EAS
eas build -p android --profile preview

# Aguarde a conclusão (pode levar alguns minutos)
# O APK será salvo no seu perfil EAS
```

Após a build:
1. Baixe o APK gerado
2. Transfira para seu dispositivo Android
3. Abra o arquivo `.apk` e instale

**Por que não usar o Expo Go?**

O Expo Go é uma ferramenta de desenvolvimento rápida, mas não suporta alguns módulos nativos avançados que este projeto utiliza:
- `react-native-reanimated` (animações performáticas)
- `react-native-gesture-handler` (detecção avançada de gestos)
- `react-native-datetimepicker` (data picker nativo)

Para compatibilidade total com essas dependências, é necessário fazer uma build nativa completa.

---

### 📋 Dependências principais

Este projeto utiliza:

* **React Native** (via Expo SDK 55)
* **React Navigation** - navegação robusta
* **Axios** - requisições HTTP
* **NetInfo** - detecção de conexão
* **React Native Reanimated** - animações de alta performance
* **React Native Gesture Handler** - gestos avançados
* **Expo Image Picker** - seleção de imagens
* **React Native Chart Kit** - gráficos de dados
* **React DOM** - suporte para web

---

### 🎯 Resumo dos comandos

| Comando | Descrição |
|---------|-----------|
| `npm install` | Instala todas as dependências |
| `npx expo start` | Inicia o servidor (pressione `w` para web) |
| `eas build -p android --profile preview` | Gera APK para teste |
| `eas build -p android --profile production` | Gera APK para produção |

---

## 🚀 DevOps / CI-CD

### Rodando o servidor Expo com Docker

```bash
docker compose up --build        # equivale a `npx expo start`, sem instalar nada local
```

- Web: http://localhost:8081
- Por padrão o app aponta para a API do Render (igual ao `app.json`). Para outra API:
  `API_URL=http://SEU_IP:3000 docker compose up`  (ou `API_URL=...` no `.env`, como descrito acima).
- Celular físico (dev client/APK): informe o IP da sua máquina, `HOST_LAN_IP=192.168.x.x docker compose up`.

Para subir **API + banco + mobile** de uma vez, use o `docker-compose.yml` da raiz do repositório.

> A URL da API é resolvida em `app.config.js`: se `API_URL` estiver definida ela vale; senão vale `extra.API_URL` do `app.json` (comportamento original).

### Pipelines (workflows na raiz do repositório)

| Workflow | Quando | O que faz |
|----------|--------|-----------|
| `CI/CD - Mobile` (`mobile-ci.yml`) | PR e main (mudanças em `InfraCow-Mobile/`) | `npm ci`, valida `app.config.js`, `tsc` e `expo-doctor` (informativos), **bundle Android** (bloqueante), build da imagem Docker + Metro no container |
| ↳ job `eas-update` | main / manual | publica **atualização OTA** no canal `production` (ou `preview`) com `eas update` |
| `Mobile - EAS Build` (`mobile-eas-build.yml`) | manual ou tag `mobile-v*` | gera APK/AAB nativo no EAS (perfil `preview`/`production`/`development`) |

**Secret** obrigatório para publicar: `EXPO_TOKEN` (expo.dev → Account → Access Tokens).
**Variable** opcional: `API_URL` (URL da API embutida no bundle; sem ela vale o `app.json`).

> OTA só entrega mudanças de JS/TS a builds com o mesmo `runtimeVersion` (hoje `1.0.0`). O modo offline usa `expo-sqlite` e `netinfo` (nativos): confirme que o APK instalado já os contém ou gere um novo build (`Mobile - EAS Build`) e incremente o `runtimeVersion` antes de publicar OTA.
> Na **web** o `expo-sqlite` exige wasm + COOP/COEP; o fluxo validado é celular/dev client.
