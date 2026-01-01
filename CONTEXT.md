# Gemini Design MCP - Contexte Complet

## Vue d'ensemble

**gemini-design-mcp** est un serveur MCP (Model Context Protocol) qui permet à des agents IA comme Claude, Cursor, ou Codex de générer du code frontend avec un design premium en utilisant Gemini 3 Flash.

Le MCP est publié sur npm : `gemini-design-mcp@3.2.2`

---

## Le problème qu'on résout

Quand on demande à Claude ou un autre agent de créer du frontend, le design est souvent :
- Basique et générique
- Sans cohérence visuelle
- Avec des wireframes vides au lieu de vraies interfaces

**Notre solution** : Déléguer la partie DESIGN à Gemini 3 Flash qui excelle dans la création d'interfaces visuellement riches et premium.

---

## Architecture actuelle

```
┌─────────────────────────────────────────────────────────────────┐
│  Agent (Claude Code, Cursor, Codex)                             │
│                                                                 │
│  L'agent gère :                                                 │
│  - La logique (useState, handlers, conditions)                  │
│  - La structure du projet                                       │
│  - L'analyse du codebase                                        │
│  - La sélection de vibe (génère les options lui-même)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Appelle le MCP pour le DESIGN
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  gemini-design-mcp                                              │
│                                                                 │
│  3 Tools :                                                      │
│  - create_frontend : Créer un nouveau fichier complet           │
│  - modify_frontend : Modifier le design d'un élément existant   │
│  - snippet_frontend : Générer un composant UI à insérer         │
│                                                                 │
│  Config Gemini :                                                │
│  - Model : gemini-3-flash-preview                               │
│  - Temperature : 1 (défaut Google)                              │
│  - ThinkingLevel : LOW (rapide)                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Call avec la clé Gemini de l'user
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Google Gemini API                                              │
│  - Génère le code frontend avec design premium                  │
│  - Retourne le code prêt à utiliser                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Les 3 Tools

### 1. `create_frontend`

**But** : Créer un NOUVEAU fichier complet (page, composant, layout)

**Paramètres** :
- `request` : Description de ce qu'on veut créer
- `filePath` : Chemin du fichier à créer
- `techStack` : Stack technique (React + Tailwind, Next.js, Vue, etc.)
- `context` : Code existant pour cohérence de design (optionnel)
- `designSystem.vibe` : La vibe sélectionnée (nom, description, keywords)

**Output** : Fichier complet avec imports, exports, prêt à sauvegarder

**Flow obligatoire avant d'appeler** :
1. Vérifier l'état du projet (repo vide ? projet initialisé ?)
2. Si nouveau projet sans design → Vibe Selection obligatoire
3. Si projet existant → Passer le contexte pour cohérence

### 2. `modify_frontend`

**But** : Modifier le DESIGN d'un élément existant (pas la logique)

**Paramètres** :
- `modification` : La modification de design à faire
- `targetCode` : Le code de l'élément à modifier
- `filePath` : Chemin du fichier
- `context` : Contexte additionnel (optionnel)

**Output** : Format find/replace
```
// NEW IMPORTS NEEDED:
import { X } from "y";

// FIND THIS CODE:
<code existant exact>

// REPLACE WITH:
<nouveau code redesigné>
```

**Règle importante** : UNE seule modification par appel. Pour plusieurs modifications → plusieurs appels en parallèle.

**Quand l'utiliser** :
- "La sidebar est moche, redesign-la" ✅
- "Rends la sidebar collapsible" ❌ (c'est de la logique, l'agent fait lui-même)

### 3. `snippet_frontend`

**But** : Générer un composant UI à INSÉRER dans un fichier existant

**Paramètres** :
- `request` : Ce qu'on veut générer
- `targetFile` : Le fichier où ça sera inséré
- `techStack` : Stack technique
- `insertionContext` : Description de où/comment insérer + style existant
- `context` : Fichiers de référence (optionnel)

**Output** :
```
// NEW IMPORTS NEEDED:
import { Search } from "lucide-react";

// SNIPPET:
<div className="...">
  ...
</div>
```

**Séparation des responsabilités** :
- L'AGENT ajoute la logique (useState, handlers) lui-même
- GEMINI génère le JSX/HTML avec design premium

**Exemple** :
```
User: "Ajoute un search dropdown avec résultats"

Agent fait lui-même :
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

