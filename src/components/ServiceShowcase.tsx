export type ShowcaseTarget = 'devices' | 'repairs' | 'wholesale' | 'credits' | 'icloud' | 'giftcards';

type FeaturedService = {
	title: string;
	badge: string;
	icon: string;
	description: string;
	tags: string[];
	target: ShowcaseTarget;
	theme: string;
};

const featuredServices: FeaturedService[] = [
	{
		title: 'iCloud Remove',
		badge: 'HOT SERVICE',
		icon: '☁',
		description: 'iPhone 5–X, A12+ bypass and iRemove tools with or without signal.',
		tags: ['iPhone 5–17', 'IMEI / Serial', 'Mac / Windows'],
		target: 'icloud',
		theme: 'from-purple-600/45 via-[#281050] to-[#050d22]',
	},
	{
		title: 'Samsung FRP',
		badge: 'SERVICE TOOL',
		icon: '🔧',
		description: 'Remote FRP service for supported Samsung USA and Android 16 devices.',
		tags: ['Android 16', 'USA models', 'IMEI required'],
		target: 'repairs',
		theme: 'from-orange-500/40 via-[#341b14] to-[#111827]',
	},
	{
		title: 'Server Credits',
		badge: 'TOOL',
		icon: '≋',
		description: 'Activations and credit packs for popular service tools.',
		tags: ['Samkey', 'Instant top-up', 'Multiple packs'],
		target: 'credits',
		theme: 'from-teal-500/35 via-[#0d2b32] to-[#111827]',
	},
	{
		title: 'Network Unlocking',
		badge: 'POPULAR',
		icon: '🔓',
		description: 'Carrier unlock iPhone and Android devices using IMEI.',
		tags: ['All carriers', 'IMEI only', 'Fast delivery'],
		target: 'devices',
		theme: 'from-sky-500/40 via-[#0d2744] to-[#111827]',
	},
	{
		title: 'Wholesale Services',
		badge: 'WHOLESALE',
		icon: '📦',
		description: 'Bulk and reseller pricing on Pixel checks and more.',
		tags: ['Pixel', 'Reseller rates', 'IMEI / Serial'],
		target: 'wholesale',
		theme: 'from-pink-600/40 via-[#2a0b1e] to-[#050d22]',
	},
	{
		title: 'Digital Gift Cards',
		badge: 'DIGITAL',
		icon: '🎁',
		description: 'PSN, Apple, Paysafecard and Google Play codes by email.',
		tags: ['PSN', 'Apple', 'Paysafecard', 'Google Play'],
		target: 'giftcards',
		theme: 'from-violet-600/40 via-[#21143a] to-[#111827]',
	},
	{
		title: 'iWatch FMI OFF',
		badge: 'NEW RELEASE',
		icon: '⌚',
		description: 'Turn off Find My on Apple Watch WiFi models using the serial number.',
		tags: ['15 models', 'Series 1–11', 'Serial number only'],
		target: 'wholesale',
		theme: 'from-indigo-500/40 via-[#1b2144] to-[#111827]',
	},
];

type Props = { onOrder: (target: ShowcaseTarget) => void };

function ServiceShowcase({ onOrder }: Props) {
	const quickServices = [
		featuredServices[3],
		featuredServices[1],
		featuredServices[0],
		featuredServices[2],
	];

	return (
		<div className="featured-showcase" aria-label="Featured services">
			<div className="showcase-hero">
				<div className="showcase-intro">
					<span className="showcase-eyebrow"><span aria-hidden="true" /> DEVICE CARE &amp; DIGITAL SERVICES</span>
					<h2>Exclusive Mobile <span>Solutions</span></h2>
					<p>Professional mobile services, device unlocking, and trusted tools—all in one place.</p>
					<button className="showcase-browse" type="button" onClick={() => onOrder('devices')}>
						Explore services <span aria-hidden="true">→</span>
					</button>
				</div>

				<article className="unlocktool-feature">
					<div className="unlocktool-orbit" aria-hidden="true">
						<span className="unlocktool-lock">⌑</span>
					</div>
					<div className="unlocktool-copy">
						<span className="unlocktool-badge">INSTANT ACTIVATION</span>
						<h3>UnlockTool</h3>
						<p>Official digital license for supported mobile servicing tools.</p>
						<button type="button" onClick={() => onOrder('credits')}>
							View tool credits <span aria-hidden="true">↗</span>
						</button>
					</div>
					<span className="unlocktool-mark" aria-hidden="true">UT</span>
				</article>
			</div>

			<div className="showcase-services" aria-label="Browse popular services">
				{quickServices.map((service, index) => (
					<button
						className={`showcase-service service-accent-${index + 1}`}
						key={service.title}
						type="button"
						onClick={() => onOrder(service.target)}
					>
						<span className="showcase-service-icon" aria-hidden="true">{service.icon}</span>
						<span className="showcase-service-copy">
							<strong>{service.title}</strong>
							<span>{service.description}</span>
						</span>
						<span className="showcase-service-arrow" aria-hidden="true">↗</span>
					</button>
				))}
			</div>
		</div>
	);
}

export default ServiceShowcase;
