export default () => (
	<dialog class="rounded search">
		<div class="search-bar">
			<input
				type="search"
				id="search-input"
				class="search-input"
				placeholder="键入以搜索..."
			/>
			<button
				class="icon-close link"
				title="关闭"
				type="button"
				id="search-close"
			></button>
		</div>
		<progress></progress>
		<div class="search-result"></div>
	</dialog>
);
