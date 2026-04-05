/** Returns the status emoji for a filter or tag name. */
export function getStatusIcon(
	name: string,
	coreNames: Set<string>,
	shimMap: Map<string, { status: string }>,
): string {
	if (coreNames.has(name)) return "✅";
	const shim = shimMap.get(name);
	if (shim) return shim.status === "parity" ? "✅" : "☑️";
	return "";
}

/** Returns the status emoji and source label for a filter or tag name. */
export function getStatusWithLabel(
	name: string,
	coreNames: Set<string>,
	shimMap: Map<string, { status: string }>,
): { icon: string; label: string } {
	if (coreNames.has(name)) return { icon: "✅", label: "LiquidJS" };
	const shim = shimMap.get(name);
	if (shim) {
		return {
			icon: shim.status === "parity" ? "✅" : "☑️",
			label: "Assay",
		};
	}
	return { icon: "", label: "" };
}
