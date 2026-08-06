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

        /* Console logging for experiments — silent unless ?v2debug=1 */
        log: log,

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
 *  Preview anything with ?only=<id>, and compare against the untouched
 *  baseline with ?v2=off.
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

/*  מסך ראשי של קטגוריות.
 *
 *  במקום להציג את כל הפעילויות בערימה אחת עם פילטר קטגוריה בצד, נפתחים
 *  במסך בחירה: כרטיס לכל קטגוריה, לחיצה נכנסת אליה, וכפתור חזרה מוביל בחזרה.
 *
 *  המימוש מניע את app.filter() הקיים — לחיצה על קטגוריה מסמנת את הצ'קבוקס
 *  המתאים ומפעילה את הפילטר. כך לא משוכפלת שום לוגיקת סינון, ופילטרי
 *  "מעגל השפעה" ו"תזמון" ממשיכים לעבוד כרגיל בתוך קטגוריה.
 */
(function () {
    /* קטגוריה וירטואלית — לא קיימת בגיליון. ראה last-year-category למטה. */
    var VIRTUAL = "__last_year__";

    var state = { category: null, wired: false, want_last_year: false };
    var last_year = { status: "idle", uid: null, ids: {}, count: 0, title: "" };

    function normalize(s) {
        return (s === null || s === undefined ? "" : String(s)).replace(/\s+/g, " ").trim();
    }

    /* שם הקמפיין הקודם ידוע כבר מהטעינה הראשית (campaign_list מגיע בתשובה),
       ולכן אפשר לכתוב את כותרת הכרטיס עוד לפני שהשליפה חוזרת. */
    function last_year_title() {
        var pid = prev_campaign_id();
        var campaign = (app.dat.idx.campaign_by_id || {})[pid];
        return (campaign && campaign.title) ? campaign.title : "שנה שעברה";
    }

    /* השם היפה של הקטגוריה נלקח מה-<span> שליד הצ'קבוקס בפילטר הקיים,
       כי בנתונים הגרשיים מוסרים (סעפשים מול סעפ"שים). */
    function cat_label(value) {
        if (value === VIRTUAL) return "פעילויות מ" + last_year_title();
        var txt = $("#filter_box_cat input[filter_name='" + value + "']")
                      .siblings("span").first().text();
        return txt || value;
    }

    /* טקסט השורה השנייה בכרטיס, לפי מצב השליפה. */
    function last_year_note() {
        switch (last_year.status) {
            case "idle":
            case "loading": return "מחפש פעילויות משנה שעברה…";
            case "error":   return "לא הצלחנו לטעון פעילויות קודמות";
            case "none":    return "לא נמצאו פעילויות קודמות";
            default:
                if (last_year.count === 0) return "לא נמצאו פעילויות קודמות";
                return last_year.count === 1 ? "פעילות אחת" : last_year.count + " פעילויות";
        }
    }

    function last_year_ready() {
        return last_year.status === "ready" && last_year.count > 0;
    }

    /* ------------------------------------------------------------------
     *  שליפת ההרשמות משנה שעברה
     *
     *  load מקבל campaign_id, ולכן קריאה שנייה עם הקמפיין הקודם מחזירה את
     *  ההרשמות של אותה משפחה אשתקד. אין צורך בשום שינוי בשרת.
     * ------------------------------------------------------------------ */

    function prev_campaign_id() {
        var cur = parseInt(app.dat.campaign_id, 10), best = null;
        $.each(app.dat.campaign_list || [], function (i, c) {
            var id = parseInt(c.id, 10);
            if (!isNaN(id) && id < cur && (best === null || id > best)) best = id;
        });
        return best;
    }

    /* לכל קמפיין יש טאב פעילויות משלו, ולכן activity_id אינו יציב בין שנים.
       ההצלבה נעשית לפי שם הפעילות, שהוא המזהה היחיד שמשמעותי חוצה-שנים.
       פעילות שנרשמנו אליה אשתקד ואינה מוצעת השנה — נופלת מהרשימה. */
    function absorb(resp, pid) {
        var name_by_id = {}, wanted = {}, ids = {}, count = 0;

        $.each(resp.activity_list || [], function (i, row) {
            name_by_id[row[0]] = normalize(row[1]);
        });
        $.each(resp.signup_list || [], function (i, row) {
            var name = name_by_id[row[1]];
            if (name) wanted[name] = true;
        });
        /* נספרות רק פעילויות שבאמת יש להן כרטיס מרונדר, כדי שהמספר על
           הכרטיס יתאים למה שיוצג בפועל אחרי הלחיצה. */
        $.each(app.dat.idx.activity_list || {}, function (id, activity) {
            if (!activity || !wanted[normalize(activity.name)]) return;
            if (!$("#activity_boxes_wrapper .activity_box[activity_id='" + id + "']").length) return;
            ids[id] = true;
            count++;
        });

        last_year.ids    = ids;
        last_year.count  = count;
        last_year.status = "ready";
        v2.log("last year: " + Object.keys(wanted).length + " signups -> " + count + " matched");
    }

    function load_last_year(on_done) {
        var uid = app.dat.user && app.dat.user.uid;
        /* בלי uid אין מה לשלוף — לסמן סופית, אחרת הכרטיס יישאר על "מחפש…" */
        if (!uid) { last_year.status = "none"; return; }
        if (last_year.uid !== uid) {            /* משתמש התחלף — לאפס את המטמון */
            last_year = { status: "idle", uid: uid, ids: {}, count: 0, title: "" };
        }
        if (last_year.status !== "idle") return;

        var pid = prev_campaign_id();
        if (pid === null) { last_year.status = "none"; return; }

        last_year.status = "loading";
        function fail(e) { last_year.status = "error"; v2.log("last year load failed", e); }

        app.post(
            { act_id: "load", uid: uid, register_user: false, campaign_id: pid },
            {
                /* מנוטרל בכוונה — זו טעינת רקע ואסור לה לחסום את המסך */
                please_wait:       function () {},
                on_success:        function (resp) { absorb(resp, pid); on_done(); },
                on_error_response: fail,
                on_connect_error:  fail,
                on_js_error:       fail
            }
        );
    }

    /* לקטגוריה הווירטואלית אין צ'קבוקס להניע, ולכן אחרי app.filter() מסתירים
       ידנית את מה שלא ברשימה. רץ כ-hook על filter, כדי שגם שינוי של מעגל או
       תזמון בתוך הקטגוריה ישמור על המיסוך. */
    function apply_mask() {
        if (state.category !== VIRTUAL) return;
        $("#activity_boxes_wrapper .activity_box").each(function () {
            var $b = $(this);
            if (!last_year.ids[$b.attr("activity_id")]) $b.hide();
        });
    }

    /* הקטגוריות נגזרות מהפעילויות שרונדרו בפועל, ולא מרשימה קשיחה,
       כדי שהמסך יישאר מסונכרן עם הגיליון בלי תחזוקה. */
    function collect() {
        var count = {}, order = [];
        $("#activity_boxes_wrapper .activity_box").each(function () {
            var $b = $(this), c = $b.attr("category");
            if (!c || $b.attr("activity_id") === "NEW_IDEA") return;
            if (count[c] === undefined) { count[c] = 0; order.push(c); }
            count[c]++;
        });
        var list = order.map(function (c) {
            return { value: c, count: count[c], label: cat_label(c) };
        });

        /* הכרטיס הווירטואלי תמיד ראשון וקיים מהרגע הראשון, גם בזמן השליפה.
           הוא תופס את מקומו מיד ומשנה רק את הטקסט שלו, כדי שלא יקפוץ לתוך
           הפריסה אחרי שהמסך כבר נראה מוכן. */
        if (state.want_last_year) {
            list.unshift({
                value:    VIRTUAL,
                label:    cat_label(VIRTUAL),
                note:     last_year_note(),
                virtual:  true,
                loading:  (last_year.status === "idle" || last_year.status === "loading"),
                disabled: !last_year_ready()
            });
        }
        return list;
    }

    function open_category(value) {
        state.category = value;
        $("#filter_box_cat input[type='checkbox']").prop("checked", false);
        if (value !== VIRTUAL) {
            $("#filter_box_cat input[filter_name='" + value + "']").prop("checked", true);
        }
        app.filter();          /* apply_mask רץ אחריו כ-hook ומצמצם לרשימה */
        paint();
        if (window.history && history.pushState) {
            history.pushState({ v2cat: value }, "", location.href);
        }
    }

    function go_home() {
        state.category = null;
        $("#filter_box_cat input[type='checkbox']").prop("checked", false);
        app.filter();
        paint();
    }

    /* הנראות מנוהלת דרך class על body ולא ב-inline style, כי app.filter()
       עושה hide/fadeIn על אותם אלמנטים ושתי הגישות היו נאבקות. */
    function paint() {
        var at_home = (state.category === null);
        $("body").toggleClass("v2_at_home", at_home);
        if (!at_home) $("#v2_back_current").text(cat_label(state.category));
        app.scroll_home();
        $(window).scrollTop(0);
    }

    function build() {
        if (!$("#v2_home").length) {
            $("<div>").attr("id", "v2_home").insertBefore("#activity_boxes_wrapper");
            $("<div>").attr("id", "v2_back")
                .append($("<span>").attr("id", "v2_back_bt")
                                   .append($("<span>").addClass("v2_back_arrow").text("←"),
                                           $("<span>").text("כל הקטגוריות"))
                                   .on("click", go_home))
                .append($("<span>").attr("id", "v2_back_current"))
                .insertBefore("#activity_boxes_wrapper");
        }

        var $home = $("#v2_home").empty();
        $home.append($("<div>").addClass("v2_home_title").text("במה תרצו לעזור?"));

        var $grid = $("<div>").addClass("v2_home_grid");
        collect().forEach(function (c, i) {
            var cls = "v2_cat_card " + (c.virtual ? "v2_cat_last" : "v2_cat_c" + (i % 5));
            if (c.loading)  cls += " v2_cat_loading";
            if (c.disabled) cls += " v2_cat_disabled";

            var note = c.note !== undefined ? c.note
                     : (c.count === 1 ? "פעילות אחת" : c.count + " פעילויות");

            var $card = $("<div>").addClass(cls)
                .append($("<div>").addClass("v2_cat_name").text(c.label))
                .append($("<div>").addClass("v2_cat_count").text(note));

            if (!c.disabled) $card.on("click", function () { open_category(c.value); });
            $card.appendTo($grid);
        });
        $home.append($grid);
    }

    v2.add({
        id:    "category-home",
        title: "מסך ראשי של קטגוריות במקום פילטר הקטגוריה",
        on:    true,

        apply: function () {
            /* v2_at_home כבר עכשיו, כדי שלא תהיה הבזקה של הרשימה המלאה
               בין הרינדור הראשון לבין paint(). */
            $("body").addClass("v2_home_on v2_at_home");
            if (state.wired) return;
            state.wired = true;
            /* במובייל כפתור החזרה של הדפדפן צריך להחזיר למסך הקטגוריות
               ולא להוציא מהאתר. */
            $(window).on("popstate", function () {
                if (state.category !== null) go_home();
            });
            /* המיסוך של הקטגוריה הווירטואלית חייב לרוץ אחרי כל סינון,
               לא רק בפתיחה שלה. */
            v2.after("filter", apply_mask);
        },

        /* רץ אחרי כל app.rebuild — כלומר גם בטעינה וגם אחרי שמירה.
           הספירות נבנות מחדש, אבל הקטגוריה הפתוחה נשמרת כדי שמי ששמר
           לא ייזרק בחזרה למסך הראשי. */
        render: function () {
            /* טעינת הרקע של שנה שעברה מתחילה רק אחרי שהמסך הראשי כבר מוצג,
               ומרעננת את הכרטיסים בעצמה כשהיא חוזרת. */
            if (state.want_last_year) {
                /* רק build — בלי paint. paint גולל למעלה, וגלילה מפתיעה
                   כשהשליפה חוזרת היא בדיוק סוג ההפרעה שאנחנו מתקנים כאן. */
                load_last_year(function () { build(); });
            }

            build();

            if (state.category !== null && state.category !== VIRTUAL &&
                !$("#filter_box_cat input[filter_name='" + state.category + "']").length) {
                state.category = null;          /* הקטגוריה נעלמה מהנתונים */
            }
            if (state.category === VIRTUAL && last_year.count === 0) {
                state.category = null;          /* אין יותר מה להציג בה */
            }
            if (state.category !== null) {
                /* app.clear() מאפס את הצ'קבוקסים בהתנתקות, ולכן מסמנים
                   מחדש במקום להניח שהסימון שרד. */
                $("#filter_box_cat input[type='checkbox']").prop("checked", false);
                if (state.category !== VIRTUAL) {
                    $("#filter_box_cat input[filter_name='" + state.category + "']")
                        .prop("checked", true);
                }
                app.filter();
            }
            paint();
        }
    });

    /*  קטגוריה וירטואלית: הפעילויות שהמשפחה נרשמה אליהן בשנה הקודמת.
     *
     *  המידע לא קיים בנתונים של השנה הנוכחית, אבל load מקבל campaign_id —
     *  ולכן קריאה שנייה עם הקמפיין הקודם מחזירה אותו, בלי שינוי בשרת.
     *  ההצלבה לפי שם הפעילות ולא לפי מזהה, כי לכל שנה טאב פעילויות משלה
     *  והמזהים אינם יציבים בין שנים. פעילות שאינה מוצעת השנה יורדת.
     *
     *  תלוי ב-category-home: זהו כרטיס במסך שלו.
     */
    v2.add({
        id:    "last-year-category",
        title: "קטגוריה של הפעילויות משנה שעברה",
        on:    true,
        apply: function () { state.want_last_year = true; }
    });
}());

