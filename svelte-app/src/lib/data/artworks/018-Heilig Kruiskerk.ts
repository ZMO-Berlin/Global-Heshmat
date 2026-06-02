

import type { Artwork } from '../types';

const artwork: Artwork = {
	
	id: 18,
	name: 'Heilig Kruiskerk',
	lat: 50.92058026384286,
	lng: 5.325863864013154,
	country: 'Belgium',
	city: 'Hasselt',
	status: 'located',
	address: 'Kruisherenlaan 29, 3500 Hasselt',
	desc: 'In memory of 23 Belgian missionaries murdered in Buta (Congo) in 1965, Hassan Heshmat was commissioned in 1970 by the Order of the Holy Cross to erect a memorial in Hasselt, Belgium. When models were submitted by various artists, his design appealed most to the jury. He produced the ceramics in his workshop in Cairo and flew them in to Belgium. The memorial still stands today, however, the ceramic panels depicting the missionaries’ robes, are no longer there. But the priests heads, carved in bas-relief, are still in place. <br>KADOC, the interfaculty Documentation and Research Centre on Religion, Culture and Society at the KU Lueven, founded in 1976, has incorporated research results from Hegasy’s projects into their archive and database.',
	images: [{src: "Mahnmal_Hasselt_Kopie.jpeg",
	         caption: "Mural next to the Heilig Kruiskerk"},
		{ 		src: "Hasselt_Einweihung_.jpg",
         		caption: "Inauguration in Hasselt"},
	   {	src: "Hasselt_Einweihung_2.jpg",
     	   caption: "Inauguration in Hasselt"},
		   {src: "Ausstellung_Heshmat_mit_Motherhood.jpg",
	         caption: "Exhibition Heshmat with Motherhood"},
		{ 		src: "Hasselt_Bau_mit_künstler.jpg",
         		caption: "The Memorial with the Artist"},
	   {	src: "Hasselt_historical_photo_1970.jpg",
     	   caption: "Historical Photo"},
		   { 		src: "Hasselt_Memorial.jpg",
         		caption: "Photo of the memorial"},
	   {	src: "Hasselt_Rückseite_Foto_The_monument_made_this_ year_for_a_church_in_Belgium_1970.jpg",
     	   caption: "Backside of Photo"},
		   ]};

export default artwork;
