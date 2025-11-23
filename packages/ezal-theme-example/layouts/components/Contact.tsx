import { URL } from 'ezal';

export default (options?: { style?: JSX.IntrinsicAttributes['style'] }) => (
	<div class="contact" style={options?.style}>
		{context.theme.contact?.map(({ url, name, icon, color }) => (
			<a
				class={`icon-${icon}`}
				href={URL.for(url)}
				title={name}
				style={{ $color: color }}
			></a>
		))}
	</div>
);
