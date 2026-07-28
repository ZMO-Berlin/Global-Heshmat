<script lang="ts">
	import { aboutContent as about } from '$lib/data/about';
	import logo from '$lib/assets/logo-zmo-white.png';
</script>

<footer class="site-footer">
	<div class="site-footer-inner">
		<div class="site-footer-brand">
			<a
				class="site-footer-logo"
				href={about.impressum.website}
				target="_blank"
				rel="noopener noreferrer external"
				aria-label="Zentrum Moderner Orient"
			>
				<img src={logo} alt="ZMO" />
			</a>
			<span class="site-footer-label">Leibniz-Zentrum Moderner Orient (ZMO)</span>
		</div>
		<div class="site-footer-credits">
			<span class="site-footer-credit">
				<span class="site-footer-role">Concept</span>
				<a
					href="https://www.zmo.de/en/people/dr-sonja-hegasy"
					target="_blank"
					rel="noopener noreferrer external">Dr Sonja Hegasy</a
				>
			</span>
			<span class="site-footer-credit">
				<span class="site-footer-role">Configuration</span>
				<a
					href="https://www.zmo.de/en/people/jan-purtzel"
					target="_blank"
					rel="noopener noreferrer external">Jan Purtzel</a
				>
			</span>
			<span class="site-footer-credit">
				<span class="site-footer-role">Development</span>
				<a href={about.impressum.development.url} target="_blank" rel="noopener noreferrer external"
					>{about.impressum.development.name}</a
				>
			</span>
			<span class="site-footer-credit">
				<span class="site-footer-role">Contributor</span>
				Samar Hafez
			</span>
		</div>
	</div>
</footer>

<style>
	/* Site footer: ZMO brand mark and project credits. */
	/* ═══════════════════════════════════════════
	   Site Footer
	   ═══════════════════════════════════════════ */
	.site-footer {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: var(--z-footer);
		height: var(--footer-height);
		background: var(--color-header-bg);
		color: var(--color-header-text);
		border-top: 2px solid var(--color-accent);
		box-shadow:
			0 -1px 0 rgb(var(--color-accent-rgb) / 0.15),
			var(--shadow-bar-dark-inverted);
		display: flex;
		align-items: center;
		padding: 0 var(--space-7);
	}

	.site-footer-inner {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-8);
	}

	.site-footer-brand {
		display: flex;
		align-items: center;
		gap: var(--space-3-5);
		flex-shrink: 0;
	}

	.site-footer-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.site-footer-logo:hover {
		opacity: 0.8;
	}

	.site-footer-logo img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
	}

	.site-footer-label {
		font-family: var(--font-body);
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		color: var(--color-header-text);
		letter-spacing: var(--tracking-wide);
		white-space: nowrap;
	}

	.site-footer-credits {
		display: flex;
		align-items: center;
		gap: var(--space-4-5);
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.site-footer-credit {
		display: inline-flex;
		align-items: baseline;
		gap: var(--space-2);
		font-size: var(--text-sm);
		line-height: var(--leading-snug);
	}

	.site-footer-role {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-accent);
	}

	.site-footer-credits a {
		color: var(--color-header-text);
		text-decoration: none;
		border-bottom: 1px solid rgb(var(--color-header-text-rgb) / 0.2);
		padding-bottom: 1px;
		transition:
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.site-footer-credits a:hover {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
	}

	/* ───── Narrowing the bar ─────
	   The credits are the widest thing in the footer, so each tier below drops
	   the next-least-essential piece of their horizontal budget rather than
	   letting them wrap: a second line orphans one credit against the right
	   edge and pushes the block out of the fixed 64px bar. */

	/* Inline role + name needs ~1275px beside the ZMO wordmark. Stacking the
	   role over the name nearly halves the strip (810px → ~470px) and keeps all
	   four credits on one row, still centred against the logo. */
	@media (max-width: 1280px) {
		.site-footer-credits {
			gap: var(--space-4);
		}

		.site-footer-credit {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-1);
		}
	}

	/* The wordmark goes next; the logo still carries the brand and links out. */
	@media (max-width: 1024px) {
		.site-footer-label {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.site-footer {
			padding: 0 var(--space-3-5);
		}

		.site-footer-inner {
			gap: var(--space-3);
		}
	}

	/* Below ~570px even the stacked roles stop fitting, so drop them and run the
	   names as one centred list. Fill the row and center so a wrapped second
	   line reads as balanced instead of a lone name dangling off the right. */
	@media (max-width: 640px) {
		.site-footer-credits {
			flex: 1;
			justify-content: center;
			gap: var(--space-1-5) var(--space-3);
		}

		.site-footer-role {
			display: none;
		}

		.site-footer-credit {
			flex-direction: row;
			align-items: baseline;
			gap: var(--space-3);
			font-size: var(--text-xs);
		}

		/* With the roles gone, a hairline dot keeps the names reading as one
		   list rather than four loose words. The empty alt text keeps it out of
		   the accessibility tree; browsers without that syntax just drop the
		   separator, which costs nothing. */
		.site-footer-credit:not(:last-child)::after {
			content: '·' / '';
			color: rgb(var(--color-header-text-rgb) / 0.45);
		}
	}
</style>
