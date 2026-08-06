/*  v2.js  —  A/B variant overlay for the parents app.
 *
 *  Loaded ONLY by v2.html and v2-mobile.html, after app.js (and mobile.js).
 *  index.html / mobile.html do not reference this file and keep behaving
 *  exactly as before. Nothing in app.js / mobile.js / app.css is edited.
 *
 *  All UX experiments are registered at the bottom of this file, in the
 *  EXPERIMENTS section. With no experiment enabled the variant page renders
 *  identically to the original — that is the intended starting state.
 *
 *  Guide: ../AB-TESTING.md
 */

var v2 = (function () {
    "use strict";

    /* ------------------------------------------------------------------
     *  0.  Which page are we on
     * ------------------------------------------------------------------ */

    /* The mobile variant MUST stay named "*mobile.html".
     * app.js ends with $(app.start), so jQuery captured the ORIGINAL app.start
     * function object — reassigning app.start later cannot change what runs.
     * That captured body redirects to mobile.html unless the current URL
     * already contains the substring "mobile.html". "v2-mobile.html" satisfies
     * it, so the legacy handler stays quiet on the variant page. */
    var IS_MOBILE_PAGE = /mobile\.html/i.test(window.location.pathname);

    var PAGE   = IS_MOBILE_PAGE ? "mobile"         : "desktop";
    var SELF   = IS_MOBILE_PAGE ? "v2-mobile.html" : "v2.html";
    var TWIN   = IS_MOBILE_PAGE ? "v2.html"        : "v2-mobile.html";
    var ORIGIN = IS_MOBILE_PAGE ? "mobile.html"    : "index.html";

    function query() {
        return window.location.href.split("?")[1] || "";
    }

    function strip(q, names) {
        if (!q) return "";
        return q.split("&").filter(function (kv) {
            return names.indexOf(kv.split("=")[0].toLowerCase()) < 0;
        }).join("&");
    }

    function url(page, q) {
        return page + (q ? "?" + q : "");
    }

    function go(page) {
        window.location.href = url(page, query());
    }

    /* ------------------------------------------------------------------
     *  1.  Routing guard  — runs at parse time, before DOM ready
     *
     *  Without this, a phone opening v2.html would be bounced to the
     *  ORIGINAL mobile.html by app.start, silently dropping the user out of
     *  the experiment. Same for a desktop opening v2-mobile.html.
     * ------------------------------------------------------------------ */

    var device_is_mobile = js.is_mobile();
    var redirecting      = (device_is_mobile !== IS_MOBILE_PAGE);

    if (redirecting) {
        go(TWIN);                       /* stay inside the variant */
    }

    /* Pin the detector so the already-captured app.start / app.start_mobile
     * handlers take the branch that simply calls app.init() and never redirect.
     * Nothing else in app.js or mobile.js calls js.is_mobile().
     *
     * This matters just as much while redirecting: assigning location.href does
     * not stop the current document, so DOMContentLoaded can still fire and the
     * legacy handler would race us with a redirect of its own to the ORIGINAL
     * page. IS_MOBILE_PAGE is the value that makes it inert in both cases. */
    js.is_mobile = function () { return IS_MOBILE_PAGE; };

    /* The page is on its way out — don't boot the app or fire a needless
     * login POST at the Apps Script backend while it unloads. */
    if (redirecting) {
        app.init = function () {};
    }

    /* Campaign switching navigates by hardcoded filename in both app.js:933
     * and mobile.js:166 — keep it inside the variant. */
    app.change_campaign = function (id) {
        window.location.href = SELF + "?campaign=" + id;
    };

    /* ------------------------------------------------------------------
     *  2.  Configuration
     * ------------------------------------------------------------------ */

    var config = {
        show_badge:   true,
        badge_text:   "דף בדיקות",
        feedback_url: "https://forms.gle/GsKDPFPszqFMJjsHA",
        debug:        js.urlParam("v2debug") === "1",

        /* Entry key: the page is only usable with ?key=<access_key>.
         * Lowercase only — js.urlParam lowercases its result.
         * Set to null to open the page to anyone with the link.
         *
         * IMPORTANT — this is a doorbell, not a lock. The value sits in a
         * public repo and the check runs in the browser, so anyone who reads
         * the source gets in. It exists to keep a parent who was forwarded
         * the link from wandering in by accident, nothing more. The control
         * that actually protects anything is read_only below. */
        access_key:   "bdika2027",

        /* Read-only mode. Blocks every write to the Apps Script backend, so
         * testing cannot pollute the live signup sheet. Set to false when you
         * want the test group to perform their real signups through the
         * variant. */
        read_only:    true
    };

    /* ------------------------------------------------------------------
     *  2b.  Entry key
     *
     *  Kept in sessionStorage once accepted, so internal navigation
     *  (campaign switching, desktop <-> mobile) does not need the key in
     *  every URL. Cleared when the tab closes.
     * ------------------------------------------------------------------ */

    var STORE_KEY = "cramim-parents-v2-key";

    function has_access() {
        if (!config.access_key) return true;
        var given = String(js.urlParam("key") || "");
        if (given === config.access_key) {
            try { window.sessionStorage.setItem(STORE_KEY, given); } catch (e) {}
            return true;
        }
        try {
            return window.sessionStorage.getItem(STORE_KEY) === config.access_key;
        } catch (e) {
            return false;                /* private mode / storage blocked */
        }
    }

    var gated = !redirecting && !has_access();

    if (gated) {
        app.init = function () {};       /* never boot, never hit the server */
    }

    /* ------------------------------------------------------------------
     *  2c.  Read-only guard
     *
     *  app.post is the single transport for the whole app, so one wrapper
     *  covers every write path from this page — desktop, mobile, and any
     *  future one. Allow-list rather than block-list: only 'load' reads.
     *
     *  Intercepting here, before the original runs, means please_wait()
     *  never fires and the UI stays exactly where it was.
     * ------------------------------------------------------------------ */

    var READ_ACTIONS = ["load"];

    if (!redirecting) {
        var _post = app.post;
        app.post = function (postdata, callback) {
            if (config.read_only && postdata &&
                READ_ACTIONS.indexOf(postdata.act_id) < 0) {
                log("blocked write", postdata.act_id);
                app.pop_err("זהו דף בדיקות — השינויים לא נשמרים.<br><br>" +
                            "כדי להירשם בפועל יש לעבור לאתר הרגיל.", true);
                return;
            }
            return _post.apply(this, arguments);
        };
    }

    /* ------------------------------------------------------------------
     *  3.  Experiment selection
     *
     *  ?v2=off        run the variant page with every experiment disabled
     *                 (baseline — for side-by-side comparison on one URL)
     *  ?only=a,b      run exactly these, ignoring their `on` flag
     *  ?off=a,b       run everything except these
     *  ?v2debug=1     verbose console logging
     *
     *  js.urlParam lowercases its result, so experiment ids must be lowercase.
     * ------------------------------------------------------------------ */

    function ids(param) {
        var raw = js.urlParam(param);
        if (!raw) return [];
        return String(raw).split(",").map(function (s) { return s.trim(); })
                          .filter(function (s) { return s.length > 0; });
    }

    var baseline = String(js.urlParam("v2") || "").toLowerCase() === "off";
    var only     = ids("only");
    var off      = ids("off");

    var changes = [];

    function log() {
        if (!config.debug) return;
        console.log.apply(console, ["[v2]"].concat([].slice.call(arguments)));
    }

    function is_enabled(c) {
        if (c.pages && c.pages.indexOf(PAGE) < 0) return false;   /* not for this page */
        if (baseline) return false;
        if (only.length) return only.indexOf(c.id) >= 0;
        if (off.indexOf(c.id) >= 0) return false;
        return c.on !== false;
    }

    function active() {
        return changes.filter(is_enabled);
    }

    /* ------------------------------------------------------------------
     *  4.  Safe execution
     *
     *  Every experiment body runs inside try/catch. A broken experiment
     *  degrades that one change to the original behaviour instead of
     *  throwing and leaving the parent with a blank screen.
     * ------------------------------------------------------------------ */

    function safe(fn, ctx, args, label) {
        try {
            return fn.apply(ctx, args || []);
        } catch (e) {
            console.error("[v2] " + (label || "hook") + " failed — skipped", e);
        }
    }

    function phase(name) {
        active().forEach(function (c) {
            if (typeof c[name] !== "function") return;
            log("run", c.id + "." + name + "()");
            safe(c[name], c, [], "experiment '" + c.id + "'." + name + "()");
        });
    }

    /* ------------------------------------------------------------------
     *  5.  Hooks into the existing app
     *
     *  These are the only sanctioned way to change behaviour. They wrap the
     *  live app.* function at call time, so they compose with mobile.js's
     *  own $.extend overrides regardless of load order.
     * ------------------------------------------------------------------ */

    function hook(name, when, fn) {
        var orig = app[name];
        if (typeof orig !== "function") {
            console.warn("[v2] app." + name + " is not a function — hook ignored");
            return;
        }
        app[name] = function () {
            var args = arguments, self = this, result;
            if (when === "before") safe(fn, self, [].slice.call(args), name + " before-hook");
            result = orig.apply(self, args);
            if (when === "after")  safe(fn, self, [].slice.call(args), name + " after-hook");
            return result;
        };
        log("hooked", when, "app." + name);
    }

    /* ------------------------------------------------------------------
     *  6.  Badge
     *
     *  Testers must be able to tell which version they are on and get back
     *  to the regular one in one click. Built with .text()/.attr() rather
     *  than string concatenation, so it adds no new HTML-injection surface.
     * ------------------------------------------------------------------ */

    function build_badge() {
        var clean = strip(query(), ["v2", "only", "off", "v2debug"]);
        var names = active().map(function (c) { return c.id; });
        var label = config.badge_text +
                    (config.read_only ? " · לקריאה בלבד" : "") +
                    (baseline ? " · כבוי" : "");

        var $b = $("<div>").attr("id", "v2_badge");
        var $t = $("<span>").addClass("v2_badge_text").text(label);
        var $f = $("<a>").addClass("v2_badge_link").text("משוב")
                         .attr({ href: config.feedback_url, target: "_blank", rel: "noopener" });
        var $o = $("<a>").addClass("v2_badge_link").text("לגרסה הרגילה")
                         .attr("href", url(ORIGIN, clean));
        var $x = $("<span>").addClass("v2_badge_close").attr("title", "הסתרה").text("×");

        $x.on("click", function () { $b.addClass("v2_badge_hidden"); });
        $b.attr("title", names.length ? "פעיל: " + names.join(", ") : "ללא שינויים פעילים");
        $b.append($t, $f, $o, $x).appendTo("body");
    }

    /* ------------------------------------------------------------------
     *  6b.  Gate screen
     * ------------------------------------------------------------------ */

    function build_gate() {
        var $g = $("<div>").attr("id", "v2_gate");
        var $c = $("<div>").addClass("v2_gate_card");

        $c.append($("<div>").addClass("v2_gate_title").text("דף בדיקות"));
        $c.append($("<div>").addClass("v2_gate_text")
            .text("הדף הזה מיועד לצוות הבדיקה בלבד ואינו הרשמה אמיתית."));
        $c.append($("<a>").addClass("v2_gate_link")
            .attr("href", url(ORIGIN, strip(query(), ["key", "v2", "only", "off", "v2debug"])))
            .text("מעבר לאתר הרגיל"));

        $("body").empty().append($g.append($c)).show();
        document.title = "דף בדיקות";
    }

    /* ------------------------------------------------------------------
     *  7.  Boot
     * ------------------------------------------------------------------ */

    if (gated) {
        $(function () {
            log("access denied — gate shown");
            safe(build_gate, null, [], "gate");
        });
    }

    if (!redirecting && !gated) {

        /* app.rebuild runs on every load and on every save response — this is
         * the hook for anything that touches rendered activity/user content. */
        hook("rebuild", "after", function () { phase("render"); });

        $(function () {
            /* app.js registered $(app.start) first and mobile.js registered
             * $(app.start_mobile) second, so by the time this runs app.init()
             * has already executed and the static DOM is in place. */
            log("page=" + PAGE, "baseline=" + baseline,
                "active=[" + active().map(function (c) { return c.id; }).join(",") + "]");
            phase("apply");
            if (config.show_badge) safe(build_badge, null, [], "badge");
        });
    }

    /* ------------------------------------------------------------------
     *  8.  Public API
     * ------------------------------------------------------------------ */

    var api = {
        page:   PAGE,
        config: config,

        /* Register an experiment. See EXPERIMENTS below for the shape. */
        add: function (change) {
            if (!change || !change.id) {
                console.warn("[v2] add() requires an id"); return api;
            }
            if (change.id !== change.id.toLowerCase()) {
                console.warn("[v2] id must be lowercase (?only= comparison): " + change.id);
            }
            if (changes.some(function (c) { return c.id === change.id; })) {
                console.warn("[v2] duplicate id ignored: " + change.id); return api;
            }
            changes.push(change);
            return api;
        },

        /* Run fn after / before an existing app function. */
        after:  function (name, fn) { hook(name, "after",  fn); return api; },
        before: function (name, fn) { hook(name, "before", fn); return api; },

        /* Full replacement, with the original handed to you:
         *   v2.replace("render_activity", function (orig) {
         *       return function (item) { ...; return orig.apply(this, arguments); };
         *   }); */
        replace: function (name, factory) {
            var orig = app[name];
            if (typeof orig !== "function") {
                console.warn("[v2] app." + name + " is not a function — replace ignored");
                return api;
            }
            app[name] = factory(orig);
            return api;
        },

        /* Re-run the render phase by hand. */
        refresh: function () { phase("render"); return api; },

        list:    function () { return changes.slice(); },
        active:  function () { return active().map(function (c) { return c.id; }); },
        enabled: function (id) {
            return changes.some(function (c) { return c.id === id && is_enabled(c); });
        }
    };

    return api;
}());

