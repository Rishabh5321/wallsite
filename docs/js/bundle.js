(() => {
	const te = Object.create;
	const B = Object.defineProperty;
	const ne = Object.getOwnPropertyDescriptor;
	const oe = Object.getOwnPropertyNames;
	const ie = Object.getPrototypeOf;
	const re = Object.prototype.hasOwnProperty;
	const C = ((e) =>
		typeof require < 'u'
			? require
			: typeof Proxy < 'u'
				? new Proxy(e, {
						get: (l, s) => (typeof require < 'u' ? require : l)[s],
					})
				: e)(function (e) {
		if (typeof require < 'u') return require.apply(this, arguments);
		throw Error('Dynamic require of "' + e + '" is not supported');
	});
	const le = (e, l) => () => (
		l || e((l = { exports: {} }).exports, l),
		l.exports
	);
	const ae = (e, l, s, c) => {
		if ((l && typeof l === 'object') || typeof l === 'function')
			for (const g of oe(l))
				!re.call(e, g) &&
					g !== s &&
					B(e, g, {
						get: () => l[g],
						enumerable: !(c = ne(l, g)) || c.enumerable,
					});
		return e;
	};
	const ce = (e, l, s) => (
		(s = e != null ? te(ie(e)) : {}),
		ae(
			l || !e || !e.__esModule
				? B(s, 'default', { value: e, enumerable: !0 })
				: s,
			e
		)
	);
	const U = le((G, j) => {
		(function (e) {
			typeof G === 'object' && typeof j < 'u'
				? (j.exports = e())
				: typeof define === 'function' && define.amd
					? define([], e)
					: ((typeof window < 'u'
							? window
							: typeof global < 'u'
								? global
								: typeof self < 'u'
									? self
									: this
						).basicLightbox = e());
		})(function () {
			return (function e(l, s, c) {
				function g(d, u) {
					if (!s[d]) {
						if (!l[d]) {
							const y = typeof C === 'function' && C;
							if (!u && y) return y(d, !0);
							if (L) return L(d, !0);
							const f = new Error(
								"Cannot find module '" + d + "'"
							);
							throw ((f.code = 'MODULE_NOT_FOUND'), f);
						}
						const n = (s[d] = { exports: {} });
						l[d][0].call(
							n.exports,
							function (p) {
								return g(l[d][1][p] || p);
							},
							n,
							n.exports,
							e,
							l,
							s,
							c
						);
					}
					return s[d].exports;
				}
				for (
					var L = typeof C === 'function' && C, a = 0;
					a < c.length;
					a++
				)
					g(c[a]);
				return g;
			})(
				{
					1: [
						function (e, l, s) {
							'use strict';
							(Object.defineProperty(s, '__esModule', {
								value: !0,
							}),
								(s.create = s.visible = void 0));
							const c = function (a) {
								const d =
									arguments.length > 1 &&
									arguments[1] !== void 0 &&
									arguments[1];
								const u = document.createElement('div');
								return (
									(u.innerHTML = a.trim()),
									d === !0 ? u.children : u.firstChild
								);
							};
							const g = function (a, d) {
								const u = a.children;
								return u.length === 1 && u[0].tagName === d;
							};
							const L = function (a) {
								return (
									(a =
										a ||
										document.querySelector(
											'.basicLightbox'
										)) != null &&
									a.ownerDocument.body.contains(a) === !0
								);
							};
							((s.visible = L),
								(s.create = function (a, d) {
									const u = (function (n, p) {
										const h = c(
											`
		<div class="basicLightbox `.concat(
												p.className,
												`">
			<div class="basicLightbox__placeholder" role="dialog"></div>
		</div>
	`
											)
										);
										const w = h.querySelector(
											'.basicLightbox__placeholder'
										);
										n.forEach(function (S) {
											return w.appendChild(S);
										});
										const x = g(w, 'IMG');
										const I = g(w, 'VIDEO');
										const M = g(w, 'IFRAME');
										return (
											x === !0 &&
												h.classList.add(
													'basicLightbox--img'
												),
											I === !0 &&
												h.classList.add(
													'basicLightbox--video'
												),
											M === !0 &&
												h.classList.add(
													'basicLightbox--iframe'
												),
											h
										);
									})(
										(a = (function (n) {
											const p = typeof n === 'string';
											const h =
												n instanceof HTMLElement == 1;
											if (p === !1 && h === !1)
												throw new Error(
													'Content must be a DOM element/node or string'
												);
											return p === !0
												? Array.from(c(n, !0))
												: n.tagName === 'TEMPLATE'
													? [n.content.cloneNode(!0)]
													: Array.from(n.children);
										})(a)),
										(d = (function () {
											let n =
												arguments.length > 0 &&
												arguments[0] !== void 0
													? arguments[0]
													: {};
											if (
												((n = Object.assign({}, n))
													.closable == null &&
													(n.closable = !0),
												n.className == null &&
													(n.className = ''),
												n.onShow == null &&
													(n.onShow = function () {}),
												n.onClose == null &&
													(n.onClose =
														function () {}),
												typeof n.closable !== 'boolean')
											)
												throw new Error(
													'Property `closable` must be a boolean'
												);
											if (typeof n.className !== 'string')
												throw new Error(
													'Property `className` must be a string'
												);
											if (typeof n.onShow !== 'function')
												throw new Error(
													'Property `onShow` must be a function'
												);
											if (typeof n.onClose !== 'function')
												throw new Error(
													'Property `onClose` must be a function'
												);
											return n;
										})(d))
									);
									const y = function (n) {
										return (
											d.onClose(f) !== !1 &&
											(function (p, h) {
												return (
													p.classList.remove(
														'basicLightbox--visible'
													),
													setTimeout(function () {
														return (
															L(p) === !1 ||
																p.parentElement.removeChild(
																	p
																),
															h()
														);
													}, 410),
													!0
												);
											})(u, function () {
												if (typeof n === 'function')
													return n(f);
											})
										);
									};
									d.closable === !0 &&
										u.addEventListener(
											'click',
											function (n) {
												n.target === u && y();
											}
										);
									var f = {
										element: function () {
											return u;
										},
										visible: function () {
											return L(u);
										},
										show: function (n) {
											return (
												d.onShow(f) !== !1 &&
												(function (p, h) {
													return (
														document.body.appendChild(
															p
														),
														setTimeout(function () {
															requestAnimationFrame(
																function () {
																	return (
																		p.classList.add(
																			'basicLightbox--visible'
																		),
																		h()
																	);
																}
															);
														}, 10),
														!0
													);
												})(u, function () {
													if (typeof n === 'function')
														return n(f);
												})
											);
										},
										close: y,
									};
									return f;
								}));
						},
						{},
					],
				},
				{},
				[1]
			)(1);
		});
	});
	const se = '@vercel/analytics';
	const de = '1.5.0';
	const ue = () => {
		window.va ||
			(window.va = function (...l) {
				(window.vaq = window.vaq || []).push(l);
			});
	};
	function V() {
		return typeof window < 'u';
	}
	function F() {
		try {
			const e = 'production';
			if (e === 'development' || e === 'test') return 'development';
		} catch {}
		return 'production';
	}
	function fe(e = 'auto') {
		if (e === 'auto') {
			window.vam = F();
			return;
		}
		window.vam = e;
	}
	function he() {
		return (V() ? window.vam : F()) || 'production';
	}
	function N() {
		return he() === 'development';
	}
	function me(e) {
		return e.scriptSrc
			? e.scriptSrc
			: N()
				? 'https://va.vercel-scripts.com/v1/script.debug.js'
				: e.basePath
					? `${e.basePath}/insights/script.js`
					: '/_vercel/insights/script.js';
	}
	function z(e = { debug: !0 }) {
		let l;
		if (!V()) return;
		(fe(e.mode),
			ue(),
			e.beforeSend &&
				((l = window.va) == null ||
					l.call(window, 'beforeSend', e.beforeSend)));
		const s = me(e);
		if (document.head.querySelector(`script[src*="${s}"]`)) return;
		const c = document.createElement('script');
		((c.src = s),
			(c.defer = !0),
			(c.dataset.sdkn = se + (e.framework ? `/${e.framework}` : '')),
			(c.dataset.sdkv = de),
			e.disableAutoTrack && (c.dataset.disableAutoTrack = '1'),
			e.endpoint
				? (c.dataset.endpoint = e.endpoint)
				: e.basePath && (c.dataset.endpoint = `${e.basePath}/insights`),
			e.dsn && (c.dataset.dsn = e.dsn),
			(c.onerror = () => {
				const g = N()
					? 'Please check if any ad blockers are enabled and try again.'
					: 'Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.';
				console.log(
					`[Vercel Web Analytics] Failed to load script from ${s}. ${g}`
				);
			}),
			N() && e.debug === !1 && (c.dataset.debug = 'false'),
			document.head.appendChild(c));
	}
	const K = ce(U());
	document.addEventListener('DOMContentLoaded', () => {
		const e = document.querySelector('.gallery-container');
		const l = document.getElementById('file-manager-tree');
		const s = document.querySelector('.sidebar');
		const c = document.querySelector('.sidebar-toggle');
		const g = document.getElementById('random-wallpaper-btn');
		const L = document.getElementById('search-input');
		let a;
		let d;
		let u = [];
		let y = [];
		let f = 0;
		let n = [];
		const p = 20;
		let h = 0;
		let w = !1;
		let x;
		if (typeof galleryData > 'u' || !galleryData) {
			(console.error(
				"Wallpaper data not found. Please ensure 'js/gallery-data.js' is loaded correctly."
			),
				e &&
					(e.innerHTML =
						'<p>Error: Wallpaper data could not be loaded.</p>'));
			return;
		}
		I();
		function I() {
			(Q(),
				M(),
				(u = $(galleryData)),
				D(u),
				(y = [...u]),
				P(galleryData, l),
				(h = 0),
				T(),
				H());
			const t = document.createElement('div');
			((t.className = 'overlay'),
				document.body.appendChild(t),
				t.addEventListener('click', S));
		}
		function M() {
			(c && c.addEventListener('click', S),
				g && g.addEventListener('click', showRandomWallpaper),
				L && L.addEventListener('input', handleSearch));
		}
		function S() {
			(s.classList.toggle('open'), c.classList.toggle('open'));
		}
		function Q() {
			const t = Math.floor(Math.random() * 360);
			const i = `hsl(${t}, 80%, 50%)`;
			const o = `hsl(${t}, 15%, 8%)`;
			const r = `hsl(${(t + 60) % 360}, 15%, 12%)`;
			(document.documentElement.style.setProperty('--accent-color', i),
				document.documentElement.style.setProperty(
					'--primary-button-bg',
					i
				),
				document.documentElement.style.setProperty(
					'--background-start',
					o
				),
				document.documentElement.style.setProperty(
					'--background-end',
					r
				));
		}
		function P(t, i) {
			const o = document.createElement('ul');
			if (((o.className = 'tree-node'), i === l)) {
				const r = W(
					{ name: 'All', type: 'folder', children: [galleryData] },
					!0
				);
				(r.querySelector('.tree-item').classList.add('active'),
					o.appendChild(r),
					r
						.querySelector('.tree-item')
						.addEventListener('click', (m) => {
							(m.stopPropagation(),
								document
									.querySelectorAll('.tree-item.active')
									.forEach((b) =>
										b.classList.remove('active')
									),
								r
									.querySelector('.tree-item')
									.classList.add('active'),
								D(u),
								(y = [...u]),
								A(),
								window.innerWidth <= 768 && S());
						}));
			}
			(t.children &&
				t.children
					.filter((r) => r.type === 'folder')
					.forEach((r) => {
						const m = W(r, !1);
						m && o.appendChild(m);
					}),
				(i.innerHTML = ''),
				i.appendChild(o));
		}
		function W(t, i) {
			if (t.type !== 'folder') return null;
			const o = document.createElement('li');
			o.className = 'tree-folder';
			const r = document.createElement('div');
			r.className = 'tree-item';
			const m = t.children && t.children.some((v) => v.type === 'folder');
			let b = '';
			m &&
				(b =
					'<svg class="chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>');
			const E =
				'<svg class="icon-folder" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>';
			const _ =
				'<svg class="icon-folder-open" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"></path></svg>';
			if (
				((r.innerHTML = `
            ${b}
            <span class="icon">${E}${_}</span>
            <span class="name">${t.name}</span>
        `),
				o.appendChild(r),
				r.addEventListener('click', (v) => {
					(v.stopPropagation(),
						i
							? (document
									.querySelectorAll('.tree-item.active')
									.forEach((q) =>
										q.classList.remove('active')
									),
								r.classList.add('active'),
								A())
							: J(t, r),
						m && o.classList.toggle('open'));
				}),
				m)
			) {
				const v = document.createElement('div');
				((v.className = 'tree-children'), P(t, v), o.appendChild(v));
			}
			return o;
		}
		function J(t, i) {
			(document
				.querySelectorAll('.tree-item.active')
				.forEach((o) => o.classList.remove('active')),
				i.classList.add('active'),
				(y = $(t)),
				A(),
				window.innerWidth <= 768 && S());
		}
		function $(t) {
			let i = [];
			return t.type === 'file'
				? [t]
				: (t.children &&
						t.children.forEach((o) => {
							i = i.concat($(o));
						}),
					i);
		}
		function D(t) {
			for (let i = t.length - 1; i > 0; i--) {
				const o = Math.floor(Math.random() * (i + 1));
				[t[i], t[o]] = [t[o], t[i]];
			}
		}
		function X(t) {
			e &&
				(t.forEach((i, o) => {
					const r = Y(i, h + o);
					e.appendChild(r);
				}),
				(h += t.length),
				e.classList.toggle('single-item', y.length === 1),
				h >= y.length && x && x.disconnect());
		}
		function T() {
			if (w || h >= y.length) return;
			w = !0;
			const t = y.slice(h, h + p);
			(t.length > 0
				? X(t)
				: h === 0 &&
					(e.innerHTML =
						'<p style="text-align: center; width: 100%;">No wallpapers to display in this category.</p>'),
				(w = !1));
		}
		function H() {
			(x && x.disconnect(),
				(x = new IntersectionObserver(
					(i) => {
						i[0].isIntersecting && !w && T();
					},
					{ rootMargin: '200px' }
				)));
			const t = e.lastElementChild;
			t ? x.observe(t) : x.observe(e);
		}
		function A() {
			((e.innerHTML = ''), (h = 0), (w = !1), T(), H());
		}
		function Y(t, i) {
			const o = document.createElement('div');
			o.className = 'gallery-item';
			const r = document.createElement('a');
			((r.href = t.full),
				r.setAttribute('aria-label', `View wallpaper ${t.name}`),
				r.addEventListener('click', (E) => {
					(E.preventDefault(), Z(y, i));
				}));
			const m = new Image();
			((m.src = t.thumbnail),
				(m.alt = `Wallpaper: ${t.name}`),
				o.classList.add('loading'),
				(m.onload = () => {
					const E = m.naturalWidth / m.naturalHeight;
					(E < 0.8
						? o.classList.add('portrait')
						: E > 2 && o.classList.add('ultrawide'),
						o.classList.remove('loading'),
						o.classList.add('loaded'));
				}),
				(m.onerror = () => {
					((o.innerHTML = '<span>Image failed to load</span>'),
						o.classList.add('error'),
						o.classList.remove('loading'));
				}));
			const b = document.createElement('div');
			return (
				(b.className = 'wallpaper-title'),
				(b.textContent = t.name.split('.').slice(0, -1).join('.')),
				r.appendChild(m),
				o.appendChild(r),
				o.appendChild(b),
				o
			);
		}
		function O() {
			!a || !a.visible() || ((f = (f + 1) % n.length), k(n[f]));
		}
		function R() {
			!a ||
				!a.visible() ||
				((f = (f - 1 + n.length) % n.length), k(n[f]));
		}
		function Z(t, i) {
			if (!t || t.length === 0) return;
			((n = t), (f = i));
			const o = n[f];
			if (a) {
				(a.visible() || a.show(), k(o));
				return;
			}
			const r = ee(o);
			((a = K.create(r, {
				onShow: (m) => {
					const b = m.element();
					(b
						.querySelector('.basicLightbox__placeholder')
						.querySelectorAll(
							'.lightbox-details, .lightbox-prev, .lightbox-next'
						)
						.forEach((v) => b.appendChild(v)),
						(b.querySelector('.lightbox-prev').onclick = R),
						(b.querySelector('.lightbox-next').onclick = O),
						(b.querySelector('.favorite-btn').onclick = () => {
							const v = b.querySelector('.favorite-btn');
							const q = n[f];
							const isFavorited = v.classList.toggle('favorited');
							if (isFavorited) {
								u.push(q);
							} else {
								u = u.filter((w) => w.full !== q.full);
							}
						}),
						(d = (v) => {
							(v.key === 'ArrowLeft' && R(),
								v.key === 'ArrowRight' && O());
						}),
						document.addEventListener('keydown', d));
				},
				onClose: () => {
					document.removeEventListener('keydown', d);
				},
			})),
				a.show(() => {
					k(o);
				}));
		}
		function k(t) {
			if (!a) return;
			const i = a.element();
			const o = i.querySelector('.lightbox-content');
			const r = o.querySelector('img');
			const m = i.querySelector('.wallpaper-name');
			const b = i.querySelector('.wallpaper-resolution');
			const E = i.querySelector('.download-btn');
			const _ = i.querySelector('.favorite-btn');
			(o.classList.add('loading'),
				(r.src = t.thumbnail),
				(r.alt = `Thumbnail for ${t.name}`),
				(m.textContent = t.name.split('.').slice(0, -1).join('.')),
				(b.textContent = 'Loading full resolution...'),
				(E.href = t.full));
			_.classList.toggle(
				'favorited',
				u.some((w) => w.full === t.full)
			);
			const v = new Image();
			((v.src = t.full),
				(v.onload = () => {
					((r.src = v.src),
						(r.alt = t.name.split('.').slice(0, -1).join('.')),
						o.classList.remove('loading'),
						(b.textContent = `${v.naturalWidth}x${v.naturalHeight}`));
					const q = (f + 1) % n.length;
					const S = (f - 1 + n.length) % n.length;
					(q !== f && (new Image().src = n[q].full),
						S !== f && (new Image().src = n[S].full));
				}),
				(v.onerror = () => {
					(o.classList.remove('loading'),
						(b.textContent = 'Full image failed to load.'));
				}));
		}
		function ee(t) {
			return `
            <div class="lightbox-content">
                <div class="loader"></div>
                <img src="" alt="">
            </div>
            <div class="lightbox-details">
                <div class="wallpaper-info">
                    <span class="wallpaper-name">${t.name.split('.').slice(0, -1).join('.')}</span>
                    <span class="wallpaper-resolution"></span>
                </div>
                <div class="lightbox-actions">
                    <button class="favorite-btn">
                        <svg class="icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </button>
                    <a href="${t.full}" download class="download-btn">Download</a>
                </div>
            </div>
            <button class="lightbox-prev">&lt;</button>
            <button class="lightbox-next">&gt;</button>
        `;
		}
	});
	z();
})();
