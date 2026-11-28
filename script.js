
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

      form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonHTML = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
        formMessage.classList.remove('show');
        formMessage.textContent = '';

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
          const formData = new FormData(form);
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData.entries())),
            signal: controller.signal
          });

          let result = {};
          try { result = await response.json(); } catch (_) { /* handled below */ }
          if (!response.ok || result.success !== true) {
            throw new Error(result.message || 'The enquiry could not be sent.');
          }

          formMessage.textContent = 'Thank you! Your enquiry has been sent successfully. Shivay Innovations will get back to you soon.';
          formMessage.classList.add('show');
          form.reset();
        } catch (error) {
          console.error('Enquiry form error:', error);
          formMessage.textContent = 'Sorry, we could not send your enquiry right now. Please email jshalini174@gmail.com directly or try again in a moment.';
          formMessage.classList.add('show');
        } finally {
          clearTimeout(timeout);
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHTML;
          formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    })();
