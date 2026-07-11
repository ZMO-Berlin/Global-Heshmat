// New artworks: copy _template.ts (the maintained field reference), not this
// file — this header once carried a stale pre-slug/videoFile copy of it.

import type { Artwork } from '../types';

const artwork: Artwork = {
	// ── Required fields ──────────────────────────────────
	id:1,
	name: 'Fatima Ismail’s Palace Museum',
	lat: 30.046696328983828,
	lng: 31.209329960099446,
	country: 'Egypt',
	city: 'Cairo (Dokki)',
	status: 'located',
	address: 'Ad Doqi, Dokki, Giza Governorate 12611',
	desc: 'The palace of princess Fatima Ismail (1853-1920) at the Agricultural Museum houses a collection of over 500 rare pieces of art dating to the late 19th and early 20th centuries. Today, we find famous Egyptian artists like Mahmoud Mukhtar as well as several works of Hassan Heshmat in the exhibition.',
	images: [{src: "Agricultural museum_1.jpeg"},
		{ 		src: "Agricultural museum_2.jpeg"},
	   {	src: "Agricultural museum_3.jpeg"},
		   {src: "Agricultural_Museum_4.jpeg"},
		{ 		src: "Agricultural_Museum_5.jpeg"},
	   {	src: "Agricultural_Museum_6.jpeg"},
		   {	src: "Agricultural_Museum_7.jpeg"}],
		   links: [
		{
			label: 'Fatma Ismail’s Palace Museum',
			url: 'https://sharinghistory.museumwnf.org/database_item.php?id=monument;AWE;eg;7;en'
		}]

	
	
};

export default artwork;
