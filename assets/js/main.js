/* ====================================================================
   KRISHNA GOYAL PORTFOLIO — MAIN JAVASCRIPT
   ==================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  initBackToTop();
  initRevealAnimations();
  
  // Load data from Supabase or Fallback
  await loadPortfolioData();
  
  initSkillsFilter();
  initProjectModal();
  initContactForm();
});

/* 1. NAVBAR SCROLL & MOBILE TOGGLE */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveSection();
  });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }
}

function highlightActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.pageYOffset;

  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 100;
    const sectionId = current.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[href*="#${sectionId}"]`);

    if (navLink) {
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLink.classList.add('active');
      } else {
        navLink.classList.remove('active');
      }
    }
  });
}

/* 2. BACK TO TOP BUTTON */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* 3. INTERSECTION OBSERVER REVEAL ANIMATIONS */
function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Trigger counter animation if inside entry
        if (entry.target.classList.contains('counter-item')) {
          animateCounter(entry.target);
        }
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));
}

/* 4. COUNTER ANIMATION */
function animateCounter(el) {
  const numEl = el.querySelector('.counter-number');
  if (!numEl || numEl.dataset.animated) return;
  
  const target = parseInt(numEl.getAttribute('data-target') || '0');
  let current = 0;
  const increment = Math.max(1, Math.ceil(target / 40));
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    numEl.textContent = current + '+';
  }, 30);

  numEl.dataset.animated = 'true';
}

/* 5. LOAD ALL DATA & DYNAMICALLY RENDER SECTIONS */
async function loadPortfolioData() {
  try {
    const [projects, skills, certs, experience, achievements, linksData, metaData] = await Promise.all([
      fetchProjects(),
      fetchSkills(),
      fetchCertifications(),
      fetchExperience(),
      fetchAchievements(),
      fetchLinks(),
      fetchMeta()
    ]);

    renderBio(metaData);
    renderLinks(linksData);
    renderSkills(skills);
    renderProjects(projects);
    renderExperience(experience);
    renderCertifications(certs);
    renderAchievements(achievements);
    renderResume(metaData, linksData, projects, skills, certs);

    // Update counters
    const pCount = document.getElementById('count-projects');
    if (pCount) pCount.setAttribute('data-target', projects.length);
    const cCount = document.getElementById('count-certs');
    if (cCount) cCount.setAttribute('data-target', certs.length);
    const sCount = document.getElementById('count-skills');
    if (sCount) sCount.setAttribute('data-target', skills.length);
    const rCount = document.getElementById('count-repos');
    if (rCount) rCount.setAttribute('data-target', projects.length + 3);

  } catch (err) {
    console.error('Error loading portfolio data:', err);
  }
}

function renderBio(metaData) {
  const bioEl = document.getElementById('about-bio-text');
  const metaMap = {};
  metaData.forEach(m => metaMap[m.key] = m.value);

  if (bioEl && metaMap.bio) {
    bioEl.textContent = metaMap.bio;
  }

  if (metaMap.profile_photo_url) {
    const heroImg = document.getElementById('hero-profile-img');
    if (heroImg) heroImg.src = metaMap.profile_photo_url;
    const aboutImg = document.getElementById('about-profile-img');
    if (aboutImg) aboutImg.src = metaMap.profile_photo_url;
  }
}

function renderLinks(linksData) {
  const linkMap = {};
  linksData.forEach(item => linkMap[item.key] = item.value);

  const resumeBtn = document.getElementById('btn-download-resume');
  if (resumeBtn && linkMap.resume_url) {
    resumeBtn.href = linkMap.resume_url;
  }

  const githubLink = document.getElementById('link-github');
  if (githubLink && linkMap.github) githubLink.href = linkMap.github;

  const linkedinLink = document.getElementById('link-linkedin');
  if (linkedinLink && linkMap.linkedin) linkedinLink.href = linkMap.linkedin;

  const twitterLink = document.getElementById('link-twitter');
  if (twitterLink && linkMap.twitter) twitterLink.href = linkMap.twitter;
}

function renderSkills(skills) {
  const container = document.getElementById('skills-grid-container');
  if (!container) return;

  container.innerHTML = skills.map(s => `
    <div class="skill-card reveal active" data-category="${s.category}">
      <div class="skill-header" style="margin-bottom: 0;">
        <span class="skill-name">${s.name}</span>
        <span class="mono-chip" style="color: var(--accent); background: var(--accent-light); padding: 2px 10px; border-radius: 6px;">${s.category}</span>
      </div>
    </div>
  `).join('');
}

function renderProjects(projects) {
  const container = document.getElementById('projects-row-container');
  if (!container) return;

  container.innerHTML = projects.map(p => `
    <div class="project-card" data-project-id="${p.id}">
      ${p.featured ? '<span class="featured-badge">FEATURED</span>' : ''}
      <div>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
      </div>
      <div>
        <div class="chip-group">
          ${(p.tech_stack || []).map(t => `<span class="tech-chip">${t}</span>`).join('')}
        </div>
        <div class="project-footer-links" style="display: flex; gap: 16px; align-items: center;">
          ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="project-link" onclick="event.stopPropagation()">GitHub →</a>` : ''}
          <a href="${p.live_url && p.live_url !== '#' ? p.live_url : 'https://demo.example.com'}" target="_blank" class="project-link" onclick="event.stopPropagation()">Live Demo ↗</a>
        </div>
      </div>
    </div>
  `).join('');
}

