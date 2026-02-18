import { URL } from 'ezal';

export default (options?: { style?: JSX.IntrinsicAttributes['style'] }) => (
	<div class="contact" style={options?.style}>
		{context.theme.contact?.map(({ url, name, icon, color }) => (
			<a
				class={`icon-${icon}`}
				href={URL.for(url)}
				aria-label={name}
				title={name}
				style={{ $color: color }}
			>
				<div class="sr-only">{name}</div>
			</a>
		))}
	</div>
);
