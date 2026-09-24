'use strict';

/* ---- GUEST NAME (?to=Nama) ---- */
const GUEST_NAME = (function readGuestName() {
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get('to') || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    return raw;
})();

(function setGuestName() {
    if (!GUEST_NAME) return;
    const el = document.getElementById('guestName');
    if (el) el.textContent = GUEST_NAME;

    // Sapaan personal + isi otomatis nama di buku tamu
    const nameInput = document.getElementById('wishName');
    if (nameInput) nameInput.value = GUEST_NAME;

    const greet = document.getElementById('wishGreeting');
    if (greet) {
        greet.textContent = 'Halo, ' + GUEST_NAME + '! Tinggalkan ucapan dan doa restu untuk kami.';
        greet.style.display = 'block';
    }
})();

/* ---- GOOGLE CALENDAR URL ---- */
(function setupCalendarLinks() {
    const loc = 'Jalan Kebon 200 RT.003 RW.006, Kel. Kamal, Kec. Kalideres, Jakarta Barat';
    const title = 'The Wedding of Fitria & Barkah';
    const details = 'Pernikahan Fitria Ramadhani & Achmad Subarkah\n\n' +
        '• Akad Nikah: 08.00 WIB\n' +
        '• Resepsi Pernikahan: 10.00 WIB — Selesai\n' +
        '• Lokasi: ' + loc;

    // All-day event for 3 October 2026 (dates=20261003/20261004 tanpa penentuan jam)
    const calUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
        '&text=' + encodeURIComponent(title) +
        '&dates=20261003/20261004' +
        '&location=' + encodeURIComponent(loc) +
        '&details=' + encodeURIComponent(details);

    const btnCal = document.getElementById('btnCal');
    if (btnCal) {
        btnCal.href = calUrl;
    }
})();

/* ---- COUNTDOWN TIMER ---- */
(function initCountdown() {
    const target = new Date('2026-10-03T01:00:00.000Z'); // 08:00 WIB

    function update() {
        const now = new Date();
        const diff = target - now;

        if (diff <= 0) {
            document.getElementById('cdDays').textContent = '00';
            document.getElementById('cdHours').textContent = '00';
            document.getElementById('cdMins').textContent = '00';
            document.getElementById('cdSecs').textContent = '00';
            return;
        }

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        document.getElementById('cdDays').textContent = String(days).padStart(2, '0');
        document.getElementById('cdHours').textContent = String(hours).padStart(2, '0');
        document.getElementById('cdMins').textContent = String(mins).padStart(2, '0');
        document.getElementById('cdSecs').textContent = String(secs).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
})();

/* ---- OPENING GATE ---- */
(function initGate() {
    const gate = document.getElementById('gate');
    const mainContent = document.getElementById('mainContent');
    const body = document.body;
    const btnOpen = document.getElementById('btnOpen');
    const petals = document.getElementById('petalsCanvas');
    const audio = document.getElementById('weddingAudio');
    const audioCtrl = document.getElementById('audioControl');

    btnOpen.addEventListener('click', function openInvitation() {
        // Play audio immediately inside the click event handler (preserves iOS Safari user gesture context)
        audio.volume = 0.35;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(function () {
                /* Autoplay policy fallback */
            });
        }

        gate.classList.add('closing');
        gate.addEventListener('animationend', function () {
            gate.style.display = 'none';
            mainContent.classList.add('visible');
            mainContent.removeAttribute('aria-hidden');
            body.classList.remove('locked');
            petals.classList.add('active');
            audioCtrl.classList.add('visible');

            // Init scroll observer
            initScrollReveal();
        }, { once: true });
    });
})();

/* ---- AUDIO CONTROL & BACKGROUND/TAB VISIBILITY ---- */
(function initAudio() {
    const audio = document.getElementById('weddingAudio');
    const btn = document.getElementById('btnAudio');
    let wasPlayingBeforeHide = false;

    function updateBtnState(isPlaying) {
        if (isPlaying) {
            btn.innerHTML = '<i class="bi bi-pause-fill"></i>';
            btn.classList.add('playing');
            btn.setAttribute('aria-label', 'Jeda musik');
        } else {
            btn.innerHTML = '<i class="bi bi-music-note-beamed"></i>';
            btn.classList.remove('playing');
            btn.setAttribute('aria-label', 'Putar musik');
        }
    }

    btn.addEventListener('click', function () {
        if (!audio.paused) {
            audio.pause();
        } else {
            audio.play().catch(function () { });
        }
    });

    audio.addEventListener('play', function () {
        updateBtnState(true);
    });

    audio.addEventListener('pause', function () {
        updateBtnState(false);
    });

    // Pause when switching tabs or minimizing / pressing home button
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            if (!audio.paused) {
                wasPlayingBeforeHide = true;
                audio.pause();
            }
        } else {
            if (wasPlayingBeforeHide) {
                audio.play().catch(function () { });
                wasPlayingBeforeHide = false;
            }
        }
    });

    // Fallback for mobile browser pagehide / pageshow
    window.addEventListener('pagehide', function () {
        if (!audio.paused) {
            wasPlayingBeforeHide = true;
            audio.pause();
        }
    });

    window.addEventListener('pageshow', function () {
        if (wasPlayingBeforeHide && !document.hidden) {
            audio.play().catch(function () { });
            wasPlayingBeforeHide = false;
        }
    });
})();

