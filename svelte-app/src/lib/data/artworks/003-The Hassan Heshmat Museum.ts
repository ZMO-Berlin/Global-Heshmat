

import type { Artwork } from '../types';

const artwork: Artwork = {

	id: 3,
	name: 'The Hassan Heshmat Museum',
	lat: 30.130794104470525,
	lng: 31.318334955818294,
	country: 'Egypt',
	city: 'Cairo (Ain Shams)',
	status: 'located',
	address: 'Ein Shams Al Gharbeyah, El Matareya, Cairo Governorate 4533483',
	desc: 'The Museum of the artist Hassan Heshmat in Ain Shams is one of the precious house museums in Egypt. Its former owner, the sculptor Hassan Heshmat (1920-2006) worked with numerous materials like clay, wood, metal, stone or porcelain in sizes between 10cm and 10m. His works can be found all over Egypt. He donated his private house, workshop, gallery and sculpture garden to the Ministry of Culture which opened the current museum in 2018.',
	images: [{src: "Balcony 1st floor Museum.jpg",
	         caption: "Balcony on the first floor of the Museum"},
		{ 		src: "Entrance Museum.jpg",
         		caption: "The Entrance of The Hassan Heshmat Museum"},
	   {	src: "Hasan_Heshmat_House Entrance.jpg",
     	   caption: "Heshmat standing in the entrance of the museum"},
		   {	src: "Horus_Sculpture Garden Museum.jpg",
     	   caption: "Horus Sculpture"},
		    {	src: "Mykerinos Triade_E_Gothe.jpg",
     	   caption: "Mykerios Triade"},
		    {	src: "The couple_Sculpture Garden Museum.jpg"}
		   ],
		   links: [
		{
			label: 'History of Hassan Heshmat Museum',
			url: 'https://www.fineart.gov.eg/Eng/musem/Musem.asp?IDs=15'
		}]
		   

	
	};

export default artwork;
