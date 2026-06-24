

import type { Artwork } from '../types';

const artwork: Artwork = {
	
	id: 23,
	name: 'Haus der Familie Haude',
	lat: 50.15855575931875,
	lng: 12.14599910244687,
	country: 'Germany',
	city: 'Selb',
	status: 'located',
	address: 'Ahornweg 6, 95100 Selb',
	desc: 'Whilst studying at the Porcelain Technical College in Selb, Hassan Heshmat lived with the Haude family at 6 Ahornweg, 95100 Selb, Germany.',
    images: [{src: "Selb_Haus_II.jpeg",
	         caption: "Hassan Heshmats Accodmodation in Selb, Bavaria, 2026"},
	   {src: "Selb_Haus_III.jpeg",
	         caption: "The upper window is that of the room he occupied at the time."},
		   {	src: "Haus_in_Selb.jpeg",
     	   caption: "The house in winter 2025"}
		   
		   ]
	
	
};

export default artwork;
