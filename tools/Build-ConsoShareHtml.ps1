<#
.SYNOPSIS
Inject the Conso Community Picks shared runtime into a standalone H5.

.DESCRIPTION
This script does not require Node. It preserves the source HTML and writes a
.conso.html output file beside it. The injected bootstrap keeps bridge methods
available during page load while the shared runtime still loads after window.load.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
    [string]$InputPath,

    [string]$OutputPath,

    [string]$ResourceId,

    [ValidateSet("production", "test")]
    [string]$Environment = "production",

    [string]$ApiBase,

    [string]$MiniAppDomain,

    [string]$Language,

    [string]$RuntimeVersion = "20260721-role-link-1"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function ConvertTo-ResourceId {
    param([string]$FileName)

    $value = [System.IO.Path]::GetFileNameWithoutExtension($FileName).ToLowerInvariant()
    $value = [regex]::Replace($value, "%[0-9a-f]{2}", "-")
    $value = [regex]::Replace($value, "[^a-z0-9]+", "-")
    return $value.Trim("-")
}

function Get-DefaultLanguage {
    param([string]$FileName)

    if ($FileName -match "(?i)^zh-") { return "zh-Hans" }
    if ($FileName -match "(?i)^en-") { return "en" }
    return "zh-Hans"
}

function Escape-HtmlAttribute {
    param([string]$Value)
    return [System.Security.SecurityElement]::Escape($Value)
}

$inputFile = Get-Item -LiteralPath $InputPath
if ($inputFile.Extension.ToLowerInvariant() -ne ".html") {
    throw "Input file must have a .html extension."
}

if ([string]::IsNullOrWhiteSpace($ResourceId)) {
    $ResourceId = ConvertTo-ResourceId $inputFile.Name
}
if ([string]::IsNullOrWhiteSpace($ResourceId)) {
    throw "Unable to derive a resource ID. Pass -ResourceId explicitly."
}

if ([string]::IsNullOrWhiteSpace($Language)) {
    $Language = Get-DefaultLanguage $inputFile.Name
}

if ([string]::IsNullOrWhiteSpace($ApiBase) -and $Environment -eq "test") {
    $ApiBase = "https://testapinew.conso.network"
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $inputFile.DirectoryName ($inputFile.BaseName + ".conso.html")
}

$html = Get-Content -LiteralPath $inputFile.FullName -Raw -Encoding UTF8
$runtimeUrl = "https://cdn.conso.cloud/communityPicks/common/conso-share-runtime.js?v=" + [uri]::EscapeDataString($RuntimeVersion)
$apiMeta = if ([string]::IsNullOrWhiteSpace($ApiBase)) { "" } else { "`r`n<meta name=`"conso-share-api-base`" content=`"$(Escape-HtmlAttribute $ApiBase)`" />" }
$miniAppMeta = if ([string]::IsNullOrWhiteSpace($MiniAppDomain)) { "" } else { "`r`n<meta name=`"conso-share-telegram-miniapp-domain`" content=`"$(Escape-HtmlAttribute $MiniAppDomain)`" />" }

$runtimeBlock = @"
<!-- conso-share-runtime:start -->
<meta name="conso-share-resource-id" content="$(Escape-HtmlAttribute $ResourceId)" />
<meta name="conso-share-capture-mode" content="viewport" />$apiMeta$miniAppMeta
<script>
(function () {
  var runtimeUrl = "$runtimeUrl";
  var previousTokenInit = window.tokenInit;
  window.__consoSharePendingImageRequests = window.__consoSharePendingImageRequests || [];

  window.tokenInit = function (token) {
    var normalized = String(token || "").trim();
    if (normalized) {
      window.__consoClientTokenReceived = true;
      window.__consoClientToken = normalized;
    }
    if (typeof previousTokenInit === "function") return previousTokenInit.apply(this, arguments);
    return undefined;
  };

  window.shareButtonVisibility = function () {
    window.__consoShareVisibilityRequested = true;
    return document.querySelector('meta[name="conso-share-resource-id"]') ? "CAE=" : "";
  };

  window.shareImageResult = function (payload) {
    window.__consoSharePendingImageRequests.push(payload);
    return true;
  };

  function loadRuntime() {
    if (window.__consoShareRuntimeLoading) return;
    window.__consoShareRuntimeLoading = true;
    var script = document.createElement("script");
    script.src = runtimeUrl;
    script.setAttribute("data-conso-share-runtime", "");
    script.setAttribute("data-conso-share-default-language", "$(Escape-HtmlAttribute $Language)");
    document.head.appendChild(script);
  }

  if (document.readyState === "complete") {
    window.setTimeout(loadRuntime, 0);
  } else {
    window.addEventListener("load", loadRuntime, { once: true });
  }
})();
</script>
<!-- conso-share-runtime:end -->
"@

$markerPattern = "(?is)<!--\s*conso-share-runtime:start\s*-->.*?<!--\s*conso-share-runtime:end\s*-->"
if ([regex]::IsMatch($html, $markerPattern)) {
    $html = [regex]::Replace($html, $markerPattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $runtimeBlock }, 1)
} elseif ($html -match "(?i)</head\s*>") {
    $html = [regex]::Replace($html, "(?i)</head\s*>", $runtimeBlock + "`r`n</head>", 1)
} else {
    $html = $runtimeBlock + "`r`n" + $html
}

[System.IO.File]::WriteAllText($OutputPath, $html, [System.Text.UTF8Encoding]::new($false))
Write-Output "Generated: $OutputPath"
Write-Output "Resource ID: $ResourceId"
Write-Output "Language: $Language"
Write-Output "Environment: $Environment"
