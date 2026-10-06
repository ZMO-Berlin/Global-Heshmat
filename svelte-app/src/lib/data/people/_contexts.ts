/**
 * Shared passages: source paragraphs that describe several people at once
 * (the three portraitists, the 1955 Warsaw delegation). Each passage is shown
 * in full on the profile of every person it lists, and is searchable from
 * each of them. Profiles are referenced by slug.
 */
import type { PeopleContext } from '../types';

export const peopleContexts: PeopleContext[] = [
	{
		id: 'portraits',
		people: ['sabry-ragheb', 'hussein-bicar', 'georges-bahgory'],
		sourceParagraphs: [46],
		paragraphs: [
			'All three artists portrayed Hassan Heshmat in their own very typical style. Ragheb and Bicar were known as masters of portrait-painting, while Bahgory was also famous for his caricatures.'
		]
	},
	{
		id: 'warsaw',
		people: ['mounir-kanaan', 'mamdouh-ammar', 'youssef-francis'],
		sourceParagraphs: [49, 54],
		paragraphs: [
			'In 1955 Heshmat was invited with a delegation of 10 artists to represent Egypt at the 5th World Festival of Youth and Students in Warsaw. We know that with him were Mounir Kanaan, Mamdouh Ammar and Youssef Francis:',
			"All four - Heshmat, Kanaan, Ammar and Francis - were part of a generation coming to fruition in extremely turbulent times. They were entering Egyptian artistic life around 1938–55, when the question wasn't simply “How do we make modern art?” or “How can we make independent art?” but how can art be simultaneously modern and recognizably Egyptian and thus original? Everyone found their own answer to this question, which would become a core topic for the development of modern Egyptian art."
		]
	}
];
