# Nereo — personal digital space

A static personal website for web experiments, AI exploration, and side projects.
Built with semantic HTML, CSS, and vanilla JavaScript. No dependencies, external
fonts, framework, installation, or build step.

## Preview

Open `index.html` directly, or serve this directory with:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8765.

## Files

- `index.html`: homepage, sandbox notes, about, and contact.
- `style.css`: shared design tokens, layout, themes, and responsive rules.
- `script.js`: optional theme persistence, Frankfurt time, orbital study.
- `space-game.html`, `game.css`, `game.js`: standalone Canvas game.
- `impressum.html`: existing legal content with the shared site layout.
- `assets/images/Skulli.png`: original favicon and signature.

Homepage content, navigation, and experiment disclosures work without JavaScript.
The orbital control, theme switch, clock, and game require JavaScript. The theme
and personal best score are stored locally when browser storage is available.
Reduced-motion preferences disable the orbital introduction and smooth scrolling.

Edit CSS custom properties in `:root` and `[data-theme=dark]` to change the palette.
