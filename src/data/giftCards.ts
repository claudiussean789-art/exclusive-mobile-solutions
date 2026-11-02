export const giftCardValues = [10, 25, 50, 100] as const;

// Customer price is face value plus 5%.
const giftCardMarkup = 1.05;

export const giftCardBrands = [
	{ id: 'psn', name: 'PlayStation (PSN)' },
	{ id: 'apple', name: 'Apple / iTunes' },
	{ id: 'paysafe', name: 'Paysafecard' },
	{ id: 'google', name: 'Google Play' },
] as const;

export type GiftCardProduct = {
	id: string;
	brand: string;
	name: string;
	value: number;
	price: number;
};

export const giftCardProducts: GiftCardProduct[] = giftCardBrands.flatMap((brand) =>
	giftCardValues.map((value) => ({
		id: `giftcard-${brand.id}-${value}`,
		brand: brand.name,
		name: `${brand.name} Digital Gift Card — $${value}`,
		value,
		price: Math.round(value * giftCardMarkup * 100) / 100,
	})),
);
