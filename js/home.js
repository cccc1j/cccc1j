/**
 * home.js —— 首页逻辑：渲染文章列表 + 关键词搜索 + 标签筛选
 */
(function () {
  "use strict";

  var listEl = document.getElementById("post-list");
  var emptyEl = document.getElementById("empty-tip");
  var searchEl = document.getElementById("search");
  var tagsEl = document.getElementById("tag-filters");

  var state = { query: "", tag: "全部" };
  var posts = window.POSTS.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date); // 新文在前
  });

  function matches(p) {
    var q = state.query.trim().toLowerCase();
    var hitText = !q ||
      (p.title + " " + p.excerpt + " " + p.tags.join(" ")).toLowerCase().indexOf(q) !== -1;
    var hitTag = state.tag === "全部" || p.tags.indexOf(state.tag) !== -1;
    return hitText && hitTag;
  }

  function renderTags() {
    var seen = {};
    var tags = ["全部"];
    window.POSTS.forEach(function (p) {
      p.tags.forEach(function (t) { if (!seen[t]) { seen[t] = 1; tags.push(t); } });
    });
    tagsEl.innerHTML = tags.map(function (t) {
      return '<button type="button" class="tag-btn' +
        (t === state.tag ? " active" : "") + '">' + t + "</button>";
    }).join("");
  }

  function render() {
    var items = posts.filter(matches);
    emptyEl.hidden = items.length !== 0;

    listEl.innerHTML = items.map(function (p) {
      var mins = Blog.readingMinutes(p.content);
      return '' +
        '<li class="post-card">' +
          '<div class="post-meta">' +
            '<time datetime="' + p.date + '">' + Blog.formatDate(p.date) + "</time>" +
            "<span>· 约 " + mins + " 分钟</span>" +
            p.tags.map(function (t) { return '<span class="tag">' + Blog.escapeHtml(t) + "</span>"; }).join("") +
          "</div>" +
          "<h2><a href=\"post.html?id=" + encodeURIComponent(p.id) + "\">" +
            Blog.escapeHtml(p.title) + "</a></h2>" +
          '<p class="post-excerpt">' + Blog.escapeHtml(p.excerpt) + "</p>" +
        "</li>";
    }).join("");
  }

  searchEl.addEventListener("input", function () {
    state.query = searchEl.value;
    render();
  });

  tagsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".tag-btn");
    if (!btn) return;
    state.tag = btn.textContent;
    renderTags();
    render();
  });

  renderTags();
  render();
})();
