(() => {
  "use strict";

  const watch = window.WATCH;
  const stops = watch.stops;
  const LEGS = stops.length - 1; // camera moves between stops
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const IMAGE_TYPES = ["jpg", "png", "webp", "jpeg"];
  const STILLS = "assets/stills/";
  const FILM = "assets/film/";

  const $ = (id) => document.getElementById(id);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const rupees = (n) => `₹${n.toLocaleString("en-IN")}`;
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const state = { dial: watch.dials[0].id, lastDial: watch.dials[0].id, dialMix: 1, bag: 0 };
  const dialById = (id) => watch.dials.find((d) => d.id === id);

  /* ================= Static text ================= */

  const brandTitle = watch.brand[0] + watch.brand.slice(1).toLowerCase();
  $("brand").textContent = watch.brand;
  $("footMark").textContent = watch.brand;
  $("footEmail").textContent = watch.email;
  $("footEmail").href = `mailto:${watch.email}`;
  $("footPhone").textContent = watch.phone;
  $("footPhone").href = `tel:${watch.phone.replace(/[^+\d]/g, "")}`;
  $("total").textContent = ` / ${String(stops.length).padStart(2, "0")}`;
  document.title = `${brandTitle} ${watch.model} | ${watch.line}`;

  // A watch site should know what time it is.
  const clock = $("clock");
  const tick = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString("en-GB");
    clock.dateTime = now.toISOString();
  };
  tick();
  window.setInterval(tick, 1000);

  /* ================= Picture loading ================= */

  const pending = new Map();
  const loaded = new Map(); // path without extension -> image, or null when missing

  function load(path) {
    if (!pending.has(path)) {
      pending.set(path, new Promise((resolve) => {
        const attempt = (n) => {
          if (n >= IMAGE_TYPES.length) {
            loaded.set(path, null);
            return resolve(null);
          }
          const img = new Image();
          img.onload = () => {
            loaded.set(path, img);
            resolve(img);
          };
          img.onerror = () => attempt(n + 1);
          img.src = `${path}.${IMAGE_TYPES[n]}`;
        };
        attempt(0);
      }));
    }
    return pending.get(path);
  }

  // The picture for a stop. The last stop shows the chosen dial.
  const stillName = (index, dial = state.dial) => (index === LEGS ? `${stops[index].still}-${dial}` : stops[index].still);

  /* ================= Panels, nav, lists ================= */

  const film = $("top");
  const pin = film.querySelector(".pin");
  film.style.setProperty("--legs", LEGS);
  const SEGMENT = 1.1; // screens of scrolling per camera move; matches .film in styles.css
  const filmTop = () => film.getBoundingClientRect().top + window.scrollY;

  const places = ["start", "left", "right"];
  const panels = stops.slice(0, LEGS).map((stop, i) => {
    const el = make("article", `panel panel-${stop.place || places[i % places.length]}`);
    el.append(make("p", "kicker", stop.kicker), make(i === 0 ? "h1" : "h2", "", stop.title), make("p", "panel-text", stop.text));
    $("panels").append(el);
    return { el, key: i, o: -1 };
  });
  panels.push({ el: $("buy"), key: LEGS, o: -1 });
  $("buyKicker").textContent = stops[LEGS].kicker;

  const nav = $("nav");
  const navLinks = stops.map((stop, i) => {
    const a = make("a", "", stop.nav);
    a.href = "#top";
    a.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: filmTop() + i * SEGMENT * window.innerHeight, behavior: reducedMotion ? "auto" : "smooth" });
    });
    nav.append(a);
    return a;
  });
  [["Made", "#made"], ["Specs", "#specs"]].forEach(([label, href]) => {
    const a = make("a", "", label);
    a.href = href;
    nav.append(a);
  });

  watch.made.forEach((m, i) => {
    const li = make("li", "card");
    li.dataset.reveal = "";
    li.style.setProperty("--i", i);
    const shot = make("div", "card-shot");
    load(STILLS + m.still).then((img) => {
      if (img) shot.style.backgroundImage = `url("${img.src}")`;
      else {
        shot.classList.add("is-empty");
        shot.textContent = `Add ${m.still}.jpg to assets/stills`;
      }
    });
    const h3 = make("h3");
    h3.append(make("span", "", String(i + 1).padStart(2, "0")), document.createTextNode(m.title));
    li.append(shot, h3, make("p", "", m.text));
    $("cards").append(li);
  });

  watch.specs.forEach((s, i) => {
    const cell = make("div");
    cell.dataset.reveal = "";
    cell.style.setProperty("--i", i);
    cell.append(make("dt", "", s.value), make("dd", "", s.label));
    $("specList").append(cell);
  });

  /* ================= Dial chooser ================= */

  function fillDial() {
    const d = dialById(state.dial);
    $("dialName").textContent = d.name;
    $("dialNote").textContent = d.note;
    $("dialText").textContent = d.text;
    $("price").textContent = rupees(d.price);
  }

  let dialRaf = 0;
  function chooseDial(id) {
    if (id === state.dial) return;
    state.lastDial = state.dial;
    state.dial = id;
    state.dialMix = reducedMotion ? 1 : 0;
    fillDial();
    $("buyNote").textContent = "";
    load(STILLS + stillName(LEGS)).then(() => render(true));
    window.cancelAnimationFrame(dialRaf);
    const start = performance.now();
    const step = (now) => {
      state.dialMix = clamp((now - start) / 450, 0, 1);
      render(true);
      if (state.dialMix < 1) dialRaf = window.requestAnimationFrame(step);
    };
    if (!reducedMotion) dialRaf = window.requestAnimationFrame(step);
    else render(true);
  }

  watch.dials.forEach((d) => {
    const label = make("label", "dial");
    const input = make("input");
    input.type = "radio";
    input.name = "dial";
    input.value = d.id;
    input.checked = d.id === state.dial;
    input.addEventListener("change", () => chooseDial(d.id));
    const dot = make("i");
    dot.style.setProperty("--c", d.colour);
    label.append(input, dot, make("span", "", d.name));
    $("dials").append(label);
  });
  fillDial();

  $("buy").addEventListener("submit", (event) => {
    event.preventDefault();
    state.bag += 1;
    $("bag").textContent = `Bag (${state.bag})`;
    $("buyNote").textContent = `Added to your bag: ${watch.model} ${dialById(state.dial).name}. Checkout is not part of this demo.`;
  });

  /* ================= Film: frame sequence (optional) ================= */

  // If assets/film/manifest.json exists, the page plays those frames as the
  // camera move. Without it, it fades between the stills instead.
  let frames = null; // array of images (undefined until each has loaded)

  function startFilm(count) {
    frames = new Array(count);
    // Fetch a thin spread of frames first so every part of the film has
    // something to show, then fill in the rest.
    const order = [];
    for (const stride of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < count; i += stride) if (!order.includes(i)) order.push(i);
    }
    let next = 0;
    const pump = () => {
      if (next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.onload = () => {
        frames[i] = img;
        render(true);
        pump();
      };
      img.onerror = pump;
      img.src = `${FILM}f-${String(i + 1).padStart(4, "0")}.jpg`;
    };
    for (let k = 0; k < 6; k++) pump();
  }

  // How far through the film the camera is at a scroll position. Each stop
  // says where it falls in the film ("at" in config.js); between two stops
  // the film runs evenly from one to the other.
  function filmFraction(position) {
    const from = Math.min(Math.floor(position), LEGS - 1);
    const a = stops[from].at ?? from / LEGS;
    const b = stops[from + 1].at ?? (from + 1) / LEGS;
    return a + (b - a) * clamp(position - from, 0, 1);
  }

  // The loaded frame closest to index `want` (the film may still be arriving).
  function nearestFrame(want) {
    for (let d = 0; d < frames.length; d++) {
      if (frames[want - d]) return frames[want - d];
      if (frames[want + d]) return frames[want + d];
    }
    return null;
  }

  // Scroll positions usually fall between two frames. Returning both, with how
  // far along we are, lets them be blended, which makes slow scrolling smooth.
  function framesAt(position) {
    if (!frames) return null;
    const exact = filmFraction(position) * (frames.length - 1);
    const index = Math.floor(exact);
    const base = nearestFrame(index);
    if (!base) return null;
    return { base, next: frames[index] === base ? frames[index + 1] : null, mix: exact - index };
  }

  fetch(`${FILM}manifest.json`)
    .then((res) => (res.ok ? res.json() : null))
    .then((manifest) => {
      if (manifest && manifest.count > 1) startFilm(manifest.count);
    })
    .catch(() => {});

  /* ================= Film: drawing ================= */

  const canvas = $("screen");
  const ctx = canvas.getContext("2d");
  let cw = 0;
  let ch = 0;

  function sizeCanvas() {
    const box = pin.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    cw = canvas.width = Math.max(1, Math.round(box.width * scale));
    ch = canvas.height = Math.max(1, Math.round(box.height * scale));
  }

  // Draw a picture so it covers the screen, optionally enlarged from the centre.
  function cover(img, alpha, zoom = 1) {
    if (!img || alpha <= 0.003) return;
    const fit = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * zoom;
    const w = img.naturalWidth * fit;
    const h = img.naturalHeight * fit;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    ctx.globalAlpha = 1;
  }

  const still = (index, dial) => loaded.get(STILLS + stillName(index, dial));

  // The chosen dial, cross-fading from the previous one when it has just changed.
  function drawDial(alpha) {
    if (state.dialMix < 1) cover(still(LEGS, state.lastDial), alpha);
    cover(still(LEGS, state.dial), alpha * (state.dialMix < 1 ? smooth(state.dialMix) : 1));
  }

  // position: 0 = first stop, LEGS = last stop; in between, the camera is moving.
  function draw(position) {
    if (!cw) return;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cw, ch);

    const at = framesAt(position);
    if (at) {
      cover(at.base, 1);
      if (at.next && !reducedMotion) cover(at.next, at.mix);
      // The film ends on the first dial; the chosen dial settles in over it.
      drawDial(smooth(clamp((position - (LEGS - 0.1)) / 0.1, 0, 1)));
      return;
    }

    // Stills only: each view pushes in slightly while the next one fades up.
    const from = Math.min(Math.floor(position), LEGS - 1);
    const t = clamp(position - from, 0, 1);
    const mix = smooth(clamp((t - 0.3) / 0.4, 0, 1));
    cover(still(from), 1, 1 + 0.07 * t);
    if (from + 1 === LEGS) {
      if (mix > 0) {
        // draw the dial stop through the same gentle zoom
        const zoom = 1.07 - 0.07 * t;
        if (state.dialMix < 1) cover(still(LEGS, state.lastDial), mix, zoom);
        cover(still(LEGS, state.dial), mix * (state.dialMix < 1 ? smooth(state.dialMix) : 1), zoom);
      }
    } else {
      cover(still(from + 1), mix, 1.07 - 0.07 * t);
    }
  }

  /* ================= Scroll ================= */

  const hint = $("hint");
  const cue = $("cue");
  const GLIDE_MS = 110;
  let target = 0;
  let shown = 0;
  let raf = 0;
  let lastFrame = 0;
  let currentStop = -1;

  function showPanels(position) {
    panels.forEach((panel) => {
      const o = smooth(clamp(1 - (Math.abs(position - panel.key) - 0.18) / 0.2, 0, 1));
      if (o === panel.o) return;
      panel.o = o;
      panel.el.style.setProperty("--o", o.toFixed(3));
      panel.el.style.visibility = o === 0 ? "hidden" : "visible";
      panel.el.inert = o < 0.5;
    });
    cue.style.setProperty("--o", clamp(1 - position * 3, 0, 1).toFixed(3));

    const stop = Math.round(position);
    if (stop !== currentStop) {
      currentStop = stop;
      $("count").textContent = String(stop + 1).padStart(2, "0");
      navLinks.forEach((a, i) => a.setAttribute("aria-current", String(i === stop)));
    }
    // Say which file is missing, but only when there is nothing to show at all.
    const name = stillName(stop);
    const missing = !frames && loaded.get(STILLS + name) === null;
    hint.hidden = !missing;
    if (missing) hint.innerHTML = `No picture for this view yet. Add <code>${name}.jpg</code> to <code>assets/stills</code>.`;
  }

  function render() {
    draw(shown);
    showPanels(shown);
  }

  function measure() {
    target = clamp(-film.getBoundingClientRect().top / (SEGMENT * window.innerHeight), 0, LEGS);
  }

  function frameStep(now) {
    const elapsed = lastFrame ? Math.min(now - lastFrame, 50) : 16;
    lastFrame = now;
    const gap = target - shown;
    shown = reducedMotion || Math.abs(gap) < 0.0008 ? target : shown + gap * (1 - Math.exp(-elapsed / GLIDE_MS));
    render();
    if (shown === target) {
      raf = 0;
      lastFrame = 0;
    } else {
      raf = requestAnimationFrame(frameStep);
    }
  }

  function onScroll() {
    measure();
    if (!raf) raf = requestAnimationFrame(frameStep);
  }

  function onResize() {
    sizeCanvas();
    measure();
    shown = target;
    render();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(pin);

  /* ================= Entrances ================= */

  const revealTargets = [...document.querySelectorAll("[data-reveal]")];
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    revealTargets.forEach((node) => revealer.observe(node));
  } else {
    revealTargets.forEach((node) => node.classList.add("is-in"));
  }

  onResize();

  // Fetch every still up front, so scrolling and changing dial never wait.
  stops.forEach((_, i) => {
    if (i < LEGS) load(STILLS + stillName(i)).then(render);
  });
  watch.dials.forEach((d) => load(STILLS + stillName(LEGS, d.id)).then(render));
})();
