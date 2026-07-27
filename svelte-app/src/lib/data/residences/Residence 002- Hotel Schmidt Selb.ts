// A place where Hassan Heshmat lived or worked. Field reference and
// instructions: src/lib/data/residences/_template.ts

import type { Residence } from '../types';

const residence: Residence = {
	id: 2,
	name: 'Hotel Schmidt Selb',
	lat: 50.17065270578028,
	lng: 12.127331675399757,
	country: 'Germany',
	city: 'Selb',
	years: '1977',
	desc: 'According to an entry in Ahmed Hegazy’s address book, Hassan Heshmat later stayed at Hotel Schmidt in Selb. The hotel, which opened in the 1930s, is located between the railway station and the town centre. The State College of Porcelain is approximately 750 metres away.',
	images: [
		{ src: 'Schmidt_Selb_I.jpg', caption: 'Entry in the address book of Ahmed Hegazy' },
		{ src: 'Schmidt_Selb_II.jpg' }
	]
};

export default residence;
