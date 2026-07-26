import { describe, expect, it } from 'vitest';
import { videoUrl, youTubeId } from './video';

describe('video URL helper', () => {
	it('maps a stored filename to its /videos/ URL', () => {
		expect(videoUrl('Midan_Galaa.mp4')).toBe('/videos/Midan_Galaa.mp4');
	});

	it('preserves spaces and casing in the filename', () => {
		expect(videoUrl('Some Clip.MP4')).toBe('/videos/Some Clip.MP4');
	});
});

describe('youTubeId', () => {
	it('reads the id from a standard watch URL', () => {
		// The URL actually used by artwork 027.
		expect(youTubeId('https://www.youtube.com/watch?v=ZytKel21hh8')).toBe('ZytKel21hh8');
	});

	it('reads the id from a youtu.be short link', () => {
		expect(youTubeId('https://youtu.be/ZytKel21hh8')).toBe('ZytKel21hh8');
	});

	it('reads the id from embed, shorts and live URLs', () => {
		expect(youTubeId('https://www.youtube.com/embed/ZytKel21hh8')).toBe('ZytKel21hh8');
		expect(youTubeId('https://www.youtube.com/shorts/ZytKel21hh8')).toBe('ZytKel21hh8');
		expect(youTubeId('https://www.youtube.com/live/ZytKel21hh8')).toBe('ZytKel21hh8');
	});

	it('tolerates extra query parameters in any order', () => {
		expect(youTubeId('https://www.youtube.com/watch?v=ZytKel21hh8&t=30s')).toBe('ZytKel21hh8');
		expect(youTubeId('https://www.youtube.com/watch?list=PLRI8sL2Uoti&v=ZytKel21hh8')).toBe(
			'ZytKel21hh8'
		);
		expect(youTubeId('https://youtu.be/ZytKel21hh8?si=abcdef')).toBe('ZytKel21hh8');
	});

	it('returns null for a playlist URL, which carries no video id', () => {
		// about.ts links one of these; it must not be turned into an embed.
		expect(
			youTubeId('https://www.youtube.com/playlist?list=PLRI8sL2Uoti_6z196Y5JQfdPsDWmCasPr')
		).toBe(null);
	});

	it('returns null rather than a truncated id when the id is the wrong length', () => {
		expect(youTubeId('https://www.youtube.com/watch?v=tooshort')).toBe(null);
		expect(youTubeId('https://www.youtube.com/watch?v=waaaaaaaaaaytoolong')).toBe(null);
	});

	it('does not mistake an arbitrary path segment for an id', () => {
		expect(youTubeId('https://example.com/somelongpath/')).toBe(null);
		expect(youTubeId('')).toBe(null);
	});
});
