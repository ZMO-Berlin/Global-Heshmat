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
				Samar Heshmat
			</span>
		</div>
	</div>
</footer>
