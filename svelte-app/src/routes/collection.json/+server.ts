import { artworks } from '#lib/data/artworks.js';
import { residences } from '#lib/data/residences.js';
import { exportRecords } from '#lib/utils/exports.js';
export const prerender = true;
export function GET() {
	return Response.json(exportRecords([...artworks, ...residences]));
}
