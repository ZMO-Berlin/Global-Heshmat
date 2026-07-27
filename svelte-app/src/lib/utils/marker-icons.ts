/**
 * Marker shapes for the map, the legend and the collection list.
 *
 * Until now the three categories differed by hue alone. Simulating the palette
 * under dichromacy puts located (teal) and residence (blue) at ΔE 12.4 under
 * tritanopia — indistinguishable at an 8px marker — so colour was carrying
 * meaning it cannot reliably carry (WCAG 1.4.1, Use of Colour). Shape now does
 * the work and colour reinforces it.
 *
 * MARKER_SPECS is the single source of truth: MapView draws these shapes onto
 * a canvas and registers them as map images, while MarkerGlyph.svelte renders
 * the same shapes as SVG for the legend and the collection list. Changing a
 * shape here changes all three.
 */

export type MarkerKind = 'located' | 'search' | 'residence' | 'former';

export type MarkerShape = 'disc' | 'ring' | 'diamond' | 'dashed-ring';

export interface MarkerSpec {
	/** Geometry — the part that survives colour blindness, greyscale and glare. */
	shape: MarkerShape;
	/** CSS custom property supplying the fill/stroke colour. */
	colorToken: string;
	/** Legend wording, also the accessible name where a glyph stands alone. */
	label: string;
}

export const MARKER_SPECS: Record<MarkerKind, MarkerSpec> = {
	located: { shape: 'disc', colorToken: '--color-primary', label: 'Located artwork' },
	search: { shape: 'ring', colorToken: '--color-search', label: 'To be found' },
	residence: { shape: 'diamond', colorToken: '--color-residence', label: 'Place of residence' },
	former: { shape: 'dashed-ring', colorToken: '--color-text-muted', label: 'Former location' }
};

/** Map image ids, mirroring the marker kinds. */
export const MARKER_IMAGE_IDS: Record<MarkerKind, string> = {
	located: 'marker-located',
	search: 'marker-search',
	residence: 'marker-residence',
	former: 'marker-former'
};

/** Drawn box in CSS pixels. Generous enough for the diamond's diagonal. */
export const MARKER_BOX = 24;

/**
 * Draw one marker shape into a 2D context, centred in a MARKER_BOX square that
 * has already been scaled by `pixelRatio`.
 *
 * `onDark` picks the halo colour: markers sit on a light basemap, so a white
 * outline is what separates them from the tiles underneath.
 */
export function drawMarker(
	ctx: CanvasRenderingContext2D,
	shape: MarkerShape,
	color: string,
	halo = '#ffffff'
): void {
	const c = MARKER_BOX / 2;
	ctx.lineJoin = 'round';

	switch (shape) {
		case 'disc': {
			ctx.beginPath();
			ctx.arc(c, c, 7.5, 0, Math.PI * 2);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.lineWidth = 2.5;
			ctx.strokeStyle = halo;
			ctx.stroke();
			break;
		}
		case 'ring': {
			// A hollow target: pale centre, thick coloured rim, small core dot.
			// Reads as clearly "not filled in" — which is the point, the work
			// has not been found yet.
			ctx.beginPath();
			ctx.arc(c, c, 7.5, 0, Math.PI * 2);
			ctx.fillStyle = halo;
			ctx.fill();
			ctx.lineWidth = 3;
			ctx.strokeStyle = color;
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(c, c, 2.6, 0, Math.PI * 2);
			ctx.fillStyle = color;
			ctx.fill();
			break;
		}
		case 'diamond': {
			const r = 8.5;
			ctx.beginPath();
			ctx.moveTo(c, c - r);
			ctx.lineTo(c + r, c);
			ctx.lineTo(c, c + r);
			ctx.lineTo(c - r, c);
			ctx.closePath();
			ctx.fillStyle = color;
			ctx.fill();
			ctx.lineWidth = 2.5;
			ctx.strokeStyle = halo;
			ctx.stroke();
			break;
		}
		case 'dashed-ring': {
			// Matches the legend's dashed swatch. The old ghost marker was a
			// solid hollow circle, so map and legend disagreed.
			ctx.beginPath();
			ctx.arc(c, c, 7, 0, Math.PI * 2);
			ctx.lineWidth = 2.5;
			ctx.strokeStyle = color;
			ctx.setLineDash([3.2, 2.8]);
			ctx.stroke();
			ctx.setLineDash([]);
			break;
		}
	}
}

/**
 * Render every marker shape and register it with the map under its image id.
 *
 * Drawn at the device pixel ratio so the shapes stay crisp on retina screens;
 * `colors` comes from the design tokens, so the map cannot drift from the
 * legend. Safe to call again after a style reload — existing images are
 * replaced rather than duplicated.
 */
export function registerMarkerIcons(
	map: {
		addImage: (id: string, img: ImageData, opts?: { pixelRatio?: number }) => void;
		hasImage: (id: string) => boolean;
		removeImage: (id: string) => void;
	},
	colors: Record<MarkerKind, string>,
	pixelRatio = 2
): void {
	for (const kind of Object.keys(MARKER_SPECS) as MarkerKind[]) {
		const canvas = document.createElement('canvas');
		canvas.width = MARKER_BOX * pixelRatio;
		canvas.height = MARKER_BOX * pixelRatio;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.scale(pixelRatio, pixelRatio);
		drawMarker(ctx, MARKER_SPECS[kind].shape, colors[kind]);

		const id = MARKER_IMAGE_IDS[kind];
		if (map.hasImage(id)) map.removeImage(id);
		map.addImage(id, ctx.getImageData(0, 0, canvas.width, canvas.height), { pixelRatio });
	}
}
