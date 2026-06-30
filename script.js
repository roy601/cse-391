'use strict';

var mouse = { x: 0, y: 0 };
document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

/* ============================================================
   1. YEAR + PAGE META
============================================================ */
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('pageMeta').innerHTML =
    'URL: ' + window.location.href +
    '&nbsp; | &nbsp;Last modified: ' + document.lastModified;

/* ============================================================
   2. PROFILE PHOTO FALLBACK
============================================================ */
(function () {
    var img      = document.getElementById('profileImg');
    var fallback = document.getElementById('photoFallback');
    function showFallback() {
        img.style.display      = 'none';
        fallback.style.display = 'flex';
    }
    if (img) {
        img.addEventListener('error', showFallback);
        if (img.complete && img.naturalWidth === 0) showFallback();
    }
}());

/* ============================================================
   3. CUSTOM CURSOR
============================================================ */
(function () {
    var dot  = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    var rx = 0, ry = 0;

    /* dot snaps to cursor; ring lerps behind using shared mouse state */
    document.addEventListener('mousemove', function (e) {
        dot.style.left = e.clientX + 'px';
        dot.style.top  = e.clientY + 'px';
    });

    (function animRing() {
        rx += (mouse.x - rx) * 0.12;
        ry += (mouse.y - ry) * 0.12;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(animRing);
    }());

    document.querySelectorAll('a, button, .tilt-card').forEach(function (el) {
        el.addEventListener('mouseenter', function () { ring.classList.add('hovered'); });
        el.addEventListener('mouseleave', function () { ring.classList.remove('hovered'); });
    });
}());

/* ============================================================
   4. SCROLL PROGRESS BAR
============================================================ */
window.addEventListener('scroll', function () {
    var pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    document.getElementById('scrollBar').style.width = pct + '%';
});

/* ============================================================
   5. STICKY NAV + ACTIVE SECTION HIGHLIGHT
============================================================ */
(function () {
    var navbar   = document.getElementById('navbar');
    var navLinks = document.querySelectorAll('.nav-links a[data-section]');
    var sections = ['about', 'education', 'work', 'skills', 'links', 'contact'];

    window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 60);

        var current = '';
        sections.forEach(function (id) {
            var el = document.getElementById(id);
            if (el && window.scrollY >= el.offsetTop - 140) current = id;
        });
        navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('data-section') === current);
        });
    });
}());

/* ============================================================
   6. MOBILE NAV TOGGLE
============================================================ */
(function () {
    var toggle = document.getElementById('navToggle');
    var links  = document.getElementById('navLinks');
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { links.classList.remove('open'); });
    });
}());

/* ============================================================
   7. THEME TOGGLE
============================================================ */
(function () {
    var btn     = document.getElementById('themeToggle');
    var icon    = btn.querySelector('.toggle-icon');
    var ghStats = document.getElementById('ghStats');
    btn.addEventListener('click', function () {
        var isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        icon.innerHTML = isDark ? '&#9790;' : '&#9728;';
        if (ghStats) {
            ghStats.src = isDark ? ghStats.dataset.lightSrc : ghStats.dataset.darkSrc;
        }
    });
}());