app.v2 = v2;


/* ====================================================================
 *  EXPERIMENTS
 *
 *  Each entry:
 *    id      lowercase kebab-case, stable — it is the ?only= / ?off= key
 *    title   Hebrew description, for the team
 *    on      true = live for everyone on the variant page. Default true.
 *    pages   ["desktop"] / ["mobile"] / both. Omit for both.
 *    apply() once, on DOM ready — static chrome: header, login, menus
 *    render() after every app.rebuild — anything inside the activity or
 *             user lists, which are re-rendered on load and on save
 *
 *  Nothing here is enabled yet, so v2.html currently matches index.html
 *  exactly. Flip `on` to true, or preview with ?only=<id>.
 * ==================================================================== */

v2.add({
    id:    "login-autofocus",
    title: "פוקוס אוטומטי על שדה הכניסה",
    on:    false,
    pages: ["desktop"],          /* on a phone this pops the keyboard on load */
    apply: function () {
        $("#eb_login").trigger("focus");
    }
});

/*  Template for a change to rendered content — copy, rename, fill in:

v2.add({
    id:    "activity-points-badge",
    title: "הדגשת מספר הנקודות בכרטיס הפעילות",
    on:    false,
    render: function () {
        $(".activity_box").addClass("v2_points_highlight");
    }
});

    And for changing behaviour rather than markup:

v2.after("save", function () { ... });
v2.replace("filter", function (orig) {
    return function () { var r = orig.apply(this, arguments); ...; return r; };
});
*/
