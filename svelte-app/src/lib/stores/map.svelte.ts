import type { Artwork } from '$lib/data/types';

// Shared reactive state for cross-component communication
let selectedArtwork = $state<Artwork | null>(null);
let activeFilter = $state<string>('all');
let searchQuery = $state<string>('');
let aboutOpen = $state<boolean>(false);
let missingOpen = $state<boolean>(false);

export function getMapStore() {
	return {
		get selectedArtwork() {
			return selectedArtwork;
		},
		set selectedArtwork(value: Artwork | null) {
			selectedArtwork = value;
		},
		get activeFilter() {
			return activeFilter;
		},
		set activeFilter(value: string) {
			activeFilter = value;
		},
		get searchQuery() {
			return searchQuery;
		},
		set searchQuery(value: string) {
			searchQuery = value;
		},
		get aboutOpen() {
			return aboutOpen;
		},
		set aboutOpen(value: boolean) {
			aboutOpen = value;
		},
		get missingOpen() {
			return missingOpen;
		},
		set missingOpen(value: boolean) {
			missingOpen = value;
		}
	};
}
