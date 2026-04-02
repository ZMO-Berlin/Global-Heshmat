<script lang="ts">
	import type { Snippet } from 'svelte';
	import logo from '$lib/assets/logo-zmo.png';
	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={logo} type="image/png" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}

<style>
	/* ═══════════════════════════════════════════
	   CSS Variables — Exhibition Cartography
	   ═══════════════════════════════════════════ */
	:global(:root) {
		/* Brand */
		--color-primary: #1a8a7d;
		--color-primary-light: #e8f5f2;
		--color-accent: #b8862d;
		--color-accent-light: rgba(184, 134, 45, 0.12);
		--color-search: #c66b3d;
		--color-search-light: #fdf0e8;
		--color-moved: #7c5cbf;
		--color-moved-light: #f3eefa;

		/* Layout */
		--color-header-bg: #16192e;
		--color-header-text: #f0e6d3;
		--color-filter-bg: #faf6f0;
		--color-filter-border: #e8dfd2;
		--color-surface: #ffffff;
		--color-surface-warm: #faf6f0;
		--color-surface-image: #efe8dc;

		/* Text */
		--color-text: #2c2a26;
		--color-text-secondary: #5a564e;
		--color-text-muted: #8a857c;
		--color-text-light: #a8a29e;

		/* UI */
		--color-border: #e8e3da;
		--color-border-light: #f0ebe3;
		--color-close-bg: #ede8e0;
		--color-close-bg-hover: #ddd7cc;

		/* Sizing */
		--header-height: 68px;
		--filter-height: 48px;
		--sidebar-width: 460px;

		/* Typography */
		--font-display: 'Cormorant Garamond', 'Georgia', serif;
		--font-body: 'Outfit', system-ui, -apple-system, sans-serif;

		/* Shadows */
		--shadow-sm: 0 1px 3px rgba(22, 25, 46, 0.06), 0 1px 2px rgba(22, 25, 46, 0.04);
		--shadow-md: 0 4px 16px rgba(22, 25, 46, 0.08), 0 2px 6px rgba(22, 25, 46, 0.04);
		--shadow-lg: 0 12px 40px rgba(22, 25, 46, 0.12), 0 4px 12px rgba(22, 25, 46, 0.06);
		--shadow-sidebar: -6px 0 32px rgba(22, 25, 46, 0.1), -1px 0 0 rgba(22, 25, 46, 0.04);

		/* Motion */
		--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
		--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

		/* Radius */
		--radius-sm: 6px;
		--radius-md: 10px;
		--radius-lg: 14px;
		--radius-pill: 100px;
	}

	/* ═══════════════════════════════════════════
	   Global Reset & Base
	   ═══════════════════════════════════════════ */
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	:global(body) {
		font-family: var(--font-body);
		overflow: hidden;
		color: var(--color-text);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	/* ═══════════════════════════════════════════
	   Header
	   ═══════════════════════════════════════════ */
	:global(.header) {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		height: var(--header-height);
		background: var(--color-header-bg);
		color: var(--color-header-text);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 28px;
		box-shadow:
			0 1px 0 rgba(184, 134, 45, 0.15),
			0 4px 20px rgba(0, 0, 0, 0.35);
	}
	:global(.header h1) {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 500;
		letter-spacing: 0.02em;
	}
	:global(.header h1 span) {
		color: var(--color-accent);
		font-weight: 600;
		font-style: italic;
	}
	:global(.header-right) {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	:global(.header-btn) {
		background: transparent;
		border: 1px solid rgba(240, 230, 211, 0.2);
		color: var(--color-header-text);
		padding: 7px 18px;
		border-radius: var(--radius-pill);
		cursor: pointer;
		font-family: var(--font-body);
		font-size: 12.5px;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		transition: all 0.3s var(--ease-out);
	}
	:global(.header-btn:hover) {
		background: rgba(184, 134, 45, 0.15);
		border-color: var(--color-accent);
		color: #fff;
	}

	/* ═══════════════════════════════════════════
	   Filter Bar
	   ═══════════════════════════════════════════ */
	:global(.filters) {
		position: fixed;
		top: var(--header-height);
		left: 0;
		right: 0;
		z-index: 999;
		height: var(--filter-height);
		background: var(--color-filter-bg);
		border-bottom: 1px solid var(--color-filter-border);
		display: flex;
		align-items: center;
		padding: 0 28px;
		gap: 8px;
		font-size: 13px;
		color: var(--color-text-secondary);
	}
	:global(.filters > span:first-child) {
		font-family: var(--font-display);
		font-size: 15px;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--color-text-muted);
		margin-right: 4px;
	}
	:global(.filter-chip) {
		padding: 5px 14px;
		border-radius: var(--radius-pill);
		cursor: pointer;
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		font-family: var(--font-body);
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.01em;
		transition: all 0.25s var(--ease-out);
		user-select: none;
		white-space: nowrap;
	}
	:global(.filter-chip:hover) {
		border-color: var(--color-text-muted);
		box-shadow: var(--shadow-sm);
	}
	:global(.filter-chip.active) {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
		box-shadow: 0 2px 8px rgba(26, 138, 125, 0.3);
	}
	:global(.filter-chip.active-search) {
		background: var(--color-search);
		color: white;
		border-color: var(--color-search);
		box-shadow: 0 2px 8px rgba(198, 107, 61, 0.3);
	}
	:global(.filter-sep) {
		width: 1px;
		height: 18px;
		background: var(--color-border);
		margin: 0 4px;
		flex-shrink: 0;
	}

	/* ═══════════════════════════════════════════
	   Search
	   ═══════════════════════════════════════════ */
	:global(.search-wrapper) {
		position: relative;
		margin-left: auto;
		flex-shrink: 0;
	}
	:global(.search-input) {
		width: 230px;
		padding: 6px 14px 6px 34px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		font-family: var(--font-body);
		font-size: 12.5px;
		outline: none;
		background: var(--color-surface);
		transition:
			border-color 0.3s var(--ease-out),
			box-shadow 0.3s var(--ease-out);
	}
	:global(.search-input:focus) {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(26, 138, 125, 0.1);
	}
	:global(.search-icon) {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		width: 14px;
		height: 14px;
		opacity: 0.35;
	}
	:global(.search-results) {
		position: absolute;
		top: 42px;
		right: 0;
		width: 340px;
		background: var(--color-surface);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		max-height: 380px;
		overflow-y: auto;
		z-index: 1001;
		border: 1px solid var(--color-border-light);
	}
	:global(.search-item) {
		padding: 12px 16px;
		cursor: pointer;
		border-bottom: 1px solid var(--color-border-light);
		transition: background 0.2s var(--ease-out);
	}
	:global(.search-item:hover) {
		background: var(--color-surface-warm);
	}
	:global(.search-item:last-child) {
		border-bottom: none;
	}
	:global(.search-item-name) {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-header-bg);
	}
	:global(.search-item-loc) {
		font-size: 11px;
		color: var(--color-text-muted);
		margin-top: 3px;
	}
	:global(.search-item-status) {
		display: inline-block;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		margin-right: 7px;
		vertical-align: middle;
	}
	:global(.search-empty) {
		padding: 18px;
		text-align: center;
		font-size: 13px;
		color: var(--color-text-muted);
		font-style: italic;
	}

	/* ═══════════════════════════════════════════
	   Sidebar
	   ═══════════════════════════════════════════ */
	:global(.sidebar) {
		position: fixed;
		top: calc(var(--header-height) + var(--filter-height));
		right: 0;
		bottom: 0;
		width: var(--sidebar-width);
		background: var(--color-surface);
		z-index: 998;
		transform: translateX(100%);
		transition: transform 0.4s var(--ease-out);
		box-shadow: var(--shadow-sidebar);
		display: flex;
		flex-direction: column;
	}
	:global(.sidebar.open) {
		transform: translateX(0);
	}
	:global(.sidebar-header) {
		padding: 22px 28px 18px;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-shrink: 0;
	}
	:global(.sidebar-header h2) {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 600;
		color: var(--color-header-bg);
		line-height: 1.25;
		flex: 1;
		padding-right: 14px;
	}
	:global(.sidebar-close) {
		width: 34px;
		height: 34px;
		border: none;
		background: var(--color-close-bg);
		border-radius: 50%;
		cursor: pointer;
		font-size: 18px;
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.2s var(--ease-out);
	}
	:global(.sidebar-close:hover) {
		background: var(--color-close-bg-hover);
		color: var(--color-text);
	}
	:global(.sidebar-body) {
		padding: 0 0 28px;
		overflow-y: auto;
		flex: 1;
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}
	:global(.sidebar-image) {
		width: 100%;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		background: var(--color-surface-image);
		position: relative;
	}
	:global(.sidebar-image-placeholder) {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #b8a88a;
	}
	:global(.sidebar-image-placeholder svg) {
		width: 44px;
		height: 44px;
		margin-bottom: 10px;
		opacity: 0.4;
	}
	:global(.sidebar-image-placeholder span) {
		font-family: var(--font-display);
		font-size: 14px;
		font-style: italic;
		opacity: 0.6;
	}
	:global(.sidebar-content) {
		padding: 22px 28px;
	}
	:global(.sidebar-meta) {
		font-size: 13px;
		color: var(--color-text-muted);
		margin-bottom: 18px;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}
	:global(.sidebar-meta .tag) {
		padding: 3px 10px;
		border-radius: var(--radius-sm);
		font-size: 10.5px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	:global(.tag-located) {
		background: var(--color-primary-light);
		color: var(--color-primary);
	}
	:global(.tag-search) {
		background: var(--color-search-light);
		color: var(--color-search);
	}
	:global(.tag-moved) {
		background: var(--color-moved-light);
		color: var(--color-moved);
	}
	:global(.sidebar-desc) {
		font-size: 14.5px;
		line-height: 1.75;
		color: var(--color-text);
		margin-bottom: 22px;
	}
	:global(.sidebar-desc a) {
		color: var(--color-primary);
		text-decoration-color: rgba(26, 138, 125, 0.3);
		text-underline-offset: 2px;
		transition: text-decoration-color 0.2s;
	}
	:global(.sidebar-desc a:hover) {
		text-decoration-color: var(--color-primary);
	}
	:global(.sidebar-address) {
		font-family: var(--font-display);
		font-size: 14px;
		color: var(--color-text-muted);
		margin-bottom: 18px;
		font-style: italic;
		line-height: 1.5;
	}
	:global(.sidebar-video) {
		margin: 18px 0;
		border-radius: var(--radius-md);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}
	:global(.sidebar-video iframe) {
		width: 100%;
		aspect-ratio: 16 / 9;
		border: none;
	}
	:global(.sidebar-links) {
		margin-top: 18px;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	:global(.sidebar-links a) {
		display: inline-block;
		padding: 6px 14px;
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-header-bg);
		text-decoration: none;
		font-size: 12.5px;
		font-weight: 500;
		transition: all 0.25s var(--ease-out);
	}
	:global(.sidebar-links a:hover) {
		background: var(--color-accent-light);
		border-color: var(--color-accent);
		color: var(--color-accent);
	}
	:global(.sidebar-movement) {
		margin: 18px 0;
		padding: 14px 18px;
		background: var(--color-moved-light);
		border-left: 3px solid var(--color-moved);
		border-radius: 0 var(--radius-md) var(--radius-md) 0;
		font-size: 13px;
		line-height: 1.6;
	}
	:global(.sidebar-contact) {
		margin-top: 22px;
		padding: 14px 18px;
		background: var(--color-search-light);
		border-radius: var(--radius-md);
		font-size: 13px;
		line-height: 1.6;
		border: 1px solid rgba(198, 107, 61, 0.15);
	}
	:global(.sidebar-contact a) {
		color: var(--color-primary);
		font-weight: 500;
	}

	/* ═══════════════════════════════════════════
	   Legend
	   ═══════════════════════════════════════════ */
	:global(.legend) {
		position: fixed;
		bottom: 28px;
		left: 28px;
		z-index: 997;
		background: var(--color-surface);
		padding: 16px 20px;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		font-size: 12.5px;
		border-top: 2px solid var(--color-accent);
	}
	:global(.legend h4) {
		margin-bottom: 10px;
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-secondary);
		letter-spacing: 0.02em;
	}
	:global(.legend-item) {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 6px 0;
		color: var(--color-text-secondary);
	}
	:global(.legend-dot) {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		border: 2px solid white;
		box-shadow: 0 0 0 1px var(--color-border);
		flex-shrink: 0;
	}
	:global(.legend-line) {
		width: 24px;
		height: 0;
		border-top: 2px dashed var(--color-accent);
		flex-shrink: 0;
	}

	/* ═══════════════════════════════════════════
	   About Modal
	   ═══════════════════════════════════════════ */
	:global(.about-overlay) {
		position: fixed;
		inset: 0;
		z-index: 2000;
		background: rgba(22, 25, 46, 0.55);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.3s var(--ease-out);
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	:global(.about-modal) {
		background: var(--color-surface);
		max-width: 700px;
		width: 92%;
		max-height: 82vh;
		border-radius: var(--radius-lg);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-lg);
		animation: modalSlideIn 0.4s var(--ease-out);
	}
	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	:global(.about-header) {
		padding: 28px 32px 20px;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	:global(.about-header h2) {
		font-family: var(--font-display);
		font-size: 26px;
		font-weight: 600;
		color: var(--color-header-bg);
	}
	:global(.about-body) {
		padding: 28px 32px;
		overflow-y: auto;
		font-size: 15px;
		line-height: 1.8;
		color: var(--color-text-secondary);
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}
	:global(.about-body p) {
		margin-bottom: 16px;
	}
	:global(.about-body a) {
		color: var(--color-primary);
		text-decoration-color: rgba(26, 138, 125, 0.3);
		text-underline-offset: 2px;
		transition: text-decoration-color 0.2s;
	}
	:global(.about-body a:hover) {
		text-decoration-color: var(--color-primary);
	}
	:global(.about-body .impressum) {
		margin-top: 28px;
		padding-top: 22px;
		border-top: 1px solid var(--color-border);
		font-size: 13px;
		color: var(--color-text-muted);
		line-height: 1.7;
	}
	:global(.about-body h3) {
		font-family: var(--font-display);
		color: var(--color-header-bg);
		margin: 24px 0 10px;
		font-size: 19px;
		font-weight: 600;
	}
	:global(.about-body .videos) {
		margin-top: 12px;
	}
	:global(.about-body .videos a) {
		display: block;
		margin: 8px 0;
		padding: 10px 16px;
		background: var(--color-surface-warm);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		text-decoration: none;
		font-size: 13.5px;
		font-weight: 500;
		transition: all 0.25s var(--ease-out);
	}
	:global(.about-body .videos a:hover) {
		background: var(--color-accent-light);
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	/* ═══════════════════════════════════════════
	   Gallery
	   ═══════════════════════════════════════════ */
	:global(.gallery-main) {
		width: 100%;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		background: var(--color-surface-image);
		position: relative;
		cursor: pointer;
	}
	:global(.gallery-main img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.5s var(--ease-out);
	}
	:global(.gallery-main:hover img) {
		transform: scale(1.03);
	}
	:global(.gallery-counter) {
		position: absolute;
		top: 12px;
		right: 12px;
		background: rgba(22, 25, 46, 0.65);
		color: white;
		font-size: 11px;
		font-weight: 500;
		padding: 3px 10px;
		border-radius: var(--radius-pill);
		pointer-events: none;
		letter-spacing: 0.5px;
		backdrop-filter: blur(8px);
	}
	:global(.gallery-expand) {
		position: absolute;
		bottom: 12px;
		right: 12px;
		width: 34px;
		height: 34px;
		border: none;
		border-radius: var(--radius-sm);
		background: rgba(22, 25, 46, 0.5);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: all 0.3s var(--ease-out);
		backdrop-filter: blur(8px);
	}
	:global(.gallery-expand svg) {
		width: 16px;
		height: 16px;
	}
	:global(.gallery-main:hover .gallery-expand) {
		opacity: 1;
	}
	:global(.gallery-expand:hover) {
		background: rgba(22, 25, 46, 0.7);
	}
	:global(.gallery-arrow) {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 50%;
		background: rgba(22, 25, 46, 0.45);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: all 0.3s var(--ease-out);
		backdrop-filter: blur(8px);
	}
	:global(.gallery-arrow svg) {
		width: 16px;
		height: 16px;
	}
	:global(.gallery-main:hover .gallery-arrow) {
		opacity: 1;
	}
	:global(.gallery-arrow:hover) {
		background: rgba(22, 25, 46, 0.7);
	}
	:global(.gallery-arrow-prev) {
		left: 10px;
	}
	:global(.gallery-arrow-next) {
		right: 10px;
	}
	:global(.gallery-caption) {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 6px 14px;
		background: linear-gradient(to top, rgba(22, 25, 46, 0.6), transparent);
		color: white;
		font-size: 11.5px;
		font-style: italic;
		pointer-events: none;
		padding-top: 24px;
	}
	:global(.gallery-thumbs) {
		display: flex;
		gap: 4px;
		padding: 8px 10px;
		background: var(--color-surface-warm);
		overflow-x: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}
	:global(.gallery-thumb) {
		width: 56px;
		height: 40px;
		flex-shrink: 0;
		border-radius: 4px;
		overflow: hidden;
		cursor: pointer;
		border: 2px solid transparent;
		opacity: 0.55;
		transition: all 0.25s var(--ease-out);
	}
	:global(.gallery-thumb:hover) {
		opacity: 0.85;
	}
	:global(.gallery-thumb.active) {
		opacity: 1;
		border-color: var(--color-accent);
	}
	:global(.gallery-thumb img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* ═══════════════════════════════════════════
	   Lightbox
	   ═══════════════════════════════════════════ */
	:global(.lightbox-overlay) {
		position: fixed;
		inset: 0;
		z-index: 3000;
		background: rgba(22, 25, 46, 0.94);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.3s var(--ease-out);
	}
	:global(.lightbox-close) {
		position: absolute;
		top: 18px;
		right: 22px;
		width: 42px;
		height: 42px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 24px;
		cursor: pointer;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.7;
		transition: all 0.25s var(--ease-out);
		z-index: 3001;
		backdrop-filter: blur(8px);
	}
	:global(.lightbox-close:hover) {
		opacity: 1;
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.3);
	}
	:global(.lightbox-content) {
		position: relative;
		max-width: 85vw;
		max-height: 75vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	:global(.lightbox-img) {
		max-width: 85vw;
		max-height: 75vh;
		object-fit: contain;
		border-radius: var(--radius-sm);
		user-select: none;
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
	}
	:global(.lightbox-caption) {
		position: absolute;
		bottom: -34px;
		left: 0;
		right: 0;
		text-align: center;
		color: rgba(255, 255, 255, 0.7);
		font-family: var(--font-display);
		font-size: 14px;
		font-style: italic;
	}
	:global(.lightbox-counter) {
		position: absolute;
		top: -30px;
		left: 0;
		right: 0;
		text-align: center;
		color: rgba(255, 255, 255, 0.4);
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 2px;
	}
	:global(.lightbox-nav) {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 48px;
		height: 48px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.06);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.25s var(--ease-out);
		z-index: 3001;
		backdrop-filter: blur(8px);
	}
	:global(.lightbox-nav:hover) {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.25);
	}
	:global(.lightbox-nav svg) {
		width: 22px;
		height: 22px;
	}
	:global(.lightbox-nav-prev) {
		left: 24px;
	}
	:global(.lightbox-nav-next) {
		right: 24px;
	}
	:global(.lightbox-thumbs) {
		display: flex;
		gap: 6px;
		padding: 14px 16px;
		max-width: 80vw;
		overflow-x: auto;
		margin-top: 28px;
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
	}
	:global(.lightbox-thumb) {
		width: 64px;
		height: 44px;
		flex-shrink: 0;
		border-radius: 4px;
		overflow: hidden;
		cursor: pointer;
		border: 2px solid transparent;
		opacity: 0.35;
		transition: all 0.25s var(--ease-out);
	}
	:global(.lightbox-thumb:hover) {
		opacity: 0.65;
	}
	:global(.lightbox-thumb.active) {
		opacity: 1;
		border-color: var(--color-accent);
	}
	:global(.lightbox-thumb img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* ═══════════════════════════════════════════
	   Responsive
	   ═══════════════════════════════════════════ */
	@media (max-width: 768px) {
		:global(.header h1) {
			font-size: 16px;
		}
		:global(.sidebar) {
			width: 100%;
		}
		:global(.legend) {
			bottom: 14px;
			left: 14px;
			padding: 12px 16px;
			font-size: 12px;
		}
		:global(.search-input) {
			width: 160px;
		}
		:global(.search-results) {
			width: 280px;
		}
		:global(.filter-chip) {
			padding: 3px 10px;
			font-size: 11px;
		}
		:global(.gallery-arrow) {
			width: 28px;
			height: 28px;
			opacity: 1;
		}
		:global(.gallery-expand) {
			opacity: 1;
		}
		:global(.gallery-thumb) {
			width: 44px;
			height: 32px;
		}
		:global(.lightbox-nav) {
			width: 38px;
			height: 38px;
		}
		:global(.lightbox-nav-prev) {
			left: 10px;
		}
		:global(.lightbox-nav-next) {
			right: 10px;
		}
		:global(.lightbox-thumb) {
			width: 48px;
			height: 34px;
		}
		:global(.lightbox-content) {
			max-width: 95vw;
			max-height: 70vh;
		}
		:global(.lightbox-img) {
			max-width: 95vw;
			max-height: 70vh;
		}
	}
</style>
