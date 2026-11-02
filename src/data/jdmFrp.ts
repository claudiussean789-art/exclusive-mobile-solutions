export const jdmFrpPrice = 40;
export const samsungUltraFrpPrice = 90;
export const samsungUltraFrpModels = [
	'Galaxy S22 Ultra',
	'Galaxy S23 Ultra',
	'Galaxy S24 Ultra',
	'Galaxy S25 Ultra',
	'Galaxy S26 Ultra',
] as const;

export const jdmFrpModels = [
	'Galaxy A02', 'Galaxy A02s', 'Galaxy A03 Core', 'Galaxy A03', 'Galaxy A03s',
	'Galaxy A04e', 'Galaxy A04', 'Galaxy A04s', 'Galaxy A05', 'Galaxy A05s',
	'Galaxy A06', 'Galaxy A06 5G', 'Galaxy A07', 'Galaxy A07 5G',
	'Galaxy A10', 'Galaxy A10s', 'Galaxy A11', 'Galaxy A12', 'Galaxy A12 Nacho',
	'Galaxy A13 4G', 'Galaxy A13 5G', 'Galaxy A14 4G', 'Galaxy A14 5G',
	'Galaxy A15 4G', 'Galaxy A15 5G', 'Galaxy A16 4G', 'Galaxy A16 5G',
	'Galaxy A17 4G', 'Galaxy A17 5G', 'Galaxy A20s', 'Galaxy A21s',
	'Galaxy A22 4G', 'Galaxy A22 5G', 'Galaxy A23 4G', 'Galaxy A23 5G',
	'Galaxy A24', 'Galaxy A25', 'Galaxy A30s', 'Galaxy A31',
	'Galaxy A32 4G', 'Galaxy A32 5G', 'Galaxy A33 5G', 'Galaxy A34 5G',
	'Galaxy A35 5G', 'Galaxy A36 5G', 'Galaxy A50', 'Galaxy A51', 'Galaxy A52',
	'Galaxy A53 5G', 'Galaxy A54 5G',
] as const;

// Must match the slug used by the catalog migration so server pricing finds the item.
export const jdmFrpId = (model: string) => `jdm-frp-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
export const jdmFrpName = (model: string) => `Samsung JDM FRP — ${model}`;
export const samsungUltraFrpId = (model: string) => `samsung-ultra-frp-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
export const samsungUltraFrpName = (model: string) => `Samsung FRP — ${model}`;
export const samsungUsaAndroid16FrpId = 'samsung-usa-android-16-frp-may-2026';
export const samsungUsaAndroid16FrpName = 'Samsung USA Models Android 16 FRP — May 2026 Security Patch';
export const samsungUsaAndroid16FrpPrice = 40;
export const icloudIphone5ToXId = 'icloud-remove-iphone-5-x';
export const icloudIphone5ToXName = 'iCloud Remove — iPhone 5 to X Series';
export const icloudIphone5ToXPrice = 60;
export const icloudServiceProducts = [
	{
		id: icloudIphone5ToXId,
		name: icloudIphone5ToXName,
		title: 'iPhone 5 to X Series',
		detail: 'Enter the device\'s IMEI (15 digits) or serial number to request service.',
		price: icloudIphone5ToXPrice,
		search: 'icloud remove iphone 5 6 7 8 x series imei serial',
	},
	{
		id: 'iremove-tool-bypass-a12-no-signal-ios-17-26-1',
		name: 'iRemove Tool Bypass A12+ (No Signal) — iOS 17.0.1 to 26.1 — Mac/Windows',
		title: 'iRemove Tool Bypass A12+ — No Signal',
		detail: 'iOS 17.0.1 to 26.1. Platform support: Mac and Windows. Enter the device\'s IMEI or serial number to request service.',
		price: 20,
		search: 'iremove tool bypass a12 no signal ios 17 26 mac windows icloud imei serial',
	},
	{
		id: 'iremove-icloud-bypass-with-signal-iphone-11-13-se',
		name: 'iRemove iCloud Bypass With Signal — iPhone 11 / 12 / 13 / SE2 / SE3',
		title: 'iRemove iCloud Bypass With Signal',
		detail: 'iPhone 11 / 12 / 13 / SE2 / SE3. Enter the device\'s IMEI or serial number to request service.',
		price: 60,
		search: 'iremove icloud bypass with signal iphone 11 12 13 se2 se3 se imei serial',
	},
	{
		id: 'iremove-icloud-bypass-with-signal-iphone-14-16',
		name: 'iRemove iCloud Bypass With Signal — iPhone 14 / 15 / 16',
		title: 'iRemove iCloud Bypass With Signal',
		detail: 'iPhone 14 / 15 / 16. Enter the device\'s IMEI or serial number to request service.',
		price: 90,
		search: 'iremove icloud bypass with signal iphone 14 15 16 imei serial',
	},
	{
		id: 'ikeypro-a12-activator-hello-bypass-no-signal',
		name: 'iKeyPro A12+ Activator Hello Screen Bypass No Signal — iPhone XR to 17 Pro Max & iPads All Models [Windows Tool]',
		title: 'iKeyPro A12+ Activator — Hello Screen Bypass (No Signal)',
		detail: 'iPhone XR to 17 Pro Max and iPads, all models. Windows tool. Enter the device\'s IMEI or serial number to request service.',
		price: 2,
		search: 'ikeypro a12 activator hello screen bypass no signal iphone xr 17 pro max ipad ipads windows tool icloud imei serial',
	},
] as const;
