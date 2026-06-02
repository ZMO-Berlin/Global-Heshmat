/**
 * Escape the five XML predefined entities. Use on any user- or data-driven
 * string before interpolating it into raw XML output (sitemap, RSS, etc.).
 */
export function escapeXml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