/* ============================================================
   8. 3D PARTICLE ORB
============================================================ */
(function initOrb() {
    var canvas = document.getElementById('orbCanvas');
    var hintEl = document.getElementById('orbHint');
    if (!canvas) return;

    var ctx  = canvas.getContext('2d');
    var DPR  = window.devicePixelRatio || 1;
    var SIZE = 400;
    canvas.width  = SIZE * DPR;
    canvas.height = SIZE * DPR;
    canvas.style.width  = SIZE + 'px';
    canvas.style.height = SIZE + 'px';
    ctx.scale(DPR, DPR);
    var CX = SIZE / 2, CY = SIZE / 2;

    var R    = 148;            /* sphere radius in px   */
    var FL   = 400;            /* focal length          */
    var N    = 200;            /* particle count        */
    var CONN = Math.cos(0.50); /* edge connection angle */

    /* Fibonacci lattice: spreads N points evenly over a sphere surface */
    var golden = Math.PI * (3 - Math.sqrt(5));
    var parts  = [];
    for (var i = 0; i < N; i++) {
        var y = 1 - (i / (N - 1)) * 2;
        var r = Math.sqrt(1 - y * y);
        var t = golden * i;
        parts.push({
            x: Math.cos(t) * r * R,
            y: y * R,
            z: Math.sin(t) * r * R,
            sz:     1.3 + Math.random() * 1.6,
            bright: Math.random() < 0.13,
            phase:  Math.random() * Math.PI * 2
        });
    }

    /* Edges are fixed in 3-D space — computed once, rotated every frame */
    var edges = [];
    for (var i = 0; i < N; i++) {
        for (var j = i + 1; j < N; j++) {
            var a = parts[i], b = parts[j];
            if ((a.x*b.x + a.y*b.y + a.z*b.z) / (R * R) > CONN) edges.push([i, j]);
        }
    }

    var rX = 0.28, rY = 0;        /* current rotation angles  */
    var vX = 0,    vY = 0.0028;   /* angular velocity         */
    var drag = false, lx = 0, ly = 0;

    /* Project a 3-D point onto the 2-D canvas using perspective */
    function project(px, py, pz) {
        var cy = Math.cos(rY), sy = Math.sin(rY);
        var x1 = px * cy + pz * sy,  z1 = -px * sy + pz * cy;
        var cx2 = Math.cos(rX), sx2 = Math.sin(rX);
        var y2 = py * cx2 - z1 * sx2, z2 = py * sx2 + z1 * cx2;
        var sc = FL / (FL + z2 + R);
        return { sx: CX + x1 * sc, sy: CY + y2 * sc, sz: z2, sc: sc };
    }

    /* Converts depth (sz) to a 0 (back) → 1 (front) factor for opacity/size */
    function df(sz) { return (sz + R) / (2 * R); }

    /* Theme-aware color helpers — orb uses dark particles on light bg, white on dark bg */
    function isLight() { return document.body.getAttribute('data-theme') === 'light'; }
    function dimColor(al) {
        return isLight()
            ? 'rgba(0,0,0,' + Math.min(al * 5, 0.85) + ')'
            : 'rgba(255,255,255,' + al + ')';
    }
    function accentColor(al) {
        return isLight()
            ? 'rgba(90,55,0,' + al + ')'
            : 'rgba(255,225,53,' + al + ')';
    }

    function render(ts) {
        ctx.clearRect(0, 0, SIZE, SIZE);

        /* Auto-spin when not being dragged */
        if (!drag) {
            rY += vY; rX += vX;
            vX *= 0.93;
            vY  = vY * 0.994 + 0.0028 * 0.006;
            if (Math.abs(vY) < 0.002) vY = 0.0028;
        }

        /* Project every particle to screen space */
        var pp = parts.map(function (p, i) {
            var pr = project(p.x, p.y, p.z);
            return { i: i, sx: pr.sx, sy: pr.sy, sz: pr.sz, sc: pr.sc, p: p };
        });

        /* Draw edges — back-facing ones fade out via depth factor */
        var edgeDimMult = isLight() ? 0.55 : 0.10;
        edges.forEach(function (e) {
            var a = pp[e[0]], b = pp[e[1]];
            var d = (df(a.sz) + df(b.sz)) * 0.5;
            if (d < 0.08) return;
            var bright = a.p.bright || b.p.bright;
            var al = d * (bright ? 0.45 : edgeDimMult);
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
            ctx.strokeStyle = bright ? accentColor(al) : dimColor(al);
            ctx.lineWidth = 0.6; ctx.stroke();
        });

        /* Painter's algorithm: sort back → front so near particles overdraw far ones */
        pp.sort(function (a, b) { return a.sz - b.sz; });

        pp.forEach(function (item) {
            var d  = df(item.sz);
            var p  = item.p;
            var sz = p.sz * item.sc;

            if (p.bright) {
                var pulse = 0.72 + 0.28 * Math.sin(ts * 0.0017 + p.phase);
                var al    = 0.3 + d * 0.7;
                ctx.shadowBlur  = isLight() ? 0 : 12 * d;
                ctx.shadowColor = isLight() ? 'transparent' : '#FFE135';
                ctx.beginPath();
                ctx.arc(item.sx, item.sy, sz * 1.8 * pulse, 0, Math.PI * 2);
                ctx.fillStyle = accentColor(al);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                var al = 0.06 + d * 0.58;
                ctx.beginPath();
                ctx.arc(item.sx, item.sy, sz, 0, Math.PI * 2);
                ctx.fillStyle = dimColor(al);
                ctx.fill();
            }
        });

        requestAnimationFrame(render);
    }

    /* Mouse drag — updates rotation velocity, released inertia auto-decays above */
    canvas.addEventListener('mousedown', function (e) {
        drag = true; lx = e.clientX; ly = e.clientY;
        vX = 0; vY = 0;
        if (hintEl) hintEl.textContent = '↔ rotating';
    });
    window.addEventListener('mousemove', function (e) {
        if (!drag) return;
        var dx = e.clientX - lx, dy = e.clientY - ly;
        rY += dx * 0.005; rX += dy * 0.005;
        vY  = dx * 0.005; vX  = dy * 0.005;
        lx = e.clientX; ly = e.clientY;
    });
    window.addEventListener('mouseup', function () {
        if (!drag) return;
        drag = false;
        if (hintEl) hintEl.textContent = '⇄ drag to rotate';
    });

    /* Touch drag (same logic as mouse) */
    canvas.addEventListener('touchstart', function (e) {
        e.preventDefault(); drag = true;
        lx = e.touches[0].clientX; ly = e.touches[0].clientY;
        vX = 0; vY = 0;
    }, { passive: false });
    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault(); if (!drag) return;
        var dx = e.touches[0].clientX - lx, dy = e.touches[0].clientY - ly;
        rY += dx * 0.005; rX += dy * 0.005;
        vY  = dx * 0.005; vX  = dy * 0.005;
        lx = e.touches[0].clientX; ly = e.touches[0].clientY;
    }, { passive: false });
    canvas.addEventListener('touchend', function () { drag = false; });

    requestAnimationFrame(render);
}());

