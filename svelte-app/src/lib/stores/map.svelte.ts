import type { Artwork, Residence } from '$lib/data/types';
import { FILTER_ALL, type MapFilter } from '$lib/utils/map-filter';

// Shared reactive state for cross-component communication
let selectedArtwork = $state<Artwork | null>(null);
let selectedResidence = $state<Residence | null>(null);
let activeFilter = $state<MapFilter>(FILTER_ALL);
let aboutOpen = $state<boolean>(false);
let missingOpen = $state<boolean>(false);

export function getMapStore() {
	return {
		get selectedArtwork() {
			return selectedArtwork;
		},
		set selectedArtwork(value: Artwork | null) {
			selectedArtwork = value;
			// An artwork and a residence can't be open at once — opening one
			// closes the other so only a single detail panel is ever shown.
			if (value !== null) selectedResidence = null;
		},
		get selectedResidence() {
			return selectedResidence;
		},
		set selectedResidence(value: Residence | null) {
			selectedResidence = value;
			if (value !== null) selectedArtwork = null;
		},
		get activeFilter() {
			return activeFilter;
		},
		set activeFilter(value: MapFilter) {
			activeFilter = value;
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
