const propertyId = (import.meta.env.VITE_TAWK_PROPERTY_ID as string | undefined) || '6af3f4d2bb94a03c3ed98753';
const widgetId = (import.meta.env.VITE_TAWK_WIDGET_ID as string | undefined) || '1k74hh5p7';

// Loads the Tawk.to live chat widget. Does nothing until both IDs are configured.
export const loadLiveChat = () => {
	if (!propertyId || !widgetId || document.getElementById('tawk-live-chat')) return;
	const script = document.createElement('script');
	script.id = 'tawk-live-chat';
	script.async = true;
	script.src = `https://embed.tawk.to/${encodeURIComponent(propertyId)}/${encodeURIComponent(widgetId)}`;
	script.charset = 'UTF-8';
	script.setAttribute('crossorigin', '*');
	document.body.appendChild(script);
};
