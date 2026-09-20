function isLocalhost(value: string) {
  return value === "localhost" || value === "127.0.0.1" || value === "[::1]" || value === "::1";
}

export function isEmbeddedStaticRuntime() {
  if (typeof window === "undefined") {
    return false;
  }

  return isLocalhost(window.location.hostname) && window.location.port === "";
}

export function resolveDocumentNavigationHref(rawPath: string) {
  if (typeof window === "undefined") {
    return rawPath;
  }

  if (!isEmbeddedStaticRuntime() || /^https?:\/\//i.test(rawPath)) {
    return rawPath;
  }

  const url = new URL(rawPath, window.location.origin);
  let nextPath = url.pathname;

  if (!nextPath.endsWith(".html")) {
    if (nextPath === "/" || nextPath === "") {
      nextPath = "/index.html";
    } else {
      nextPath = `${nextPath.replace(/\/$/, "")}.html`;
    }
  }

  return `${nextPath}${url.search}${url.hash}`;
}

export function navigateDocument(rawPath: string, options?: { replace?: boolean }) {
  const href = resolveDocumentNavigationHref(rawPath);

  if (options?.replace) {
    window.location.replace(href);
    return;
  }

  window.location.href = href;
}
