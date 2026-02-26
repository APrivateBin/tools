// extractYoutubePlaylistInfo.js
// 单个 block：<ytd-playlist-video-renderer>
//
// 输出顺序：
// 提取数字部分
// \t 上传者名（a.yt-simple-endpoint.yt-formatted-string）
// \t title
// \t badge
// \t 第三个 <span class="style-scope yt-formatted-string">
// \t URL

document.addEventListener("DOMContentLoaded", function () {

  const inputEl = document.getElementById("inputHTML");
  const outputEl = document.getElementById("outputText");

  if (!inputEl || !outputEl) return;


  // ========= 从标题提取数字 =========
  function extractNumbers(title) {

    if (!title) return "";

    const matches =
      title.match(/\d+(?:[.\-\/]\d+)*/g);

    if (!matches) return "";

    return matches.join(" ");
  }


  // ========= 提取上传者 =========
  function extractUploader(mediaEl) {

    const uploaderLink =
      mediaEl.querySelector(
        "a.yt-simple-endpoint.style-scope.yt-formatted-string"
      );

    if (!uploaderLink) return "";

    return uploaderLink.textContent.trim();
  }


  // ========= 提取单个 block =========
  function extractFromMedia(mediaEl) {

    // ---------- title + href ----------
    const link =
      mediaEl.querySelector("h3 a");

    if (!link) return "";

    const title =
      (link.getAttribute("title") ||
        link.textContent ||
        "")
        .trim();

    let href =
      (link.getAttribute("href") || "")
        .trim();

    if (!href) return "";

    // 补全 URL
    if (!href.startsWith("http")) {
      href =
        "https://www.youtube.com" +
        href;
    }

    // ---------- badge ----------
    const badgeEl =
      mediaEl.querySelector(
        "div.yt-badge-shape__text"
      );

    const badgeText =
      badgeEl
        ? badgeEl.textContent.trim()
        : "";

    // ---------- 第三个 span.style-scope.yt-formatted-string ----------
    const spans =
      mediaEl.querySelectorAll(
        "span.style-scope.yt-formatted-string"
      );

    let thirdSpanText = "";

    if (spans.length >= 3) {
      thirdSpanText =
        spans[2].textContent.trim();
    }

    // ---------- uploader ----------
    const uploader =
      extractUploader(mediaEl);

    // ---------- numbers ----------
    const numbers =
      extractNumbers(title);

    return `${numbers}\t${uploader}\t${title}\t${badgeText}\t${thirdSpanText}\t${href}`;
  }


  // ========= 主解析 =========
  function parseHTML() {

    const htmlText =
      inputEl.value.trim();

    if (!htmlText) {
      outputEl.value = "";
      return;
    }

    const parser =
      new DOMParser();

    const doc =
      parser.parseFromString(
        htmlText,
        "text/html"
      );

    const outer =
      doc.body.firstElementChild;

    if (!outer) {
      outputEl.value = "";
      return;
    }

    const tag =
      outer.tagName.toLowerCase();

    // ===== 单个 =====
    if (tag === "ytd-playlist-video-renderer") {

      outputEl.value =
        extractFromMedia(outer);

      return;
    }

    // ===== div 多个 =====
    if (tag === "div") {

      const medias =
        outer.querySelectorAll(
          "ytd-playlist-video-renderer"
        );

      const results = [];

      medias.forEach(media => {

        const result =
          extractFromMedia(media);

        if (result)
          results.push(result);

      });

      outputEl.value =
        results.join("\n");

      return;
    }

    outputEl.value = "";
  }


  // ========= 即时更新 =========
  inputEl.addEventListener(
    "input",
    parseHTML
  );

});