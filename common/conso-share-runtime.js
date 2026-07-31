(function () {
  "use strict";

  var runtimeScript = document.currentScript;
  var runtimeUrl = runtimeScript && runtimeScript.src ? new URL(runtimeScript.src, window.location.href) : null;
  var runtimeBaseUrl = runtimeUrl
    ? runtimeUrl.href.replace(/[^/]+(?:\?.*)?$/, "")
    : "./conso-share-runtime/";
  var runtimeVersion = runtimeUrl ? runtimeUrl.search : "";
  var root = document.documentElement;
  var params = new URLSearchParams(window.location.search || "");
  var defaultLanguage = runtimeScript ? runtimeScript.getAttribute("data-conso-share-default-language") : "";
  var DEFAULT_CONSO_DEEP_LINK = "conso.tg://open";
  var DEFAULT_TELEGRAM_MINI_APP_DOMAIN = "conso_mini_bot";
  var DEFAULT_TELEGRAM_MINI_APP_NAME = "share_invite";
  var TELEGRAM_AUTO_OPEN_DELAY_MS = 3000;
  var INVITE_CODE_PARAM_NAMES = ["inviteCode", "invite_code", "invitationCode", "invitation_code", "startapp"];

  var localizedCopy = {
    en: {
      getApp: "Get the App", openApp: "Open Conso", openInApp: "Open in App",
      dialogTitle: "This feature is only available in Conso", dialogDescription: "Open Conso to enjoy the full experience.",
      cancel: "Cancel", confirm: "Allow", communityPicks: "Community Picks",
      posterPrompt: "Open Conso to view the full content", posterFooter: "Open Conso to view the full content"
    },
    zhHans: {
      getApp: "获取App", openApp: "打开Conso", openInApp: "App内打开",
      dialogTitle: "该功能需在Conso中使用", dialogDescription: "前往Conso，获取完整内容与功能。",
      cancel: "取消", confirm: "允许", communityPicks: "社区精选",
      posterPrompt: "打开Conso查看完整内容", posterFooter: "前往Conso，查看完整内容"
    },
    zhHant: {
      getApp: "下載App", openApp: "開啟Conso", openInApp: "App內開啟",
      dialogTitle: "此功能需在Conso中使用", dialogDescription: "開啟Conso，體驗完整內容與功能。",
      cancel: "取消", confirm: "允許", communityPicks: "社區精選",
      posterPrompt: "開啟Conso查看完整內容", posterFooter: "前往Conso，查看完整內容"
    },
    ru: {
      getApp: "Скачать приложение", openApp: "Открыть Conso", openInApp: "Открыть в приложении",
      dialogTitle: "Эта функция доступна только в Conso", dialogDescription: "Откройте Conso, чтобы получить полный опыт использования.",
      cancel: "Отмена", confirm: "Разрешить", communityPicks: "Выбор сообщества",
      posterPrompt: "Откройте Conso, чтобы увидеть полный контент", posterFooter: "Откройте Conso, чтобы увидеть полный контент"
    },
    ar: {
      getApp: "تحميل التطبيق", openApp: "فتح Conso", openInApp: "فتح في التطبيق",
      dialogTitle: "هذه الميزة متاحة فقط في Conso", dialogDescription: "افتح Conso للاستمتاع بالتجربة الكاملة.",
      cancel: "إلغاء", confirm: "السماح", communityPicks: "مختارات المجتمع",
      posterPrompt: "افتح Conso لعرض المحتوى الكامل", posterFooter: "افتح Conso لعرض المحتوى الكامل"
    }
  };

  function normalizeLocale(value) {
    var language = String(value || "").trim().toLowerCase();
    if (["zh-hans-raw", "zh-cn", "zhcn", "zhhans", "zh-hans"].indexOf(language) >= 0) return "zhHans";
    if (["zh", "zh-hant-raw", "zh-hant", "zhhant", "zh-tw", "zhtw", "zh-hk", "zhhk"].indexOf(language) >= 0) return "zhHant";
    if (language.indexOf("ru") === 0) return "ru";
    if (language.indexOf("ar") === 0) return "ar";
    return "en";
  }

  function getLocalizedCopy() {
    var requestedLanguage = params.get("language") || params.get("lang") || defaultLanguage || document.documentElement.lang || window.navigator.language;
    return localizedCopy[normalizeLocale(requestedLanguage)] || localizedCopy.en;
  }

  window.__consoShareRuntimeBaseUrl = runtimeBaseUrl;
  window.ConsoShareLocale = { getCopy: getLocalizedCopy, normalize: normalizeLocale };

  function hasConsoBridge() {
    return Boolean(
      (window.conso_android && typeof window.conso_android.post === "function")
      || (window.conso_ios && typeof window.conso_ios.post === "function")
    );
  }

  function isConsoApp() {
    return hasConsoBridge()
      || window.__consoClientTokenReceived === true
      || window.__consoEnvironmentState === "in-app";
  }

  function isEnvironmentPending() {
    return !isConsoApp() && window.__consoEnvironmentState === "pending";
  }

  function setEnvironmentState(state) {
    if (window.__consoEnvironmentState === state) return;
    window.__consoEnvironmentState = state;
    root.classList.toggle("conso-share-env-pending", state === "pending");
    root.classList.toggle("conso-share-in-app", state === "in-app");
    window.dispatchEvent(new CustomEvent("conso-environment-changed"));
  }

  var previousTokenInit = window.tokenInit;
  window.tokenInit = function (token) {
    var normalized = String(token || "").trim();
    if (normalized) {
      var environmentChanged = !window.__consoClientTokenReceived;
      window.__consoClientTokenReceived = true;
      window.__consoClientToken = normalized;
      if (environmentChanged) {
        setEnvironmentState("in-app");
        window.dispatchEvent(new CustomEvent("conso-client-token-received"));
      }
    }
    if (typeof previousTokenInit === "function") return previousTokenInit.apply(this, arguments);
    return undefined;
  };

  function getInviteCode() {
    for (var index = 0; index < INVITE_CODE_PARAM_NAMES.length; index += 1) {
      var inviteCode = String(params.get(INVITE_CODE_PARAM_NAMES[index]) || "").trim();
      if (inviteCode) return inviteCode;
    }
    return "";
  }

  function getTelegramMiniAppDomain() {
    var meta = document.querySelector('meta[name="conso-share-telegram-miniapp-domain"]');
    var domain = String(meta && meta.content || DEFAULT_TELEGRAM_MINI_APP_DOMAIN).trim();
    return /^[A-Za-z0-9_]{5,64}$/.test(domain) ? domain : DEFAULT_TELEGRAM_MINI_APP_DOMAIN;
  }

  function getTelegramMiniAppName() {
    var meta = document.querySelector('meta[name="conso-share-telegram-miniapp-appname"]');
    var appName = String(meta && meta.content || DEFAULT_TELEGRAM_MINI_APP_NAME).trim();
    return /^[A-Za-z0-9_]{1,64}$/.test(appName) ? appName : DEFAULT_TELEGRAM_MINI_APP_NAME;
  }

  function getTelegramInviteDeepLink() {
    var domain = getTelegramMiniAppDomain();
    if (!domain) return "";

    var appName = getTelegramMiniAppName();
    var deepLink = "tg://resolve?domain=" + encodeURIComponent(domain) + "&appname=" + encodeURIComponent(appName);
    var inviteCode = getInviteCode();
    return inviteCode
      ? deepLink + "&startapp=" + encodeURIComponent(inviteCode)
      : deepLink;
  }

  function getConsoDeepLink() {
    return String(
      params.get("deeplink")
      || params.get("openUrl")
      || params.get("consoDeepLink")
      || DEFAULT_CONSO_DEEP_LINK
    ).trim();
  }

  function scheduleTelegramInviteOpen() {
    if (isConsoApp()) return;
    if (isEnvironmentPending()) {
      window.addEventListener("conso-environment-changed", scheduleTelegramInviteOpen, { once: true });
      return;
    }

    var consoDeepLink = getConsoDeepLink();
    if (consoDeepLink && document.visibilityState !== "hidden") {
      window.location.href = consoDeepLink;
    }

    var telegramDeepLink = getTelegramInviteDeepLink();
    if (!telegramDeepLink) return;

    var timer = window.setTimeout(function () {
      timer = null;
      // Conso 唤起成功时页面会进入后台；仍停留在前台才尝试邀请 Mini App。
      if (isConsoApp() || document.visibilityState === "hidden") return;
      window.location.href = telegramDeepLink;
    }, TELEGRAM_AUTO_OPEN_DELAY_MS);

    function cancelAutoOpen() {
      if (!timer) return;
      window.clearTimeout(timer);
      timer = null;
    }

    window.addEventListener("pagehide", cancelAutoOpen, { once: true });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") cancelAutoOpen();
    }, { once: true });
  }

  function syncInitialEnvironment() {
    var theme = String(params.get("theme") || "").toLowerCase();
    var inApp = isConsoApp();
    if (inApp && window.__consoEnvironmentState !== "in-app") {
      setEnvironmentState("in-app");
    }
    root.classList.toggle("conso-share-in-app", inApp);
    root.classList.toggle("conso-share-env-pending", !inApp && isEnvironmentPending());
    root.classList.toggle("conso-share-dark", theme === "dark" || params.get("isDark") === "1");
  }

  function appendStylesheet() {
    var existing = document.querySelector("link[data-conso-share-runtime-style]");
    if (existing) {
      if (existing.getAttribute("data-conso-share-loaded") === "true" || existing.sheet) {
        return Promise.resolve();
      }
      return new Promise(function (resolve, reject) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      });
    }

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = runtimeBaseUrl + "conso-share-widget.css" + runtimeVersion;
    link.setAttribute("data-conso-share-runtime-style", "");
    return new Promise(function (resolve, reject) {
      link.onload = function () {
        link.setAttribute("data-conso-share-loaded", "true");
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  function loadScript(name) {
    return new Promise(function (resolve, reject) {
      var selector = 'script[data-conso-share-runtime-module="' + name + '"]';
      var existing = document.querySelector(selector);
      if (existing) {
        if (existing.getAttribute("data-conso-share-loaded") === "true") {
          resolve();
        } else {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
        }
        return;
      }

      var script = document.createElement("script");
      script.src = runtimeBaseUrl + name + runtimeVersion;
      script.async = false;
      script.setAttribute("data-conso-share-runtime-module", name);
      script.onload = function () {
        script.setAttribute("data-conso-share-loaded", "true");
        resolve();
      };
      script.onerror = function () {
        reject(new Error("Unable to load Conso share runtime module: " + name));
      };
      document.head.appendChild(script);
    });
  }

  function mountShell() {
    if (document.querySelector("[data-conso-share-shell]")) return;

    var logoUrl = runtimeBaseUrl + "circle_logo.svg";
    var copy = getLocalizedCopy();
    document.body.insertAdjacentHTML("afterbegin", [
      '<header class="conso-share-header" data-conso-share-entry data-conso-share-shell>',
      '<img class="conso-share-logo" src="' + logoUrl + '" alt="" />',
      '<button class="conso-share-get" type="button" data-conso-open-app>' + copy.getApp + '</button>',
      '</header>'
    ].join(""));
    document.body.insertAdjacentHTML("beforeend", [
      '<button class="conso-share-floating" type="button" aria-label="' + copy.openApp + '" data-conso-open-app data-conso-share-shell>',
      '<img src="' + logoUrl + '" alt="" />',
      '<span>' + copy.openInApp + '</span>',
      '</button>',
      '<div class="conso-share-modal" data-conso-restricted-modal data-conso-share-shell hidden>',
      '<div class="conso-share-dialog" role="dialog" aria-modal="true" aria-labelledby="conso-share-dialog-title" aria-describedby="conso-share-dialog-description">',
      '<div class="conso-share-dialog-copy">',
      '<h2 id="conso-share-dialog-title">' + copy.dialogTitle + '</h2>',
      '<p id="conso-share-dialog-description">' + copy.dialogDescription + '</p>',
      '</div>',
      '<div class="conso-share-dialog-actions">',
      '<button type="button" data-conso-dialog-cancel>' + copy.cancel + '</button>',
      '<button type="button" data-conso-dialog-confirm>' + copy.confirm + '</button>',
      '</div>',
      '</div>',
      '</div>'
    ].join(""));
  }

  function start() {
    syncInitialEnvironment();
    var shellReady = appendStylesheet().then(function () {
      mountShell();
    }, function (error) {
      console.error("[ConsoShareRuntime] Unable to load widget styles", error);
    });
    var protobufReady = loadScript("protobuf.min.js")
      .then(function () { return loadScript("h5_share_bridge_pb.js"); });

    return Promise.all([
      loadScript("html2canvas.min.js"),
      shellReady.then(function () { return loadScript("conso-share-widget.js"); }),
      loadScript("qrcode.js"),
      protobufReady
    ])
      .then(function () { return loadScript("conso-share-image.js"); })
      .catch(function (error) {
        console.error("[ConsoShareRuntime]", error);
        throw error;
      });
  }

  syncInitialEnvironment();
  scheduleTelegramInviteOpen();
  window.addEventListener("pageshow", syncInitialEnvironment);
  window.addEventListener("conso-client-token-received", syncInitialEnvironment);
  window.addEventListener("conso-environment-changed", syncInitialEnvironment);
  window.ConsoH5ShareReady = new Promise(function (resolve, reject) {
    function initialize() {
      start().then(resolve, reject);
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
      initialize();
    }
  });
})();