Agent appelle snippet_frontend pour :
  Le JSX du dropdown avec design premium
```

---

## Le système de Vibe Selection

Quand un projet n'a pas encore de design system, l'agent DOIT faire une sélection de vibe avant d'appeler `create_frontend`.

**L'agent génère 5 vibes** avec des descriptions riches (2-3 phrases évocatrices) :

```
🏛️ "Pristine Museum"
An ultra-clean, 'white-cube' aesthetic focused on vast negative space and
absolute stillness. Content displayed like art in a modern gallery.
Minimal chrome, maximum breathing room, typography as sculpture.

⚡ "Technical Precision"
A layout-driven vibe emphasizing the grid and intentional structure.
Sharp edges, monospace accents, blueprint energy. Feels slightly
'under construction' in a cool, architectural way.

🌊 "Fluid & Organic"
Soft curves, flowing gradients, and natural movement throughout.
Like water or silk, everything feels smooth and interconnected.
Calming yet sophisticated, with gentle animations.

🔥 "Bold & Unapologetic"
High contrast, oversized typography, dramatic color blocks.
Demands attention and makes a statement. Not for the faint of heart.
Strong visual hierarchy, impactful first impressions.

🌙 "Dark Luxe"
Deep, rich darks with subtle metallic or jewel-tone accents.
Premium feel, like a high-end app at night. Sophisticated shadows,
glowing highlights, and refined micro-interactions.
```

L'utilisateur choisit, et la vibe est passée à `create_frontend` via `designSystem.vibe`.

---

## Configuration technique

### Modèle
- `gemini-3-flash-preview` : Le meilleur pour le design, rapide, bon marché

### Paramètres
- `temperature: 1` : Valeur par défaut de Google (changer peut causer des bugs)
- `thinkingLevel: LOW` : Rapide, le design ne nécessite pas de deep thinking

### Clé API
Actuellement, l'utilisateur doit fournir sa propre clé API Gemini via la variable d'environnement `API_KEY`.

---

## Installation actuelle

### Claude Code / Codex
```bash
claude mcp add gemini-design-mcp --env API_KEY=xxx -- npx -y gemini-design-mcp@latest
```

### Cursor (JSON)
```json
{
  "mcpServers": {
    "gemini-design-mcp": {
      "command": "npx",
      "args": ["-y", "gemini-design-mcp@latest"],
      "env": {
        "API_KEY": "xxx"
      }
    }
  }
}
```

---

## Ce qu'on veut créer : Le SaaS

### Problème actuel
- L'utilisateur doit avoir sa propre clé API Gemini
- Pas de tracking de consommation
- Pas de monétisation possible

### Solution : Un service hosted

#### Landing Page
- Expliquer ce que fait le MCP
- Démo visuelle (avant/après)
- Pricing
- Témoignages / exemples de designs générés

#### Auth
- Signup/Login
- Dashboard utilisateur

#### Système d'API Keys
- L'utilisateur crée une API key sur le dashboard (format : `gd_xxxxxxxx`)
- Cette clé est utilisée à la place de la clé Gemini

#### API Proxy
```
User configure le MCP avec sa clé gd_xxxxx
      │
      ▼
MCP appelle notre proxy : https://api.gemini-design.com/generate
      │
      ▼
Notre proxy :
  1. Vérifie que gd_xxxxx est valide
  2. Vérifie le quota/solde de l'utilisateur
  3. Forward la requête à Gemini avec NOTRE clé API
  4. Log la consommation
  5. Retourne la réponse à l'utilisateur
```

#### Billing
- Système de crédits ou abonnement

#### Dashboard
- Voir sa consommation
- Gérer ses API keys
- Historique des générations (optionnel)

---

## Modifications nécessaires dans le MCP

Pour supporter le mode hosted, le MCP devra détecter le type de clé :

```typescript
if (apiKey.startsWith("gd_")) {
  // Appelle notre proxy
  endpoint = "https://api.gemini-design.com/v1/generate";
} else {
  // Appelle Gemini direct (comportement actuel)
}
```

---

## Résumé

**gemini-design-mcp** = MCP qui permet aux agents IA de générer du frontend avec un design premium via Gemini 3 Flash.

**Le SaaS** = Un service qui permet aux utilisateurs d'utiliser le MCP sans avoir leur propre clé Gemini, avec un système de billing et de tracking de consommation.
