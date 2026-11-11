import type { WholesaleService } from './wholesaleServices';

export const pixelServices: WholesaleService[] = [
	{
		id: 'pixel-service-tool-refill-credits',
		title: 'Pixel Service Tool - Refill Credits',
		tags: ['Google Pixel', 'Pixel', 'Service Tool', 'Credits'],
		category: 'Pixel Service',
		price: 0.55,
		time: 'Digital',
		status: 'INSTANT',
		description: 'Refill credits for an existing Pixel Service Tool account. Use only with an account you own or are authorized to manage.',
		logo: '/images/tools/google-pixel.svg',
		identifierType: 'account',
		identifierLabel: 'Pixel Service Tool account email or username',
	},
	{
		id: 'pixel-carrier-unlock-magic-one-click',
		title: 'Google Pixel Carrier Unlock 100% Windows Tool | Magic One Click | 6|7|8|9|10|11 Series Supported',
		tags: ['Google Pixel', 'Pixel', 'Carrier Unlock', 'Windows Tool', 'Magic One Click'],
		category: 'Pixel Service',
		price: 18.9,
		time: '1-5 Minutes',
		status: 'INSTANT',
		description: 'Permanent Google Pixel carrier unlock by serial number with the Magic One Click Windows tool, version 2.1. Supports Pixel 6 to 11 series and Pixel Tablet. Requires a Windows PC. Delivered in minutes.',
		logo: '/images/tools/google-pixel.svg',
		identifierLabel: 'Serial number',
	},
];
