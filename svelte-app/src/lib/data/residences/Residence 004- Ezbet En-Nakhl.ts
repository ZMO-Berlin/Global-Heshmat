// A place where Hassan Heshmat lived or worked. Field reference and
// instructions: src/lib/data/residences/_template.ts

import type { Residence } from '../types';

const residence: Residence = {
	id: 4,
	name: 'Ezbet El Nakhl',
	lat: 30.138763547445613,
	lng: 31.32135369007047,
	country: 'Egypt',
	city: 'Cairo (Ezbet El Nakhl)',
	years: '1945',
	desc: 'Hassan Heshmat lived here as a young man',
	images: [{src: "Heshmat 1942 Ezbet al Nakhl.jpg",
	         caption: "Around 1942: Hassan Heshmat with clay plates and mugs. An order most probably commissioned by the British army. The photo was taken in Ezbet al Nakhl, Cairo, where Heshmat lived at the time."
	}
],
};

export default residence;
