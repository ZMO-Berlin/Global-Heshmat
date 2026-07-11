import type { Artwork } from '../types';

const artwork: Artwork = {
	id: 40,
	name: 'Midan Galaa',
	lat: 30.095811499506347,
	lng: 31.342745241206778,
	country: 'Egypt',
	city: 'Cairo (Heliopolis)',
	status: 'located',
	address: 'Almazah, El Nozha, Cairo Governorate',
	desc: 'From 1982 to 2022, this square was home to the sculpture ‚The Dawn of Egypt’, eight-metre high and made of white stone. Every day, tens of thousands of people passed by. Popularly known as Galaa Masr, as it stood near the bridge of the same name in el-Nozha and referred to the Anglo-Egyptian Agreement of 1954 on the evacuation of British forces from the Suez Zone. In 2022, the statue had to make way for road construction and was moved to 10th of Ramadan City, where it stands today, completely renovated (see ‚The Dawn of Egypt’).',
	images: [
		{ src: 'Midan_Galaa_historic.jpg', caption: 'Historic image of Midan Galaa' },
		{ src: 'Midan_Galaa_2026_1.jpg', caption: 'Midan Galaa April 2026' },
		{ src: 'Midan_Galaa_2026_2.jpg', caption: 'Midan Galaa April 2026' },
		{ src: 'Midan_Galaa_2026_3.jpg', caption: 'Midan Galaa April 2026' }
	],
	videoFile: 'Midan_Galaa.mp4'
};

export default artwork;
