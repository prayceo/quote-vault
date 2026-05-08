import { useState, useMemo, useCallback, useRef, useEffect } from "react";

const GLOBAL_CSS = `
      :root {
        --bg: #FFFFFF;
        --bg-secondary: #F5F5F7;
        --bg-tertiary: #FBFBFD;
        --text-primary: #1D1D1F;
        --text-secondary: #6E6E73;
        --text-tertiary: #86868B;
        --text-quaternary: #AEAEB2;
        --border: rgba(0,0,0,0.06);
        --border-strong: rgba(0,0,0,0.1);
        --card-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
        --card-hover: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
        --blue: #007AFF;
        --font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
        --mono: "SF Mono", SFMono-Regular, ui-monospace, Menlo, monospace;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
      html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      body { background: var(--bg-secondary); font-family: var(--font); color: var(--text-primary); }
      /* Show copy hint on touch devices since :hover never fires */
      @media (hover: none) { .quote-copy { opacity: 1 !important; } }

      .app-root { min-height: 100vh; }

      .app-header {
        position: sticky; top: 0; z-index: 100;
        background: rgba(251,251,253,0.72);
        backdrop-filter: saturate(180%) blur(20px);
        -webkit-backdrop-filter: saturate(180%) blur(20px);
        border-bottom: 0.5px solid var(--border-strong);
      }
      .header-inner { max-width: 980px; margin: 0 auto; padding: 20px 24px 16px; }
      .header-top { display: flex; justify-content: space-between; align-items: flex-start; }

      .app-title {
        font-size: 34px; font-weight: 700; letter-spacing: -0.015em;
        color: var(--text-primary); line-height: 1.12;
      }
      .app-subtitle {
        font-size: 15px; color: var(--text-secondary);
        margin-top: 4px; font-weight: 400; letter-spacing: -0.01em;
      }

      .random-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 16px; border-radius: 980px;
        background: var(--blue); color: #fff;
        border: none; font-size: 15px; font-weight: 500;
        font-family: var(--font); cursor: pointer;
        transition: all 0.2s ease; letter-spacing: -0.01em;
      }
      .random-btn:hover { filter: brightness(1.08); transform: scale(1.02); }
      .random-btn:active { transform: scale(0.97); }

      .random-panel {
        margin-top: 16px; padding: 20px;
        background: var(--bg);
        border-radius: 16px;
        border: 0.5px solid var(--border-strong);
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        animation: panelIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes panelIn {
        from { opacity: 0; transform: translateY(-8px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .random-panel-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 12px;
      }
      .random-panel-badge {
        font-size: 13px; font-weight: 600; letter-spacing: -0.01em;
        padding: 3px 10px; border-radius: 980px;
      }
      .close-btn {
        width: 28px; height: 28px; border-radius: 50%;
        background: var(--bg-secondary); border: none;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: var(--text-tertiary);
        transition: all 0.15s ease;
      }
      .close-btn:hover { background: #E8E8ED; color: var(--text-primary); }

      .random-quote-text {
        font-size: 22px; font-weight: 600; line-height: 1.35;
        letter-spacing: -0.02em; color: var(--text-primary);
      }

      .insight-container {
        margin-top: 16px; padding-top: 16px;
        border-top: 0.5px solid var(--border);
        max-height: 60vh; overflow-y: auto;
        overscroll-behavior: contain;
      }
      .loading-row {
        display: flex; align-items: center; gap: 10px;
        color: var(--text-tertiary); font-size: 14px;
      }
      .spinner {
        width: 16px; height: 16px;
        border: 2px solid var(--border-strong);
        border-top: 2px solid var(--blue);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      .insight-content { font-size: 15px; line-height: 1.55; color: var(--text-secondary); }
      .insight-section { margin-bottom: 14px; }
      .insight-section:last-child { margin-bottom: 0; }
      .insight-label {
        font-size: 12px; font-weight: 600; letter-spacing: 0.02em;
        text-transform: uppercase; margin-bottom: 3px;
        font-family: var(--font);
      }
      .insight-text { color: var(--text-primary); font-weight: 400; }
      .script-section {
        margin-top: 18px; padding: 16px; border-radius: 12px;
        background: rgba(175,82,222,0.06);
        border: 1px solid rgba(175,82,222,0.15);
        position: relative;
      }
      .script-text {
        font-size: 14px; line-height: 1.75; white-space: pre-line;
      }
      .caption-section {
        margin-top: 12px; padding: 16px; border-radius: 12px;
        background: rgba(255,45,85,0.06);
        border: 1px solid rgba(255,45,85,0.15);
        position: relative;
      }
      .caption-text {
        font-size: 14px; line-height: 1.65; white-space: pre-line;
      }
      .section-copy-btn {
        position: absolute; top: 12px; right: 12px;
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 10px; border-radius: 6px;
        background: rgba(0,0,0,0.05); border: none;
        font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
        text-transform: uppercase; color: #8E8E93;
        font-family: var(--font); cursor: pointer;
        transition: all 0.15s ease;
      }
      .section-copy-btn:hover { background: rgba(0,0,0,0.1); color: #1D1D1F; }
      .section-copy-btn.copied-section { color: #34C759; }

      .section-actions {
        display: flex; gap: 8px; margin-top: 16px; padding-top: 16px;
        border-top: 1px solid rgba(0,0,0,0.06);
      }
      .section-action-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 14px; border-radius: 8px;
        background: #F2F2F7; border: none;
        font-size: 13px; font-weight: 600; color: #1D1D1F;
        font-family: var(--font); cursor: pointer;
        transition: all 0.15s ease;
      }
      .section-action-btn:hover { background: #E5E5EA; }
      .section-action-btn.copied-green { color: #34C759; }

      .search-wrapper { position: relative; margin-top: 16px; }
      .search-icon {
        position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
        color: var(--text-quaternary); pointer-events: none;
      }
      .search-input {
        width: 100%; padding: 10px 40px 10px 38px;
        background: rgba(142,142,147,0.12);
        border: none; border-radius: 12px;
        font-size: 17px; font-family: var(--font);
        color: var(--text-primary); outline: none;
        transition: all 0.2s ease; letter-spacing: -0.01em;
      }
      .search-input::placeholder { color: var(--text-quaternary); }
      .search-input:focus {
        background: rgba(142,142,147,0.18);
        box-shadow: 0 0 0 4px rgba(0,122,255,0.15);
      }
      .search-clear {
        position: absolute; right: 36px; top: 50%; transform: translateY(-50%);
        background: none; border: none; cursor: pointer;
        display: flex; align-items: center; padding: 2px;
      }
      .search-hint {
        position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
        font-size: 13px; font-family: var(--mono);
        color: var(--text-quaternary);
        background: rgba(142,142,147,0.12);
        padding: 1px 7px; border-radius: 5px;
        pointer-events: none;
      }

      .theme-scroll {
        display: flex; flex-wrap: wrap; gap: 6px;
        margin-top: 14px; padding-bottom: 2px;
      }
      .theme-pill {
        padding: 6px 14px; border-radius: 980px;
        font-size: 14px; font-weight: 500;
        font-family: var(--font); letter-spacing: -0.01em;
        background: rgba(142,142,147,0.12);
        color: var(--text-secondary);
        border: none; cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex; align-items: center; gap: 5px;
      }
      .theme-pill:hover { background: rgba(142,142,147,0.2); }
      .theme-pill.active {
        background: var(--pill-color, var(--blue));
        color: #fff;
      }
      .pill-count {
        font-size: 12px; font-weight: 400; opacity: 0.7;
        font-family: var(--mono);
      }

      .main-content { max-width: 980px; margin: 0 auto; padding: 12px 24px 60px; }
      .results-count {
        font-size: 13px; color: var(--text-tertiary);
        font-family: var(--mono); padding: 8px 0 12px;
      }

      .quote-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 10px;
      }
      .quote-card {
        background: var(--bg);
        border-radius: 14px;
        padding: 18px 20px;
        cursor: pointer;
        box-shadow: var(--card-shadow);
        border: 0.5px solid var(--border);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex; flex-direction: column; justify-content: space-between;
      }
      .quote-card:hover {
        box-shadow: var(--card-hover);
        transform: translateY(-2px);
      }
      .quote-card:active { transform: scale(0.985); }

      .quote-text {
        font-size: 15px; line-height: 1.55; letter-spacing: -0.01em;
        color: var(--text-primary); font-weight: 400;
      }
      .quote-footer {
        display: flex; justify-content: space-between; align-items: center;
        margin-top: 14px; padding-top: 12px;
        border-top: 0.5px solid var(--border);
      }
      .quote-theme {
        font-size: 12px; font-weight: 600;
        letter-spacing: -0.01em;
      }
      .quote-copy {
        font-size: 12px; font-weight: 500;
        color: var(--text-quaternary);
        opacity: 0; transition: all 0.2s ease;
        display: inline-flex; align-items: center; gap: 4px;
      }
      .quote-card:hover .quote-copy { opacity: 1; }
      .quote-copy.copied { opacity: 1; color: #34C759; }

      .empty-state {
        text-align: center; padding: 80px 24px;
        display: flex; flex-direction: column; align-items: center; gap: 8px;
      }
      .empty-title { font-size: 22px; font-weight: 600; color: var(--text-primary); margin-top: 8px; }
      .empty-subtitle { font-size: 15px; color: var(--text-secondary); }
      .empty-btn {
        margin-top: 12px; padding: 10px 20px;
        background: var(--blue); color: #fff;
        border: none; border-radius: 980px;
        font-size: 15px; font-weight: 500;
        font-family: var(--font); cursor: pointer;
        transition: all 0.2s ease;
      }
      .empty-btn:hover { filter: brightness(1.08); }

      /* ── Modal Overlay ── */
      .modal-overlay {
        position: fixed; inset: 0; z-index: 1000;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        display: flex; align-items: flex-start; justify-content: center;
        padding: 60px 16px 40px;
        animation: fadeIn 0.2s ease;
        overflow-y: auto;
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .modal-panel {
        background: #fff;
        border-radius: 16px;
        max-width: 600px; width: 100%;
        max-height: calc(100vh - 100px);
        overflow-y: auto;
        padding: 24px;
        box-shadow: 0 24px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06);
        animation: slideUp 0.25s ease;
      }
      .modal-panel-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 16px;
      }
      .modal-copy-btn {
        display: flex; align-items: center; gap: 5px;
        padding: 6px 12px;
        background: #F2F2F7; border: none; border-radius: 8px;
        font-size: 13px; font-weight: 500; color: #1D1D1F;
        font-family: var(--font); cursor: pointer;
        transition: all 0.15s ease;
      }
      .modal-copy-btn:hover { background: #E5E5EA; }
      .modal-close-btn {
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        background: #F2F2F7; border: none; border-radius: 50%;
        color: #8E8E93; cursor: pointer;
        transition: all 0.15s ease;
      }
      .modal-close-btn:hover { background: #E5E5EA; color: #1D1D1F; }


      /* ── Responsive ── */
      @media (max-width: 600px) {
        .header-inner {
          padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) 12px max(16px, env(safe-area-inset-left));
        }
        .app-title { font-size: 28px; }
        .main-content {
          padding: 8px max(16px, env(safe-area-inset-right)) max(40px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
        }
        .quote-grid { grid-template-columns: 1fr; }
        .random-quote-text { font-size: 19px; }
        .modal-overlay { padding: 20px 12px max(40px, env(safe-area-inset-bottom)) 12px; }
        .modal-panel { padding: 20px; max-height: calc(100dvh - 40px); }
        /* Bigger touch targets on mobile (≥44px is Apple's HIG) */
        .theme-pill { padding: 10px 14px; font-size: 15px; }
        .random-btn { padding: 10px 18px; }
        /* Slightly less aggressive press effect */
        .quote-card:active { transform: scale(0.99); }
        /* Search hint badge looks weird on mobile (uses keyboard-only "/") */
        .search-hint { display: none; }
      }
`;


