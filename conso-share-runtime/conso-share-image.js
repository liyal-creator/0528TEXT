(function () {
  "use strict";

  var PRODUCT_ID = "802";
  var TOKEN_TIMEOUT_MS = 8000;
  var previousTokenInit = window.tokenInit;
  var memoryToken = "";
  var tokenWaiters = [];
  var tokenWarmUpStarted = false;
  var shareGenerationInFlight = false;
  var shareGenerationSequence = 0;
  var sharePreloadStarted = false;
  var preparedShareImage = null;
  var preparedShareImagePromise = null;
  var preparedUploadTarget = null;
  var preparedUploadTargetPromise = null;

  function ShareError(code, message) {
    this.name = "ShareError";
    this.code = code || "SHARE_FAILED";
    this.message = message || "Unable to generate the share image.";
    if (Error.captureStackTrace) Error.captureStackTrace(this, ShareError);
  }
  ShareError.prototype = Object.create(Error.prototype);
  ShareError.prototype.constructor = ShareError;

  function getMeta(name) {
    var node = document.querySelector('meta[name="' + name + '"]');
    return node ? String(node.getAttribute("content") || "").trim() : "";
  }
  function getParam(name) {
    return String(new URLSearchParams(window.location.search || "").get(name) || "").trim();
  }
  function getApiBase(options) {
    var value = String((options && options.apiBase) || getParam("apiBase") || getMeta("conso-share-api-base") || "").trim();
    if (value) return value.replace(/\/+$/, "");
    return /test/i.test(window.location.host || "") ? "https://testapinew.conso.network" : "https://api.conso.network";
  }
  function getLanguage(options) {
    return String((options && options.language) || getParam("language") || getParam("lang") || document.documentElement.lang || "en").trim() || "en";
  }
  function getLocalizedCopy() {
    var locale = window.ConsoShareLocale;
    if (locale && typeof locale.getCopy === "function") return locale.getCopy();
    return {
      communityPicks: "Community Picks",
      posterPrompt: "Open Conso to view the full content",
      posterFooter: "Open Conso to view full content"
    };
  }
  function getCaptureMode(options) {
    var value = String((options && options.captureMode) || getMeta("conso-share-capture-mode") || "viewport").toLowerCase();
    return value === "full" ? "full" : "viewport";
  }
  function isDebugEnabled() {
    var value = String(getParam("consoShareDebug") || getMeta("conso-share-debug") || "").toLowerCase();
    return value === "1" || value === "true" || value === "yes";
  }
  function now() {
    return window.performance && typeof window.performance.now === "function" ? window.performance.now() : Date.now();
  }
  function elapsedMs(startedAt) {
    return Math.max(0, Math.round(now() - startedAt));
  }
  function getDebugPanel() {
    if (!isDebugEnabled()) return null;
    var panel = document.querySelector("[data-conso-share-debug]");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.setAttribute("data-conso-share-debug", "");
    panel.style.cssText = "position:fixed;z-index:2147483647;left:12px;right:12px;bottom:12px;max-height:42vh;overflow:auto;box-sizing:border-box;padding:10px 12px;border-radius:8px;background:rgba(0,0,0,.88);color:#6ce783;font:12px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;white-space:pre-wrap;word-break:break-word;box-shadow:0 4px 18px rgba(0,0,0,.35);pointer-events:none;";
    document.body.appendChild(panel);
    return panel;
  }
  function resetDebugPanel() {
    var panel = getDebugPanel();
    if (panel) panel.textContent = "";
  }
  function debugLog(stage, data) {
    if (!isDebugEnabled()) return;
    if (window.console && typeof window.console.info === "function") window.console.info("[ConsoShare] " + stage, data || {});
    var panel = getDebugPanel();
    if (!panel) return;
    var detail = "";
    if (data && Object.keys(data).length) {
      try { detail = " " + JSON.stringify(data); }
      catch (error) { detail = " " + String(data); }
    }
    panel.textContent += new Date().toLocaleTimeString() + " " + stage + detail + "\n";
    panel.scrollTop = panel.scrollHeight;
  }
  function sendBridgeData(eventName, eventData) {
    try {
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.performAction) {
        window.webkit.messageHandlers.performAction.postMessage({ eventName: eventName, eventData: eventData });
        return true;
      }
      if (window.conso_android && typeof window.conso_android.post === "function") {
        window.conso_android.post(JSON.stringify({ eventName: eventName, eventData: eventData }));
        return true;
      }
    } catch (error) { return false; }
    return false;
  }
  function sendBridge(eventName, payload) {
    return sendBridgeData(eventName, JSON.stringify(payload || {}));
  }
  function sendBridgeProtobuf(eventName, messageName, payload) {
    return sendBridgeData(eventName, bytesToBase64(encodeBridgeMessage(messageName, payload)));
  }
  function getShareButtonVisibilityPayload() {
    return bytesToBase64(encodeBridgeMessage("H5ShareButtonVisibility", {
      showShareButton: !!getMeta("conso-share-resource-id")
    }));
  }
  function settleTokenWaiters(token) {
    tokenWaiters.splice(0).forEach(function (waiter) {
      window.clearTimeout(waiter.timer);
      waiter.resolve(token);
    });
  }
  window.tokenInit = function (token) {
    var normalized = String(token || "").trim();
    if (normalized) {
      memoryToken = normalized;
      var waiterCount = tokenWaiters.length;
      settleTokenWaiters(normalized);
      debugLog("token.received", { waiterCount: waiterCount });
    }
    if (typeof previousTokenInit === "function") return previousTokenInit.apply(this, arguments);
    return undefined;
  };
  function requestToken(forceRefresh) {
    if (!forceRefresh && memoryToken) return Promise.resolve(memoryToken);
    if (forceRefresh) memoryToken = "";
    return new Promise(function (resolve, reject) {
      var shouldRequestToken = tokenWaiters.length === 0;
      var waiter = { resolve: resolve, reject: reject };
      waiter.timer = window.setTimeout(function () {
        var index = tokenWaiters.indexOf(waiter);
        if (index >= 0) tokenWaiters.splice(index, 1);
        reject(new ShareError("TOKEN_TIMEOUT", "Timed out waiting for the Conso client token."));
      }, TOKEN_TIMEOUT_MS);
      tokenWaiters.push(waiter);
      if (shouldRequestToken) sendBridge("getClientWebToken", {});
    });
  }
  function warmUpToken() {
    if (memoryToken || tokenWarmUpStarted) return;
    tokenWarmUpStarted = true;
    requestToken(false).catch(function () {});
  }

  function concatBytes(chunks) {
    var length = chunks.reduce(function (total, chunk) { return total + chunk.length; }, 0);
    var output = new Uint8Array(length);
    var offset = 0;
    chunks.forEach(function (chunk) { output.set(chunk, offset); offset += chunk.length; });
    return output;
  }
  function encodeVarint(value) {
    var current = Number(value);
    if (!Number.isSafeInteger(current) || current < 0) throw new ShareError("PROTO_ENCODE_FAILED", "Invalid protobuf varint value.");
    var bytes = [];
    do {
      var byte = current % 128;
      current = Math.floor(current / 128);
      if (current > 0) byte += 128;
      bytes.push(byte);
    } while (current > 0);
    return new Uint8Array(bytes);
  }
  function encodeField(number, wireType, value) {
    var tag = encodeVarint(number * 8 + wireType);
    if (wireType === 0) return concatBytes([tag, encodeVarint(value)]);
    var bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(String(value));
    return concatBytes([tag, encodeVarint(bytes.length), bytes]);
  }
  function bytesToBase64(bytes) {
    var binary = "";
    for (var index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
    return window.btoa(binary);
  }
  function base64ToBytes(value) {
    var normalized = String(value || "").replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4) normalized += "=";
    var binary = window.atob(normalized);
    var bytes = new Uint8Array(binary.length);
    for (var index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }
  function getBridgeMessage(messageName) {
    var protobuf = window.protobuf;
    var root = protobuf && protobuf.roots && protobuf.roots.default;
    var message = root && root.pb && root.pb[messageName];
    if (!message) throw new ShareError("BRIDGE_PROTO_UNAVAILABLE", "H5 share bridge protobuf is unavailable.");
    return message;
  }
  function encodeBridgeMessage(messageName, payload) {
    var message = getBridgeMessage(messageName);
    return message.encode(message.create(payload || {})).finish();
  }
  function decodeBridgeMessage(messageName, payload) {
    var message = getBridgeMessage(messageName);
    return message.decode(base64ToBytes(payload));
  }
  function encodeUploadRequest(resourceId, language, imageData) {
    var fields = [encodeField(1, 0, 2), encodeField(2, 2, resourceId), encodeField(3, 2, language)];
    if (imageData) fields.push(encodeField(4, 2, imageData));
    return concatBytes(fields);
  }
  function readVarint(bytes, offset) {
    var value = 0;
    var shift = 0;
    for (var index = 0; index < 10; index += 1) {
      if (offset >= bytes.length) throw new ShareError("PROTO_DECODE_FAILED", "Unexpected end of protobuf data.");
      var byte = bytes[offset++];
      value += (byte & 127) * Math.pow(2, shift);
      if ((byte & 128) === 0) return { value: value, offset: offset };
      shift += 7;
    }
    throw new ShareError("PROTO_DECODE_FAILED", "Invalid protobuf varint.");
  }
  function decodeFields(bytes) {
    var fields = {};
    var offset = 0;
    while (offset < bytes.length) {
      var tag = readVarint(bytes, offset);
      offset = tag.offset;
      var fieldNumber = Math.floor(tag.value / 8);
      var wireType = tag.value % 8;
      var value;
      if (wireType === 0) {
        var varint = readVarint(bytes, offset);
        value = varint.value;
        offset = varint.offset;
      } else if (wireType === 2) {
        var length = readVarint(bytes, offset);
        offset = length.offset;
        var end = offset + length.value;
        if (end > bytes.length) throw new ShareError("PROTO_DECODE_FAILED", "Invalid protobuf length-delimited field.");
        value = bytes.slice(offset, end);
        offset = end;
      } else if (wireType === 1) { offset += 8; value = null; }
      else if (wireType === 5) { offset += 4; value = null; }
      else throw new ShareError("PROTO_DECODE_FAILED", "Unsupported protobuf wire type: " + wireType);
      if (offset > bytes.length || fieldNumber === 0) throw new ShareError("PROTO_DECODE_FAILED", "Invalid protobuf field.");
      if (!fields[fieldNumber]) fields[fieldNumber] = [];
      fields[fieldNumber].push(value);
    }
    return fields;
  }
  function firstField(fields, number) { return fields[number] && fields[number][0]; }
  function decodeText(bytes) {
    if (!bytes) return "";
    if (window.TextDecoder) return new TextDecoder("utf-8").decode(bytes);
    return Array.prototype.map.call(bytes, function (byte) { return String.fromCharCode(byte); }).join("");
  }
  function decodeBaseResponse(bytes) {
    var base = decodeFields(bytes);
    var resultBytes = firstField(base, 1);
    var value = resultBytes ? firstField(decodeFields(resultBytes), 2) : null;
    return { errcode: Number(firstField(base, 2) || 0), errmsg: decodeText(firstField(base, 3)), value: value || null };
  }
  function decodeUploadUrlResponse(bytes) {
    var fields = decodeFields(bytes);
    return {
      uploadUrl: decodeText(firstField(fields, 1)),
      imageUrl: decodeText(firstField(fields, 2)),
      objectKey: decodeText(firstField(fields, 3)),
      expireSeconds: Number(firstField(fields, 4) || 0)
    };
  }
  function decodeUploadResponse(bytes) { return { imageUrl: decodeText(firstField(decodeFields(bytes), 1)) }; }

  function requestProtobuf(apiBase, endpoint, body, language, retried, onTiming) {
    var tokenStartedAt = now();
    return requestToken(false).then(function (token) {
      var tokenMs = elapsedMs(tokenStartedAt);
      var requestStartedAt = now();
      return window.fetch(apiBase + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-protobuf", "Accept": "application/x-protobuf", "product-id": PRODUCT_ID, "x-access-token": token, "conso-language": language },
        body: body
      }).then(function (response) {
        if (typeof onTiming === "function") onTiming({ tokenMs: tokenMs, requestMs: elapsedMs(requestStartedAt), status: response.status });
        return response;
      });
    }).then(function (response) {
      return response.arrayBuffer().then(function (buffer) {
        var decoded;
        try { decoded = decodeBaseResponse(new Uint8Array(buffer)); }
        catch (error) {
          if (!response.ok) throw new ShareError("API_REQUEST_FAILED", "Share image API request failed (HTTP " + response.status + ").");
          throw error;
        }
        if (decoded.errcode === 107 && !retried) {
          return requestToken(true).then(function () { return requestProtobuf(apiBase, endpoint, body, language, true, onTiming); });
        }
        if (decoded.errcode !== 0) throw new ShareError("API_" + decoded.errcode, decoded.errmsg || "Share image API request failed.");
        if (!response.ok) throw new ShareError("API_REQUEST_FAILED", "Share image API request failed (HTTP " + response.status + ").");
        return decoded.value;
      });
    });
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve, reject) {
      if (canvas.toBlob) {
        canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new ShareError("CAPTURE_FAILED", "Unable to encode the share image as PNG.")); }, "image/png");
        return;
      }
      try {
        var binary = window.atob(canvas.toDataURL("image/png").split(",")[1]);
        var bytes = new Uint8Array(binary.length);
        for (var index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
        resolve(new Blob([bytes], { type: "image/png" }));
      } catch (error) { reject(new ShareError("CAPTURE_FAILED", "Unable to encode the share image as PNG.")); }
    });
  }
  function capturePage(captureMode) {
    if (typeof window.html2canvas !== "function") return Promise.reject(new ShareError("CAPTURE_LIBRARY_UNAVAILABLE", "The embedded image capture library is unavailable."));
    var body = document.body;
    var captureTarget = document.querySelector("[data-conso-share-content], .page-container, main") || body;
    var captureBackgroundColor = "#10131A";
    function getCaptureBackgroundColor(candidates, clonedWindow) {
      for (var index = 0; index < candidates.length; index += 1) {
        var color = clonedWindow.getComputedStyle(candidates[index]).backgroundColor;
        if (color && color !== "transparent" && color !== "rgba(0, 0, 0, 0)") return color;
      }
      return "#10131A";
    }
    var targetRect = captureTarget.getBoundingClientRect();
    var targetWidth = Math.max(1, Math.round(targetRect.width || captureTarget.clientWidth || window.innerWidth));
    var viewportTargetHeight = Math.max(1, Math.round(Math.min(targetRect.height || window.innerHeight, window.innerHeight - Math.max(0, targetRect.top))));
    var options = {
      backgroundColor: null,
      useCORS: true,
      allowTaint: false,
      // 海报最终宽度固定为 750px，3x 截图随后缩放属于无效计算，统一使用 2x 保持清晰度。
      scale: 2,
      logging: false,
      // Apply the share-only dark theme in html2canvas's clone so the live H5 never flashes.
      onclone: function (clonedDocument) {
        var clonedRoot = clonedDocument.documentElement;
        var clonedBody = clonedDocument.body;
        var clonedTarget = clonedDocument.querySelector("[data-conso-share-content], .page-container, main") || clonedBody;
        clonedRoot.setAttribute("data-theme", "dark");
        clonedBody.setAttribute("data-theme", "dark");
        clonedBody.classList.add("theme-dark");
        Array.prototype.forEach.call(clonedDocument.querySelectorAll("[data-conso-share-entry], [data-conso-restricted-modal], [data-conso-share-debug], .conso-share-floating"), function (node) {
          node.style.setProperty("display", "none", "important");
        });
        captureBackgroundColor = getCaptureBackgroundColor([clonedTarget, clonedBody, clonedRoot], clonedDocument.defaultView);
        // Prevent transparent page areas in the capture from revealing the poster texture below.
        [clonedRoot, clonedBody, clonedTarget].forEach(function (node) {
          node.style.setProperty("background-color", captureBackgroundColor, "important");
        });
      },
      ignoreElements: function (element) {
        return Boolean(element && element.closest && element.closest("[data-conso-share-entry], [data-conso-restricted-modal], [data-conso-share-debug], .conso-share-floating"));
      }
    };
    if (captureMode === "full") {
      options.width = targetWidth;
      options.height = Math.max(1, Math.round(captureTarget.scrollHeight || targetRect.height || window.innerHeight));
      options.windowWidth = window.innerWidth;
      options.windowHeight = window.innerHeight;
      options.scrollX = 0;
      options.scrollY = 0;
    } else {
      options.width = targetWidth;
      options.height = viewportTargetHeight;
      options.windowWidth = window.innerWidth;
      options.windowHeight = window.innerHeight;
      options.scrollX = 0;
      options.scrollY = 0;
    }
    return window.html2canvas(captureTarget, options).then(function (canvas) {
      return canvasToBlob(canvas).then(function (blob) {
        return { blob: blob, canvas: canvas, width: canvas.width, height: canvas.height, posterCapture: false, pageBackgroundColor: captureBackgroundColor };
      });
    }).catch(function (error) {
      if (error instanceof ShareError) throw error;
      throw new ShareError("CAPTURE_FAILED", error && error.message ? error.message : "Unable to capture the page.");
    });
  }
  function getPosterTitle(options) {
    return String((options && options.posterTitle) || getMeta("conso-share-poster-title") || document.title || "Community Picks").trim();
  }
  function getShareLink(options) {
    var configured = String((options && options.shareUrl) || getMeta("conso-share-url") || "").trim();
    if (configured) return configured;
    var url = new URL(window.location.href);
    ["shareImagePreview", "inConso", "consoApp", "isConso", "token", "accessToken"].forEach(function (key) {
      url.searchParams.delete(key);
    });
    return url.toString();
  }
  function loadImage(url) {
    return new Promise(function (resolve) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { resolve(null); };
      image.src = url;
    });
  }
  function roundedRect(context, x, y, width, height, radius) {
    var safeRadius = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.arcTo(x + width, y, x + width, y + height, safeRadius);
    context.arcTo(x + width, y + height, x, y + height, safeRadius);
    context.arcTo(x, y + height, x, y, safeRadius);
    context.arcTo(x, y, x + width, y, safeRadius);
    context.closePath();
  }
  function drawCoverImage(context, image, x, y, width, height) {
    var scale = Math.max(width / image.width, height / image.height);
    var drawWidth = image.width * scale;
    var drawHeight = image.height * scale;
    context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
  }
  function wrapText(context, value, maxWidth) {
    var lines = [];
    var current = "";
    Array.prototype.forEach.call(String(value || ""), function (character) {
      var candidate = current + character;
      if (current && context.measureText(candidate).width > maxWidth) {
        lines.push(current);
        current = character;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    return lines;
  }
  function drawCenteredText(context, value, centerX, topY, maxWidth, lineHeight, maxLines) {
    var lines = wrapText(context, value, maxWidth).slice(0, maxLines);
    lines.forEach(function (line, index) {
      context.fillText(line, centerX - context.measureText(line).width / 2, topY + index * lineHeight);
    });
  }
  function drawQrCode(context, value, x, y, size) {
    if (typeof window.qrcode !== "function") {
      throw new ShareError("QR_LIBRARY_UNAVAILABLE", "The embedded QR code library is unavailable.");
    }
    var code = window.qrcode(0, "M");
    code.addData(value);
    code.make();
    var modules = code.getModuleCount();
    var cellSize = size / modules;
    context.fillStyle = "#ffffff";
    context.fillRect(x, y, size, size);
    context.fillStyle = "#111111";
    for (var row = 0; row < modules; row += 1) {
      for (var column = 0; column < modules; column += 1) {
        if (code.isDark(row, column)) {
          context.fillRect(x + column * cellSize, y + row * cellSize, Math.ceil(cellSize), Math.ceil(cellSize));
        }
      }
    }
  }
  function drawFallbackBrandLogo(context, centerX, centerY, radius) {
    centerX = centerX || 52;
    centerY = centerY || 53;
    radius = radius || 17;
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#111216";
    context.font = "700 " + Math.max(14, Math.round(radius * 1.05)) + "px Georgia, serif";
    context.fillText("C", centerX - radius * 0.36, centerY + radius * 0.4);
  }
  // The poster geometry intentionally mirrors TopicShareImageRenderer on the Java side.
  function drawSpark(context, centerX, centerY, radius, color) {
    function star(x, y, outerRadius, innerRadius) {
      context.beginPath();
      for (var point = 0; point < 8; point += 1) {
        var angle = -Math.PI / 2 + point * Math.PI / 4;
        var currentRadius = point % 2 === 0 ? outerRadius : innerRadius;
        var px = x + Math.cos(angle) * currentRadius;
        var py = y + Math.sin(angle) * currentRadius;
        if (point === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.closePath();
      context.fill();
    }
    context.fillStyle = color;
    star(centerX - Math.round(radius * 0.55), centerY - Math.round(radius * 0.5), Math.max(2, Math.floor(radius / 2)), 1);
    star(centerX + Math.round(radius * 0.45), centerY + Math.round(radius * 0.35), radius, Math.max(2, Math.floor(radius * 0.38)));
  }
  function drawPosterHeader(context, logo, title, copy) {
    var tagX = 40;
    var tagY = 32;
    var tagHeight = 54;
    var logoWidth = 60;
    var logoHeight = 35;
    context.font = "600 22px -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif";
    var label = copy.communityPicks;
    var tagWidth = logoWidth + 12 + context.measureText(label).width + 24;
    context.fillStyle = "#34373f";
    roundedRect(context, tagX, tagY, tagWidth, tagHeight, 12);
    context.fill();
    if (logo) context.drawImage(logo, tagX + 12, tagY + 10, logoWidth, logoHeight);
    else drawFallbackBrandLogo(context, tagX + 42, tagY + 27, 17);
    context.fillStyle = "#f5f7f5";
    context.fillText(label, tagX + 12 + logoWidth + 10, tagY + 35);

    context.fillStyle = "#f5f7f5";
    context.font = "600 26px -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif";
    drawCenteredText(context, title, 375, 124, 590, 32, 1);
  }
  function drawCapturedContent(context, captured, x, y, width, height) {
    var sourceWidth = captured.width;
    var sourceHeight = Math.min(captured.height, Math.round(sourceWidth * height / width));
    var sourceX = Math.max(0, Math.round((captured.width - sourceWidth) / 2));
    context.save();
    roundedRect(context, x, y, width, height, 12);
    context.clip();
    context.drawImage(captured.canvas, sourceX, 0, sourceWidth, sourceHeight, x, y, width, height);
    context.restore();
  }
  function toAlphaColor(color, alpha) {
    var value = String(color || "#10131A").trim();
    var rgb = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgb) return "rgba(" + rgb[1] + ", " + rgb[2] + ", " + rgb[3] + ", " + alpha + ")";
    var hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      var normalized = hex[1].length === 3
        ? hex[1].split("").map(function (part) { return part + part; }).join("")
        : hex[1];
      return "rgba(" + parseInt(normalized.slice(0, 2), 16) + ", " + parseInt(normalized.slice(2, 4), 16) + ", " + parseInt(normalized.slice(4, 6), 16) + ", " + alpha + ")";
    }
    return "rgba(16, 19, 26, " + alpha + ")";
  }
  function drawBlurAndDarkenOverlay(context, canvas, x, topY, width, regionHeight, pageBackgroundColor) {
    var region = document.createElement("canvas");
    region.width = width;
    region.height = regionHeight;
    region.getContext("2d").drawImage(canvas, x, topY, width, regionHeight, 0, 0, width, regionHeight);
    context.save();
    context.filter = "blur(8px)";
    context.drawImage(region, x, topY);
    context.restore();
    // Match the 72px mobile guide with the page background color, not a separate black layer.
    var gradient = context.createLinearGradient(0, topY, 0, topY + regionHeight);
    gradient.addColorStop(0, toAlphaColor(pageBackgroundColor, 0));
    gradient.addColorStop(0.7, toAlphaColor(pageBackgroundColor, 0.7));
    gradient.addColorStop(1, toAlphaColor(pageBackgroundColor, 1));
    context.fillStyle = gradient;
    context.fillRect(x, topY, width, regionHeight);
  }
  function drawBottomSheet(context, options, logo, copy, pageBackgroundColor, dividerY, posterHeight, promptHeight) {
    var width = 750;
    var pagePadding = 40;
    var prompt = copy.posterPrompt;
    var sparkRadius = 10;
    var sparkWidth = 30;
    var promptGap = 14;
    context.font = "600 30px -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif";
    var promptTextWidth = context.measureText(prompt).width;
    var promptX = Math.round((width - sparkWidth - promptGap - promptTextWidth) / 2);
    var promptBaseline = dividerY - promptHeight + Math.round((promptHeight + 30) / 2) - 6;
    drawSpark(context, promptX + Math.round(sparkWidth / 2), dividerY - Math.round(promptHeight / 2), sparkRadius, "#44d564");
    context.fillStyle = "#44d564";
    context.fillText(prompt, promptX + sparkWidth + promptGap, promptBaseline);

    context.fillStyle = pageBackgroundColor || "#10131A";
    context.fillRect(0, dividerY + 1, width, posterHeight - dividerY - 1);
    context.fillStyle = "#303030";
    context.fillRect(pagePadding, dividerY, width - pagePadding * 2, 1);

    var qrBoxSize = 170;
    var qrPadding = 14;
    var qrSize = qrBoxSize - qrPadding * 2;
    var qrX = width - pagePadding - qrBoxSize;
    // Align the QR card with the enlarged footer copy while preserving a compact bottom margin.
    var qrY = dividerY + 22;
    var copyX = pagePadding + 18;
    // Keep the copy and logo vertically centered against the QR card.
    var copyY = dividerY + 92;
    context.fillStyle = "#f5f7f5";
    var footerText = copy.posterFooter;
    var footerFontSize = 30;
    do {
      context.font = "600 " + footerFontSize + "px -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif";
      footerFontSize -= 1;
    } while (footerFontSize > 20 && context.measureText(footerText).width > qrX - copyX - 18);
    context.fillText(footerText, copyX, copyY);
    if (logo) context.drawImage(logo, copyX, copyY + 14, 64, 37);
    else drawFallbackBrandLogo(context, copyX + 32, copyY + 33, 18);

    context.fillStyle = "#ffffff";
    roundedRect(context, qrX, qrY, qrBoxSize, qrBoxSize, 12);
    context.fill();
    context.save();
    roundedRect(context, qrX, qrY, qrBoxSize, qrBoxSize, 12);
    context.clip();
    drawQrCode(context, getShareLink(options), qrX + qrPadding, qrY + qrPadding, qrSize);
    context.restore();
  }
  function composeSharePoster(captured, options) {
    var posterWidth = 750;
    // Community poster content uses half of the previous side inset for a fuller preview.
    var pagePadding = 20;
    // Java uses the same 16% share texture as the poster base; reserve a visible header area for it.
    var contentY = 160;
    var contentWidth = posterWidth - pagePadding * 2;
    // Preserve the captured mobile viewport ratio so the poster always shows one complete phone screen.
    var contentHeight = Math.max(1, Math.round(contentWidth * captured.height / captured.width));
    var dividerY = contentY + contentHeight;
    var posterHeight = dividerY + 214;
    // The source texture occupies the top 354px of the phone design, not the entire poster.
    var backgroundHeight = 708;
    // 72px on the phone design, scaled to the 2x poster canvas.
    var blurHeight = 144;
    var blurTopY = dividerY - blurHeight;
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = posterWidth;
    canvas.height = posterHeight;
    var runtimeBaseUrl = String(window.__consoShareRuntimeBaseUrl || "./conso-share-runtime/");
    var localAssets = window.ConsoShareAssets || {};
    var logoUrl = window.location.protocol === "file:" && localAssets.darkLogo
      ? localAssets.darkLogo
      : runtimeBaseUrl + "dark-logo.png";
    var backgroundUrl = window.location.protocol === "file:" && localAssets.topicShareBackground
      ? localAssets.topicShareBackground
      : runtimeBaseUrl + "topic-share-background.png";
    return Promise.all([loadImage(backgroundUrl), loadImage(logoUrl)]).then(function (images) {
      var background = images[0];
      var logo = images[1];
      var copy = getLocalizedCopy();
      context.fillStyle = captured.pageBackgroundColor || "#10131A";
      context.fillRect(0, 0, posterWidth, posterHeight);
      if (background) {
        context.save();
        context.globalAlpha = 0.16;
        drawCoverImage(context, background, 0, 0, posterWidth, backgroundHeight);
        context.restore();
      }
      drawPosterHeader(context, logo, getPosterTitle(options), copy);
      drawCapturedContent(context, captured, pagePadding, contentY, contentWidth, contentHeight);
      drawBlurAndDarkenOverlay(context, canvas, pagePadding, blurTopY, contentWidth, blurHeight, captured.pageBackgroundColor);
      drawBottomSheet(context, options, logo, copy, captured.pageBackgroundColor, dividerY, posterHeight, blurHeight);
      return canvasToBlob(canvas).then(function (blob) {
        return { blob: blob, canvas: canvas, width: posterWidth, height: posterHeight };
      });
    });
  }
  function emitStage(onStage, stage, data) {
    if (typeof onStage === "function") onStage(stage, data || {});
  }
  function hasValidUploadTarget() {
    return preparedUploadTarget
      && preparedUploadTarget.expiresAt > Date.now() + 15000;
  }
  function prepareUploadTarget(apiBase, resourceId, language, onStage) {
    if (hasValidUploadTarget()) {
      emitStage(onStage, "presign.cache_hit", { expiresInMs: Math.max(0, preparedUploadTarget.expiresAt - Date.now()) });
      return Promise.resolve(preparedUploadTarget);
    }
    if (preparedUploadTargetPromise) {
      emitStage(onStage, "presign.waiting", {});
      return preparedUploadTargetPromise;
    }
    preparedUploadTargetPromise = requestProtobuf(apiBase, "/gamefi/share/h5/image/upload-url", encodeUploadRequest(resourceId, language), language, false, function (timing) {
      emitStage(onStage, "token.ready", { durationMs: timing.tokenMs });
      emitStage(onStage, "presign.completed", { durationMs: timing.requestMs, status: timing.status });
    }).then(function (result) {
      var uploadInfo = decodeUploadUrlResponse(result || new Uint8Array(0));
      if (!uploadInfo.uploadUrl || !uploadInfo.imageUrl) throw new ShareError("UPLOAD_URL_INVALID", "Share image upload URL response is incomplete.");
      preparedUploadTarget = {
        uploadUrl: uploadInfo.uploadUrl,
        imageUrl: uploadInfo.imageUrl,
        expiresAt: Date.now() + Math.max(60, Number(uploadInfo.expireSeconds || 0)) * 1000
      };
      return preparedUploadTarget;
    });
    return preparedUploadTargetPromise.then(function (target) {
      preparedUploadTargetPromise = null;
      return target;
    }, function (error) {
      preparedUploadTargetPromise = null;
      throw error;
    });
  }
  function prepareShareImage(options, onStage) {
    if (preparedShareImage) {
      emitStage(onStage, "capture.cache_hit", { width: preparedShareImage.width, height: preparedShareImage.height });
      emitStage(onStage, "poster.cache_hit", { bytes: preparedShareImage.blob.size });
      return Promise.resolve(preparedShareImage);
    }
    if (preparedShareImagePromise) {
      emitStage(onStage, "poster.waiting", {});
      return preparedShareImagePromise;
    }
    var captureStartedAt = now();
    preparedShareImagePromise = capturePage(getCaptureMode(options)).then(function (captured) {
      emitStage(onStage, "capture.completed", { durationMs: elapsedMs(captureStartedAt), width: captured.width, height: captured.height });
      var posterStartedAt = now();
      return composeSharePoster(captured, options).then(function (poster) {
        emitStage(onStage, "poster.completed", { durationMs: elapsedMs(posterStartedAt), bytes: poster.blob.size });
        preparedShareImage = poster;
        return poster;
      });
    });
    return preparedShareImagePromise.then(function (poster) {
      preparedShareImagePromise = null;
      return poster;
    }, function (error) {
      preparedShareImagePromise = null;
      throw error;
    });
  }
  function uploadImage(apiBase, resourceId, language, captured, onStage) {
    return prepareUploadTarget(apiBase, resourceId, language, onStage)
      .then(function (uploadInfo) {
        var cosStartedAt = now();
        return window.fetch(uploadInfo.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png" }, body: captured.blob })
          .then(function (response) {
            if (!response.ok) throw new ShareError("COS_UPLOAD_FAILED", "COS upload failed (HTTP " + response.status + ").");
            emitStage(onStage, "cos.completed", { durationMs: elapsedMs(cosStartedAt), status: response.status });
            return uploadInfo.imageUrl;
          }).catch(function (error) {
            emitStage(onStage, "cos.failed", { durationMs: elapsedMs(cosStartedAt), error: error && error.message ? error.message : "COS upload failed" });
            var fallbackStartedAt = now();
            return captured.blob.arrayBuffer().then(function (buffer) {
              return requestProtobuf(apiBase, "/gamefi/share/h5/image/upload", encodeUploadRequest(resourceId, language, new Uint8Array(buffer)), language, false, function (timing) {
                emitStage(onStage, "fallback.request", { tokenMs: timing.tokenMs, requestMs: timing.requestMs, status: timing.status });
              });
            }).then(function (fallbackResult) {
              var fallback = decodeUploadResponse(fallbackResult || new Uint8Array(0));
              if (!fallback.imageUrl) throw new ShareError("UPLOAD_FAILED", "Share image fallback upload returned no image URL.");
              emitStage(onStage, "fallback.completed", { durationMs: elapsedMs(fallbackStartedAt) });
              return fallback.imageUrl;
            });
          });
      });
  }
  function closePreview() {
    var preview = document.querySelector("[data-conso-share-preview]");
    if (!preview) return;
    var imageUrl = preview.getAttribute("data-conso-share-preview-url");
    preview.remove();
    if (imageUrl) window.URL.revokeObjectURL(imageUrl);
  }
  function showPreviewError(error) {
    closePreview();
    var preview = document.createElement("div");
    var message = error && error.message ? error.message : "Unable to generate the preview.";
    preview.className = "conso-share-preview";
    preview.setAttribute("data-conso-share-preview", "");
    preview.innerHTML = '<div class="conso-share-preview-panel conso-share-preview-error">'
      + '<button class="conso-share-preview-close" type="button">\u5173\u95ed</button>'
      + '<strong>\u5206\u4eab\u56fe\u9884\u89c8\u751f\u6210\u5931\u8d25</strong>'
      + '<p></p>'
      + '</div>';
    preview.querySelector("p").textContent = message;
    preview.querySelector(".conso-share-preview-close").addEventListener("click", closePreview);
    document.body.appendChild(preview);
  }
  function preview(options) {
    return capturePage(getCaptureMode(options)).then(function (captured) {
      return composeSharePoster(captured, options);
    }).then(function (captured) {
      closePreview();
      var imageUrl = window.URL.createObjectURL(captured.blob);
      var preview = document.createElement("div");
      preview.className = "conso-share-preview";
      preview.setAttribute("data-conso-share-preview", "");
      preview.setAttribute("data-conso-share-preview-url", imageUrl);
      preview.innerHTML = '<div class="conso-share-preview-panel">'
        + '<button class="conso-share-preview-close" type="button" aria-label="Close preview">\u5173\u95ed</button>'
        + '<img class="conso-share-preview-image" alt="Share image preview" />'
        + '</div>';
      preview.querySelector(".conso-share-preview-image").src = imageUrl;
      preview.querySelector(".conso-share-preview-close").addEventListener("click", closePreview);
      preview.addEventListener("click", function (event) {
        if (event.target === preview) closePreview();
      });
      document.body.appendChild(preview);
      return { ok: true, width: captured.width, height: captured.height };
    });
  }
  function emitShareResult(result, generationId) {
    var sent = sendBridgeProtobuf("shareImageResult", "H5ShareGenerateResponse", result);
    debugLog("generate.result", {
      generationId: generationId,
      errCode: result && result.errCode,
      sent: sent,
      hasImageUrl: Boolean(result && result.imageUrl)
    });
    return result;
  }
  function generate(payload, generationId) {
    var request;
    try {
      request = decodeBridgeMessage("H5ShareGenerateRequest", payload);
    } catch (error) {
      return Promise.resolve(emitShareResult({ errCode: 1, errMsg: "Invalid H5 share request." }, generationId));
    }
    resetDebugPanel();
    var generatedStartedAt = now();
    debugLog("generate.start", { generationId: generationId, requestId: request && request.requestId ? request.requestId : "" });
    var options = {};
    var resourceId = getMeta("conso-share-resource-id");
    if (!resourceId) {
      return Promise.resolve(emitShareResult({ errCode: 2, errMsg: "This page has no share resource ID." }, generationId));
    }
    return prepareShareImage(options, function (stage, data) {
      debugLog(stage, data);
    }).then(function (captured) {
      return uploadImage(getApiBase(options), resourceId, getLanguage(options), captured, function (stage, data) {
        debugLog(stage, data);
      }).then(function (imageUrl) {
        debugLog("generate.completed", { totalDurationMs: elapsedMs(generatedStartedAt) });
        return { errCode: 0, imageUrl: imageUrl, shareUrl: getShareLink(options), width: captured.width, height: captured.height };
      });
    }).then(function (result) {
      return emitShareResult(result, generationId);
    }).catch(function (error) {
      debugLog("generate.failed", { totalDurationMs: elapsedMs(generatedStartedAt), error: error && error.message ? error.message : "Unable to generate the share image." });
      return emitShareResult({ errCode: 3, errMsg: error && error.message ? error.message : "Unable to generate the share image." }, generationId);
    });
  }

  function warmUpShareResources() {
    if (sharePreloadStarted || !getMeta("conso-share-resource-id")) return;
    sharePreloadStarted = true;
    var preload = function () {
      var options = {};
      var resourceId = getMeta("conso-share-resource-id");
      var apiBase = getApiBase(options);
      var language = getLanguage(options);
      debugLog("preload.start", {});
      prepareShareImage(options, function (stage, data) {
        debugLog("preload." + stage, data);
      }).then(function () {
        debugLog("preload.poster.ready", {});
      }).catch(function (error) {
        debugLog("preload.poster.failed", { error: error && error.message ? error.message : "Unable to prepare the share image." });
      });
      prepareUploadTarget(apiBase, resourceId, language, function (stage, data) {
        debugLog("preload." + stage, data);
      }).then(function () {
        debugLog("preload.presign.ready", {});
      }).catch(function (error) {
        debugLog("preload.presign.failed", { error: error && error.message ? error.message : "Unable to prepare the upload URL." });
      });
    };
    if (document.readyState === "complete") {
      window.setTimeout(preload, 0);
    } else {
      window.addEventListener("load", preload, { once: true });
    }
  }

  window.shareButtonVisibility = function () {
    // 分享按钮初始化时预取 token，避免用户点击分享后再等待原生桥接返回。
    warmUpToken();
    warmUpShareResources();
    var result = getShareButtonVisibilityPayload();
    debugLog("visibility.result", { showShareButton: Boolean(getMeta("conso-share-resource-id")) });
    return result;
  };
  window.shareImageResult = function (payload) {
    if (shareGenerationInFlight) {
      debugLog("generate.ignored", { reason: "in_flight" });
      return true;
    }
    shareGenerationInFlight = true;
    var generationId = ++shareGenerationSequence;
    generate(payload, generationId).then(function () {
      shareGenerationInFlight = false;
    }, function () {
      shareGenerationInFlight = false;
    });
    return true;
  };
  if (getParam("shareImagePreview") === "1") {
    window.setTimeout(function () { preview().catch(showPreviewError); }, 0);
  }
})();
