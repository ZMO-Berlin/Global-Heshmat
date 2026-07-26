// A place where Hassan Heshmat lived or worked. Field reference and
// instructions: src/lib/data/residences/_template.ts

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
		{ src: 'Selb_Haus_II.jpeg', caption: 'Hassan Heshmat’s Accommodation in Selb, Bavaria, 2026' },
		{ src: 'Selb_Haus_III.jpeg' }
	]
};

export default residence;
