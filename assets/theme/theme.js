/* 主题交互与 Artalk 接入不依赖外部字体或公共脚本 CDN。 */
(() => {
  const root = document.documentElement;
  try {
    const mode = localStorage.getItem("reader-theme");
    root.classList.toggle("dark", mode === "dark" || (!mode && matchMedia("(prefers-color-scheme: dark)").matches));
  } catch { /* 禁用本地存储不影响阅读。 */ }
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    root.classList.toggle("dark");
    try { localStorage.setItem("reader-theme", root.classList.contains("dark") ? "dark" : "light"); } catch { /* 忽略存储限制。 */ }
  });
  document.querySelectorAll(".prose pre").forEach((block) => {
    const button = document.createElement("button");
    button.className = "code-copy";
    button.textContent = "复制";
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(block.querySelector("code")?.textContent || "");
        button.textContent = "已复制";
        setTimeout(() => { button.textContent = "复制"; }, 1500);
      } catch { button.textContent = "请手动复制"; }
    });
    block.append(button);
  });
  const node = document.getElementById("blog-comments-config");
  if (!node) return;
  const config = JSON.parse(node.textContent || "{}");
  if (config.comments && window.Artalk) {
    try {
      Artalk.init({
        el: "#comments", server: config.server, site: config.site,
        pageKey: config.pageKey, pageTitle: config.pageTitle, locale: config.locale,
        pvAdd: false, pvEl: "", emoticons: false,
        darkMode: root.classList.contains("dark"),
      });
    } catch {
      document.getElementById("comments").textContent = "评论服务暂时不可用，请稍后重试。";
    }
  }
  // 两个开关彼此独立，评论组件不负责增加浏览量，避免重复计数。
  if (config.views) {
    fetch(config.server.replace(/\/$/, "") + "/api/v2/pages/pv", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_key: config.pageKey, page_title: config.pageTitle, site_name: config.site }),
      credentials: "omit", signal: AbortSignal.timeout(10000),
    }).then((response) => {
      if (!response.ok) throw new Error("统计服务不可用");
      return response.json();
    }).then((data) => {
      const counter = document.getElementById("page-views");
      if (counter && Number.isFinite(data.pv)) counter.textContent = data.pv.toLocaleString("zh-CN");
    }).catch(() => { /* 统计失败保持占位符，不能阻断正文阅读。 */ });
  }
})();