/* ---- SCROLL REVEAL ---- */
function initScrollReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el, i) {
        el.style.transitionDelay = (i % 4) * 0.08 + 's';
        observer.observe(el);
    });
}

/* ---- LIGHTBOX ---- */
(function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImg');
    const lbClose = document.getElementById('lightboxClose');

    document.querySelectorAll('.gallery-item').forEach(function (item) {
        function openLB() {
            lbImg.src = item.dataset.src;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        item.addEventListener('click', openLB);
        item.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(); }
        });
    });

    function closeLB() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        lbImg.src = '';
    }
    lbClose.addEventListener('click', closeLB);
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLB();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLB();
    });
})();

/* ---- WISHES / BUKU TAMU (GOOGLE SHEETS & PAGINATION) ---- */
(function initWishes() {
    // URL Google Apps Script Web App (Dapat diisi saat sudah di-deploy)
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyarBgrqcfZvfoo4PRsCOyj2o4qYVhWgTLomUCgZf2d_lk5lnLdVPrDi11bUeAVGzH-Kw/exec';
    const STORAGE_KEY = 'fitria_barkah_wishes_v1';
    const ITEMS_PER_PAGE = 5;

    const form = document.getElementById('wishForm');
    const nameInput = document.getElementById('wishName');
    const msgInput = document.getElementById('wishMsg');
    const btnSubmit = document.getElementById('btnWishSubmit');
    const list = document.getElementById('wishesList');
    const pagination = document.getElementById('wishesPagination');
    const pageInfo = document.getElementById('wishPageInfo');
    const btnPrev = document.getElementById('btnPrevWish');
    const btnNext = document.getElementById('btnNextWish');

    let allWishes = [];
    let currentPage = 1;

    // Sample awal ucapan doa restu
    const defaultWishes = [
        {
            name: 'Keluarga Besar Fitria & Barkah',
            message: 'Selamat menempuh hidup baru untuk Fitria & Barkah. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Bahagia selalu hingga akhir hayat!',
            ts: 1788334800000
        }
    ];

    function loadLocalWishes() {
        try {
            const cached = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return (cached && cached.length) ? cached : defaultWishes;
        } catch {
            return defaultWishes;
        }
    }

    function saveLocalWishes(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch { }
    }

    function formatDate(ts) {
        const d = new Date(ts);
        if (isNaN(d.getTime())) return 'Baru saja';
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' +
            d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    function escHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderPage(page) {
        const total = allWishes.length;
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        currentPage = page;

        list.innerHTML = '';

        if (total === 0) {
            list.innerHTML = '<p class="wishes-empty"><i class="bi bi-chat-dots"></i> Belum ada ucapan. Jadilah yang pertama memberikan doa restu!</p>';
            pagination.style.display = 'none';
            return;
        }

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const pageItems = allWishes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        pageItems.forEach(function (w) {
            const card = document.createElement('div');
            card.className = 'wish-card';
            card.innerHTML =
                '<p class="wish-name"><i class="bi bi-chat-heart-fill"></i> ' + escHtml(w.name) + '</p>' +
                '<p class="wish-msg">' + escHtml(w.message) + '</p>' +
                '<p class="wish-time"><i class="bi bi-clock"></i> ' + formatDate(w.ts) + '</p>';
            list.appendChild(card);
        });

        // Update pagination bar
        if (totalPages > 1) {
            pagination.style.display = 'flex';
            pageInfo.textContent = 'Halaman ' + currentPage + ' dari ' + totalPages;
            btnPrev.disabled = (currentPage <= 1);
            btnNext.disabled = (currentPage >= totalPages);
        } else {
            pagination.style.display = 'none';
        }
    }

    // Pagination button events
    btnPrev.addEventListener('click', function () {
        if (currentPage > 1) {
            renderPage(currentPage - 1);
            list.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    btnNext.addEventListener('click', function () {
        const totalPages = Math.ceil(allWishes.length / ITEMS_PER_PAGE) || 1;
        if (currentPage < totalPages) {
            renderPage(currentPage + 1);
            list.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    // Fetch from Google Sheets if configured
    async function fetchGoogleSheetsWishes() {
        if (!GOOGLE_SHEETS_URL) {
            allWishes = loadLocalWishes();
            renderPage(1);
            return;
        }

        try {
            const res = await fetch(GOOGLE_SHEETS_URL);
            const json = await res.json();
            if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
                allWishes = json.data.map(item => ({
                    name: item.name,
                    message: item.message,
                    ts: item.timestamp || Date.now()
                }));
                saveLocalWishes(allWishes);
            } else {
                allWishes = loadLocalWishes();
            }
        } catch (err) {
            console.log('Using local wishes cache:', err);
            allWishes = loadLocalWishes();
        }
        renderPage(1);
    }

    fetchGoogleSheetsWishes();

    // Submit handler
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = nameInput.value.trim();
        const msg = msgInput.value.trim();
        if (!name || !msg) return;

        const newWish = { name, message: msg, ts: Date.now() };

        // UI loading state
        const origBtnContent = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="bi bi-hourglass-split"></i> Mengirim...';

        // Save locally immediately
        allWishes.unshift(newWish);
        saveLocalWishes(allWishes);
        renderPage(1);
        form.reset();
        if (GUEST_NAME) nameInput.value = GUEST_NAME;

        // Send to Google Sheets if configured
        if (GOOGLE_SHEETS_URL) {
            try {
                const formData = new URLSearchParams();
                formData.append('name', name);
                formData.append('message', msg);
                formData.append('timestamp', new Date().toISOString());

                await fetch(GOOGLE_SHEETS_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                });
            } catch (err) {
                console.log('Google Sheets submit notice:', err);
            }
        }

        btnSubmit.disabled = false;
        btnSubmit.innerHTML = origBtnContent;
        showToast('<i class="bi bi-check-circle-fill"></i> Ucapan Anda berhasil terkirim!');
    });
})();

/* ---- COPY TO CLIPBOARD ---- */
(function initCopy() {
    document.querySelectorAll('.btn-copy').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const account = btn.dataset.account;
            if (!account) return;

            (navigator.clipboard
                ? navigator.clipboard.writeText(account)
                : Promise.resolve(
                    (function () {
                        const ta = document.createElement('textarea');
                        ta.value = account;
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                    })()
                )
            ).then(function () {
                showToast('<i class="bi bi-check-circle-fill"></i> Nomor berhasil disalin!');
                btn.classList.add('copied');
                const origHTML = btn.innerHTML;
                btn.innerHTML = '<i class="bi bi-check-lg"></i> Tersalin!';
                setTimeout(function () {
                    btn.classList.remove('copied');
                    btn.innerHTML = origHTML;
                }, 2500);
            }).catch(function () {
                showToast('<i class="bi bi-exclamation-triangle"></i> Gagal menyalin. Silakan salin manual.');
            });
        });
    });
})();

