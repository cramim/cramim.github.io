/*  v2-test.js  —  test-page scaffolding for the A/B variant.
 *
 *  Loaded ONLY by v2.html and v2-mobile.html, and ONLY after v2.js.
 *  index.html / mobile.html must never reference this file.
 *
 *  Everything here exists to make the variant pages safe to hand to a small
 *  test group, and none of it belongs in production:
 *
 *    · entry key      — keeps a forwarded link from wandering in by accident
 *    · read-only      — blocks every write to the sheet
 *    · routing guard  — keeps a phone inside v2-mobile.html instead of being
 *                       bounced to the real mobile.html by app.start
 *    · badge          — tells the tester which version they are on
 *    · gate screen    — what a visitor without the key sees
 *
 *  It drives v2.js only through the public API — chiefly v2.halt() — so the
 *  production file has no idea any of this exists.
 *
 *  Load order matters: v2.js first (it defines `v2`), this second. Both are
 *  parsed before DOM ready, so halting here still lands before v2.js runs its
 *  apply phase.
 *
 *  Guide: ../AB-TESTING.md   ·   Promotion notes: ../PROMOTE-V2.md
 */

(function () {
    "use strict";

    if (typeof v2 === "undefined") {
        console.error("[v2-test] v2.js must be loaded before v2-test.js");
        return;
    }

    /* ------------------------------------------------------------------
     *  0.  Which variant page are we on
     * ------------------------------------------------------------------ */

    /* The mobile variant MUST stay named "*mobile.html".
     * app.js ends with $(app.start), so jQuery captured the ORIGINAL app.start
     * function object — reassigning app.start later cannot change what runs.
     * That captured body redirects to mobile.html unless the current URL
     * already contains the substring "mobile.html". "v2-mobile.html" satisfies
     * it, so the legacy handler stays quiet on the variant page. */
    var IS_MOBILE_PAGE = /mobile\.html/i.test(window.location.pathname);

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
     *  1.  Configuration
     * ------------------------------------------------------------------ */

    var config = {
        show_badge:   true,
        badge_text:   "דף בדיקות",
        feedback_url: "https://forms.gle/GsKDPFPszqFMJjsHA",

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

    /* Reachable from the console as v2.test.read_only etc., the way
     * v2.config.read_only used to be before the split. */
    v2.test = config;

    function log() {
        if (!v2.config.debug) return;
        console.log.apply(console, ["[v2-test]"].concat([].slice.call(arguments)));
    }

    /* ------------------------------------------------------------------
     *  2.  Routing guard  — runs at parse time, before DOM ready
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
        v2.halt("redirecting to " + TWIN);
    }

    /* Campaign switching navigates by hardcoded filename in both app.js:933
     * and mobile.js:166 — keep it inside the variant. */
    app.change_campaign = function (id) {
        window.location.href = SELF + "?campaign=" + id;
    };

    /* ------------------------------------------------------------------
     *  3.  Entry key
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
        v2.halt("gated");
    }

    /* ------------------------------------------------------------------
     *  4.  Read-only guard
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
     *  5.  Badge
     *
     *  Testers must be able to tell which version they are on and get back
     *  to the regular one in one click. Built with .text()/.attr() rather
     *  than string concatenation, so it adds no new HTML-injection surface.
     * ------------------------------------------------------------------ */

    function build_badge() {
        var clean = strip(query(), ["v2", "only", "off", "v2debug"]);
        var names = v2.active();
        var label = config.badge_text +
                    (config.read_only ? " · לקריאה בלבד" : "") +
                    (v2.baseline ? " · כבוי" : "");

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
     *  6.  Gate screen
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
     *
     *  This file is parsed after v2.js, so its ready callback runs after the
     *  one in v2.js — meaning the badge is built after the apply phase and
     *  reports the experiments that actually ran.
     * ------------------------------------------------------------------ */

    function safe(fn, label) {
        try { return fn(); }
        catch (e) { console.error("[v2-test] " + label + " failed — skipped", e); }
    }

    $(function () {
        if (gated) {
            log("access denied — gate shown");
            safe(build_gate, "gate");
            return;
        }
        if (redirecting) return;
        if (config.show_badge) safe(build_badge, "badge");
    });
}());
