<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { getMapStore } from '$lib/stores/map.svelte';
	import { aboutContent as about } from '$lib/data/about';

	const store = getMapStore();
</script>

<Modal
	open={store.missingOpen}
	title="Help us find missing works"
	onclose={() => (store.missingOpen = false)}
>
	<p>
		{about.missingWorksText}
		<a href="mailto:{about.contactEmail}">{about.contactEmail}</a>
	</p>
</Modal>