/* ---- TOAST ---- */
function showToast(htmlMsg, duration) {
    const toast = document.getElementById('toast');
    toast.innerHTML = htmlMsg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, duration || 3000);
}

/* ---- FALLING PETALS CANVAS ---- */
(function initPetals() {
    const canvas = document.getElementById('petalsCanvas');
    const ctx = canvas.getContext('2d');
    let W, H, petals = [], raf;
    let active = true;

    // Petal colors matching maroon/ivory palette
    const COLORS = [
        'rgba(201,164,92,0.55)',   // gold
        'rgba(245,239,227,0.45)',  // ivory
        'rgba(201,164,92,0.35)',   // gold dim
        'rgba(253,251,247,0.5)',   // ivory light
        'rgba(42,106,75,0.4)',     // green soft
    ];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function makePetal() {
        return {
            x: Math.random() * W,
            y: -20 - Math.random() * 100,
            size: 4 + Math.random() * 6,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            speedY: 0.8 + Math.random() * 1.5,
            speedX: (Math.random() - 0.5) * 0.6,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.04,
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.008 + Math.random() * 0.012,
            swayAmt: 0.5 + Math.random() * 1.2,
        };
    }

    function init() {
        petals = [];
        for (let i = 0; i < 40; i++) {
            const p = makePetal();
            p.y = Math.random() * H; // scatter on init
            petals.push(p);
        }
    }

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        // Simple ellipse petal
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        if (!active) { raf = requestAnimationFrame(loop); return; }

        petals.forEach(function (p) {
            p.sway += p.swaySpeed;
            p.x += p.speedX + Math.sin(p.sway) * p.swayAmt;
            p.y += p.speedY;
            p.rot += p.rotSpeed;

            if (p.y > H + 20) {
                Object.assign(p, makePetal());
            }

            drawPetal(p);
        });

        raf = requestAnimationFrame(loop);
    }

    resize();
    init();
    loop();
    window.addEventListener('resize', function () { resize(); init(); });
})();
