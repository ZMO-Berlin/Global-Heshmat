

import type { Artwork } from '../types';

const artwork: Artwork = {
	
	id: 37,
	slug: "musee-de-l-homme",
	name: 'Musée de l’Homme',
	lat: 48.86126475967253,
	lng: 2.2868264049295925,
	country: 'France',
	city: 'Paris',
	status: 'search',
	trails: ['east-west', 'museums'],
	address: '17 Pl. du Trocadéro et du 11 Novembre, 75116 Paris',
	desc: 'The Musée de l’Homme in Paris once housed works by Hassan Heshmat.',
	images: [
		{
			src: 'Musée_de_l`Homme.jpg',
			caption: 'The Musée de l’Homme, Paris',
			sourceUrl: 'https://www.museos.com/de/paris/musee-de-l-homme-paris/'
		}
	],
	links: [
		{
			label: 'Museum Homepage',
			url: 'https://www.museedelhomme.fr/fr'
		}]
	
	
	
};

export default artwork;
