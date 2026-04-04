class ToggleSwitch extends HTMLElement {
	connectedCallback() {
		const checkbox = this.querySelector('input[type="checkbox"]');
		if (!checkbox) return;

		checkbox.addEventListener("change", () => {
			this.toggleAttribute("checked", checkbox.checked);
		});
	}
}

customElements.define("toggle-switch", ToggleSwitch);
