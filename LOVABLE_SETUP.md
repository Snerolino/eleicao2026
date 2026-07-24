# Integração Lovable - Portal de Transparência Eleitoral RS 2026

## 📋 Configuração

Este repositório foi integrado com **Lovable**, uma plataforma de desenvolvimento assistido por IA.

### ✅ Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Lovable (https://lovable.dev)

### 🚀 Instalação

#### 1. Clonar o repositório
```bash
git clone https://github.com/Snerolino/eleicao2026.git
cd eleicao2026
```

#### 2. Instalar dependências
```bash
npm install
```

#### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```

Preencha as variáveis de ambiente:
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
```

#### 4. Instalar CLI do Lovable (opcional)
```bash
npm install -g @lovable/cli
lovable login
lovable link --project-id seu_project_id
```

### 🔑 Configurar Secrets do GitHub

Se usar CI/CD com Lovable:

1. Vá para: **Settings → Secrets and variables → Actions**
2. Adicione os secrets:
   - `LOVABLE_API_KEY`: Token da API Lovable
   - `LOVABLE_PROJECT_ID`: ID do projeto Lovable

### 📁 Estrutura do Projeto

```
eleicao2026/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/          # Páginas
│   ├── styles/         # CSS/Tailwind
│   ├── utils/          # Utilitários
│   └── types/          # Tipos TypeScript
├── public/             # Arquivos estáticos
├── .lovable.json       # Configuração Lovable
├── .lovablerc.json     # Runtime config
└── vite.config.ts      # Config Vite
```

### 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### 🤖 Usando Lovable para Desenvolvimento

1. **No Lovable.dev**: Crie um novo projeto e conecte este repositório
2. **Descreva as mudanças desejadas** em linguagem natural
3. **Lovable gerará código** que você pode revisar e validar
4. **Faça push das alterações** ou use o fluxo de sincronização automática

### 🔄 Sincronização com Lovable

#### Automática (com CLI)
```bash
lovable sync
```

#### Manual
1. Faça as alterações no Lovable.dev
2. Sincronize o código
3. Pull as mudanças no seu repositório local
4. Teste e faça commit

### 📚 Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **PWA**: vite-plugin-pwa
- **Dev**: TypeScript, ESLint (recomendado)

### 🐛 Troubleshooting

**Erro de tipo TypeScript?**
```bash
npm run build  # TypeScript checking
```

**Dependências faltando?**
```bash
npm install
npm install --save-dev
```

**Porta 5173 em uso?**
```bash
npm run dev -- --port 3000
```

### 📖 Recursos

- [Documentação Lovable](https://lovable.dev/docs)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)

### 💡 Boas Práticas

1. **Type Safety**: Mantenha tipos TypeScript estritos
2. **Components**: Prefira componentes funcionais com hooks
3. **Styling**: Use classes Tailwind em vez de CSS inline
4. **Database**: Use queries type-safe do Supabase
5. **Testing**: Considere adicionar testes com Vitest

### 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Faça commit das alterações: `git commit -m 'feat: descrição'`
3. Push para a branch: `git push origin feature/sua-feature`
4. Abra um Pull Request

### 📝 Licença

MIT

---

**Última atualização**: 24/07/2026
