(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/basiclightbox/dist/basicLightbox.min.js
  var require_basicLightbox_min = __commonJS({
    "node_modules/basiclightbox/dist/basicLightbox.min.js"(exports, module) {
      !function(e) {
        if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
        else if ("function" == typeof define && define.amd) define([], e);
        else {
          ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).basicLightbox = e();
        }
      }(function() {
        return function e(n, t, o) {
          function r(c2, u) {
            if (!t[c2]) {
              if (!n[c2]) {
                var s = "function" == typeof __require && __require;
                if (!u && s) return s(c2, true);
                if (i) return i(c2, true);
                var a = new Error("Cannot find module '" + c2 + "'");
                throw a.code = "MODULE_NOT_FOUND", a;
              }
              var l = t[c2] = { exports: {} };
              n[c2][0].call(l.exports, function(e2) {
                return r(n[c2][1][e2] || e2);
              }, l, l.exports, e, n, t, o);
            }
            return t[c2].exports;
          }
          for (var i = "function" == typeof __require && __require, c = 0; c < o.length; c++) r(o[c]);
          return r;
        }({ 1: [function(e, n, t) {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: true }), t.create = t.visible = void 0;
          var o = function(e2) {
            var n2 = arguments.length > 1 && void 0 !== arguments[1] && arguments[1], t2 = document.createElement("div");
            return t2.innerHTML = e2.trim(), true === n2 ? t2.children : t2.firstChild;
          }, r = function(e2, n2) {
            var t2 = e2.children;
            return 1 === t2.length && t2[0].tagName === n2;
          }, i = function(e2) {
            return null != (e2 = e2 || document.querySelector(".basicLightbox")) && true === e2.ownerDocument.body.contains(e2);
          };
          t.visible = i;
          t.create = function(e2, n2) {
            var t2 = function(e3, n3) {
              var t3 = o('\n		<div class="basicLightbox '.concat(n3.className, '">\n			<div class="basicLightbox__placeholder" role="dialog"></div>\n		</div>\n	')), i2 = t3.querySelector(".basicLightbox__placeholder");
              e3.forEach(function(e4) {
                return i2.appendChild(e4);
              });
              var c2 = r(i2, "IMG"), u2 = r(i2, "VIDEO"), s = r(i2, "IFRAME");
              return true === c2 && t3.classList.add("basicLightbox--img"), true === u2 && t3.classList.add("basicLightbox--video"), true === s && t3.classList.add("basicLightbox--iframe"), t3;
            }(e2 = function(e3) {
              var n3 = "string" == typeof e3, t3 = e3 instanceof HTMLElement == 1;
              if (false === n3 && false === t3) throw new Error("Content must be a DOM element/node or string");
              return true === n3 ? Array.from(o(e3, true)) : "TEMPLATE" === e3.tagName ? [e3.content.cloneNode(true)] : Array.from(e3.children);
            }(e2), n2 = function() {
              var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
              if (null == (e3 = Object.assign({}, e3)).closable && (e3.closable = true), null == e3.className && (e3.className = ""), null == e3.onShow && (e3.onShow = function() {
              }), null == e3.onClose && (e3.onClose = function() {
              }), "boolean" != typeof e3.closable) throw new Error("Property `closable` must be a boolean");
              if ("string" != typeof e3.className) throw new Error("Property `className` must be a string");
              if ("function" != typeof e3.onShow) throw new Error("Property `onShow` must be a function");
              if ("function" != typeof e3.onClose) throw new Error("Property `onClose` must be a function");
              return e3;
            }(n2)), c = function(e3) {
              return false !== n2.onClose(u) && function(e4, n3) {
                return e4.classList.remove("basicLightbox--visible"), setTimeout(function() {
                  return false === i(e4) || e4.parentElement.removeChild(e4), n3();
                }, 410), true;
              }(t2, function() {
                if ("function" == typeof e3) return e3(u);
              });
            };
            true === n2.closable && t2.addEventListener("click", function(e3) {
              e3.target === t2 && c();
            });
            var u = { element: function() {
              return t2;
            }, visible: function() {
              return i(t2);
            }, show: function(e3) {
              return false !== n2.onShow(u) && function(e4, n3) {
                return document.body.appendChild(e4), setTimeout(function() {
                  requestAnimationFrame(function() {
                    return e4.classList.add("basicLightbox--visible"), n3();
                  });
                }, 10), true;
              }(t2, function() {
                if ("function" == typeof e3) return e3(u);
              });
            }, close: c };
            return u;
          };
        }, {}] }, {}, [1])(1);
      });
    }
  });

  // docs/js/main.js
  var basicLightbox = __toESM(require_basicLightbox_min());
  document.addEventListener("DOMContentLoaded", () => {
    const galleryContainer = document.querySelector(".gallery-container");
    const treeContainer = document.getElementById("file-manager-tree");
    const sidebar = document.querySelector(".sidebar");
    const sidebarToggle = document.querySelector(".sidebar-toggle");
    const randomWallpaperBtn = document.getElementById("random-wallpaper-btn");
    const mainContent = document.querySelector(".main-content");
    let lightbox;
    let keydownHandler;
    let currentWallpapers = [];
    let allWallpapersList = [];
    let currentLightboxIndex = 0;
    let lightboxWallpaperList = [];
    if (typeof galleryData === "undefined" || !galleryData) {
      console.error("Wallpaper data not found. Please ensure 'js/gallery-data.js' is loaded correctly.");
      if (galleryContainer) galleryContainer.innerHTML = "<p>Error: Wallpaper data could not be loaded.</p>";
      return;
    }
    initializeApp();
    function initializeApp() {
      setRandomTheme();
      setupEventListeners();
      allWallpapersList = flattenTree(galleryData);
      shuffleArray(allWallpapersList);
      buildFileTree(galleryData, treeContainer);
      renderGallery(allWallpapersList);
      const overlay = document.createElement("div");
      overlay.className = "overlay";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", toggleSidebar);
    }
    function setupEventListeners() {
      if (sidebarToggle) {
        sidebarToggle.addEventListener("click", toggleSidebar);
      }
      if (randomWallpaperBtn) {
        randomWallpaperBtn.addEventListener("click", showRandomWallpaper);
      }
    }
    function toggleSidebar() {
      sidebar.classList.toggle("open");
      sidebarToggle.classList.toggle("open");
    }
    function setRandomTheme() {
      const baseHue = Math.floor(Math.random() * 360);
      const accentColor = `hsl(${baseHue}, 80%, 50%)`;
      const backgroundColorStart = `hsl(${baseHue}, 15%, 8%)`;
      const backgroundColorEnd = `hsl(${(baseHue + 60) % 360}, 15%, 12%)`;
      document.documentElement.style.setProperty("--accent-color", accentColor);
      document.documentElement.style.setProperty("--primary-button-bg", accentColor);
      document.documentElement.style.setProperty("--background-start", backgroundColorStart);
      document.documentElement.style.setProperty("--background-end", backgroundColorEnd);
    }
    function buildFileTree(node, container) {
      const ul = document.createElement("ul");
      ul.className = "tree-node";
      if (container === treeContainer) {
        const allFolderLi = createTreeElement({ name: "All", type: "folder", children: [galleryData] }, true);
        allFolderLi.querySelector(".tree-item").classList.add("active");
        ul.appendChild(allFolderLi);
        allFolderLi.querySelector(".tree-item").addEventListener("click", (e) => {
          e.stopPropagation();
          document.querySelectorAll(".tree-item.active").forEach((el) => el.classList.remove("active"));
          allFolderLi.querySelector(".tree-item").classList.add("active");
          shuffleArray(allWallpapersList);
          renderGallery(allWallpapersList);
          if (window.innerWidth <= 768) toggleSidebar();
        });
      }
      if (node.children) {
        node.children.filter((child) => child.type === "folder").forEach((child) => {
          const li = createTreeElement(child, false);
          if (li) ul.appendChild(li);
        });
      }
      container.innerHTML = "";
      container.appendChild(ul);
    }
    function createTreeElement(node, isRoot) {
      if (node.type !== "folder") return null;
      const li = document.createElement("li");
      li.className = `tree-folder`;
      const itemDiv = document.createElement("div");
      itemDiv.className = "tree-item";
      const hasSubfolders = node.children && node.children.some((child) => child.type === "folder");
      let chevronIcon = "";
      if (hasSubfolders) {
        chevronIcon = `<svg class="chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>`;
      }
      const folderIcon = `<svg class="icon-folder" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>`;
      const folderOpenIcon = `<svg class="icon-folder-open" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"></path></svg>`;
      itemDiv.innerHTML = `
            ${chevronIcon}
            <span class="icon">${folderIcon}${folderOpenIcon}</span>
            <span class="name">${node.name}</span>
        `;
      li.appendChild(itemDiv);
      itemDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isRoot) {
          document.querySelectorAll(".tree-item.active").forEach((el) => el.classList.remove("active"));
          itemDiv.classList.add("active");
          renderGallery(allWallpapersList);
        } else {
          handleTreeSelection(node, itemDiv);
        }
        if (hasSubfolders) {
          li.classList.toggle("open");
        }
      });
      if (hasSubfolders) {
        const childrenContainer = document.createElement("div");
        childrenContainer.className = "tree-children";
        buildFileTree(node, childrenContainer);
        li.appendChild(childrenContainer);
      }
      return li;
    }
    function handleTreeSelection(node, element) {
      document.querySelectorAll(".tree-item.active").forEach((el) => el.classList.remove("active"));
      element.classList.add("active");
      const wallpapers = flattenTree(node);
      renderGallery(wallpapers);
      if (window.innerWidth <= 768) {
        toggleSidebar();
      }
    }
    function flattenTree(node) {
      let files = [];
      if (node.type === "file") {
        return [node];
      }
      if (node.children) {
        node.children.forEach((child) => {
          files = files.concat(flattenTree(child));
        });
      }
      return files;
    }
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    function renderGallery(wallpapersToRender) {
      if (!galleryContainer) return;
      galleryContainer.innerHTML = "";
      currentWallpapers = wallpapersToRender;
      galleryContainer.classList.toggle("single-item", currentWallpapers.length === 1);
      if (currentWallpapers.length === 0) {
        galleryContainer.innerHTML = '<p style="text-align: center; width: 100%;">No wallpapers to display in this category.</p>';
        return;
      }
      currentWallpapers.forEach((wallpaper, index) => {
        const galleryItem = createGalleryItem(wallpaper, index);
        galleryContainer.appendChild(galleryItem);
      });
    }
    function createGalleryItem(wallpaper, index) {
      const galleryItem = document.createElement("div");
      galleryItem.className = "gallery-item";
      const link = document.createElement("a");
      link.href = wallpaper.full;
      link.setAttribute("aria-label", `View wallpaper ${wallpaper.name}`);
      link.addEventListener("click", (e) => {
        e.preventDefault();
        showLightbox(currentWallpapers, index);
      });
      const img = new Image();
      img.src = wallpaper.thumbnail;
      img.alt = `Wallpaper: ${wallpaper.name}`;
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        if (aspectRatio < 0.8) galleryItem.classList.add("portrait");
        else if (aspectRatio > 2) galleryItem.classList.add("ultrawide");
      };
      img.onerror = () => {
        galleryItem.innerHTML = "<span>Image failed to load</span>";
        galleryItem.classList.add("error");
      };
      const title = document.createElement("div");
      title.className = "wallpaper-title";
      title.textContent = wallpaper.name.split(".").slice(0, -1).join(".");
      link.appendChild(img);
      galleryItem.appendChild(link);
      galleryItem.appendChild(title);
      return galleryItem;
    }
    function showNextLightboxItem() {
      if (!lightbox || !lightbox.visible()) return;
      currentLightboxIndex = (currentLightboxIndex + 1) % lightboxWallpaperList.length;
      updateLightbox(lightboxWallpaperList[currentLightboxIndex]);
    }
    function showPrevLightboxItem() {
      if (!lightbox || !lightbox.visible()) return;
      currentLightboxIndex = (currentLightboxIndex - 1 + lightboxWallpaperList.length) % lightboxWallpaperList.length;
      updateLightbox(lightboxWallpaperList[currentLightboxIndex]);
    }
    function showLightbox(wallpaperList, index) {
      if (!wallpaperList || wallpaperList.length === 0) return;
      lightboxWallpaperList = wallpaperList;
      currentLightboxIndex = index;
      const wallpaper = lightboxWallpaperList[currentLightboxIndex];
      if (lightbox) {
        if (!lightbox.visible()) {
          lightbox.show();
        }
        updateLightbox(wallpaper);
        return;
      }
      const content = createLightboxContent(wallpaper);
      lightbox = basicLightbox.create(content, {
        onShow: (instance) => {
          const lightboxElement = instance.element();
          const placeholder = lightboxElement.querySelector(".basicLightbox__placeholder");
          const controls = placeholder.querySelectorAll(".lightbox-details, .lightbox-prev, .lightbox-next");
          controls.forEach((control) => lightboxElement.appendChild(control));
          lightboxElement.querySelector(".lightbox-prev").onclick = showPrevLightboxItem;
          lightboxElement.querySelector(".lightbox-next").onclick = showNextLightboxItem;
          keydownHandler = (e) => {
            if (e.key === "ArrowLeft") showPrevLightboxItem();
            if (e.key === "ArrowRight") showNextLightboxItem();
          };
          document.addEventListener("keydown", keydownHandler);
        },
        onClose: () => {
          document.removeEventListener("keydown", keydownHandler);
        }
      });
      lightbox.show(() => {
        updateLightbox(wallpaper);
      });
    }
    function updateLightbox(wallpaper) {
      if (!lightbox) return;
      const lightboxElement = lightbox.element();
      const contentElement = lightboxElement.querySelector(".lightbox-content");
      const img = contentElement.querySelector("img");
      contentElement.classList.add("loading");
      const newImg = new Image();
      newImg.src = wallpaper.full;
      newImg.onload = () => {
        img.src = newImg.src;
        img.alt = wallpaper.name.split(".").slice(0, -1).join(".");
        const wallpaperName = lightboxElement.querySelector(".wallpaper-name");
        const wallpaperRes = lightboxElement.querySelector(".wallpaper-resolution");
        const downloadBtn = lightboxElement.querySelector(".download-btn");
        wallpaperName.textContent = wallpaper.name.split(".").slice(0, -1).join(".");
        wallpaperRes.textContent = `${newImg.naturalWidth}x${newImg.naturalHeight}`;
        downloadBtn.href = wallpaper.full;
        contentElement.classList.remove("loading");
        const nextIndex = (currentLightboxIndex + 1) % lightboxWallpaperList.length;
        const prevIndex = (currentLightboxIndex - 1 + lightboxWallpaperList.length) % lightboxWallpaperList.length;
        if (nextIndex !== currentLightboxIndex) new Image().src = lightboxWallpaperList[nextIndex].full;
        if (prevIndex !== currentLightboxIndex) new Image().src = lightboxWallpaperList[prevIndex].full;
      };
      newImg.onerror = () => {
        img.alt = "Error loading image.";
        contentElement.classList.remove("loading");
      };
    }
    function createLightboxContent(wallpaper) {
      const imageName = wallpaper.name.split(".").slice(0, -1).join(".");
      return `
            <div class="lightbox-content">
                <div class="loader"></div>
                <img src="" alt="">
            </div>
            <div class="lightbox-details">
                <div class="wallpaper-info">
                    <span class="wallpaper-name">${imageName}</span>
                    <span class="wallpaper-resolution"></span>
                </div>
                <a href="${wallpaper.full}" download class="download-btn">Download</a>
            </div>
            <button class="lightbox-prev">&lt;</button>
            <button class="lightbox-next">&gt;</button>
        `;
    }
    function showRandomWallpaper() {
      const activeWallpapers = currentWallpapers.length > 0 ? currentWallpapers : allWallpapersList;
      if (activeWallpapers.length === 0) return;
      const randomIndex = Math.floor(Math.random() * activeWallpapers.length);
      showLightbox(activeWallpapers, randomIndex);
    }
  });

  // node_modules/@vercel/analytics/dist/index.mjs
  var name = "@vercel/analytics";
  var version = "1.5.0";
  var initQueue = () => {
    if (window.va) return;
    window.va = function a(...params) {
      (window.vaq = window.vaq || []).push(params);
    };
  };
  function isBrowser() {
    return typeof window !== "undefined";
  }
  function detectEnvironment() {
    try {
      const env = "development";
      if (env === "development" || env === "test") {
        return "development";
      }
    } catch (e) {
    }
    return "production";
  }
  function setMode(mode = "auto") {
    if (mode === "auto") {
      window.vam = detectEnvironment();
      return;
    }
    window.vam = mode;
  }
  function getMode() {
    const mode = isBrowser() ? window.vam : detectEnvironment();
    return mode || "production";
  }
  function isDevelopment() {
    return getMode() === "development";
  }
  function getScriptSrc(props) {
    if (props.scriptSrc) {
      return props.scriptSrc;
    }
    if (isDevelopment()) {
      return "https://va.vercel-scripts.com/v1/script.debug.js";
    }
    if (props.basePath) {
      return `${props.basePath}/insights/script.js`;
    }
    return "/_vercel/insights/script.js";
  }
  function inject(props = {
    debug: true
  }) {
    var _a;
    if (!isBrowser()) return;
    setMode(props.mode);
    initQueue();
    if (props.beforeSend) {
      (_a = window.va) == null ? void 0 : _a.call(window, "beforeSend", props.beforeSend);
    }
    const src = getScriptSrc(props);
    if (document.head.querySelector(`script[src*="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.sdkn = name + (props.framework ? `/${props.framework}` : "");
    script.dataset.sdkv = version;
    if (props.disableAutoTrack) {
      script.dataset.disableAutoTrack = "1";
    }
    if (props.endpoint) {
      script.dataset.endpoint = props.endpoint;
    } else if (props.basePath) {
      script.dataset.endpoint = `${props.basePath}/insights`;
    }
    if (props.dsn) {
      script.dataset.dsn = props.dsn;
    }
    script.onerror = () => {
      const errorMessage = isDevelopment() ? "Please check if any ad blockers are enabled and try again." : "Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.";
      console.log(
        `[Vercel Web Analytics] Failed to load script from ${src}. ${errorMessage}`
      );
    };
    if (isDevelopment() && props.debug === false) {
      script.dataset.debug = "false";
    }
    document.head.appendChild(script);
  }

  // docs/js/app.js
  inject();
})();
