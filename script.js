/* ──────────────────────────────────────────
      1. CUSTOM CURSOR
    ────────────────────────────────────────── */
    const cursor = document.getElementById('cursor');
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .mosaic-item, .reason-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });

    /* ──────────────────────────────────────────
      2. FLOATING HEARTS (canvas)
    ────────────────────────────────────────── */
    (function() {
      const canvas = document.getElementById('hearts-canvas');
      const ctx = canvas.getContext('2d');
      let hearts = [];
      const HEART_COUNT = 28;

      function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resize();
      window.addEventListener('resize', resize);

      function heartPath(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size, size);
        ctx.beginPath();
        ctx.moveTo(0, -0.3);
        ctx.bezierCurveTo(0.5, -1, 1.3, 0, 0, 1);
        ctx.bezierCurveTo(-1.3, 0, -0.5, -1, 0, -0.3);
        ctx.closePath();
        ctx.restore();
      }

      function createHeart() {
        return {
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 20,
          size: Math.random() * 10 + 4,
          speed: Math.random() * .6 + .2,
          drift: (Math.random() - .5) * .5,
          opacity: Math.random() * .18 + .04,
          color: Math.random() > .5 ? '#E63946' : '#FF4D8D'
        };
      }

      for (let i = 0; i < HEART_COUNT; i++) {
        const h = createHeart();
        h.y = Math.random() * window.innerHeight;
        hearts.push(h);
      }

      function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hearts.forEach((h, i) => {
          heartPath(ctx, h.x, h.y, h.size);
          ctx.fillStyle = h.color;
          ctx.globalAlpha = h.opacity;
          ctx.fill();
          ctx.globalAlpha = 1;

          h.y -= h.speed;
          h.x += h.drift;

          if (h.y < -30) hearts[i] = createHeart();
        });
        requestAnimationFrame(loop);
      }
      loop();
    })();

    /* ──────────────────────────────────────────
      3. SCROLL REVEAL
    ────────────────────────────────────────── */
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: .12 });
    revealEls.forEach(el => io.observe(el));

    /* ──────────────────────────────────────────
      4. COUNTER
      ✏️ EDITE: coloque a data de início do relacionamento
      Formato: 'YYYY-MM-DDTHH:MM:SS'
    ────────────────────────────────────────── */
    const START_DATE = new Date('2022-09-26T00:00:00'); // ← EDITE AQUI

    function updateCounter() {
      const now  = new Date();
      const diff = Math.max(0, now - START_DATE);

      const days  = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000)  / 60000);
      const secs  = Math.floor((diff % 60000)    / 1000);

      document.getElementById('c-days').textContent  = String(days).padStart(3, '0');
      document.getElementById('c-hours').textContent = String(hours).padStart(2, '0');
      document.getElementById('c-mins').textContent  = String(mins).padStart(2, '0');
      document.getElementById('c-secs').textContent  = String(secs).padStart(2, '0');
    }
    updateCounter();
    setInterval(updateCounter, 1000);

    /* ──────────────────────────────────────────
      5. MUSIC PLAYER
    ────────────────────────────────────────── */
    const audio   = document.getElementById('audio-player');
    const playBtn = document.getElementById('btn-play');
    const fill    = document.getElementById('progress-fill');
    const wrap    = document.getElementById('progress-wrap');
    const tCur    = document.getElementById('time-current');
    const tTot    = document.getElementById('time-total');

    let playing = false;

    function fmt(s) {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    }

    playBtn.addEventListener('click', () => {
      if (!audio.src || audio.src === window.location.href) {
        // demo mode without file: animate visually
        playing = !playing;
        playBtn.textContent = playing ? '⏸' : '▶';
        if (playing) demoAnimate();
        return;
      }
      if (playing) { audio.pause(); playing = false; playBtn.textContent = '▶'; }
      else         { audio.play();  playing = true;  playBtn.textContent = '⏸'; }
    });

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      fill.style.width = pct + '%';
      tCur.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => { tTot.textContent = fmt(audio.duration); });
    audio.addEventListener('ended', () => { playing = false; playBtn.textContent = '▶'; fill.style.width = '0%'; });

    wrap.addEventListener('click', e => {
      if (!audio.duration) return;
      const rect = wrap.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    // demo animation (no file attached)
    let demoProgress = 0, demoInterval;
    function demoAnimate() {
      demoInterval = setInterval(() => {
        if (!playing) { clearInterval(demoInterval); return; }
        demoProgress = (demoProgress + .08) % 100;
        fill.style.width = demoProgress + '%';
        const fake = (demoProgress / 100) * 210;
        tCur.textContent = fmt(fake);
        tTot.textContent = '3:30';
      }, 300);
    }

    /* ──────────────────────────────────────────
      6. GALLERY LIGHTBOX
    ────────────────────────────────────────── */
    const lb      = document.getElementById('lightbox');
    const lbImg   = document.getElementById('lightbox-img');
    const lbClose = document.getElementById('lightbox-close');

    document.querySelectorAll('.mosaic-item img').forEach(img => {
      img.addEventListener('click', () => {
        lbImg.src = img.src;
        lb.classList.add('open');
      });
    });
    lbClose.addEventListener('click', () => lb.classList.remove('open'));
    lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });

    /* ──────────────────────────────────────────
      7. PARALLAX (hero photo)
    ────────────────────────────────────────── */
    const heroPhoto = document.querySelector('.hero-photo img');
    window.addEventListener('scroll', () => {
      if (!heroPhoto) return;
      const offset = window.scrollY * .3;
      heroPhoto.style.transform = `translateY(${offset}px)`;
    });

    /* ──────────────────────────────────────────
      8. BACK TO TOP
    ────────────────────────────────────────── */
    const backTop = document.getElementById('back-top');
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('show', window.scrollY > 400);
    });

    /* ──────────────────────────────────────────
      9. HEARTS BURST (closing section)
    ────────────────────────────────────────── */
    function burstHearts(btn) {
      const closing = document.getElementById('closing');
      const rect = closing.getBoundingClientRect();
      const colors = ['❤️','💕','💖','💗','💓','🌸','✨'];

      for (let i = 0; i < 24; i++) {
        setTimeout(() => {
          const span = document.createElement('span');
          span.className = 'burst-heart';
          span.textContent = colors[Math.floor(Math.random() * colors.length)];
          span.style.left = Math.random() * 100 + '%';
          span.style.bottom = '0';
          span.style.animationDelay = Math.random() * .5 + 's';
          span.style.animationDuration = (2 + Math.random() * 2) + 's';
          closing.appendChild(span);
          span.addEventListener('animationend', () => span.remove());
        }, i * 60);
      }
    }

    /* ──────────────────────────────────────────
      10. SMOOTH SCROLL on nav buttons
    ────────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });