/**
 * Formats a markdown table with aligned columns.
 */
export function formatTable(headers: string[], rows: string[][]): string[] {
	const columnCount = headers.length;

	const widths = headers.map((header, index) => {
		const cellWidths = rows.map((row) => displayWidth(row[index] ?? ""));
		return Math.max(displayWidth(header), 1, ...cellWidths);
	});

	const separator = widths.map((width) => "-".repeat(width));

	return [
		formatRow(headers, widths, columnCount),
		formatRow(separator, widths, columnCount),
		...rows.map((row) => formatRow(row, widths, columnCount)),
	];
}

function formatRow(
	cells: string[],
	widths: number[],
	columnCount: number,
): string {
	const padded = Array.from({ length: columnCount }, (_, index) => {
		const cell = cells[index] ?? "";
		const padding = widths[index] - displayWidth(cell);
		return cell + " ".repeat(Math.max(0, padding));
	});
	return `| ${padded.join(" | ")} |`;
}

/** Approximate display width, accounting for emoji rendering as double-width in monospace. */
function displayWidth(text: string): number {
	let width = 0;
	for (const char of text) {
		const code = char.codePointAt(0) ?? 0;
		if (code === 0xfe0f) {
			// Variation selector — no display width
		} else if (code > 0x1f000 || (code >= 0x2600 && code <= 0x27bf)) {
			// Emoji — renders double-width in monospace
			width += 2;
		} else {
			width += 1;
		}
	}
	return width;
}
