

import type { Artwork } from '../types';

const artwork: Artwork = {
	
	id: 2,
	slug: "museum-of-modern-egyptian-art",
	name: 'Museum of Egyptian Modern Art',
	lat: 30.0436289222398,
	lng: 31.224813224857503,
	country: 'Egypt',
	city: 'Cairo (Zamalek)',
	status: 'located',
	trails: ['museums'],
	address: 'Inside the Egyptian Opera House, Zamalek, Cairo Governorate 4270020',
	desc: 'There is currently no statue of Hassan Heshmat in the ongoing exhibition (May 2026), but his artworks are mentioned in the museum’s overview.',
	images: [{src: "Museum_of_Egyptian_Modern_Art.jpg",
		caption: "Museum of Egyptian Modern Art"},
	{src: "ticket museum of egyptian modern art.jpg",
		caption: "Ticket Museum of Egyptian Modern Art "} 	
],
sources: [
			{
				label:
					'al-Razaz 2005: 296', 
				url: 'https://viewer2.bibalex.org/BookViewer/?locale=en&EnableLogin=True&book_id=DAF-Job:143070&keyword=', 
			}
		]

};

export default artwork;
