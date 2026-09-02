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
	desc: 'While studying at the Porcelain Technical College in Selb, Germany, Hassan Heshmat and his wife, Zeinab, lived with the Haude family at 6 Ahornweg. In 1957, three generations of the Haude family lived under one roof. Friede Haude, the grandmother, came up with the idea to sublet a room to a student in Selb. Thus, they shared the top floor with Hassan and Zeinab. Zeinab had a heart condition for several years, and the couple had hoped she could receive treatment in West Germany in 1958 and in Budapest. Her health improved, as recounted in his autobiography. After returning to Egypt, the couple moved into their new house in Ain Shams and reunited with their children, who, on the doctor’s advice, had attended a nursery prior to their stay in Germany. The Haude family ran a general store out of their home, selling everyday goods. Anneliese Haude, who was newly married at the time, recalls that the Egyptian couple was very friendly and that Heshmat was outgoing. He usually bought his goods at the small store in the house after coming back from school. However, she has no recollection of what Zeinab, who had four children ranging in age from 2 to 10 back home in Cairo, did during her long days. However, we know they celebrated Christmas together because we found photos of the event in two family albums: one with Magda Heshmat in Ismailia, Egypt, and the other with Karin Haude in Hof, Germany. Zeinab knitted the dress worn by the toddler in one of the pictures. Sixty-nine years later, Ms. Haude recognized the photo from her family album in ZMO’s digital exhibition “Hassan Heshmat - Ein Visionär seiner Zeit” and contacted the center in Berlin.',
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
