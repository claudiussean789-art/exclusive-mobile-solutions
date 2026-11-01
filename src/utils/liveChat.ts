const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID as string | undefined;
const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID as string | undefined;

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
