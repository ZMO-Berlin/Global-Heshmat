import { artworks } from '$lib/data/artworks';
import { residences } from '$lib/data/residences';
import { exportRecords } from '$lib/utils/exports';
export const prerender = true;
export function GET() {
	return Response.json(exportRecords([...artworks, ...residences]));
}