/* ============================================================
   9. CANVAS PARTICLE NETWORK (hero background)
============================================================ */
(function initParticles() {
    var canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    var COUNT     = 70;
    var particles = [];

    function Particle() { this.reset(); }
    Particle.prototype.reset = function () {
        this.x      = Math.random() * canvas.width;
        this.y      = Math.random() * canvas.height;
        this.vx     = (Math.random() - 0.5) * 0.45;
        this.vy     = (Math.random() - 0.5) * 0.45;
        this.r      = Math.random() * 1.8 + 0.8;
        this.a      = Math.random() * 0.4 + 0.2;
        this.yellow = Math.random() > 0.45;
    };
    Particle.prototype.update = function () {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    };
    Particle.prototype.draw = function () {
        var light = document.body.getAttribute('data-theme') === 'light';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        if (light) {
            ctx.fillStyle = this.yellow
                ? 'rgba(90,55,0,' + this.a + ')'
                : 'rgba(0,0,0,' + (this.a * 0.35) + ')';
        } else {
            ctx.fillStyle = this.yellow
                ? 'rgba(255,225,53,' + this.a + ')'
                : 'rgba(255,255,255,' + (this.a * 0.4) + ')';
        }
        ctx.fill();
    };

    for (var i = 0; i < COUNT; i++) particles.push(new Particle());

    function drawLines() {
        for (var a = 0; a < particles.length; a++) {
            for (var b = a + 1; b < particles.length; b++) {
                var dx = particles[a].x - particles[b].x;
                var dy = particles[a].y - particles[b].y;
                var d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 115) {
                    var light2 = document.body.getAttribute('data-theme') === 'light';
                    var lineA  = 0.1 * (1 - d / 115);
                    ctx.beginPath();
                    ctx.strokeStyle = light2
                        ? 'rgba(90,55,0,' + (lineA * 2.5) + ')'
                        : 'rgba(255,225,53,' + lineA + ')';
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    (function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function (p) { p.update(); p.draw(); });
        drawLines();
        requestAnimationFrame(loop);
    }());
}());

/* ============================================================
   10. 3D TILT ON CARDS
============================================================ */
(function () {
    document.querySelectorAll('.tilt-card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width  - 0.5;
            var y = (e.clientY - r.top)  / r.height - 0.5;
            card.style.transform =
                'perspective(900px) rotateY(' + (x * 14) + 'deg) ' +
                'rotateX(' + (-y * 14) + 'deg) scale3d(1.03,1.03,1.03)';
        });
        card.addEventListener('mouseleave', function () {
            card.style.transform =
                'perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
        });
    });
}());

/* ============================================================
   11. FADE-IN ON SCROLL
============================================================ */
(function () {
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) e.target.classList.add('visible');
        });
    }, { threshold: 0.07 });

    document.querySelectorAll('.fade-in, .project-card, .skill-category, .link-category')
        .forEach(function (el) { obs.observe(el); });
}());

