// 仅搜索页加载官方组件。模块加载失败或超时后提供重试，不影响其他页面阅读。
(() => {
  const ui = document.getElementById("site-search-ui");
  const status = document.getElementById("search-status");
  const retry = document.getElementById("search-retry");
  if (!ui || !status || !retry) return;
  retry.addEventListener("click", () => location.reload());
  status.hidden = false;
  let timeout;
  let queryTimeout;
  let failed = false;
  const showError = (error) => {
    failed = true;
    clearTimeout(queryTimeout);
    console.error("Pagefind 搜索加载失败", error);
    ui.hidden = true;
    status.textContent = "搜索暂时无法加载，请稍后重试。";
    status.hidden = false;
    retry.hidden = false;
  };
  const deadline = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error("搜索组件加载超时")), 15000);
  });
  // 预览沙箱中的经典脚本没有模块解析基址，显式转换为当前文档的完整地址。
  const moduleURL = new URL(ui.dataset.module, document.baseURI).href;
  const initialize = async () => {
    await import(moduleURL);
    const instance = window.PagefindComponents.getInstanceManager().getInstance("default");
    instance.on("error", showError);
    // 提前验证索引可读；官方加载过程遇到损坏索引时也受统一超时限制。
    await instance.triggerLoad();
    if (failed) return;
    instance.on("loading", () => {
      clearTimeout(queryTimeout);
      queryTimeout = setTimeout(() => showError(new Error("搜索请求超时")), 15000);
    });
    instance.on("results", () => clearTimeout(queryTimeout));
    status.hidden = true;
    ui.hidden = false;
    ui.querySelector("input")?.focus();
  };
  Promise.race([initialize(), deadline])
    .catch(showError)
    .finally(() => clearTimeout(timeout));
})();
