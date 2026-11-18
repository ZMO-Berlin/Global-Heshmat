import { entries } from '#lib/data/entries.js';
import { exportRecords } from '#lib/utils/exports.js';
export const prerender = true;
export function GET() {
	return Response.json(exportRecords(entries));
}