/*  כיווץ התיאור בכרטיס פעילות במובייל.
 *
 *  התיאורים ארוכים, וכשכולם פתוחים הרשימה נעשית ארוכה מאוד ואי אפשר לסרוק
 *  אותה. התיאור מוסתר, וכפתור "פרטים" פותח אותו לכרטיס בודד.
 *
 *  לא נשען על box_maximized הקיים: ה-handler שלו ניגש ל-#box_placeholder
 *  ול-#mask_dialog, ששניהם לא קיימים ב-mobile.html, ואין לו עיצוב ב-mobile.css.
 *  הוא מחליף שם class שלא עושה כלום. מנגנון עצמאי הוא גם ברור יותר וגם לא
 *  יישבר אם מישהו יוסיף את האלמנטים האלה למובייל בעתיד.
 */
(function () {
    var wired = false;

    /* התיאור מרונדר כ-&nbsp; כשאין תוכן, אז trim לבדו לא מספיק. */
    function has_text($d) {
        return $d.length > 0 && $d.text().replace(/ /g, " ").trim() !== "";
    }

    v2.add({
        id:    "mobile-desc-collapse",
        title: "הסתרת תיאור הפעילות במובייל, עם כפתור פתיחה",
        on:    true,
        pages: ["mobile"],

        apply: function () {
            $("body").addClass("v2_desc_on");
            if (wired) return;
            wired = true;
            /* delegation — הכרטיסים נבנים מחדש בכל rebuild, ובלי זה היינו
               צריכים לחבר מאזין לכל כרטיס בכל פעם מחדש. */
            $("#activity_boxes_wrapper").on("click", ".v2_desc_bt", function () {
                var open = $(this).closest(".activity_box")
                                  .toggleClass("v2_desc_open")
                                  .hasClass("v2_desc_open");
                $(this).text(open ? "פחות" : "פרטים").toggleClass("v2_desc_bt_open", open);
            });
        },

        render: function () {
            $("#activity_boxes_wrapper .activity_box").each(function () {
                var $b = $(this);
                if ($b.attr("activity_id") === "NEW_IDEA") return;
                if ($b.find(".v2_desc_bt").length) return;      /* כבר יש */
                var $d = $b.find(".activity_box_desc");
                if (!has_text($d)) return;                      /* אין מה לפתוח */
                $("<div>").addClass("v2_desc_bt").text("פרטים").insertBefore($d);
            });
        }
    });
}());

