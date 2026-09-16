/**
 * post.js —— 详情页逻辑：根据 URL 的 ?id=xxx 找到文章并渲染
 * 访问方式：post.html?id=hello-world
 */
(function () {
  "use strict";

  var id = new URLSearchParams(location.search).get("id");
  var articleEl = document.getElementById("article");
  var navEl = document.getElementById("post-nav");

  var posts = window.POSTS.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date); // 新文在前
  });
  var idx = posts.findIndex(function (p) { return p.id === id; });

  if (idx === -1) {
    document.title = "文章不存在 · 我的博客";
    articleEl.innerHTML =
      '<p class="empty-tip">没有找到这篇文章 ' +
      '<a href="index.html">← 返回首页</a></p>';
    return;
  }

  var post = posts[idx];
  document.title = post.title + " · 我的博客";

  articleEl.innerHTML =
    '<header class="post-header">' +
      "<h1>" + Blog.escapeHtml(post.title) + "</h1>" +
      '<div class="post-meta">' +
        '<time datetime="' + post.date + '">' + Blog.formatDate(post.date) + "</time>" +
        "<span>· 约 " + Blog.readingMinutes(post.content) + " 分钟</span>" +
        post.tags.map(function (t) {
          return '<span class="tag">' + Blog.escapeHtml(t) + "</span>";
        }).join("") +
      "</div>" +
    "</header>" +
    '<div class="post-content">' + Blog.renderMarkdown(post.content) + "</div>";

  // 上一篇（更早）/ 下一篇（更新）
  var older = posts[idx + 1];
  var newer = posts[idx - 1];
  var links = "";

  if (older) {
    links += '<a href="post.html?id=' + encodeURIComponent(older.id) + '">' +
      '<span class="label">← 上一篇</span>' + Blog.escapeHtml(older.title) + "</a>";
  }
  if (newer) {
    links += '<a class="next" href="post.html?id=' + encodeURIComponent(newer.id) + '">' +
      '<span class="label">下一篇 →</span>' + Blog.escapeHtml(newer.title) + "</a>";
  }
  navEl.innerHTML = links;
})();
