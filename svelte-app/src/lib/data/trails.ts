import { artworks } from './artworks';
import { residences } from './residences';
import type { Entry } from '$lib/utils/collection';
/** Reading sequences based on existing record geography, not verified walking routes. */
export const trails: { id: string; title: string; introduction: string; entries: Entry[] }[] = [
	{
		id: 'selb',
		title: 'Heshmat in Selb',
		introduction:
			'Read the collection’s records of artworks and places of residence in Selb, Germany. The individual entries provide the documentary context.',
		entries: [...residences, ...artworks].filter((item) => item.city === 'Selb')
	},
	{
		id: '10th-of-ramadan',
		title: '10th of Ramadan City',
		introduction:
			'Explore the records associated with 10th of Ramadan City, including The Dawn of Egypt and its recorded relocation in 2022.',
		entries: artworks.filter((item) => item.city === '10th of Ramadan City')
	}
];
