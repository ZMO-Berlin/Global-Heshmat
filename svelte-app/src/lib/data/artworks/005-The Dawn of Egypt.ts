
import type { Artwork } from '../types';

const artwork: Artwork = {
	
	id: 5,
	name: 'The Dawn of Egypt',
	lat: 30.29508569400449,
	lng: 31.781317367195644,
	country: 'Egypt',
	city: '10th of Ramadan City',
	status: 'located',
	address: '10th of Ramadan City 1, Al-Sharqia Governorate 7065843',
	desc: 'The sculpture ‚The Dawn of Egypt’, eight-metre high and made of white stone, was erected in 1982 at Midan Galaa. Every day, tens of thousands of people passed by. Popularly known as Galaa Masr, as it stood near the bridge of the same name in el-Nozha and referred to the Anglo-Egyptian Agreement of 1954 on the evacuation of British forces from the Suez Zone. In 2022, the statue had to make way for road construction in Cairo. By courtesy of Marie L. Bishara it now stands completely renovated at this roundabout in 10th of Ramadan City.',
	images: [{src: "Intilaqat_Misr_Abbau.jpg",
	         caption: "Removal of the statue in Midan Galaa"},
		{ 		src: "Intilaqat_Misr_Ahmed_Kamel.jpg",
         		caption: "Statue in 10th of Ramadan City, Photo: Ahmed Kamel, 2025"},
	   {	src: "Intilaqat Masr Kopie_c Ephraim Gothe.jpg",
     	   caption: "Statue in 10th of Ramadan City, Photo: Ephraim Goethe, 2025"}
		   ],
	movement: {
		fromLat: 30.095414812468157,
		fromLng: 31.3427619673732,
		fromName: 'Original location: Midan Galaa, Cairo',
		year: 2022	}

	
	
};

export default artwork;
