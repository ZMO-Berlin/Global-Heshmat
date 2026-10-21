

import type { Artwork } from '../types';

const artwork: Artwork = {
	
	id: 36,
	slug: "museum-of-applied-arts",
	name: 'Museum of Applied Arts',
	lat: 47.48627844528314,
	lng: 19.06837053892711,
	country: 'Hungary',
	city: 'Budapest',
	status: 'search',
	trails: ['east-west', 'museums'],
	address: 'Üllői út 33-37, 1092 Budapest',
	desc: 'The Iparművészeti Múzeum (Museum of Applied Arts) in Budapest once housed works by Hassan Heshmat. In his autobiography, Heshmat devotes half a page to his exhibition there. Currently, there is no information available and the works whereabouts are unknown.',
	images: [
		{
			src: 'budapest 1.jpg',
			caption: 'Hassan Heshmat and his wife Zeinab Hegasy at the vernissage of his exhibition at the Museum of Applied Arts in Budapest, Hungary, September 1957. The handwriting reads: “To Soheir and Sonia with our love. Mum and Dad together at the vernissage of the Budapest exhibition”.'
		},
		{
			 src: 'budapest 3.jpg',
			caption: 'Hassan Heshmat at the Museum of Applied Arts in Budapest, Hungary, September 1957.'
		 },
		{
			 src: 'budapest 2.jpg',
			 caption: 'On the back of the photo, written by hand: “Place these photographs in a frame in front of Soheir and Sonia. With great appreciation and thanks”.'
		}
	]
};

export default artwork;
