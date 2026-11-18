/** Today's date in UTC as YYYY-MM-DD: the accessed date of citations and exports. */
export function isoToday(): string {
	return new Date().toISOString().slice(0, 10);
}
