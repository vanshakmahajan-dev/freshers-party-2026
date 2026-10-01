/* Small, dependency-free behaviours for the Freshers Party site.
   1. Mobile menu toggle
   2. Highlight the nav link of the section you are reading
   3. Print the current year in the footer
   4. Dark / light mode toggle
   5. Countdown to the event date                                   */

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initScrollSpy();
  initYear();
  initTheme();
  initCountdown();
});

/* ---------- 1. Mobile menu ---------- */
function initMobileMenu() {
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", function () {
    // is-open is the class the CSS checks inside the mobile media query
    var isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Tapping a link closes the menu and scrolls to the section
  nav.addEventListener("click", function (event) {
    if (event.target.closest(".nav__link")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* ---------- 2. Scroll spy ---------- */
function initScrollSpy() {
  var links = document.querySelectorAll(".nav__link");
  var sections = [];

  // Collect only the links that point at a section on this page
  links.forEach(function (link) {
    var id = link.getAttribute("href");
    if (!id || id.charAt(0) !== "#" || id === "#top") {
      return;
    }

    var section = document.querySelector(id);
    if (section) {
      sections.push({ link: link, section: section });
    }
  });

  if (!sections.length) {
    return;
  }

  var setActive = function (current) {
    sections.forEach(function (item) {
      item.link.classList.toggle("is-active", item.link === current);
    });
  };

  window.addEventListener("scroll", function () {
    // The section nearest the top of the screen below 140px wins
    var offset = 140;
    var current = null;

    sections.forEach(function (item) {
      if (item.section.getBoundingClientRect().top <= offset) {
        current = item.link;
      }
    });

    setActive(current);
  }, { passive: true });
}

/* ---------- 3. Footer year ---------- */
function initYear() {
  var year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

/* ---------- 4. Dark / light mode ---------- */
var THEME_KEY = "spmr-freshers-theme";

function applyTheme(theme) {
  var isDark = theme === "dark";

  // The whole stylesheet keys off this one attribute
  document.documentElement.setAttribute("data-theme", theme);

  var button = document.getElementById("theme-toggle");
  if (button) {
    button.setAttribute("aria-pressed", String(isDark));
    button.title = isDark ? "Switch to light mode" : "Switch to dark mode";

    var text = button.querySelector(".theme-toggle__text");
    if (text) {
      text.textContent = isDark ? "Light" : "Dark";
    }
  }
}

function initTheme() {
  var button = document.getElementById("theme-toggle");

  // The inline snippet in <head> already set the attribute from storage,
  // so read it back from there instead of touching localStorage twice.
  var current = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(current);

  if (!button) {
    return;
  }

  button.addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark"
      ? "light"
      : "dark";

    applyTheme(next);

    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      /* storage blocked (private mode): theme still applies for this visit */
    }
  });
}

/* ---------- 5. Countdown ---------- */
function initCountdown() {
  var box = document.getElementById("countdown-box");
  if (!box) {
    return;
  }

  var target = box.getAttribute("data-countdown-target");

  // No announced date yet. The HTML already shows 00, and we simply
  // never start a timer, so nothing can count down to an invented date.
  // When a real date is confirmed, set the attribute in index.html, e.g.
  //   data-countdown-target="2026-11-14T17:00"
  // and this function starts working with no other change.
  if (!target) {
    return;
  }

  var endTime = new Date(target).getTime();
  if (isNaN(endTime)) {
    return;
  }

  var hoursEl = document.getElementById("countdown-hours");
  var minutesEl = document.getElementById("countdown-minutes");
  var secondsEl = document.getElementById("countdown-seconds");
  var pendingEl = document.getElementById("countdown-pending");
  var srEl = document.getElementById("countdown-sr");

  // The "Announced Soon" line is only relevant while no date exists
  if (pendingEl) {
    pendingEl.hidden = true;
  }

  var pad = function (value) {
    return value < 10 ? "0" + value : String(value);
  };

  var render = function () {
    var remaining = endTime - Date.now();

    if (remaining <= 0) {
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      if (srEl) {
        srEl.textContent = "The event has started.";
      }
      window.clearInterval(timer);
      return;
    }

    var totalSeconds = Math.floor(remaining / 1000);
    var h = Math.floor(totalSeconds / 3600);
    var m = Math.floor((totalSeconds % 3600) / 60);
    var s = totalSeconds % 60;

    hoursEl.textContent = pad(h);
    minutesEl.textContent = pad(m);
    secondsEl.textContent = pad(s);

    // Read out once a minute so screen readers are not flooded
    if (srEl && totalSeconds % 60 === 0) {
      srEl.textContent = h + " hours, " + m + " minutes remaining.";
    }
  };

  render();
  var timer = window.setInterval(render, 1000);
}
