# Project Overview

**Course:** CSE 391 — Programming for the Internet  
**Student:** Apurba Roy, BRAC University  
**Assignment:** Assignment 1 — Personal Web Page

---

## File Structure

```
cse-391/
├── index.html          # Main portfolio page (577 lines)
├── hobbies.html        # Internal linked page — hobbies
├── style.css           # External stylesheet (~1,300 lines)
├── script.js           # All JavaScript modules (647 lines)
├── images/
│   └── IMG_7449.jpg    # Local profile photo
└── docs/
    ├── project-overview.md       # This file
    └── ai-usage-declaration.md  # AI tool usage disclosure
```

---

## Assignment Requirements Coverage

### Part 1 — Basic Structure & Content (30 pts)
- Multiple sections: About, Education, Projects, Skills, Links, Contact
- Anchor links (`#about`, `#education`, `#work`, etc.)
- Internal link → `hobbies.html`
- External links → GitHub, BRAC University, Codeforces, Next.js, Supabase
- Name prominently in hero `<h1>` with profile photo
- All sections clearly labelled (01–06)

### Part 2 — Formatting & Content Enhancement (25 pts)
- Bold (`<strong>`), italics (`<em>`), colour variations, multiple font sizes
- Favourite quote — Harold Abelson, *SICP*
- Ordered list — Top 10 Developer Tools
- 5+ hyperlinks including: sentence-embedded, BRAC University, CSE 391 Discord

### Part 3 — Layout & Styling with CSS (25 pts)
- Local image: `images/IMG_7449.jpg`
- Web image: GitHub readme-stats card (live API)
- Table with `rowspan`, `colspan`, multi-line cells, caption, thead/tbody/tfoot
- Hover effects, striped table rows (`nth-child`), responsive table wrapper
- External CSS (`style.css`), internal CSS (`<style>` in `<head>`), inline CSS (table attributes)
- Footer shows page URL + last modified date via JavaScript

### Part 4 — Code Quality & Standards (20 pts)
- Valid HTML5 with `<!DOCTYPE html>`, `<html lang>`, `<head>`, `<body>`
- Meta tags: charset, viewport, description, author, keywords
- `<title>`, semantic header/main/footer structure
- Copyright in footer with dynamic year via JS

### Bonus Challenges (Extra Credit)
- Contact form with `mailto:` action
- Dark / light mode toggle (CSS `data-theme` attribute)
- CSS animations: hero entrance, fade-in on scroll, scramble effect, particle orb

---

## Technologies Used

- **HTML5** — semantic markup, accessibility attributes
- **CSS3** — custom properties, flexbox, grid, `@keyframes`, `IntersectionObserver`
- **Vanilla JavaScript** — no frameworks or build tools
- **Canvas 2D API** — 3D particle orb, background particle network