/*  דסקטופ: להוציא את התיאור מקופסת הגלילה בת שלוש השורות.
 *
 *  התיאורים ברובם ארוכים מהקופסה, כך שכל כרטיס מציג שבריר טקסט עם פס גלילה
 *  ובכל זאת תופס 4.1em. הרמז היחיד שיש שם עוד תוכן הוא אייקון שמופיע רק
 *  בריחוף (app.css:440), ולכן קל מאוד לפספס אותו.
 *
 *  כאן דווקא כן נשענים על box_maximized הקיים — בדסקטופ הוא מעוצב ועובד
 *  (מודאל, התיאור גדל), ו-#box_placeholder ו-#mask_dialog קיימים ב-index.html.
 *  הכפתור פשוט מפעיל את הלחיצה על הכותרת, במקום לשכפל מנגנון.
 */
(function () {
    var wired = false;

    function has_text($d) {
        return $d.length > 0 && $d.text().replace(/ /g, " ").trim() !== "";
    }

    v2.add({
        id:    "desktop-desc-popup",
        title: "הסתרת קופסת התיאור בדסקטופ, עם כפתור ברור לתיאור המלא",
        on:    true,
        pages: ["desktop"],

        apply: function () {
            $("body").addClass("v2_descd_on");
            if (wired) return;
            wired = true;
            $("#activity_boxes_wrapper").on("click", ".v2_descd_bt", function (ev) {
                ev.stopPropagation();
                $(this).closest(".activity_box").find(".activity_box_title").trigger("click");
            });
        },

        render: function () {
            $("#activity_boxes_wrapper .activity_box").each(function () {
                var $b = $(this);
                if ($b.attr("activity_id") === "NEW_IDEA") return;
                if ($b.find(".v2_descd_bt").length) return;
                var $d = $b.find(".activity_box_desc");
                if (!has_text($d)) return;
                $("<div>").addClass("v2_descd_bt").text("לתיאור הפעילות").insertBefore($d);
            });
        }
    });
}());


/*  יישור הדיאלוג של בחירת השכבות.
 *
 *  ב-app.css הוא מוגדר עם justify-content: right יחד עם text-align: left —
 *  שני כללים שמושכים לכיוונים הפוכים — ועם font-size: 24px שגורם לגלישה.
 *  התוצאה היא צ'קבוקסים לא מיושרים. כאן רק פריסה; אין שינוי התנהגות.
 */
v2.add({
    id:    "grade-dialog-layout",
    title: "יישור ועימוד של דיאלוג בחירת השכבות",
    on:    true,
    /* ה-CSS תלוי ב-class הזה, אחרת הוא היה חל תמיד ו-?off= לא היה מכבה אותו */
    apply: function () { $("body").addClass("v2_gradedlg_on"); }
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
