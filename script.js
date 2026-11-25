
    (function () {
      const header = document.querySelector('.site-header');
      const menuToggle = document.getElementById('menuToggle');
      const navLinks = document.getElementById('navLinks');
      const backTop = document.getElementById('backTop');
      const form = document.getElementById('contactForm');
      const formMessage = document.getElementById('formMessage');

      document.getElementById('year').textContent = new Date().getFullYear();

      menuToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.textContent = open ? '×' : '☰';
      });
      navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = '☰';
      }));

      const updateScrollUI = () => {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 20);
        backTop.classList.toggle('visible', y > 650);
      };
      window.addEventListener('scroll', updateScrollUI, { passive: true });
      updateScrollUI();

      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

      document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
        const serviceSelect = document.getElementById('service');
        const target = link.dataset.service;
        const option = Array.from(serviceSelect.options).find(opt => opt.textContent === target);
        if (option) serviceSelect.value = option.value || option.textContent;
      }));

      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        formMessage.classList.add('show');
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    })();
