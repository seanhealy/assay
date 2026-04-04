import type { Liquid } from "liquidjs";

export function registerDefaultFilters(engine: Liquid): void {
	engine.registerFilter("money", (value: unknown): string => {
		if (typeof value === "number") return `$${(value / 100).toFixed(2)}`;
		return String(value ?? "");
	});
}
