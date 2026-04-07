/* =====================================================
   MAIN.JS — Shared Portfolio Functionality
   ===================================================== */

// ── 1. Load Header + Footer ───────────────────────────

async function loadComponents() {
  const $header = document.getElementById('header-placeholder');
  const $footer = document.getElementById('footer-placeholder');

  if ($header) {
    try {
      const res  = await fetch('/components/header.html');
      const html = await res.text();
      $header.innerHTML = html;
      initNav();
    } catch (err) {
      console.warn('[Portfolio] Header load failed. Make sure you are running a local server (not file://):', err);
    }
  }

  if ($footer) {
    try {
      const res  = await fetch('/components/footer.html');
      const html = await res.text();
      $footer.innerHTML = html;
    } catch (err) {
      console.warn('[Portfolio] Footer load failed:', err);
    }
  }
}

// ── 2. Navigation ─────────────────────────────────────

function initNav() {
  const toggle   = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Mobile hamburger open/close
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen.toString());
    });
  }

  // Mobile dropdown accordion
  document.querySelectorAll('.nav-dropdown').forEach(parent => {
    const trigger = parent.querySelector('a');
    if (!trigger) return;
    trigger.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        parent.classList.toggle('is-open');
      }
    });
  });

  // Highlight active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    if (path === href) {
      link.classList.add('active');
      return;
    }
    // Highlight "作品" parent when inside works/ or projects/
    if (
      (path.startsWith('/works/') || path.startsWith('/projects/')) &&
      href === '#'
    ) {
      link.classList.add('active');
    }
  });

  // Smooth scroll for "联系" anchor
  document.querySelectorAll('a[href="#site-footer"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const footer = document.getElementById('site-footer');
      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ── 3. Modal ──────────────────────────────────────────

let modalEl = null;

function buildModal() {
  modalEl = document.createElement('div');
  modalEl.className = 'modal-overlay';
  modalEl.setAttribute('role', 'dialog');
  modalEl.setAttribute('aria-modal', 'true');
  modalEl.setAttribute('aria-label', '图片预览');

  modalEl.innerHTML = `
    <div class="modal-frame">
      <button class="modal-close-btn" aria-label="关闭预览">✕</button>
      <div class="modal-img-area">
        <div class="img-placeholder" id="modal-placeholder">
          <span id="modal-placeholder-text"></span>
        </div>
      </div>
      <p class="modal-caption-text" id="modal-caption"></p>
    </div>
  `;

  document.body.appendChild(modalEl);

  // Close on button
  modalEl.querySelector('.modal-close-btn').addEventListener('click', closeModal);

  // Close on overlay click
  modalEl.addEventListener('click', e => {
    if (e.target === modalEl) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalEl && modalEl.classList.contains('is-open')) {
      closeModal();
    }
  });
}

function openModal(placeholderLabel, caption) {
  if (!modalEl) buildModal();

  const pText = modalEl.querySelector('#modal-placeholder-text');
  const capEl = modalEl.querySelector('#modal-caption');

  pText.textContent = placeholderLabel || '图片';
  capEl.textContent = caption || '';

  modalEl.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  // Focus trap: focus close button
  requestAnimationFrame(() => {
    modalEl.querySelector('.modal-close-btn').focus();
  });
}

function closeModal() {
  if (!modalEl) return;
  modalEl.classList.remove('is-open');
  document.body.style.overflow = '';
}

// ── 4. Gallery Click Handlers ─────────────────────────

function initGallery() {
  document.querySelectorAll('.gallery-item').forEach((item, idx) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `查看大图 ${idx + 1}`);

    const activate = () => {
      const pTextEl = item.querySelector('.img-placeholder');
      const label   = pTextEl ? pTextEl.textContent.trim() : `图片 ${idx + 1}`;
      const caption = item.dataset.caption || label;
      openModal(label, caption);
    };

    item.addEventListener('click', activate);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}

// ── 5. Scroll Fade-Up Animation ───────────────────────

function initScrollFade() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Stagger siblings
      const siblings = Array.from(
        entry.target.parentElement.querySelectorAll('.fade-up')
      );
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 80}ms`;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  els.forEach(el => io.observe(el));
}

// ── 6. Bootstrap ──────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  initScrollFade();
  initGallery();
});
