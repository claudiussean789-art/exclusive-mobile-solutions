export const giftCardValues = [10, 25, 50, 100] as const;

// Customer price is face value plus 5% plus a flat $5.
const giftCardMarkup = 1.05;
const giftCardFlatFee = 5;

export const giftCardBrands = [
	{ id: 'psn', name: 'PlayStation (PSN)' },
	{ id: 'apple', name: 'Apple / iTunes' },
	{ id: 'paysafe', name: 'Paysafecard' },
	{ id: 'google', name: 'Google Play' },
	{ id: 'pubg', name: 'PUBG Mobile' },
	{ id: 'newstate', name: 'PUBG New State' },
] as const;

export type GiftCardProduct = {
	id: string;
	brand: string;
	name: string;
	label?: string;
	value: number;
	price: number;
};

const pubgProducts: GiftCardProduct[] = [
	{ id: 'giftcard-pubg-60-uc', brand: 'PUBG Mobile', name: 'PUBG Mobile 60 UC Direct Top-Up – Official', label: '60 UC Direct Top-Up', value: 5, price: 5 },
	{ id: 'giftcard-pubg-325-uc', brand: 'PUBG Mobile', name: 'PUBG Mobile 325 UC Direct Top-Up – Official', label: '325 UC Direct Top-Up', value: 10, price: 10 },
	{ id: 'giftcard-pubg-660-uc', brand: 'PUBG Mobile', name: 'PUBG Mobile 660 UC Direct Top-Up – Official', label: '660 UC Direct Top-Up', value: 20, price: 20 },
	{ id: 'giftcard-pubg-8100-uc', brand: 'PUBG Mobile', name: 'PUBG Mobile 8100 UC Direct Top-Up – Official', label: '8100 UC Direct Top-Up', value: 115, price: 115 },
];

const newStateProducts: GiftCardProduct[] = [
	{ id: 'giftcard-newstate-300', brand: 'PUBG New State', name: 'PUBG New State 300 NC PIN', label: '300 NC PIN', value: 300, price: 1.5 },
	{ id: 'giftcard-newstate-1500', brand: 'PUBG New State', name: 'PUBG New State 1500 NC + 80 Bonus PIN', label: '1500 NC + 80 Bonus PIN', value: 1500, price: 8.95 },
	{ id: 'giftcard-newstate-3600', brand: 'PUBG New State', name: 'PUBG New State 3600 NC + 250 Bonus PIN', label: '3600 NC + 250 Bonus PIN', value: 3600, price: 17.95 },
	{ id: 'giftcard-newstate-9300', brand: 'PUBG New State', name: 'PUBG New State 9300 NC + 930 Bonus PIN', label: '9300 NC + 930 Bonus PIN', value: 9300, price: 37.27 },
	{ id: 'giftcard-newstate-15000', brand: 'PUBG New State', name: 'PUBG New State 15000 NC + 1800 Bonus PIN', label: '15000 NC + 1800 Bonus PIN', value: 15000, price: 60.35 },
	{ id: 'giftcard-newstate-30000', brand: 'PUBG New State', name: 'PUBG New State 30000 NC + 5000 Bonus PIN', label: '30000 NC + 5000 Bonus PIN', value: 30000, price: 110.95 },
];

export const giftCardProducts: GiftCardProduct[] = [...giftCardBrands.filter((brand) => brand.id !== 'pubg' && brand.id !== 'newstate').flatMap((brand) =>
	giftCardValues.map((value) => ({
		id: `giftcard-${brand.id}-${value}`,
		brand: brand.name,
		name: `${brand.name} Digital Gift Card — $${value}`,
		value,
		price: Math.round((value * giftCardMarkup + giftCardFlatFee) * 100) / 100,
	})),
), ...pubgProducts, ...newStateProducts];
