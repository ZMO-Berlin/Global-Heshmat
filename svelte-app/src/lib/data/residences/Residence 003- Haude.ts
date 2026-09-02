// A place where Hassan Heshmat lived or worked. Field reference and
// instructions: src/lib/data/residences/_template.ts

import baby from '@lucide/svelte/icons/baby';
import type { Residence } from '../types';

const residence: Residence = {
	id: 3,
	name: 'Haus der Familie Haude',
	lat: 50.15855575931875,
	lng: 12.14599910244687,
	country: 'Germany',
	city: 'Selb',
	years: '1957–1958',
	desc: 'Whilst studying at the Porcelain Technical College in Selb, Hassan Heshmat lived with the Haude family at 6 Ahornweg, 95100 Selb, Germany.',
	images: [
		{ src:'The Haude family in front of their store.jpg', caption: 'The Haude family in front of their store, Selb, Bavaria, 1957'},
		{ src: 'The Gemischtwarenladen, Ahornweg 6.jpg', caption: 'The Gemischtwarenladen, Ahornweg 6, Selb, Bavaria'}, 
		{ src: 'Selb_Haus_II.jpeg', caption: 'Hassan Heshmat’s Accommodation in Selb, Bavaria, 2026' },
		{ src: 'The room in Selb, Ahornweg 6.jpg', caption: 'The room in which Hassan Heshmat lived'},
		{ src: 'Collected Karin Haude.jpg', caption: 'Karin Haude`s collected artworks by Hassan Heshamt'},
		{ src: 'Pendant for Karin Haude.jpg', caption: 'Pendant for Karin Haude'},
		{ src: 'for Karin_from H Heshmat.jpg', caption: 'Pendant for Karin Haude, by Hassan Heshmat'},
		{ src: 'Familienalbum mit Handschrift Fritz Haude.jpg', caption: 'Family album with handwriting of Fritz Haude'},
		{ src: 'Karin Haude 1957 with knit dress by Zeinab.jpg', caption: 'Karin Haude with dress knit dress by Zeinab, 1957'},
		{ src: 'The Heshmat couple with baby Karin Haude in Selb, christmas 1957.jpg', caption: 'The Heshmat couple with baby Karin Haude in Selb, Christmas 1957' }, 
		{ src: 'Selb_Haus_III.jpeg', caption: 'Selb House III' }
	]
};

export default residence;
