/* Food Lab — front-end behaviour
   Sections: helpers · motion (curtain, reveal, header, scroll-spy, parallax) · products · cart · checkout · contact */
(function () {
  'use strict';

  /* ------------------------------------------------------------ helpers */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var money = function (n) { return 'Rs. ' + Number(n).toLocaleString('en-US'); };

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (attrs[k] !== false && attrs[k] != null) el.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }

  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  function api(path, opts) {
    opts = opts || {};
    var init = { method: opts.method || 'GET', headers: {} };
    if (opts.body) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opts.body); }
    return fetch(path, init).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) { var err = new Error(data.error || 'Something went wrong. Please try again.'); err.field = data.field; throw err; }
        return data;
      });
    });
  }

  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* WhatsApp links get their number from a single place (kept in sync with the server's .env default) */
  var WA = '923065158738';
  $$('[data-wa]').forEach(function (a) {
    var text = a.getAttribute('data-wa');
    a.href = 'https://wa.me/' + WA + (text ? '?text=' + encodeURIComponent(text) : '');
  });
  $('#year').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------- motion */
  // 1) Start the page: optional brand curtain, then the hero entrance.
  var started = false;
  function start() {
    if (started) return; started = true;
    root.classList.add('is-ready');
    if (root.classList.contains('has-curtain')) {
      setTimeout(function () { root.classList.add('curtain-done'); }, 1100);
    }
    // once the hero image finished its entrance, parallax may take over the transform
    setTimeout(function () { root.classList.add('hero-settled'); }, reduceMotion ? 0 : 2200);
  }
  (function boot() {
    var hold = root.classList.contains('has-curtain') ? 700 : 60; // let the logo breathe on first visit
    var fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })]) : Promise.resolve();
    var imgReady = new Promise(function (resolve) {
      var img = $('#heroImg');
      if (!img || img.complete) return resolve();
      img.addEventListener('load', resolve); img.addEventListener('error', resolve); setTimeout(resolve, 1500);
    });
    Promise.all([fontsReady, imgReady, new Promise(function (r) { setTimeout(r, hold); })]).then(start);
    setTimeout(start, 2500); // safety net
  })();

  // 2) Scroll reveal (also used for products once they are rendered)
  var revealIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.classList.contains('product')) setTimeout(function () { e.target.classList.add('settled'); }, 1300);
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;
  function observeReveals(scope) {
    $$('.reveal:not(.is-in)', scope).forEach(function (el) {
      if (revealIO) revealIO.observe(el); else el.classList.add('is-in');
    });
  }
  observeReveals();

  // 3) Header state + parallax (one rAF-throttled scroll handler)
  var header = $('#header'), heroImg = $('#heroImg'), heroFrame = $('#heroFrame'), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0;
    header.classList.toggle('scrolled', y > 24);
    if (!reduceMotion && heroImg && root.classList.contains('hero-settled') && y < 900) {
      heroImg.style.transform = 'translate3d(0,' + Math.min(y * 0.05, 20).toFixed(1) + 'px,0) scale(1.1)'; // base scale matches the CSS so there is no jump
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // 4) Scroll-spy for the nav
  var navLinks = $$('#navLinks a');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // 5) Mobile menu
  var menuBtn = $('#menuToggle'), menu = $('#navLinks');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  navLinks.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('click', function (e) { if (!e.target.closest('header')) setMenu(false); });

  /* ----------------------------------------------------------- products */
  var products = [];            // active products from the API
  var grid = $('#productGrid');

  function renderSkeletons() {
    grid.setAttribute('aria-busy', 'true');
    grid.textContent = '';
    for (var i = 0; i < 6; i++) {
      grid.appendChild(h('article', { class: 'product skeleton', 'aria-hidden': 'true' }, [
        h('div', { class: 'product-media' }),
        h('div', { class: 'product-body' }, [h('div', { class: 'bar w60' }), h('div', { class: 'bar' }), h('div', { class: 'bar w40' })])
      ]));
    }
  }

  function renderProducts() {
    grid.textContent = '';
    grid.setAttribute('aria-busy', 'false');
    if (!products.length) {
      grid.appendChild(h('div', { class: 'grid-error', text: 'Our menu is being updated. Please check back soon, or message us on WhatsApp.' }));
      return;
    }
    products.forEach(function (p, i) {
      var addBtn = h('button', { class: 'btn-add', type: 'button', 'data-id': p.id, 'aria-label': 'Add ' + p.name + ' to your order' }, [
        h('span', { class: 'plus', 'aria-hidden': 'true', text: '+' }), h('span', { class: 'lbl', text: 'Add' })
      ]);
      var media = h('div', { class: 'product-media' }, [
        h('img', { src: p.image || 'assets/food-lab-logo.webp', alt: p.name, loading: i < 3 ? 'eager' : 'lazy', width: 600, height: 400 }),
        p.badge ? h('span', { class: 'product-badge', text: p.badge }) : null
      ]);
      var card = h('article', { class: 'product reveal' }, [
        media,
        h('div', { class: 'product-body' }, [
          h('h3', { text: p.name }),
          p.description ? h('p', { class: 'desc', text: p.description }) : h('div', { class: 'desc' }),
          p.weight ? h('span', { class: 'weight', text: p.weight }) : null,
          h('div', { class: 'product-foot' }, [h('strong', { class: 'price', text: money(p.price) }), addBtn])
        ])
      ]);
      card.style.setProperty('--i', String(i % 3)); // stagger within a row
      grid.appendChild(card);
    });
    observeReveals(grid);
  }

  function loadProducts() {
    products = (window.FL_PRODUCTS || []).slice(); // list lives in js/products.js
    renderProducts();
    reconcileCart();
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-add');
    if (!btn) return;
    var id = Number(btn.getAttribute('data-id'));
    var p = products.find(function (x) { return x.id === id; });
    if (!p) return;
    changeQty(id, 1);
    toast(p.name + ' added to your order');
    btn.classList.add('added');
    btn.querySelector('.lbl').textContent = 'Added';
    btn.querySelector('.plus').textContent = '✓';
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.classList.remove('added'); btn.querySelector('.lbl').textContent = 'Add'; btn.querySelector('.plus').textContent = '+'; }, 1400);
  });

  /* --------------------------------------------------------------- cart */
  var cart = {};                // { productId: qty }
  var saved = store.get('fl-cart');
  if (saved && typeof saved === 'object') Object.keys(saved).forEach(function (k) { var q = Math.floor(Number(saved[k])); if (q > 0) cart[k] = Math.min(q, 50); });

  var cartCount = $('#cartCount'), cartList = $('#cartList'), cartEmpty = $('#cartEmpty'), checkout = $('#checkoutForm'), cartTotal = $('#cartTotal');

  function reconcileCart() { // drop products that no longer exist / are inactive
    var ids = products.map(function (p) { return String(p.id); });
    Object.keys(cart).forEach(function (k) { if (ids.indexOf(k) === -1) delete cart[k]; });
    persist(); renderCart();
  }
  function persist() { store.set('fl-cart', cart); }
  function totalQty() { return Object.keys(cart).reduce(function (n, k) { return n + cart[k]; }, 0); }

  function changeQty(id, delta) {
    var q = (cart[id] || 0) + delta;
    if (q <= 0) delete cart[id]; else cart[id] = Math.min(q, 50);
    persist(); renderCart(true);
  }

  function renderCart(bump) {
    var n = totalQty();
    cartCount.hidden = n === 0;
    cartCount.textContent = n;
    if (bump && n) { cartCount.classList.remove('bump'); void cartCount.offsetWidth; cartCount.classList.add('bump'); }

    cartList.textContent = '';
    var total = 0;
    Object.keys(cart).forEach(function (k, i) {
      var p = products.find(function (x) { return String(x.id) === k; });
      if (!p) return;
      var qty = cart[k]; total += p.price * qty;
      var minus = h('button', { type: 'button', 'data-act': 'dec', 'aria-label': 'Remove one ' + p.name, text: '−' });
      var plus = h('button', { type: 'button', 'data-act': 'inc', 'aria-label': 'Add one ' + p.name, text: '+' });
      var li = h('li', { class: 'cart-item', 'data-id': p.id }, [
        h('img', { src: p.image, alt: '', width: 64, height: 64 }),
        h('div', {}, [h('h4', { text: p.name }), h('div', { class: 'line-price', text: money(p.price * qty) + (p.weight ? ' · ' + p.weight : '') })]),
        h('div', { class: 'qty' }, [minus, h('span', { 'aria-live': 'polite', text: String(qty) }), plus])
      ]);
      li.style.animationDelay = (i * 50) + 'ms';
      cartList.appendChild(li);
    });
    cartTotal.textContent = money(total);
    var empty = cartList.children.length === 0;
    cartEmpty.hidden = !empty || !$('#orderDone').hidden;
    checkout.hidden = empty;
    cartList.hidden = empty;
  }

  cartList.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    var id = Number(b.closest('.cart-item').getAttribute('data-id'));
    changeQty(id, b.getAttribute('data-act') === 'inc' ? 1 : -1);
  });

  /* drawer open/close with focus handling */
  var drawer = $('#drawer'), overlay = $('#overlay'), lastFocus = null;
  var inertTargets = ['#main', 'header', 'footer', '.topline'];
  function setInert(on) { inertTargets.forEach(function (s) { var el = $(s); if (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } }); }

  function openDrawer() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('show'); drawer.classList.add('open'); });
    drawer.setAttribute('aria-hidden', 'false');
    root.classList.add('drawer-open');
    setInert(true);
    setTimeout(function () { $('#drawerClose').focus(); }, 60);
  }
  function closeDrawer() {
    overlay.classList.remove('show'); drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    root.classList.remove('drawer-open');
    setInert(false);
    setTimeout(function () { overlay.hidden = true; }, 400);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('#cartBtn').addEventListener('click', openDrawer);
  $('#drawerClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  $$('[data-close-drawer]').forEach(function (a) { a.addEventListener('click', closeDrawer); });
  document.addEventListener('keydown', function (e) {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') return closeDrawer();
    if (e.key !== 'Tab') return; // keep focus inside the drawer
    var f = $$('button, a[href], input, textarea', drawer).filter(function (el) { return !el.disabled && el.offsetParent !== null && !el.classList.contains('hp'); });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* -------------------------------------------------------- form helpers */
  function setLoading(form, on) {
    var b = $('button[type=submit]', form);
    b.disabled = on; b.classList.toggle('loading', on);
  }
  function showMsg(el, text, kind) { el.textContent = text || ''; el.className = 'form-msg' + (kind ? ' ' + kind : ''); }
  function clearInvalid(form) { $$('.field.invalid', form).forEach(function (f) { f.classList.remove('invalid'); }); }
  function markInvalid(form, name) {
    var input = form.elements[name];
    if (input && input.closest) { input.closest('.field').classList.add('invalid'); input.focus(); }
  }
  function validate(form, rules) { // lightweight client-side check; the server is the source of truth
    clearInvalid(form);
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i], v = (form.elements[r.name].value || '').trim();
      if (v.length < r.min) { markInvalid(form, r.name); return r.msg; }
    }
    return null;
  }
  var nameRule = { name: 'name', min: 2, msg: 'Please enter your name.' };
  var phoneRule = { name: 'phone', min: 9, msg: 'Please enter a valid phone number.' };
  var savedCustomer = store.get('fl-customer') || {};
  ['name', 'phone', 'address'].forEach(function (k) { if (savedCustomer[k]) { var el = checkout.elements[k]; if (el) el.value = savedCustomer[k]; } });

  /* ------------------------------------------------------------ checkout */
  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }

  checkout.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('#orderMsg');
    showMsg(msg, '');
    var problem = validate(checkout, [nameRule, phoneRule, { name: 'address', min: 8, msg: 'Please enter your full delivery address.' }]);
    if (problem) return showMsg(msg, problem, 'error');
    var f = checkout.elements, lines = [], total = 0;
    Object.keys(cart).forEach(function (k) {
      var p = products.find(function (x) { return String(x.id) === k; });
      if (!p) return;
      lines.push('• ' + cart[k] + ' × ' + p.name + ' — ' + money(p.price * cart[k]));
      total += p.price * cart[k];
    });
    if (!lines.length) return;
    var text = ["Assalam-o-alaikum Food Lab! I'd like to order:"].concat(lines, ['Total: ' + money(total), '',
      'Name: ' + f.name.value.trim(), 'Phone: ' + f.phone.value.trim(), 'Address: ' + f.address.value.trim()],
      f.notes.value.trim() ? ['Notes: ' + f.notes.value.trim()] : []).join('\n');
    var url = waLink(text);
    store.set('fl-customer', { name: f.name.value.trim(), phone: f.phone.value.trim(), address: f.address.value.trim() });
    cart = {}; persist(); renderCart();
    checkout.hidden = true; cartList.hidden = true; cartEmpty.hidden = true;
    $('#orderWa').href = url;
    $('#orderDone').hidden = false;
    f.notes.value = '';
    $('#drawerBody').scrollTop = 0;
    window.open(url, '_blank', 'noopener'); // runs inside the click, so browsers allow it
  });
  $('#orderAgain').addEventListener('click', function () { $('#orderDone').hidden = true; renderCart(); closeDrawer(); });

  /* ------------------------------------------------------------- contact */
  var contactForm = $('#contactForm');
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('#contactMsg');
    showMsg(msg, '');
    var problem = validate(contactForm, [nameRule, phoneRule, { name: 'message', min: 5, msg: 'Please write a short message.' }]);
    if (problem) return showMsg(msg, problem, 'error');
    var f = contactForm.elements;
    var text = 'Assalam-o-alaikum Food Lab!\n' + f.message.value.trim() + '\n\n— ' + f.name.value.trim() + ' (' + f.phone.value.trim() + ')';
    window.open(waLink(text), '_blank', 'noopener');
    contactForm.reset();
    showMsg(msg, 'WhatsApp is opening — press Send in the chat to deliver your message.', 'ok');
  });
  [checkout, contactForm].forEach(function (form) {
    form.addEventListener('input', function (e) { var fld = e.target.closest && e.target.closest('.field'); if (fld) fld.classList.remove('invalid'); });
  });

  /* ---------------------------------------------------------------- go */
  renderCart();
  loadProducts();
})();
