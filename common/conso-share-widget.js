(function () {
  var DEFAULT_CONSO_DEEP_LINK = "conso.tg://open";
  var DEFAULT_IOS_APP_DOWN_URL = "https://apps.apple.com/app/id6740982711";
  var DEFAULT_ANDROID_APP_DOWN_URL = "https://play.google.com/store/apps/details?id=global.xfinite.conso";

  var root = document.documentElement;
  var body = document.body;
  var params = new URLSearchParams(window.location.search || "");
  var modal = document.querySelector("[data-conso-restricted-modal]");
  var cancelButtons = document.querySelectorAll("[data-conso-dialog-cancel]");
  var confirmButtons = document.querySelectorAll("[data-conso-dialog-confirm]");

  function getParam(name) {
    return String(params.get(name) || "").trim();
  }

  function isConsoApp() {
    // 只有全屏 Web 会收到客户端回传的有效 tokenInit，内置浏览器统一按外部环境处理。
    return Boolean(window.__consoClientTokenReceived);
  }

  function isDarkMode() {
    var theme = getParam("theme").toLowerCase();
    return theme === "dark"
      || getParam("isDark") === "1"
      || root.getAttribute("data-theme") === "dark"
      || body.classList.contains("theme-dark");
  }

  function getMobileOS() {
    var ua = window.navigator.userAgent || "";
    if (/android/i.test(ua)) return "Android";
    if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
    return "unknown";
  }

  function isHttpUrl(url) {
    return /^https?:\/\//i.test(url || "");
  }

  function getFallbackUrl() {
    var os = getMobileOS();
    var fallback = getParam("fallbackUrl") || getParam("appDownUrl");
    var ios = getParam("iosAppDownUrl") || fallback || DEFAULT_IOS_APP_DOWN_URL;
    var android = getParam("androidAppDownUrl") || fallback || DEFAULT_ANDROID_APP_DOWN_URL;
    if (os === "iOS") return ios || android || "";
    return android || ios || "";
  }

  function openConsoApp() {
    if (isConsoApp()) return;

    var deepLink = getParam("deeplink")
      || getParam("openUrl")
      || getParam("consoDeepLink")
      || DEFAULT_CONSO_DEEP_LINK;
    var fallbackUrl = getFallbackUrl();
    var targetUrl = deepLink || fallbackUrl;
    if (!targetUrl) return;

    var fallbackTimer;
    var clearFallback = function () {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    };

    if (fallbackUrl && fallbackUrl !== targetUrl && !isHttpUrl(targetUrl)) {
      window.addEventListener("pagehide", clearFallback, { once: true });
      document.addEventListener("visibilitychange", clearFallback, { once: true });
      fallbackTimer = window.setTimeout(function () {
        if (document.visibilityState === "visible") {
          window.location.href = fallbackUrl;
        }
      }, 1200);
    }

    window.location.href = targetUrl;
  }

  function showDialog() {
    if (!modal || isConsoApp()) return;
    modal.hidden = false;
    root.classList.add("conso-share-lock");
    var confirm = document.querySelector("[data-conso-dialog-confirm]");
    if (confirm) confirm.focus({ preventScroll: true });
  }

  function closeDialog() {
    if (!modal) return;
    modal.hidden = true;
    root.classList.remove("conso-share-lock");
  }

  function isSamePageAnchor(anchor) {
    var href = anchor.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#") return true;
    try {
      var url = new URL(href, window.location.href);
      return url.origin === window.location.origin
        && url.pathname === window.location.pathname
        && !!url.hash
        && !url.search;
    } catch (error) {
      return false;
    }
  }

  function shouldRestrictLink(anchor) {
    if (!anchor || isConsoApp()) return false;
    if (anchor.closest("[data-conso-open-app]")) return false;
    if (anchor.hasAttribute("data-conso-pass-through")) return false;
    if (isSamePageAnchor(anchor)) return false;

    var href = (anchor.getAttribute("href") || "").trim().toLowerCase();
    return href
      && href.indexOf("javascript:") !== 0
      && href.indexOf("mailto:") !== 0
      && href.indexOf("tel:") !== 0;
  }

  function syncState() {
    var inApp = isConsoApp();
    root.classList.toggle("conso-share-in-app", inApp);
    root.classList.toggle("conso-share-dark", isDarkMode());
    body.classList.toggle("conso-share-has-promo", !inApp);
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    var openButton = target.closest && target.closest("[data-conso-open-app]");
    if (openButton) {
      event.preventDefault();
      event.stopPropagation();
      openConsoApp();
      return;
    }

    var anchor = target.closest && target.closest("a[href]");
    if (shouldRestrictLink(anchor)) {
      event.preventDefault();
      event.stopPropagation();
      showDialog();
    }
  }, true);

  cancelButtons.forEach(function (button) {
    button.addEventListener("click", closeDialog);
  });

  confirmButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      closeDialog();
      openConsoApp();
    });
  });

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeDialog();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeDialog();
  });

  syncState();
  window.addEventListener("conso-client-token-received", syncState);
})();
