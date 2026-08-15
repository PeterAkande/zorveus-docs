<p align="left">
  <a href="https://zorveus.com" target="_blank" rel="noopener noreferrer">
    <img src="./public/zorveus-logo.svg" alt="Zorveus Logo" height="40" />
  </a>
</p>

# Zorveus Documentation

Official developer documentation for [**Zorveus**](https://zorveus.com) — the AI wallet, billing layer, and multi-provider inference gateway for startups and application developers.


---


## 🌟 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Documentation Engine**: [Fumadocs](https://fumadocs.vercel.app/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS Tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Content**: MDX (Markdown with JSX components)

---

## 📁 Repository Structure

```tree
zorveus-docs/
├── app/                  # Next.js App Router pages & layout
│   ├── (docs)/           # Main documentation layout & dynamic slug router
│   └── globals.css       # Design tokens, typography & sidebar styling
├── components/
│   ├── context/          # Interactive KeyContext state management
│   └── mdx/              # Custom interactive MDX components
│       ├── ApiEndpoint.tsx   # Endpoint badges & method tags
│       ├── ApiRunner.tsx     # Interactive API execution tester
│       ├── CodeGroup.tsx     # Tabbed multi-language code snippets
│       ├── KeyInserter.tsx   # Dynamic key replacer for snippets
│       ├── SequenceDiagram.tsx # Interactive OAuth PKCE visualizer
│       └── Tabs.tsx          # Clean tab containers
├── content/docs/         # Markdown & MDX documentation content
│   ├── getting-started/  # Onboarding guides & quickstarts
│   ├── concepts/         # Core architectural concepts & models
│   ├── startups/         # Metering, credit grants & service keys
│   ├── oauth/            # OAuth 2.0 PKCE & connectable apps
│   ├── inference/        # Chat completions, streaming, audio, images
│   ├── providers/        # BYOK setup for OpenAI, Anthropic, Gemini, etc.
│   └── api-reference/    # Full REST API parameter and response schemas
└── public/               # Static assets & brand mark SVGs
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: `v20+` or `v22+`
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### 2. Installation

```bash
git clone https://github.com/PeterAkande/zorveus-docs.git
cd zorveus-docs
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in your console) to view the documentation.

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## 🧩 Interactive MDX Components

All MDX files support rich, interactive components out of the box:

- **`<KeyInserter type="inference" />`**: Allows users to paste their key to personalize all code snippets on the page.
- **`<CodeGroup titles={["cURL", "Python", "TypeScript"]}>`**: Multi-language code tabs with automatic clipboard copy.
- **`<SequenceDiagram flow="oauth-pkce" />`**: Interactive visualizer for step-by-step authorization flows.
- **`<ApiEndpoint method="GET" path="/..." auth="service_key" />`**: Styled HTTP method tag with auth badge.
- **`<CardGroup cols={2}>`**: Responsive navigation card grids.

---

## 📝 License

Proprietary © [Zorveus](https://zorveus.com). All rights reserved.
