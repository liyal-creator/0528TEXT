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

  var localizedCopy = {
    en: {
      getApp: "Get the app", openApp: "Open Conso", openInApp: "Open in app",
      dialogTitle: "This feature is available in Conso", dialogDescription: "Open Conso for the full content and experience.",
      cancel: "Cancel", confirm: "Allow", communityPicks: "Community Picks",
      posterPrompt: "Open Conso to view the full content", posterFooter: "Open Conso to view full content"
    },
    zhHans: {
      getApp: "获取应用", openApp: "打开 Conso", openInApp: "APP内打开",
      dialogTitle: "该功能需在 Conso 中使用", dialogDescription: "前往 Conso，获取完整内容与功能。",
      cancel: "取消", confirm: "允许", communityPicks: "社区精选",
      posterPrompt: "打开Conso查看完整内容", posterFooter: "前往 Conso，查看完整内容"
    },
    zhHant: {
      getApp: "取得應用程式", openApp: "開啟 Conso", openInApp: "在 APP 內開啟",
      dialogTitle: "此功能需在 Conso 中使用", dialogDescription: "前往 Conso，取得完整內容與功能。",
      cancel: "取消", confirm: "允許", communityPicks: "社群精選",
      posterPrompt: "開啟Conso查看完整內容", posterFooter: "前往 Conso，查看完整內容"
    },
    ru: {
      getApp: "Скачать приложение", openApp: "Открыть Conso", openInApp: "Открыть в приложении",
      dialogTitle: "Эта функция доступна в Conso", dialogDescription: "Откройте Conso, чтобы получить полный доступ к контенту и функциям.",
      cancel: "Отмена", confirm: "Открыть", communityPicks: "Выбор сообщества",
      posterPrompt: "Откройте Conso, чтобы увидеть полный контент", posterFooter: "Откройте Conso, чтобы увидеть полный контент"
    },
    ar: {
      getApp: "احصل على التطبيق", openApp: "افتح Conso", openInApp: "افتح في التطبيق",
      dialogTitle: "هذه الميزة متاحة في Conso", dialogDescription: "افتح Conso للوصول إلى المحتوى والميزات الكاملة.",
      cancel: "إلغاء", confirm: "فتح", communityPicks: "اختيارات المجتمع",
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

  function isEnabledParam(name) {
    var value = String(params.get(name) || "").trim().toLowerCase();
    return value === "1" || value === "true" || value === "yes";
  }

  function isConsoApp() {
    var ua = window.navigator.userAgent || "";
    return isEnabledParam("inConso")
      || isEnabledParam("consoApp")
      || isEnabledParam("isConso")
      || Boolean(window.conso_android)
      || Boolean(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.performAction)
      || Boolean(window.consoAppVersion || window.__consoAppVersion)
      || /Conso-iOS|Conso-Android|Conso-App/i.test(ua);
  }

  function syncInitialEnvironment() {
    var theme = String(params.get("theme") || "").toLowerCase();
    root.classList.toggle("conso-share-in-app", isConsoApp());
    root.classList.toggle("conso-share-dark", theme === "dark" || params.get("isDark") === "1");
  }

  function appendStylesheet() {
    if (document.querySelector("link[data-conso-share-runtime-style]")) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = runtimeBaseUrl + "conso-share-widget.css" + runtimeVersion;
    link.setAttribute("data-conso-share-runtime-style", "");
    document.head.appendChild(link);
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
    appendStylesheet();
    mountShell();
    return loadScript("html2canvas.min.js")
      .then(function () { return loadScript("conso-share-widget.js"); })
      .then(function () { return loadScript("qrcode.js"); })
      .then(function () { return loadScript("protobuf.min.js"); })
      .then(function () { return loadScript("h5_share_bridge_pb.js"); })
      .then(function () { return loadScript("conso-share-image.js"); })
      .catch(function (error) {
        console.error("[ConsoShareRuntime]", error);
        throw error;
      });
  }

  syncInitialEnvironment();
  window.addEventListener("pageshow", syncInitialEnvironment);
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
