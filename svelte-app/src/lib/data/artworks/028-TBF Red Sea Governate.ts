

import type { Artwork } from '../types';

const artwork: Artwork = {
	
	id: 28,
	name: 'Mermaid with Wings',
	lat: 27.258733434548205,
	lng: 33.80775414275154,
	country: 'Egypt',
	city: 'Hurghada',
	status: 'search',
	address: 'October 6, Second District, Hurghada, Red Sea Governorate 1974121',
	desc: 'The Bride of the Sea, the symbol of the Governorate of the Red Sea is approximately eight metres high and was made of white stone. We do not know when the statue in front of the Governorate`s building, located formerly in Dahar square, was removed and we do not know where it is today, but Hassan Heshmat designed the ‘The Bride of the Sea’ as the landmark for the governorate of the Red Sea in the city of Hurghada with wings heading to the sky. It was still there in 2009, as we know from photos, but it surely was gone by 2016, as al-Bawaba News reports about various statues of mermaids in the city at the time to the dismay of the inhabitants and is asking the same question: Where did the original go?',
	images: [{src: "mermaid_rsg_I.jpg",
	         caption: "The statue in front of the government building"},
		{src: "mermaid_rsg_II.jpg",
	         caption: "The statue in front of the government building"},
			 {src: "mermaid_rsg_III.jpg",
	         caption: "The statue on a different location, 2009"}],
	links: [
		{
			label: 'To the Article at Al-Bawaba News (in Arabic)',
			url: 'https://www.albawabhnews.com/2138911'
		}]
	
	
};

export default artwork;
