import type { Liquid } from "liquidjs";

type ShimStatus = "parity" | "mock";
type ImplementationTag = Parameters<Liquid["registerTag"]>[1];

interface ShimBase {
	name: string;
	status: ShimStatus;
	description?: string;
}

export interface ShimFilter extends ShimBase {
	type: "filter";
	implementation: (value: unknown, ...args: unknown[]) => unknown;
}

export interface ShimTag extends ShimBase {
	type: "tag";
	implementation: ImplementationTag;
}
