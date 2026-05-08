# Quote Vault

Steve Gatena's curated collection of **12,000+ quotes** across 15 themes — Faith & Prayer, Wisdom, Self-Mastery, Leadership, Business, Wealth, Action, Discipline, Relationships, Resilience, Communication, Creativity, Courage, Character, Family.

Built with React + Vite, deployed on Vercel.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

The static site is output to `dist/`.

## Project layout

```
quote-vault/
├── index.html          # entry HTML
├── src/
│   ├── main.jsx        # React mount point
│   └── App.jsx         # the entire vault component (UI + quotes data)
├── package.json
└── vite.config.js
```

The full quote data lives inline in `src/App.jsx` as a `QUOTES` array of `{q, t}` objects (`q` = quote text, `t` = theme).
