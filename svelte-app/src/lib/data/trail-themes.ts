/**
 * Thematic trails, in display order. An artwork or residence joins a trail
 * by listing the trail's id in its `trails` field — the type checker flags a
 * typo. Place trails (one city each) are defined in trails.ts.
 */
export const trailThemes = [
	{
		id: 'industry-everyday',
		title: 'Art for industry, hotels and everyday life',
		introduction:
			'Under Sadat and Mubarak, factories, hotels and companies became major patrons. Already in the Nasser years, a Cairo stationery shop sold his small statues to private buyers.'
	},
	{
		id: 'state-army',
		title: 'Commissions for the state and the army',
		introduction:
			'Monuments, reliefs and friezes for public squares, the metro, a stadium, the armed forces and regional government.'
	},
	{
		id: 'east-west',
		title: 'Between East and West',
		introduction:
			'During the Cold War, his work travelled to both sides of the Iron Curtain, and as far as China and the United States.'
	},
	{
		id: 'faith-remembrance',
		title: 'Faith and remembrance',
		introduction:
			'Works for churches and memorials, and monuments that commemorate national events, from Cairo to Hasselt and Boston.'
	},
	{
		id: 'museums',
		title: 'Museums',
		introduction: 'Museums in Egypt, Europe and China that hold, or once held, works by Heshmat.'
	}
] as const;

export type TrailThemeId = (typeof trailThemes)[number]['id'];
