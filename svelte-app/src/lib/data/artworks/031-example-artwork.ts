import type { Artwork } from '../types';

const artwork: Artwork = {
	id: 31,
	name: "The Nile Fisherman",
	lat: 31.215,
	lng: 29.955,
	country: "Egypt",
	city: "Alexandria",
	status: 'located',
	address: "15 Corniche Road, Raml Station, Alexandria Governorate 21500",
	desc: "A life-size bronze statue of a fisherman casting his net into the Nile, commissioned in 1968 by the Alexandria Cultural Foundation. The work was originally installed at the old harbour promenade before being relocated to the Bibliotheca Alexandrina gardens in 2015. It reflects Heshmat's recurring interest in <em>everyday working figures</em> and was restored in 2020 with funding from the Goethe-Institut.",
	image: "Story map II.jpg",
	imageCaption: "Photo: Sonja Hegasy, 2019",
	images: [
		{
			src: "Story map II.jpg",
			caption: "Front view of the fisherman statue at sunset"
		},
		{
			src: "Story map III.jpg",
			caption: "Detail of the net and hands"
		}
	],
	links: [
		{
			label: "Bibliotheca Alexandrina catalogue",
			url: "https://www.bibalex.org/en/default"
		},
		{
			label: "Goethe-Institut restoration project",
			url: "https://www.goethe.de/en/index.html"
		}
	],
	video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	movement: {
		fromLat: 31.199,
		fromLng: 29.900,
		fromName: "Old Harbour Promenade, Alexandria",
		year: 2015
	},
};

export default artwork;