/* ============================================================
   12. TEXT SCRAMBLE on hero name
============================================================ */
(function () {
    var CHARS = '!<>-_/[]{}=+*^?#@0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function scramble(el, finalText, delay) {
        setTimeout(function () {
            /* Each character gets a random frame window to scramble through */
            var queue = [];
            for (var i = 0; i < finalText.length; i++) {
                queue.push({
                    to:    finalText[i],
                    start: Math.floor(Math.random() * 16),
                    end:   Math.floor(Math.random() * 16) + 18,
                    char:  ''
                });
            }
            var frame = 0;
            (function tick() {
                var out = '', done = 0;
                for (var j = 0; j < queue.length; j++) {
                    var q = queue[j];
                    if (frame >= q.end) {
                        done++;
                        out += q.to;
                    } else if (frame >= q.start) {
                        if (Math.random() < 0.3) {
                            q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
                        }
                        out += '<span class="sc">' + (q.char || q.to) + '</span>';
                    } else {
                        out += q.to;
                    }
                }
                el.innerHTML = out;
                if (done < queue.length) { frame++; requestAnimationFrame(tick); }
            }());
        }, delay || 0);
    }

    var nameFirst = document.querySelector('.name-first');
    var nameLast  = document.querySelector('.name-last');

    /* Initial load animation */
    if (nameFirst) scramble(nameFirst, 'Apurba', 400);
    if (nameLast)  scramble(nameLast,  'Roy',    900);

    /* Re-scramble every 5 s */
    function loopScramble() {
        if (nameFirst) scramble(nameFirst, 'Apurba', 0);
        if (nameLast)  scramble(nameLast,  'Roy',    500);
        setTimeout(loopScramble, 5000);
    }
    setTimeout(loopScramble, 5000);
}());

/* ============================================================
   13. TYPING / CYCLING ROLE TEXT
============================================================ */
(function () {
    var el = document.getElementById('typingRole');
    if (!el) return;

    var roles = [
        'Full-Stack Developer',
        'AI / ML Researcher',
        'Flutter Developer',
        'Electron Desktop Builder',
        'Open Source Builder'
    ];
    var ri = 0, ci = 0, deleting = false;
    var SPEED_TYPE = 75, SPEED_DEL = 38, PAUSE = 2000;

    (function type() {
        var current = roles[ri];
        if (!deleting) {
            el.textContent = current.slice(0, ++ci);
            if (ci === current.length) {
                deleting = true;
                setTimeout(type, PAUSE);
                return;
            }
        } else {
            el.textContent = current.slice(0, --ci);
            if (ci === 0) {
                deleting = false;
                ri = (ri + 1) % roles.length;
            }
        }
        setTimeout(type, deleting ? SPEED_DEL : SPEED_TYPE);
    }());
}());

/* ============================================================
   14. COUNT-UP ANIMATION on stats
============================================================ */
(function () {
    var animated = []; /* tracks which elements have already run */
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            if (animated.indexOf(el) !== -1) return;
            animated.push(el);

            var raw     = el.textContent.trim();
            var num     = parseInt(raw, 10);
            var hasPlus = raw.indexOf('+') !== -1;
            if (isNaN(num)) return;

            var start = null, dur = 1400;
            (function step(ts) {
                if (!start) start = ts;
                var pct  = Math.min((ts - start) / dur, 1);
                var ease = 1 - Math.pow(1 - pct, 3); /* cubic ease-out */
                el.textContent = Math.floor(ease * num) + (hasPlus ? '+' : '');
                if (pct < 1) requestAnimationFrame(step);
            }(performance.now()));
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.stat-number').forEach(function (s) { obs.observe(s); });
}());

