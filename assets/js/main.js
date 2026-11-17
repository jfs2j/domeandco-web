(function () {
  'use strict';

  /* Progressive enhancement marker for scroll reveals */
  document.documentElement.classList.add('has-reveal');

  /* Transparent header over hero -> cream with hairline on scroll */
  var header = document.querySelector('.site-header');
  function updateHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  updateHeaderScroll();
  window.addEventListener('scroll', updateHeaderScroll, { passive: true });

  /* Desktop full-width mega-menu panel ("Nos metiers" / "Practice areas") */
  var megaTrigger = document.querySelector('[data-mega-trigger]');
  var megaPanel = document.getElementById('mega-panel-metiers');
  var megaCloseTimer = null;
  var megaLockedOpen = false;

  function setMegaState(open) {
    if (!megaTrigger || !megaPanel || !header) return;
    megaTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    megaPanel.hidden = !open;
    if (open) {
      header.classList.add('has-mega-open');
    } else {
      header.classList.remove('has-mega-open');
      megaLockedOpen = false;
    }
  }

  function scheduleMegaClose() {
    if (megaLockedOpen) return;
    clearTimeout(megaCloseTimer);
    megaCloseTimer = setTimeout(function () {
      setMegaState(false);
    }, 140);
  }

  function cancelMegaClose() {
    clearTimeout(megaCloseTimer);
  }

  if (megaTrigger && megaPanel && header) {
    megaTrigger.addEventListener('mouseenter', function () {
      cancelMegaClose();
      setMegaState(true);
    });

    megaTrigger.addEventListener('mouseleave', scheduleMegaClose);

    megaPanel.addEventListener('mouseenter', function () {
      cancelMegaClose();
      setMegaState(true);
    });

    megaPanel.addEventListener('mouseleave', scheduleMegaClose);

    megaTrigger.addEventListener('focus', function () {
      cancelMegaClose();
      setMegaState(true);
    });

    megaTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      var isExpanded = megaTrigger.getAttribute('aria-expanded') === 'true';
      if (isExpanded && megaLockedOpen) {
        setMegaState(false);
      } else {
        megaLockedOpen = true;
        setMegaState(true);
      }
    });

    header.addEventListener('focusout', function (event) {
      var nextTarget = event.relatedTarget;
      if (!nextTarget || (!megaPanel.contains(nextTarget) && nextTarget !== megaTrigger)) {
        setTimeout(function () {
          var active = document.activeElement;
          if (!megaPanel.contains(active) && active !== megaTrigger && !megaLockedOpen) {
            setMegaState(false);
          }
        }, 40);
      }
    });

    document.addEventListener('click', function (event) {
      if (
        megaTrigger.getAttribute('aria-expanded') === 'true' &&
        !megaPanel.contains(event.target) &&
        event.target !== megaTrigger &&
        !megaTrigger.contains(event.target)
      ) {
        setMegaState(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && megaTrigger.getAttribute('aria-expanded') === 'true') {
        setMegaState(false);
        megaTrigger.focus();
      }
    });
  }

  /* Full-screen accessible mobile drawer & accordion */
  var toggle = document.querySelector('[data-menu-toggle]');
  var closeBtn = document.querySelector('[data-menu-close]');
  var mobileNav = document.getElementById('mobile-navigation');
  var accordionTrigger = document.querySelector('[data-mobile-accordion]');
  var accordionPanel = document.getElementById('mobile-metiers-panel');

  function openMobileMenu() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute('aria-expanded', 'true');
    mobileNav.hidden = false;
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeMobileMenu(restoreFocus) {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute('aria-expanded', 'false');
    mobileNav.hidden = true;
    document.body.style.overflow = '';
    updateHeaderScroll();
    if (restoreFocus) toggle.focus();
  }

  if (accordionTrigger && accordionPanel) {
    accordionTrigger.addEventListener('click', function () {
      var expanded = accordionTrigger.getAttribute('aria-expanded') === 'true';
      accordionTrigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      accordionPanel.hidden = expanded;
      var icon = accordionTrigger.querySelector('.mobile-accordion-icon');
      if (icon) icon.textContent = expanded ? '+' : '−';
    });
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileMenu(true);
      } else {
        openMobileMenu();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeMobileMenu(true);
      });
    }

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileMenu(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu(true);
      }
    });
  }

  /* Subtle fade-and-rise on scroll (20px, 600ms, ease-out, staggered) */
  var revealElements = document.querySelectorAll('[data-reveal]');
  if (revealElements.length) {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach(function (el) {
        el.setAttribute('data-reveal', 'visible');
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.setAttribute('data-reveal', 'visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
      );
      revealElements.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  /* Contact form validation (before Brevo endpoint connection) */
  var contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    var statusBox = contactForm.querySelector('[data-form-status]');
    var lang = document.documentElement.lang === 'en' ? 'en' : 'fr';

    var messages = {
      fr: {
        required: 'Merci de renseigner tous les champs obligatoires et de valider le consentement RGPD.',
        email: 'Merci de saisir une adresse e-mail valide.',
        success: 'Votre demande a bien été vérifiée. Pour finaliser l’envoi, connectez ce formulaire à votre compte Brevo ou utilisez nos coordonnées.'
      },
      en: {
        required: 'Please complete all required fields and accept the privacy consent.',
        email: 'Please enter a valid email address.',
        success: 'Your request has been checked. Connect this form to your Brevo endpoint to route submissions directly.'
      }
    };

    contactForm.addEventListener('submit', function (event) {
      var action = contactForm.getAttribute('action');
      var isBrevoConfigured = action && action.indexOf('http') === 0;

      var nameInput = contactForm.querySelector('[name="nom"]');
      var emailInput = contactForm.querySelector('[name="email"]');
      var structureInput = contactForm.querySelector('[name="structure"]');
      var needInput = contactForm.querySelector('[name="besoin"]');
      var messageInput = contactForm.querySelector('[name="message"]');
      var consentInput = contactForm.querySelector('[name="consentement"]');

      var inputs = [nameInput, emailInput, structureInput, needInput, messageInput];
      var hasMissing = false;

      inputs.forEach(function (el) {
        if (!el) return;
        var empty = !el.value || !el.value.trim();
        el.setAttribute('aria-invalid', empty ? 'true' : 'false');
        if (empty) hasMissing = true;
      });

      if (consentInput && !consentInput.checked) {
        consentInput.setAttribute('aria-invalid', 'true');
        hasMissing = true;
      } else if (consentInput) {
        consentInput.setAttribute('aria-invalid', 'false');
      }

      var emailValue = emailInput ? emailInput.value.trim() : '';
      var emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

      if (hasMissing) {
        event.preventDefault();
        if (statusBox) {
          statusBox.hidden = false;
          statusBox.className = 'form-status form-status--error';
          statusBox.textContent = messages[lang].required;
        }
        return;
      }

      if (!emailValid) {
        event.preventDefault();
        if (emailInput) emailInput.setAttribute('aria-invalid', 'true');
        if (statusBox) {
          statusBox.hidden = false;
          statusBox.className = 'form-status form-status--error';
          statusBox.textContent = messages[lang].email;
        }
        return;
      }

      if (!isBrevoConfigured) {
        event.preventDefault();
        if (statusBox) {
          statusBox.hidden = false;
          statusBox.className = 'form-status form-status--success';
          statusBox.textContent = messages[lang].success;
        }
        contactForm.reset();
      }
    });
  }
})();
