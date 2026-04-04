import { registerFilter } from "@augeo/assay";

// Register Shopify filters not yet included in assay
registerFilter("upcase_first", (value: unknown): string => {
	const str = String(value ?? "");
	return str.charAt(0).toUpperCase() + str.slice(1);
});
