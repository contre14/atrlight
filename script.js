const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const menu = document.querySelector('[data-menu]');
const servicesNav = document.querySelector('[data-services-nav]');
const servicesToggle = document.querySelector('[data-services-toggle]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateHeader = () => {
  if (header) header.classList.toggle('header--solid', window.scrollY > 36);
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('load', updateHeader);
window.addEventListener('hashchange', updateHeader);
requestAnimationFrame(updateHeader);
setTimeout(updateHeader, 250);

const closeServicesMenu = ({ returnFocus = false } = {}) => {
  if (!servicesNav || !servicesToggle) return;
  servicesNav.classList.remove('is-open');
  servicesToggle.setAttribute('aria-expanded', 'false');
  if (returnFocus) servicesToggle.focus();
};

const closeMobileNav = ({ returnFocus = false } = {}) => {
  if (!nav || !menu) return;
  nav.classList.remove('nav--open');
  menu.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  closeServicesMenu();
  if (returnFocus) menu.focus();
};

if (menu && nav) {
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('nav--open');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMobileNav()));
}

if (servicesNav && servicesToggle) {
  servicesToggle.addEventListener('click', event => {
    event.stopPropagation();
    const open = servicesNav.classList.toggle('is-open');
    servicesToggle.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', event => {
    if (!servicesNav.contains(event.target)) closeServicesMenu();
  });

  servicesNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    closeServicesMenu();
    const targetId = link.getAttribute('href');
    if (!targetId?.startsWith('#service-')) return;
    const target = document.querySelector(targetId);
    const targetToggle = target?.querySelector('.capability__toggle');
    const targetPanel = target?.querySelector('.capability__panel');
    if (!target || !targetToggle || !targetPanel) return;

    document.querySelectorAll('[data-service-accordion]').forEach(other => {
      const isTarget = other === target;
      const otherToggle = other.querySelector('.capability__toggle');
      const otherPanel = other.querySelector('.capability__panel');
      other.classList.toggle('is-open', isTarget);
      otherToggle?.setAttribute('aria-expanded', String(isTarget));
      if (otherPanel) otherPanel.hidden = !isTarget;
    });
  }));
}

// Accessible reveal behavior, with a no-animation fallback.
const revealElements = document.querySelectorAll('[data-reveal]');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach(el => el.classList.add('is-visible'));
} else {
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        reveal.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach(el => reveal.observe(el));
}

// Service accordions.
document.querySelectorAll('[data-service-accordion]').forEach(item => {
  const toggle = item.querySelector('.capability__toggle');
  const panel = item.querySelector('.capability__panel');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const willOpen = toggle.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('[data-service-accordion]').forEach(other => {
      if (other === item) return;
      const otherToggle = other.querySelector('.capability__toggle');
      const otherPanel = other.querySelector('.capability__panel');
      other.classList.remove('is-open');
      otherToggle?.setAttribute('aria-expanded', 'false');
      if (otherPanel) otherPanel.hidden = true;
    });
    item.classList.toggle('is-open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
    panel.hidden = !willOpen;
  });
});

// The public form remains a transparent prototype until ATR approves a form endpoint.
const form = document.querySelector('[data-inquiry-form]');
const status = document.querySelector('[data-form-status]');
if (form && status) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.textContent = 'Preview only: no information was transmitted. Connect ATR’s approved form service before launch.';
    status.classList.add('is-visible');
  });
}

// Legal and accessibility dialogs.
let dialogTrigger = null;
document.querySelectorAll('[data-dialog-open]').forEach(button => {
  button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.dialogOpen);
    if (!dialog) return;
    dialogTrigger = button;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    dialog.querySelector('[data-dialog-close]')?.focus();
  });
});

document.querySelectorAll('.site-dialog').forEach(dialog => {
  const closeDialog = () => {
    if (dialog.open) dialog.close();
    dialogTrigger?.focus();
    dialogTrigger = null;
  };
  dialog.querySelector('[data-dialog-close]')?.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
});

// Global Escape-key behavior.
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const openDialog = document.querySelector('.site-dialog[open]');
  if (openDialog) {
    openDialog.close();
    dialogTrigger?.focus();
    dialogTrigger = null;
    return;
  }
  if (servicesNav?.classList.contains('is-open')) {
    closeServicesMenu({ returnFocus: true });
    return;
  }
  if (nav?.classList.contains('nav--open')) closeMobileNav({ returnFocus: true });
});