function renderExperience(experience) {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  container.innerHTML = experience.map(e => `
    <div class="timeline-item reveal active">
      <div class="timeline-marker"></div>
      <div class="timeline-card">
        <div class="timeline-header">
          <div>
            <div class="timeline-role">${e.role}</div>
            <div class="timeline-company">${e.company}</div>
          </div>
          <div class="timeline-date">${e.start_date} — ${e.end_date || 'Present'}</div>
        </div>
        ${e.description ? `
          <ul class="timeline-bullets">
            ${(Array.isArray(e.description) ? e.description : [e.description]).map(b => `<li>${b}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function renderCertifications(certs) {
  const container = document.getElementById('certs-grid-container');
  if (!container) return;

  container.innerHTML = certs.map(c => `
    <div class="cert-card reveal active">
      ${c.image_url ? `
        <div class="cert-img-frame">
          <img src="${c.image_url}" alt="${c.name}" loading="lazy">
        </div>
      ` : ''}
      <h3 class="cert-title">${c.name}</h3>
      <div class="cert-platform">${c.platform}</div>
      <div class="cert-date">Earned: ${c.date_earned}</div>
      <div class="cert-badge">✓ Verified Credential</div>
      ${c.certificate_url && c.certificate_url !== '#' ? `
        <div style="margin-top: 14px;">
          <a href="${c.certificate_url}" target="_blank" class="project-link">View Certificate →</a>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function renderResume(metaData, linksData, projects, skills, certs) {
  const container = document.getElementById('resume-preview-content');
  if (!container) return;

  const topSkills = skills.slice(0, 5).map(s => s.name).join(', ');
  const topProjects = projects.slice(0, 3).map(p => p.title).join(', ');

  container.innerHTML = `
    <div class="resume-header">
      <h2 class="resume-name">Krishna Goyal</h2>
      <p class="resume-sub">B.Tech AI & Data Analytics Student | GLA University (Class of 2028)</p>
    </div>

    <div class="resume-block">
      <div class="resume-section-title">Education</div>
      <p><strong>GLA University</strong> — B.Tech in Artificial Intelligence & Data Analytics (1st Year, Expected 2028)</p>
    </div>

    <div class="resume-block">
      <div class="resume-section-title">Technical Core</div>
      <p><strong>Languages & AI:</strong> ${topSkills}</p>
      <p><strong>Featured Works:</strong> ${topProjects}</p>
    </div>

    <div class="resume-block">
      <div class="resume-section-title">Certifications & Achievements</div>
      <p>${certs.map(c => c.name + ' (' + c.platform + ')').join(' • ')}</p>
    </div>
  `;
}

/* 6. SKILLS CATEGORY TAB FILTERING */
function initSkillsFilter() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.getAttribute('data-category');
      const cards = document.querySelectorAll('.skill-card');

      cards.forEach(card => {
        if (cat === 'All' || card.getAttribute('data-category').toLowerCase().includes(cat.toLowerCase())) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* 7. PROJECT MODAL POPUP */
function initProjectModal() {
  const overlay = document.getElementById('project-modal-overlay');
  const closeBtn = document.getElementById('modal-close-btn');
  const modalContent = document.getElementById('modal-project-content');

  if (!overlay || !closeBtn) return;

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    if (card) {
      const title = card.querySelector('.project-title').textContent;
      const desc = card.querySelector('.project-desc').textContent;
      const chips = card.querySelector('.chip-group').innerHTML;
      const links = card.querySelector('.project-footer-links').innerHTML;

      modalContent.innerHTML = `
        <h2 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 12px;">${title}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 1.05rem; line-height: 1.7;">${desc}</p>
        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;">Technologies Used</h4>
          <div class="chip-group">${chips}</div>
        </div>
        <div class="project-footer-links" style="border-top: 1px solid var(--border); padding-top: 16px;">${links}</div>
      `;

      overlay.classList.add('active');
    }
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
}

/* 8. CONTACT FORM SUBMISSION */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('contact-form-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.className = 'form-status';
    statusEl.textContent = 'Transmitting message...';

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    try {
      await saveMessage(name, email, message);
      statusEl.className = 'form-status success';
      statusEl.textContent = '✓ Your message has been sent successfully.';
      form.reset();
    } catch (err) {
      statusEl.className = 'form-status error';
      statusEl.textContent = '❌ Something went wrong. Please try again.';
    }
  });
}
