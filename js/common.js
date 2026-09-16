/**
 * common.js —— 公共部分
 * 1. 深色/浅色主题切换（记忆到 localStorage，默认跟随系统）
 * 2. 迷你 Markdown 渲染器（先转义再替换，避免 XSS）
 * 3. 日期格式化、阅读时长估算等小工具
 */
(function () {
  "use strict";

  /* ---------- 主题切换 ---------- */
  var KEY = "***";
  var root = document.documentElement;
  var btn = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  var prefersDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(localStorage.getItem(KEY) || (prefersDark ? "dark" : "light"));

  if (btn) {
    btn.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem(KEY, next);
      applyTheme(next);
    });
  }

  /* ---------- 小工具 ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function safeUrl(u) {
    var t = String(u).trim();
    if (/^(javascript|data|vbscript):/i.test(t.replace(/\s+/g, ""))) return "#";
    return t;
  }

  function formatDate(iso) {
    var p = String(iso).split("-");
    return p[0] + " 年 " + (+p[1]) + " 月 " + (+p[2]) + " 日";
  }

  /** 粗略估算阅读分钟数：中文按 400 字/分钟、西文按 200 词/分钟 */
  function readingMinutes(md) {
    var cjk = (md.match(/[\u4e00-\u9fff]/g) || []).length;
    var words = (md.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9_]+/g) || []).length;
    return Math.max(1, Math.round(cjk / 400 + words / 200));
  }

  /* ---------- 迷你 Markdown 渲染器 ---------- */
  /** 行内语法：粗体、斜体、`代码`、[链接](url)（先整体转义，再替换） */
  function inline(s) {
    return escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\(([^)\s]+)\)/g, function (_, text, url) {
        var ext = /^https?:/i.test(url) ? ' target="_blank" rel="noopener"' : "";
        return '<a href="' + safeUrl(url) + '"' + ext + ">" + text + "</a>";
      });
  }

  /**
   * 块级语法：# 标题(1-3) / - 无序列表 / 1. 有序列表 / > 引用 /
   * ~~~ 或 ``` 代码围栏 / --- 分割线 / 空行分段
   */
  function renderMarkdown(md) {
    var lines = String(md).replace(/\r\n/g, "\n").split("\n");
    var out = [];
    var para = [], list = [], listType = null, quote = [], code = null;

    function flushPara() {
      if (para.length) { out.push("<p>" + inline(para.join(" ")) + "</p>"); para = []; }
    }
    function flushList() {
      if (list.length) {
        out.push("<" + listType + ">" +
          list.map(function (i) { return "<li>" + inline(i) + "</li>"; }).join("") +
          "</" + listType + ">");
        list = []; listType = null;
      }
    }
    function flushQuote() {
      if (quote.length) {
        out.push("<blockquote><p>" + inline(quote.join(" ")) + "</p></blockquote>");
        quote = [];
      }
    }
    function flushBlocks() { flushPara(); flushList(); flushQuote(); }

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var line = raw.trimEnd();
      var m;

      // 代码围栏（``` 或 ~~~）
      var fence = line.match(/^(```|~~~)(.*)$/);
      if (fence) {
        if (code === null) {
          flushBlocks();
          code = { lang: fence[2].trim(), buf: [] };
        } else {
          out.push('<pre><code' + (code.lang ? ' class="language-' + escapeHtml(code.lang) + '"' : "") +
            ">" + escapeHtml(code.buf.join("\n")) + "</code></pre>");
          code = null;
        }
        continue;
      }
      if (code !== null) { code.buf.push(raw); continue; }

      if (!line.trim()) { flushBlocks(); continue; }

      if ((m = line.match(/^(#{1,3})\s+(.*)/))) {
        flushBlocks();
        out.push("<h" + m[1].length + ">" + inline(m[2]) + "</h" + m[1].length + ">");
        continue;
      }
      if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
        flushBlocks(); out.push("<hr>"); continue;
      }
      if ((m = line.match(/^>\s?(.*)/))) {
        flushPara(); flushList(); quote.push(m[1]); continue;
      }
      if ((m = line.match(/^[-*]\s+(.*)/))) {
        flushPara(); flushQuote();
        if (listType && listType !== "ul") flushList();
        listType = "ul"; list.push(m[1]); continue;
      }
      if ((m = line.match(/^\d+\.\s+(.*)/))) {
        flushPara(); flushQuote();
        if (listType && listType !== "ol") flushList();
        listType = "ol"; list.push(m[1]); continue;
      }

      flushList(); flushQuote();
      para.push(line.trim());
    }

    if (code !== null) { // 兜底：围栏未闭合
      out.push("<pre><code>" + escapeHtml(code.buf.join("\n")) + "</code></pre>");
    }
    flushBlocks();
    return out.join("\n");
  }

  /* ---------- 对外暴露 ---------- */
  window.Blog = {
    renderMarkdown: renderMarkdown,
    escapeHtml: escapeHtml,
    safeUrl: safeUrl,
    formatDate: formatDate,
    readingMinutes: readingMinutes,
  };
})();
