

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
	address: 'Üllői út 33-37, 1092 Budapest',
	desc: 'The Iparművészeti Múzeum (Museum of Applied Arts) in Budapest once housed works by Hassan Heshmat. Currently, there is no information available and the works whereabouts are unknown.',
	images: [
		{
			src: 'budapest 1.jpg',
			caption: 'Hassan Heshmat and his wife Zeinab Hegasy at the vernissage of his exhibition at the Museum of Applied Arts in Budapest, Hungary, 1958.'
		},
		{ src: 'budapest 3.jpg' },
		{ src: 'budapest 2.jpg' }
	]
};

export default artwork;
