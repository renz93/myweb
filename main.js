/* =========
   Util
   ========= */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

/* =========
   Smooth anchor + offset header
   ========= */
const header = $('.site-header');
const headerH = () => header ? header.getBoundingClientRect().height : 0;

$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1 && $(id)) {
      e.preventDefault();
      const y = $(id).getBoundingClientRect().top + window.scrollY - headerH() - 8;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.pushState(null, '', id);
      $(id).setAttribute('tabindex', '-1'); // fokus untuk a11y
      $(id).focus({ preventScroll: true });
      setTimeout(()=> $(id).removeAttribute('tabindex'), 500);
    }
  });
});

/* =========
   Highlight nav saat section aktif
   ========= */
const sections = $$('#tentang, #karya, #eksperimen, #kontak');
const links = new Map($$('.site-nav a').map(a => [a.getAttribute('href'), a]));
const obs = new IntersectionObserver(entries => {
  entries.forEach(ent => {
    if (ent.isIntersecting) {
      const id = `#${ent.target.id}`;
      $$('.site-nav a[aria-current="page"]').forEach(x => x.removeAttribute('aria-current'));
      if (links.get(id)) links.get(id).setAttribute('aria-current', 'page');
    }
  });
}, { rootMargin: `-${Math.max(0, headerH()-4)}px 0px -60% 0px`, threshold: 0.1 });
sections.forEach(s => obs.observe(s));

/* =========
   Skip link fokus (aksesibilitas)
   ========= */
const skip = $('.skip-link');
if (skip) {
  skip.addEventListener('click', () => {
    const main = $('#main');
    main.setAttribute('tabindex','-1');
    main.focus();
    setTimeout(()=> main.removeAttribute('tabindex'), 300);
  });
}

/* =========
   Form kontak (dummy handler)
   - Nonaktifkan submit default (belum ada backend)
   ========= */
const form = $('.contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    alert('Form belum dihubungkan ke backend. Silakan kirim email langsung 🙂');
  });
}

/* =========
   Placeholder Kanvas 3D
   - Ringan: 2D canvas animasi sebagai placeholder
   - Jika Three.js tersedia (window.THREE), pakai Three.js
   - Lazy init saat #eksperimen terlihat
   ========= */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const expSection = $('#eksperimen');
const canvasWrap = $('.canvas-wrap');

function initPlaceholderCanvas() {
  if (!canvasWrap || canvasWrap.querySelector('canvas')) return;
  const c = document.createElement('canvas');
  c.width = canvasWrap.clientWidth;
  c.height = Math.max(300, canvasWrap.clientHeight);
  canvasWrap.appendChild(c);

  const ctx = c.getContext('2d');
  let t = 0, raf;
  function draw() {
    const w = c.width, h = c.height;
    ctx.clearRect(0,0,w,h);

    // background gradient
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,'#0f1218'); g.addColorStop(1,'#1b2533');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

    // rotating squares
    const cx = w/2, cy = h/2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t*0.001);
    for (let i=0; i<6; i++){
      ctx.rotate(Math.PI/3);
      ctx.globalAlpha = 0.15 + (i/10);
      ctx.fillStyle = '#5cc8ff';
      const s = 40 + i*22 + 12*Math.sin(t*0.002+i);
      ctx.fillRect(-s/2, -s/2, s, s);
    }
    ctx.restore();

    // text
    ctx.globalAlpha = 1;
    ctx.font = '600 16px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillStyle = '#9aa3ad';
    ctx.textAlign = 'center';
    ctx.fillText('Placeholder Kanvas — siap untuk Three.js', cx, h - 24);

    t += 16;
    if (!prefersReduced) raf = requestAnimationFrame(draw);
  }
  draw();

  // Resize
  const ro = new ResizeObserver(() => {
    c.width = canvasWrap.clientWidth;
    c.height = Math.max(300, canvasWrap.clientHeight);
    if (prefersReduced && raf) cancelAnimationFrame(raf);
    if (!prefersReduced) draw();
  });
  ro.observe(canvasWrap);
}

async function initThreeIfAvailable() {
  if (!window.THREE) return false;
  try {
    const { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshNormalMaterial, Mesh } = window.THREE;
    const scene = new Scene();
    const camera = new PerspectiveCamera(60, canvasWrap.clientWidth / 300, 0.1, 100);
    camera.position.z = 3;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWrap.clientWidth, Math.max(300, canvasWrap.clientHeight));
    canvasWrap.innerHTML = '';
    canvasWrap.appendChild(renderer.domElement);

    const mesh = new Mesh(new BoxGeometry(), new MeshNormalMaterial());
    scene.add(mesh);

    function onResize(){
      const w = canvasWrap.clientWidth;
      const h = Math.max(300, canvasWrap.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    new ResizeObserver(onResize).observe(canvasWrap);

    let raf;
    const animate = () => {
      mesh.rotation.y += 0.01; mesh.rotation.x += 0.005;
      renderer.render(scene, camera);
      if (!prefersReduced) raf = requestAnimationFrame(animate);
    };
    animate();
    return true;
  } catch (e) {
    console.warn('Gagal init Three.js:', e);
    return false;
  }
}

/* Lazy init saat terlihat */
if (expSection && canvasWrap) {
  const once = new IntersectionObserver(async (ents, ob) => {
    if (ents.some(ent => ent.isIntersecting)) {
      ob.disconnect();
      // Jika Three.js tersedia (mis. kamu menaruh /libs/three.min.js & import di HTML), pakai itu.
      const usedThree = await initThreeIfAvailable();
      if (!usedThree) initPlaceholderCanvas();
    }
  }, { rootMargin: '0px 0px -20% 0px', threshold: 0.2 });
  once.observe(expSection);
}

/* =========
   Kualitas hidup kecil
   ========= */
// Tambah kelas ke body saat JS aktif
document.documentElement.classList.add('js-enabled');
