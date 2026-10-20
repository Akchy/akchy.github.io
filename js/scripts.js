(function () {
    "use strict";

    var root = document.documentElement;

    // Footer date stamp, like a man page's revision date
    var now = new Date();
    document.getElementById("updated").textContent =
        now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");

    // Theme toggle: auto -> light -> dark -> auto
    var themes = ["auto", "light", "dark"];
    var label = document.getElementById("theme-label");
    var current = root.dataset.theme || "auto";
    label.textContent = current;
    document.getElementById("theme").addEventListener("click", function () {
        current = themes[(themes.indexOf(current) + 1) % themes.length];
        label.textContent = current;
        try {
            if (current === "auto") {
                delete root.dataset.theme;
                localStorage.removeItem("theme");
            } else {
                root.dataset.theme = current;
                localStorage.setItem("theme", current);
            }
        } catch (e) {
            if (current === "auto") delete root.dataset.theme;
            else root.dataset.theme = current;
        }
    });

    // Timeline built from the experience and education entries
    function toYears(s) {
        if (s === "now") return now.getFullYear() + now.getMonth() / 12;
        var p = s.split("-");
        return +p[0] + (+p[1] - 1) / 12;
    }

    var entries = Array.prototype.slice.call(document.querySelectorAll(".entry"));
    var rows = entries.map(function (el) {
        return {
            id: el,
            label: el.querySelector("h3").firstChild.textContent.trim(),
            kind: el.dataset.kind,
            live: el.dataset.to === "now",
            from: toYears(el.dataset.from),
            to: toYears(el.dataset.to)
        };
    }).sort(function (a, b) { return b.from - a.from; });

    var min = Math.floor(Math.min.apply(null, rows.map(function (r) { return r.from; })));
    var max = Math.ceil(Math.max.apply(null, rows.map(function (r) { return r.to; })));
    var pct = function (y) { return ((y - min) / (max - min)) * 100; };

    var gantt = document.getElementById("gantt");
    var html = "";
    rows.forEach(function (r, i) {
        var title = r.label + " · " + r.id.querySelector(".range").textContent;
        html += '<div class="g-row" title="' + title + '">' +
            '<span class="g-label">' + r.label + "</span>" +
            '<span class="g-track"><span class="g-bar' + (r.live ? " live" : "") + '" data-kind="' + r.kind + '" style="left:' +
            pct(r.from).toFixed(2) + "%;width:" + (pct(r.to) - pct(r.from)).toFixed(2) + "%;animation-delay:" + (i * 60) + 'ms"></span></span></div>';
    });
    html += '<div class="g-row g-axis"><span></span><span class="g-track">';
    for (var y = min; y <= max; y++) {
        html += '<span class="g-tick" style="left:' + pct(y).toFixed(2) + '%">' + "'" + String(y).slice(2) + "</span>";
    }
    html += "</span></div>";
    html += '<div class="g-legend"><span>work</span><span class="edu">education</span><span class="vol">community</span></div>';
    gantt.innerHTML = html;
    gantt.removeAttribute("aria-hidden");
    gantt.setAttribute("role", "img");
    gantt.setAttribute("aria-label", "Career timeline from " + min + " to " + max);

    // Highlight the section currently being read in the contents list
    if (!("IntersectionObserver" in window)) return;
    var links = document.querySelectorAll(".toc a");
    var spy = new IntersectionObserver(function (list) {
        list.forEach(function (e) {
            if (!e.isIntersecting) return;
            links.forEach(function (a) {
                a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
            });
        });
    }, { rootMargin: "-30% 0px -65% 0px" });
    document.querySelectorAll("main section").forEach(function (s) { spy.observe(s); });
})();