/* ============================================================
   15. MAGNETIC BUTTONS
============================================================ */
(function () {
    document.querySelectorAll('.btn').forEach(function (btn) {
        btn.style.transition = 'transform 0.18s ease, box-shadow 0.28s ease';
        btn.addEventListener('mousemove', function (e) {
            var r = btn.getBoundingClientRect();
            var x = (e.clientX - r.left - r.width  / 2) * 0.4;
            var y = (e.clientY - r.top  - r.height / 2) * 0.4;
            btn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        });
        btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
}());

/* ============================================================
   16. MOUSE PARALLAX on hero
============================================================ */
(function () {
    var heroContent = document.querySelector('.hero-content');
    var orbWrapper  = document.querySelector('.orb-wrapper');

    /* Runs in rAF loop reading shared mouse state — no extra event listener */
    (function animParallax() {
        var xPct = (mouse.x / window.innerWidth  - 0.5);
        var yPct = (mouse.y / window.innerHeight - 0.5);
        if (heroContent) heroContent.style.transform =
            'translate(' + (xPct * 12) + 'px,' + (yPct * 9) + 'px)';
        if (orbWrapper)  orbWrapper.style.transform =
            'translate(' + (-xPct * 7) + 'px,' + (-yPct * 5) + 'px)';
        requestAnimationFrame(animParallax);
    }());
}());

/* ============================================================
   17. CURSOR TRAIL
============================================================ */
(function () {
    var TRAIL_COUNT = 14;
    var trail = [];

    for (var i = 0; i < TRAIL_COUNT; i++) {
        var dot = document.createElement('div');
        dot.className = 'cursor-trail';
        document.body.appendChild(dot);
        trail.push({ el: dot, x: 0, y: 0 });
    }

    /* Reads from shared mouse state — no extra event listener */
    (function animTrail() {
        var lx = mouse.x, ly = mouse.y;
        for (var j = 0; j < trail.length; j++) {
            var t    = trail[j];
            var ease = 0.18 - j * 0.009;
            t.x += (lx - t.x) * ease;
            t.y += (ly - t.y) * ease;
            var scale   = 1 - j / TRAIL_COUNT * 0.75;
            var opacity = (1 - j / TRAIL_COUNT) * 0.45;
            t.el.style.left      = t.x + 'px';
            t.el.style.top       = t.y + 'px';
            t.el.style.opacity   = opacity;
            t.el.style.transform = 'translate(-50%,-50%) scale(' + scale + ')';
            lx = t.x; ly = t.y;
        }
        requestAnimationFrame(animTrail);
    }());
}());

/* ============================================================
   18. SIDE SECTION PROGRESS DOTS
============================================================ */
(function () {
    var SECTIONS = ['hero', 'about', 'education', 'work', 'skills', 'links', 'quote', 'contact'];
    var nav = document.getElementById('sideNav');
    if (!nav) return;

    SECTIONS.forEach(function (id) {
        var btn = document.createElement('button');
        btn.className = 'side-dot';
        btn.setAttribute('aria-label', 'Jump to ' + id);
        btn.setAttribute('data-sid', id);
        btn.addEventListener('click', function () {
            var el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        });
        nav.appendChild(btn);
    });

    function updateDots() {
        var current = 'hero';
        SECTIONS.forEach(function (id) {
            var el = document.getElementById(id);
            if (el && window.scrollY >= el.offsetTop - 200) current = id;
        });
        nav.querySelectorAll('.side-dot').forEach(function (dot) {
            dot.classList.toggle('active', dot.getAttribute('data-sid') === current);
        });
    }
    window.addEventListener('scroll', updateDots);
    updateDots();
}());

/* ============================================================
   19. CONTACT FORM — async Formspree submission
============================================================ */
(function () {
    var form   = document.getElementById('contactForm');
    var btn    = document.getElementById('contactBtn');
    var status = document.getElementById('formStatus');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        btn.disabled    = true;
        btn.textContent = 'Sending…';
        status.textContent = '';
        status.className   = 'form-status';

        fetch(form.action, {
            method:  'POST',
            body:    new FormData(form),
            headers: { 'Accept': 'application/json' }
        })
        .then(function (res) {
            if (res.ok) {
                status.textContent = '✓ Message sent — I\'ll get back to you soon!';
                status.classList.add('form-success');
                form.reset();
            } else {
                return res.json().then(function (data) {
                    throw new Error(data.errors ? data.errors.map(function(e){return e.message;}).join(', ') : 'Something went wrong.');
                });
            }
        })
        .catch(function (err) {
            status.textContent = '✕ ' + err.message;
            status.classList.add('form-error');
        })
        .finally(function () {
            btn.disabled    = false;
            btn.textContent = 'Send Message →';
        });
    });
}());

/* ============================================================
   20. PROJECT CARD CLICK EXPAND
============================================================ */
(function () {
    document.querySelectorAll('.project-card').forEach(function (card) {
        card.addEventListener('click', function () {
            var isExpanded = card.classList.contains('expanded');
            document.querySelectorAll('.project-card.expanded').forEach(function (c) {
                c.classList.remove('expanded');
            });
            if (!isExpanded) card.classList.add('expanded');
        });
    });
}());

