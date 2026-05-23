const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
}

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

initTheme();

// --- CV-opplasting, parsing og kontaktskjema ---
const downloadLink = document.getElementById('downloadCv');
const heroName = document.getElementById('heroName');
const heroTitle = document.getElementById('heroTitle');
const heroSummary = document.getElementById('heroSummary');
const skillsList = document.getElementById('skillsList');
const referencesList = document.getElementById('referencesList');

function safeText(str, fallback = '') {
  return (str || '').trim();
}

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function renderSkills(skillsText) {
  clearChildren(skillsList);
  const parts = skillsText.split(/[,•\n]/).map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    skillsList.innerHTML = '<span style="color:var(--text-muted)">Ingen ferdigheter funnet</span>';
    return;
  }
  parts.forEach(s => {
    const span = document.createElement('span');
    span.textContent = s;
    skillsList.appendChild(span);
  });
}

function renderReferences(refText) {
  clearChildren(referencesList);
  const parts = refText.split(/\n{1,}/).map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    referencesList.innerHTML = '<p style="color:var(--text-muted)">Ingen referanser funnet</p>';
    return;
  }
  parts.forEach(p => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.innerHTML = `<p style="margin:0.25rem 0 0.5rem;color:var(--text-muted)">Reference</p><div>${p.replace(/\n/g,'<br>')}</div>`;
    referencesList.appendChild(card);
  });
}

function parseSectionsFromText(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  // Basic heuristics: first line = name, second line (if short) = title
  if (lines.length > 0) heroName.textContent = safeText(lines[0], heroName.textContent);
  if (lines.length > 1 && lines[1].length < 60) heroTitle.textContent = safeText(lines[1], heroTitle.textContent);

  // Find headings and blocks
  const headings = ['profile','profil','summary','sammendrag','about','om meg','experience','erfaring','work experience','arbeidserfaring','education','utdanning','skills','ferdigheter','references','referanser','contact','kontakt','references:','skills:'];
  const lower = lines.map(l => l.toLowerCase());
  const blocks = {};
  let current = 'top';
  blocks[current] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const li = l.toLowerCase().replace(/[:\s]+$/,'');
    if (headings.includes(li)) {
      current = li.replace(/\s+/g,'_');
      blocks[current] = [];
      continue;
    }
    // lines that look like heading uppercase (e.g., EXPERIENCE) treat as heading too
    if (/^[A-Z\s]{3,}$/.test(lines[i]) && lines[i].length < 40) {
      current = lines[i].toLowerCase().replace(/[:\s]+$/,'').replace(/\s+/g,'_');
      blocks[current] = [];
      continue;
    }
    blocks[current].push(l);
  }

  // Summary/profile
  const summaryKeys = ['profile','summary','about','top'];
  for (const k of summaryKeys) {
    if (blocks[k] && blocks[k].length) {
      heroSummary.textContent = blocks[k].join(' ');
      break;
    }
  }

  // Skills
  const skillKeys = ['skills','skills:'];
  for (const k of skillKeys) {
    if (blocks[k] && blocks[k].length) {
      renderSkills(blocks[k].join('\n'));
      break;
    }
  }

  // References
  const refKeys = ['references','references:'];
  for (const k of refKeys) {
    if (blocks[k] && blocks[k].length) {
      renderReferences(blocks[k].join('\n\n'));
      break;
    }
  }
}

// Contact form: open mail client with filled subject/body
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    const subject = encodeURIComponent(`Melding fra portefølje: ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} <${email}>`);
    // open mailto
    window.location.href = `mailto:Steffen-hu95@hotmail.com?subject=${subject}&body=${body}`;
  });
}