const THEMES = {
  "Leadership": "👑",
  "Faith & Prayer": "🙏",
  "Discipline": "⚡",
  "Business": "📈",
  "Wealth": "💰",
  "Self-Mastery": "🧠",
  "Relationships": "🤝",
  "Wisdom": "📚",
  "Creativity": "🎨",
  "Character": "🛡️",
  "Communication": "📣",
  "Resilience": "🔥",
  "Action": "🎯",
  "Family": "🏠",
  "Courage": "⚔️",
};

// QUOTES are loaded asynchronously from ./quotes.js (see useEffect inside App).


const PAGE_SIZE = 200;

function App() {
  const [search, setSearch] = useState("");
  const [activeTheme, setActiveTheme] = useState("All");
  const [copied, setCopied] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);
  const [randomQuote, setRandomQuote] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [quotes, setQuotes] = useState(null); // null = still loading
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const searchRef = useRef(null);
  const sentinelRef = useRef(null);

  // Lazy-load the big QUOTES array after first paint so the UI shell ships fast.
  useEffect(() => {
    let cancelled = false;
    import('./quotes.js').then(m => {
      if (!cancelled) setQuotes(m.QUOTES);
    });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!quotes) return [];
    let results = quotes;
    if (activeTheme !== "All") results = results.filter(q => q.t === activeTheme);
    if (search.trim()) {
      const lower = search.toLowerCase();
      results = results.filter(q => q.q.toLowerCase().includes(lower));
    }
    return results;
  }, [search, activeTheme, quotes]);

  const themeCounts = useMemo(() => {
    if (!quotes) return { All: 0 };
    const counts = { All: quotes.length };
    quotes.forEach(q => { counts[q.t] = (counts[q.t] || 0) + 1; });
    return counts;
  }, [quotes]);

  // Reset render cap when filter or search changes
  useEffect(() => { setDisplayCount(PAGE_SIZE); }, [search, activeTheme]);

  // Auto-load more when the sentinel scrolls into view
  useEffect(() => {
    if (!sentinelRef.current || displayCount >= filtered.length) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setDisplayCount(c => Math.min(c + PAGE_SIZE, filtered.length));
      }
    }, { rootMargin: '600px' });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [filtered.length, displayCount]);

  const copyQuote = useCallback((text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const themeColor = (theme) => ({
    "Leadership": "#007AFF",
    "Faith & Prayer": "#AF52DE",
    "Discipline": "#FF2D55",
    "Business": "#34C759",
    "Wealth": "#FF9500",
    "Self-Mastery": "#5856D6",
    "Relationships": "#FF2D55",
    "Wisdom": "#5AC8FA",
    "Creativity": "#FF9500",
    "Character": "#34C759",
    "Communication": "#007AFF",
    "Resilience": "#FF3B30",
    "Action": "#34C759",
    "Family": "#AF52DE",
    "Courage": "#FF9500",
  }[theme] || "#007AFF");

  const panelRef = useRef(null);

  const openQuoteInsight = useCallback(async (quoteObj) => {
    setRandomQuote(quoteObj);
    setExplanation("");
    setLoadingExplanation(true);
    // Scroll modal to top when opened
    setTimeout(() => panelRef.current?.scrollTo(0, 0), 50);

    const personaLine = `You are advising a driven leader focused on building something meaningful. They value efficiency, servant leadership, and legacy.`;

    var cleanQuote = String(quoteObj.q)
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\\/g, "")
      .replace(/"/g, "'")
      .replace(/\n/g, " ")
      .trim()
      .substring(0, 400);

    let password = localStorage.getItem("qv_password") || "";
    if (!password) {
      password = window.prompt("Enter the AI breakdown password to unlock quote insights:") || "";
      if (password) localStorage.setItem("qv_password", password.trim());
    }
    if (!password) {
      setExplanation("Locked. The quote vault is free to browse — clicking a quote also generates an AI breakdown (Reel script + Pray.com caption) but that requires a password. Click a quote again to enter one.");
      setLoadingExplanation(false);
      return;
    }

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote: cleanQuote, password: password.trim() }),
      });
      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("qv_password");
        setExplanation("Wrong password. Click a quote again to try a different one.");
      } else if (!response.ok || data.error) {
        setExplanation("Error: " + (data.error || ("HTTP " + response.status)));
      } else {
        setExplanation(data.text || "No text in response.");
      }
    } catch (err) {
      setExplanation("Network error: " + (err && err.message ? err.message : String(err)));
    }
    setLoadingExplanation(false);
  }, []);

  const pickRandom = useCallback(() => {
    if (!quotes) return; // still loading
    const pool = activeTheme === "All" ? quotes : quotes.filter(q => q.t === activeTheme);
    if (!pool.length) return;
    const rand = pool[Math.floor(Math.random() * pool.length)];
    openQuoteInsight(rand);
  }, [activeTheme, openQuoteInsight, quotes]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (randomQuote) {
          setRandomQuote(null); setExplanation(""); setLoadingExplanation(false);
        } else {
          searchRef.current?.blur();
          setSearch("");
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [randomQuote]);

  const insightRef = useRef(null);

  const extractSection = useCallback((text, sectionName) => {
    const patterns = {
      script: /\*\*60-Second Script:\*\*\s*([\s\S]*?)(?=\*\*Caption:\*\*|$)/,
      caption: /\*\*Caption:\*\*\s*([\s\S]*?)$/,
    };
    const match = text.match(patterns[sectionName]);
    return match ? match[1].trim() : "";
  }, []);

  const copySectionText = useCallback((sectionName) => {
    if (!explanation) return;
    const text = extractSection(explanation, sectionName);
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedSection(sectionName);
      setTimeout(() => setCopiedSection(null), 1500);
    }
  }, [explanation, extractSection]);

  const formatExplanation = (text) => {
    return text
      .replace(/\*\*What It Means:\*\*/g, '<div class="insight-section"><div class="insight-label" style="color:#007AFF">💡 What It Means</div><div class="insight-text">')
      .replace(/\*\*How to Apply It:\*\*/g, '</div></div><div class="insight-section"><div class="insight-label" style="color:#34C759">⚡ How to Apply It</div><div class="insight-text">')
      .replace(/\*\*Why It Matters:\*\*/g, '</div></div><div class="insight-section"><div class="insight-label" style="color:#FF9500">🎯 Why It Matters</div><div class="insight-text">')
      .replace(/\*\*60-Second Script:\*\*/g, '</div></div><div class="insight-section script-section" data-section="script"><div class="insight-label" style="color:#AF52DE">🎬 60-Second Script</div><div class="insight-text script-text">')
      .replace(/\*\*Caption:\*\*/g, '</div></div><div class="insight-section caption-section" data-section="caption"><div class="insight-label" style="color:#FF2D55">📱 Caption</div><div class="insight-text caption-text">')
      + '</div></div>';
  };

  return (
    <div className="app-root">
      <style>{GLOBAL_CSS}</style>

      {/* Sticky header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-top">
            <div>
              <h1 className="app-title">Quote Vault</h1>
              <p className="app-subtitle">{quotes ? `${quotes.length.toLocaleString()} quotes` : 'Loading…'} across {Object.keys(THEMES).length} themes</p>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <button className="random-btn" onClick={pickRandom}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
                Random
              </button>
            </div>
          </div>

          {/* Random quote panel - now a modal overlay */}

          {/* Search */}
          <div className="search-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search quotes"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>
                <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#8E8E93"/><line x1="4.5" y1="4.5" x2="9.5" y2="9.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/><line x1="9.5" y1="4.5" x2="4.5" y2="9.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
              </button>
            )}
            <span className="search-hint">/</span>
          </div>

          {/* Theme pills */}
          <div className="theme-scroll">
            <button
              className={`theme-pill ${activeTheme === "All" ? "active" : ""}`}
              onClick={() => setActiveTheme("All")}
            >All <span className="pill-count">{themeCounts.All}</span></button>
            {Object.entries(THEMES).map(([theme]) => (
              <button
                key={theme}
                className={`theme-pill ${activeTheme === theme ? "active" : ""}`}
                onClick={() => setActiveTheme(activeTheme === theme ? "All" : theme)}
                style={activeTheme === theme ? {"--pill-color": themeColor(theme)} : {}}
              >
                {theme} <span className="pill-count">{themeCounts[theme] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="main-content">
        <p className="results-count">
          {!quotes
            ? "Loading quotes…"
            : `${filtered.length.toLocaleString()} quote${filtered.length !== 1 ? "s" : ""}${search ? ` matching "${search}"` : ""}`}
        </p>

        <div className="quote-grid">
          {filtered.slice(0, displayCount).map((q, i) => (
            <div
              key={i}
              className="quote-card"
              onClick={() => openQuoteInsight(q)}
            >
              <p className="quote-text">"{q.q}"</p>
              <div className="quote-footer">
                <span className="quote-theme" style={{color: themeColor(q.t)}}>{q.t}</span>
                <span className={`quote-copy ${copied === i ? "copied" : ""}`} onClick={(e) => { e.stopPropagation(); copyQuote(q.q, i); }}>
                  {copied === i ? (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
                  ) : "Copy"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Infinite-scroll sentinel: triggers loading more when in view */}
        {quotes && displayCount < filtered.length && (
          <div ref={sentinelRef} style={{padding: "24px 0", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px"}}>
            Loading more… ({(filtered.length - displayCount).toLocaleString()} remaining)
          </div>
        )}

        {quotes && filtered.length === 0 && (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <p className="empty-title">No Results</p>
            <p className="empty-subtitle">No quotes match your search.</p>
            <button className="empty-btn" onClick={() => { setSearch(""); setActiveTheme("All"); }}>Clear All Filters</button>
          </div>
        )}
      </main>

      {/* Quote Insight Modal Overlay */}
      {randomQuote && (
        <div className="modal-overlay" onClick={() => { setRandomQuote(null); setExplanation(""); setLoadingExplanation(false); }}>
          <div className="modal-panel" ref={panelRef} onClick={e => e.stopPropagation()}>
            <div className="modal-panel-header">
              <span className="random-panel-badge" style={{color: themeColor(randomQuote.t), background: themeColor(randomQuote.t) + "12"}}>{randomQuote.t}</span>
              <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
                <button className="modal-copy-btn" onClick={() => { navigator.clipboard.writeText(randomQuote.q); setCopied("modal"); setTimeout(() => setCopied(null), 1500); }}>
                  {copied === "modal" ? (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
                  ) : (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
                  )}
                </button>
                <button className="modal-close-btn" onClick={() => { setRandomQuote(null); setExplanation(""); setLoadingExplanation(false); }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>
                </button>
              </div>
            </div>
            <p className="random-quote-text">"{randomQuote.q}"</p>
            <div className="insight-container">
              {loadingExplanation ? (
                <div className="loading-row">
                  <div className="spinner" />
                  <span>Generating insight…</span>
                </div>
              ) : explanation ? (
                <>
                  <div className="insight-content" ref={insightRef} dangerouslySetInnerHTML={{ __html: formatExplanation(explanation) }} />
                  <div className="section-actions">
                    <button className={`section-action-btn${copiedSection === "script" ? " copied-green" : ""}`} onClick={() => copySectionText("script")}>
                      {copiedSection === "script" ? (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
                      ) : (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Script</>
                      )}
                    </button>
                    <button className={`section-action-btn${copiedSection === "caption" ? " copied-green" : ""}`} onClick={() => copySectionText("caption")}>
                      {copiedSection === "caption" ? (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied</>
                      ) : (
                        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Caption</>
                      )}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
