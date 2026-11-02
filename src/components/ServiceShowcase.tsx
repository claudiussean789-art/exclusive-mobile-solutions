import { useEffect, useState } from 'react';

export type ShowcaseTarget = 'devices' | 'repairs' | 'wholesale' | 'credits' | 'icloud' | 'giftcards';

type Slide = {
	badge: string;
	icon: string;
	title: string;
	text: string;
	chips: string[];
	target: ShowcaseTarget;
	accent: string;
	glow: string;
};

const slides: Slide[] = [
	{ badge: 'NEW RELEASE', icon: '⌚', title: 'iWatch FMI OFF', text: 'Turn off Find My on Apple Watch WiFi models using only the serial number.', chips: ['15 models', 'Series 1–11', 'SE 1st–3rd Gen', 'Serial number only'], target: 'icloud', accent: '#818cf8', glow: 'from-indigo-500/40 via-[#0b0b2e] to-[#050d22]' },
	{ badge: 'HOT SERVICE', icon: '☁', title: 'iCloud Remove', text: 'iPhone 5–X, A12+ bypass and iRemove tools with or without signal.', chips: ['iPhone 5–17', 'IMEI / Serial', 'Mac / Windows'], target: 'icloud', accent: '#a78bfa', glow: 'from-purple-600/40 via-[#150b2e] to-[#050d22]' },
	{ badge: 'SERVICE TOOL', icon: '🔧', title: 'Samsung FRP', text: 'Remove FRP on Samsung USA and Android 16 devices fast.', chips: ['Android 16', 'USA models', 'IMEI box'], target: 'repairs', accent: '#fb923c', glow: 'from-orange-600/40 via-[#2a1205] to-[#050d22]' },
	{ badge: 'TOOL', icon: '≋', title: 'Server Credits', text: 'Activations and credit packs for popular service tools.', chips: ['Samkey', 'Instant top-up', 'Min 30 credits'], target: 'credits', accent: '#2dd4bf', glow: 'from-teal-500/40 via-[#052a2a] to-[#050d22]' },
	{ badge: 'POPULAR', icon: '🔓', title: 'Network Unlocking', text: 'Carrier unlock iPhone and Android devices using IMEI.', chips: ['All carriers', 'IMEI only', 'Fast delivery'], target: 'devices', accent: '#38bdf8', glow: 'from-sky-500/40 via-[#06223a] to-[#050d22]' },
	{ badge: 'WHOLESALE', icon: '📦', title: 'Wholesale Services', text: 'Bulk and reseller pricing on Pixel checks and more.', chips: ['Pixel', 'Reseller rates', 'IMEI / Serial'], target: 'wholesale', accent: '#f472b6', glow: 'from-pink-600/40 via-[#2a0b1e] to-[#050d22]' },
	{ badge: 'DIGITAL', icon: '🎁', title: 'Digital Gift Cards', text: 'PSN, Apple, Paysafecard and Google Play codes by email.', chips: ['PSN', 'Apple', 'Paysafe', 'Google Play'], target: 'giftcards', accent: '#facc15', glow: 'from-yellow-500/30 via-[#2a2205] to-[#050d22]' },
];

const ROTATE_MS = 5000;

type Props = { onOrder: (target: ShowcaseTarget) => void };

function ServiceShowcase({ onOrder }: Props) {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (paused) return;
		const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), ROTATE_MS);
		return () => window.clearInterval(timer);
	}, [paused]);

	const featured = slides[index];
	const side = [1, 2, 3].map((offset) => slides[(index + offset) % slides.length]);

	return (
		<div
			className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			aria-roledescription="carousel"
			aria-label="Featured services"
		>
			<div
				className={`relative flex min-h-[320px] flex-col justify-center gap-4 overflow-hidden rounded-2xl border bg-gradient-to-br p-6 sm:min-h-[420px] sm:p-10 ${featured.glow}`}
				style={{ borderColor: `${featured.accent}55` }}
				key={featured.title}
			>
				<div className="pointer-events-none absolute -right-10 top-1/2 hidden h-64 w-64 -translate-y-1/2 rotate-12 rounded-[3rem] border-4 border-slate-700/70 bg-gradient-to-br from-slate-500/40 to-slate-900 shadow-2xl sm:block" />
				<span className="w-fit rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wider text-slate-900" style={{ backgroundColor: featured.accent }}>{featured.badge}</span>
				<span className="grid h-14 w-14 place-items-center rounded-xl border text-2xl" style={{ borderColor: featured.accent }}>{featured.icon}</span>
				<h2 className="relative text-4xl font-extrabold sm:text-6xl">{featured.title}</h2>
				<p className="relative max-w-md text-base text-slate-300">{featured.text}</p>
				<div className="relative flex flex-wrap gap-2">
					{featured.chips.map((chip) => (
						<span className="rounded-full border px-3 py-1 text-xs font-semibold text-slate-200" style={{ borderColor: `${featured.accent}99` }} key={chip}>{chip}</span>
					))}
				</div>
				<button
					className="relative mt-2 w-fit rounded-md border px-5 py-2.5 text-sm font-extrabold tracking-wide text-white hover:bg-white/10"
					style={{ borderColor: featured.accent }}
					type="button"
					onClick={() => onOrder(featured.target)}
				>
					ORDER NOW →
				</button>
				<div className="absolute bottom-4 right-5 flex gap-1.5">
					{slides.map((slide, dot) => (
						<button
							className={`h-2 rounded-full transition-all ${dot === index ? 'w-6' : 'w-2 bg-white/30'}`}
							style={dot === index ? { backgroundColor: featured.accent } : undefined}
							type="button"
							aria-label={`Show ${slide.title}`}
							key={slide.title}
							onClick={() => setIndex(dot)}
						/>
					))}
				</div>
			</div>
			<div className="grid gap-3">
				{side.map((slide) => (
					<div
						className={`relative flex flex-col gap-2 overflow-hidden rounded-2xl border bg-gradient-to-br p-4 ${slide.glow}`}
						style={{ borderColor: `${slide.accent}55` }}
						key={slide.title}
					>
						<span className="w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider" style={{ borderColor: slide.accent, color: slide.accent }}>{slide.badge}</span>
						<div className="flex items-center gap-3">
							<span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border" style={{ borderColor: slide.accent }}>{slide.icon}</span>
							<div>
								<p className="text-lg font-bold leading-tight">{slide.title}</p>
								<p className="text-xs text-slate-300">{slide.text.split('.')[0]}</p>
							</div>
						</div>
						<button
							className="w-fit rounded-md border px-3 py-1.5 text-xs font-extrabold text-white hover:bg-white/10"
							style={{ borderColor: slide.accent }}
							type="button"
							onClick={() => onOrder(slide.target)}
						>
							ORDER NOW →
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

export default ServiceShowcase;
