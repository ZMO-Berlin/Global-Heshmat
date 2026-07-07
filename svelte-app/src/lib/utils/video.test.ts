import { describe, expect, it } from 'vitest';
import { videoUrl } from './video';

describe('video URL helper', () => {
	it('maps a stored filename to its /videos/ URL', () => {
		expect(videoUrl('Midan_Galaa.mp4')).toBe('/videos/Midan_Galaa.mp4');
	});

	it('preserves spaces and casing in the filename', () => {
		expect(videoUrl('Some Clip.MP4')).toBe('/videos/Some Clip.MP4');
	});
});
