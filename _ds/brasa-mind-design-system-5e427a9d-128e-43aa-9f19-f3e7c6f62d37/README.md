# Brasa Mind: convenções para construir UI

Design system do **Brasa Mind** (empreendedorismo, churrasco e network gaúcho). Identidade: fogo/brasa laranja `#F93A06`, dourado (ember), carvão morno. Importe os componentes de `@brasamind/ui` e o CSS uma vez: `import '@brasamind/ui/styles.css'`.

## Setup e temas
- **Sem provider obrigatório**: os componentes são autossuficientes.
- **Tema**: tokens vêm de CSS variables em `:root` (claro) e `.dark` (escuro). Para o modo escuro, aplique a classe `dark` num ancestral (ex.: `<html class="dark">`). Área de membros tende ao escuro; área administrativa ao claro.
- Fundo/foreground da página: `bg-background text-foreground`.

## Idioma de estilo: classes utilitárias Tailwind sobre tokens
Nunca use hex solto. Componha layout com utilitários que mapeiam nos tokens:

| Papel | Classes |
|---|---|
| Ação principal (fogo) | `bg-primary text-primary-foreground` |
| Destaque premium (dourado) | `bg-ember text-ember-foreground` |
| Superfície | `bg-card text-card-foreground`, `bg-popover` |
| Texto de apoio | `text-muted-foreground`, fundo `bg-muted` |
| Neutro / hover | `bg-secondary`, `bg-accent` |
| Bordas / foco | `border-border`, `ring-ring` |
| Status | `bg-success`, `bg-warning`, `bg-destructive`, `bg-info` (cada um com `text-*-foreground`) |

Utilitários de marca (use com parcimônia, um destaque por tela):
- `.bg-brasa`: gradiente de fogo para dourado (heróis, headers).
- `.glow-ember`: brilho de brasa no CTA principal ou no card do plano Membro.
- `.text-brasa`: texto com gradiente de fogo.

Fontes: `font-sans` (Inter, corpo/UI), `font-display` (Barlow, títulos), `font-impact` (Barlow Semi Condensed, herói/logo, já uppercase), `font-mono` (JetBrains Mono, valores e dados).

## Componentes-chave
- **Button** `variant`: `default` (fogo), `ember` (premium), `success`, `destructive`, `secondary`, `outline`, `ghost`, `link`.
- **Badge** `variant`: `ember` (selo Membro), `fire` (ofertas "40% OFF"), `success`, `warning`, `destructive`, `info` (status de pagamento).
- **Card** (com `CardHeader/Title/Description/Content/Footer`), **Table** (admin; valores em `font-mono`), **Tabs**, **Select**, **Input** (com `Label`), **Avatar**, **Separator**.
- **BrasaMindLogo** e **BrasaMindSymbol**: logo e símbolo (a chama) da marca, autossuficientes.

A verdade de cada API está em `components/<grupo>/<Nome>/<Nome>.d.ts` e o uso em `<Nome>.prompt.md`. Leia `styles.css` para as classes disponíveis.

## Voz e escrita (obrigatório em toda copy)
- Nome **"Brasa Mind"**, duas palavras. "Brasa" é o grupo, referenciado no **masculino**: "o Brasa", "do Brasa". Nunca "a Brasa".
- **Não use travessão nem a seta comum.** Prefira vírgula, dois-pontos ou parênteses; a ação vai no próprio botão ("Quero ser Membro").
- Voz ativa e direta; o botão diz o que acontece e o retorno confirma.

## Exemplo idiomático
```tsx
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, BrasaMindLogo } from '@brasamind/ui'
import '@brasamind/ui/styles.css'

function CardEvento() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Churrasco &amp; Vendas B2B</CardTitle>
          <Badge variant="ember">★ Membro</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold">R$ 180</span>
          <Badge variant="fire">40% OFF</Badge>
        </div>
        <Button className="w-full">Confirmar presença</Button>
      </CardContent>
    </Card>
  )
}
```

# BrasaMindUI (@brasamind/ui@1.0.0)

This design system is the published @brasamind/ui React library, bundled as a single
browser global. All 32 components are the real upstream code.

## Where things are

- `_ds_bundle.js` - the whole-DS bundle at the project root; loads every component to `window.BrasaMindUI`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` - the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` - CSS custom properties, names verbatim from upstream.
- `fonts/` - `@font-face` files + `fonts.css` (when the package ships fonts).

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.BrasaMindUI.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { Avatar } = window.BrasaMindUI;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<Avatar />);
```

## Tokens

86 CSS custom properties from @brasamind/ui. Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (6): `--tw-border-spacing-x`, `--tw-border-spacing-y`, `--tw-ring-offset-color`, …
- **spacing** (1): `--tw-ring-inset`
- **radius** (1): `--radius`
- **shadow** (4): `--tw-ring-offset-shadow`, `--tw-ring-shadow`, `--tw-shadow`, …
- **other** (74): `--tw-translate-x`, `--tw-translate-y`, `--tw-rotate`, …

## Components

### general
- `Avatar` - Avatar circular do membro.
- `AvatarFallback` - Fallback com iniciais, sobre gradiente de fogo.
- `AvatarImage`
- `Badge` - Selo de status ou rtulo curto.
- `BrasaMindLogo` - Lockup do Brasa Mind: smbolo + wordmark BRASA MIND (BRASA na cor do texto,
- `BrasaMindSymbol` - O smbolo do Brasa Mind: a chama no hexgono.  a assinatura da marca.
- `Button` - Boto de ao do Brasa Mind.
- `Card` - Superfcie de card: painel com borda e fundo card.
- `CardContent`
- `CardDescription`
- `CardFooter`
- `CardHeader`
- `CardTitle` - Ttulo do card (usa a famlia de display Barlow).
- `Input` - Campo de texto. Foco com anel de fogo (ring). Sempre acompanhe de um
- `Label` - Rtulo de campo de formulrio.
- `Select` - Seletor (dropdown). Ex.: escolher a modalidade de ingresso.
- `SelectContent`
- `SelectGroup`
- `SelectItem`
- `SelectTrigger`
- `SelectValue`
- `Separator` - Divisor horizontal ou vertical.
- `Table` - Tabela de dados (rea administrativa). Use valores monetrios em font-mono.
- `TableBody`
- `TableCell`
- `TableHead`
- `TableHeader`
- `TableRow`
- `Tabs` - Container de abas.
- `TabsContent`
- `TabsList`
- `TabsTrigger` - Gatilho de aba a aba ativa recebe realce de fogo.
