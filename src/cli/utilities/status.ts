export function statusIcon(status: string | undefined): string {
	if (status === "parity") return "✅";
	if (status === "mock") return "☑️";
	return "";
}
