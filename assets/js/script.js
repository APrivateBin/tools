// extractYoutubeFullInfo.js
// 输出顺序：
// uploaderId \t h3 a.title \t badge文本 \t 第二个inline-metadata-item文本 \t 完整URL

document.addEventListener("DOMContentLoaded", function () {

  const inputEl = document.getElementById("inputHTML");
  const outputEl = document.getElementById("outputText");
  const uploaderInput = document.getElementById("uploaderId");

  if (!inputEl || !outputEl || !uploaderInput) return;

  // ========= 提取单个 ytd-rich-grid-media =========
  function extractFromMedia(mediaEl, uploaderId) {

    // ---------- h3 a ----------
    const link = mediaEl.querySelector("h3 a");

    if (!link) return "";

    const title =
      (link.getAttribute("title") || link.textContent || "")
        .trim();

    let href = (link.getAttribute("href") || "").trim();

    if (!href) return "";

    // ✅ 补全 YouTube 链接
    if (!href.startsWith("http")) {
      href = "https://www.youtube.com" + href;
    }

    // ---------- badge ----------
    const badgeEl =
      mediaEl.querySelector("div.yt-badge-shape__text");

    const badgeText = badgeEl
      ? badgeEl.textContent.trim()
      : "";

    // ---------- 第二个 metadata span ----------
    const metaSpans = mediaEl.querySelectorAll(
      "span.inline-metadata-item.style-scope.ytd-video-meta-block"
    );

    let secondMetaText = "";

    if (metaSpans.length >= 2) {
      secondMetaText = metaSpans[1].textContent.trim();
    }

    // ✅ uploaderId 加在最前
    return `${uploaderId}\t${title}\t${badgeText}\t${secondMetaText}\t${href}`;
  }

  // ========= 主解析函数 =========
  function parseHTML() {

    const htmlText = inputEl.value.trim();
    const uploaderId = uploaderInput.value.trim();

    if (!htmlText) {
      outputEl.value = "";
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const outer = doc.body.firstElementChild;

    if (!outer) {
      outputEl.value = "";
      return;
    }

    const tag = outer.tagName.toLowerCase();

    // ===== 单个 ytd-rich-grid-media =====
    if (tag === "ytd-rich-grid-media") {

      outputEl.value =
        extractFromMedia(outer, uploaderId);

      return;
    }

    // ===== div 包含多个 =====
    if (tag === "div") {

      const medias =
        outer.querySelectorAll("ytd-rich-grid-media");

      const results = [];

      medias.forEach(media => {

        const result =
          extractFromMedia(media, uploaderId);

        if (result) results.push(result);

      });

      outputEl.value = results.join("\n");

      return;
    }

    outputEl.value = "";
  }

  // ========= 即时更新 =========

  // HTML 输入变化
  inputEl.addEventListener("input", parseHTML);

  // uploaderId 输入变化（同样即时更新）
  uploaderInput.addEventListener("input", parseHTML);

});