// extractYoutubeFullInfo.js
// 输出顺序：
// 提取数字部分 \t uploaderId \t title \t badge \t metadata \t URL

document.addEventListener("DOMContentLoaded", function () {

  const inputEl = document.getElementById("inputHTML");
  const outputEl = document.getElementById("outputText");
  const uploaderInput = document.getElementById("uploaderId");

  if (!inputEl || !outputEl || !uploaderInput) return;


  // ========= 从标题提取数字 =========
  // 规则：
  // 2022.01.31 -> 2022.01.31
  // Pt2 s1 2022.2 -> 2 1 2022.2
  //
  // 思路：
  // 找所有「数字开头」片段：
  // 允许 . - / 等数字连接符
  function extractNumbers(title) {

    if (!title) return "";

    // 匹配：
    // 2022
    // 2022.01
    // 2022.01.31
    // 2022-01
    // 2022/01
    // 或 单独数字 2 / 1
    const matches = title.match(/\d+(?:[.\-\/]\d+)*/g);

    if (!matches) return "";

    // 用空格连接
    return matches.join(" ");
  }


  // ========= 提取单个 ytd-rich-grid-media =========
  function extractFromMedia(mediaEl, uploaderId) {

    const link = mediaEl.querySelector("h3 a");

    if (!link) return "";

    const title =
      (link.getAttribute("title") || link.textContent || "")
        .trim();

    let href = (link.getAttribute("href") || "").trim();

    if (!href) return "";

    // 补全 YouTube URL
    if (!href.startsWith("http")) {
      href = "https://www.youtube.com" + href;
    }

    // ---------- badge ----------
    const badgeEl =
      mediaEl.querySelector("div.yt-badge-shape__text");

    const badgeText = badgeEl
      ? badgeEl.textContent.trim()
      : "";

    // ---------- 第二个 metadata ----------
    const metaSpans = mediaEl.querySelectorAll(
      "span.inline-metadata-item.style-scope.ytd-video-meta-block"
    );

    let secondMetaText = "";

    if (metaSpans.length >= 2) {
      secondMetaText = metaSpans[1].textContent.trim();
    }

    // ---------- 提取数字 ----------
    const numbers = extractNumbers(title);

    // ✅ 最终输出
    return `${numbers}\t${uploaderId}\t${title}\t${badgeText}\t${secondMetaText}\t${href}`;
  }


  // ========= 主解析 =========
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

    // ===== 单个 =====
    if (tag === "ytd-rich-grid-media") {

      outputEl.value =
        extractFromMedia(outer, uploaderId);

      return;
    }

    // ===== div 多个 =====
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

  inputEl.addEventListener("input", parseHTML);

  uploaderInput.addEventListener("input", parseHTML);

});
