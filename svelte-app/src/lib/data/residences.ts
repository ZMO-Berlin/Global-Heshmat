import allResidences from './residences/index';
import type { Residence } from './types';

/**
 * All places of residence, sorted by id. Not yet rendered on the map — the
 * "Places of residence" category is a legend/filter placeholder for now.
 * When wiring up markers, import this into MapView.svelte.
 */
export const residences: Residence[] = allResidences;
