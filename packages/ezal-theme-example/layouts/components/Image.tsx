import { URL } from 'ezal';

const { page, getImageInfo, mime } = context;

export default ({
	url,
	alt,
	...extra
}: { url: string; alt: string } & JSX.IntrinsicAttributes) => {
	const info = getImageInfo(URL.resolve(page.url, url));
	if (!info.rule)
		return (
			<img
				src={URL.for(url)}
				alt={alt}
				width={info.metadata?.width}
				height={info.metadata?.height}
				style={{ $imgColor: info.metadata?.color }}
				loading="lazy"
				{...extra}
			/>
		);
	return (
		<picture>
			{info.rule.slice(0, -1).map((ext) => (
				<source
					srcset={URL.for(URL.encode(URL.extname(url, `.opt${ext}`)))}
					type={mime.lookup(ext) as any}
				/>
			))}
			<img
				src={URL.for(URL.encode(URL.extname(url, info.rule.at(-1))))}
				alt={alt}
				width={info.metadata?.width}
				height={info.metadata?.height}
				style={{ $imgColor: info.metadata?.color }}
				loading="lazy"
				{...extra}
			/>
		</picture>
	);
};
