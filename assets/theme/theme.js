/* 主题交互与 Artalk 接入不依赖外部字体或公共脚本 CDN。 */
(() => {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const describeTheme = () => {
    const label = root.classList.contains("dark") ? "切换到浅色模式" : "切换到深色模式";
    toggle?.setAttribute("aria-label", label);
    toggle?.setAttribute("title", label);
  };
  describeTheme();
  toggle?.addEventListener("click", () => {
    root.classList.toggle("dark");
    describeTheme();
    try {
      localStorage.setItem("reader-theme", root.classList.contains("dark") ? "dark" : "light");
    } catch {
      /* 忽略存储限制。 */
    }
  });
  // 文章使用独立滚动容器，不能滚动 window；按钮仅在正文下滑后出现。
  const articleScroll = document.querySelector(".article-scroll");
  const backToTop = document.getElementById("back-to-top");
  if (articleScroll && backToTop) {
    const updateBackToTop = () => {
      backToTop.hidden = articleScroll.scrollTop < 320;
    };
    articleScroll.addEventListener("scroll", updateBackToTop, { passive: true });
    window.addEventListener("resize", updateBackToTop);
    window.addEventListener("pageshow", updateBackToTop);
    backToTop.addEventListener("click", () => {
      // 遵循系统减少动态效果的偏好，并将键盘焦点交回正文。
      articleScroll.scrollTo({
        top: 0,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
      document.getElementById("main")?.focus({ preventScroll: true });
    });
    updateBackToTop();
  }
  document.querySelectorAll(".prose pre").forEach((block) => {
    const button = document.createElement("button");
    button.className = "code-copy";
    button.textContent = "复制";
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(block.querySelector("code")?.textContent || "");
        button.textContent = "已复制";
        setTimeout(() => {
          button.textContent = "复制";
        }, 1500);
      } catch {
        button.textContent = "请手动复制";
      }
    });
    block.append(button);
  });
})();
