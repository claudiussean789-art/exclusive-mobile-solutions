const propertyId = (import.meta.env.VITE_TAWK_PROPERTY_ID as string | undefined) || '6af3f4d2bb94a03c3ed98753';
const widgetId = (import.meta.env.VITE_TAWK_WIDGET_ID as string | undefined) || '1k74hh5p7';

export const loadLiveChat = () => {
	if (!propertyId || !widgetId || document.getElementById('tawk-live-chat')) return;
	const tawkWindow = window as typeof window & {
		Tawk_API?: Record<string, unknown>;
		Tawk_LoadStart?: Date;
	};
	tawkWindow.Tawk_API = tawkWindow.Tawk_API || {};
	tawkWindow.Tawk_API.customStyle = {
		visibility: {
			desktop: { position: 'tr', xOffset: '15px', yOffset: '80px' },
			mobile: { position: 'tr', xOffset: '15px', yOffset: '80px' },
		},
	};
	tawkWindow.Tawk_LoadStart = new Date();

	const script = document.createElement('script');
	script.id = 'tawk-live-chat';
	script.async = true;
	script.src = `https://embed.tawk.to/${encodeURIComponent(propertyId)}/${encodeURIComponent(widgetId)}`;
	script.charset = 'UTF-8';
	script.setAttribute('crossorigin', '*');
	const firstScript = document.getElementsByTagName('script')[0];
	if (firstScript?.parentNode) firstScript.parentNode.insertBefore(script, firstScript);
	else document.head.appendChild(script);
};
