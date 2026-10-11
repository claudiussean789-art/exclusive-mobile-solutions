import { FormEvent, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  FileCheck2,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Minus,
  MoveRight,
  Plus,
  ShoppingBag,
  Smartphone,
  Tablet,
  Monitor,
  Cpu,
  X,
  ShieldCheck,
  WalletCards,
  Wrench,
  Zap,
  Globe,
  Clock,
  Wifi,
  MonitorSmartphone,
  Bitcoin,
  Copy,
  AlertCircle,
} from 'lucide-react';

const repairImage = 'https://images.pexels.com/photos/6755075/pexels-photo-6755075.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const deviceImage = 'https://images.pexels.com/photos/6754839/pexels-photo-6754839.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const promoMessages = [
  'FRP REMOVAL — SAMSUNG, LG, NOKIA & MORE',
  'NEW: GOOGLE PIXEL CARRIER UNLOCK TOOL — ONE-CLICK',
  'RAMDISK A12–A13 WINDOWS TOOL V1.5 NOW AVAILABLE',
  'REMOTE FRP & iCLOUD BYPASS — ANYDESK / TEAMVIEWER',
  'CRYPTO PAYMENTS NOW ACCEPTED — USDT & BINANCE PAY',
  'JDM FRP BYPASS — ANDROID 14–17 SUPPORTED',
];

const benefits = [
  { icon: FileCheck2, title: 'Proof of ownership', text: 'Unlocking and account-recovery work is only done for verified owners. Proof of ownership may be required.' },
  { icon: Zap, title: 'Fast', text: 'Many unlocks and repairs are completed the same day.' },
  { icon: BadgeCheck, title: 'Professional', text: 'Experienced technicians and the right tools for each brand.' },
  { icon: LockKeyhole, title: 'Confidential', text: 'Your data and personal information stay private.' },
];

type Product = {
  id: number;
  name: string;
  category: 'iPhone' | 'iPad' | 'Samsung' | 'Tecno' | 'Xiaomi' | 'LG' | 'Nokia' | 'Google Pixel';
  price: string;
  accent: string;
};

const products: Product[] = [
  { id: 1, name: 'iPhone 14 Pro', category: 'iPhone', price: '$650 USD', accent: 'violet' },
  { id: 2, name: 'iPhone 13 · Grade A', category: 'iPhone', price: '$480 USD', accent: 'silver' },
  { id: 5, name: 'Tecno Camon 20 Pro', category: 'Tecno', price: '$220 USD', accent: 'teal' },
  { id: 6, name: 'Tecno Spark 10 Pro', category: 'Tecno', price: '$160 USD', accent: 'amber' },
  { id: 7, name: 'Xiaomi Redmi Note 12', category: 'Xiaomi', price: '$180 USD', accent: 'orange' },
  { id: 8, name: 'Xiaomi 13 Pro', category: 'Xiaomi', price: '$580 USD', accent: 'rose' },
  { id: 14, name: 'iPad mini (5th Gen)', category: 'iPad', price: '$320 USD', accent: 'ipad-gold' },
  { id: 15, name: 'iPad Air (3rd Gen)', category: 'iPad', price: '$380 USD', accent: 'ipad-silver' },
  { id: 16, name: 'iPad (8th Gen)', category: 'iPad', price: '$290 USD', accent: 'ipad-space' },
  { id: 17, name: 'iPad (9th Gen)', category: 'iPad', price: '$310 USD', accent: 'ipad-rose' },
];

type FrpDevice = { name: string; price: string };

type FrpService = {
  category: 'Samsung' | 'LG' | 'Nokia' | 'Google Pixel';
  title: string;
  devices: FrpDevice[];
};

const frpServices: FrpService[] = [
  { category: 'Samsung', title: 'Samsung FRP Removal', devices: [
    { name: 'Galaxy S22', price: '$30 USD' },
    { name: 'Galaxy A54', price: '$30 USD' },
  ]},
  { category: 'LG', title: 'LG FRP Removal', devices: [
    { name: 'LG Stylo 6', price: '$40 USD' },
    { name: 'LG Velvet', price: '$40 USD' },
  ]},
  { category: 'Nokia', title: 'Nokia FRP Removal', devices: [
    { name: 'Nokia G42 5G', price: '$40 USD' },
    { name: 'Nokia C32', price: '$40 USD' },
  ]},
];

type PixelService = {
  id: string;
  title: string;
  badge: string;
  price: string;
  features: string[];
  ctaLabel: string;
  ctaText: string;
};

const pixelServices: PixelService[] = [
  {
    id: 'pixel-unlock',
    title: 'Carrier Unlock',
    badge: 'ONE-CLICK · WINDOWS TOOL',
    price: '$50 USD',
    features: [
      'One-Click Carrier Unlock',
      'Pixel 6 / 7 / 8 / 9 / 10 Series Supported',
      '100% Windows Tool',
      'Fast & Stable',
      'Easy to Use',
    ],
    ctaLabel: 'Get the unlock tool',
    ctaText: 'Hi, I am interested in the Google Pixel Carrier Unlock Tool (Windows)',
  },
  {
    id: 'pixel-credits',
    title: 'Pixel Service Tool Credits',
    badge: 'SERVER CREDITS · PAY-AS-YOU-GO',
    price: '$25 USD / 5 credits',
    features: [
      'Credits for Pixel Service Tool',
      '1 Credit = 1 Unlock Operation',
      'No Expiration on Unused Credits',
      'Instant Activation After Payment',
      'Bulk Credit Packages Available',
    ],
    ctaLabel: 'Buy tool credits',
    ctaText: 'Hi, I would like to buy Pixel Service Tool credits',
  },
  {
    id: 'gpixel-pro',
    title: 'GPixel Pro',
    badge: 'PREMIUM · ALL-IN-ONE PACKAGE',
    price: '$120 USD',
    features: [
      'Unlimited Carrier Unlocks for 30 Days',
      'All Pixel Series 6–10 Supported',
      'Priority Server Access',
      'Free Updates During Subscription',
      'Dedicated WhatsApp Support Line',
    ],
    ctaLabel: 'Get GPixel Pro',
    ctaText: 'Hi, I am interested in the GPixel Pro premium package',
  },
];

const jdmModels = [
  'A02', 'A03', 'A03s', 'A04', 'A05', 'A05s', 'A06', 'A07', 'A12', 'A13', 'A14', 'A15', 'A16',
];

const ikeyWhatsNew = [
  'Custom SN Write',
  'WiFi MAC Write',
  'Bluetooth MAC Write',
  'DFU Helper Added',
];

const ikeyKeyFeatures = [
  'Passcode Bypass with Signal',
  'Hello Screen Bypass (No Signal) — Supports iOS 15–26.6',
  'Auto Serial Number Change',
  'Camera & Touch ID Working',
  'iCloud Login & Apple Store Supported',
];

const ikeyIphones = [
  'iPhone XS', 'iPhone XS Max', 'iPhone XR', 'iPhone SE 2',
  'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
];

const ikeyIpads = [
  'iPad mini (5th Generation)',
  'iPad Air (3rd Generation)',
  'iPad (8th Generation)',
  'iPad (9th Generation)',
];

const steps = [
  ['01', 'Tell us the device', 'Pick your service and send the device model through checkout or WhatsApp.'],
  ['02', 'Verify ownership', 'For unlocks and account recovery, we confirm you are the verified owner.'],
  ['03', 'Pay securely', 'Get your quote and pay with Lynk, Payoneer, or crypto (USDT / Binance Pay).'],
  ['04', 'Back in your hand', 'We complete the work fast and confirm everything is working.'],
];

const usdtAddress = 'TQn9Y2khEsLJ7p5kXkRrE4Q8mN3vY6bW1Z';

function App() {
  const [payment, setPayment] = useState<'local' | 'payoneer' | 'crypto'>('local');
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'iPhone' | 'iPad' | 'Samsung' | 'Tecno' | 'Xiaomi' | 'LG' | 'Nokia' | 'Google Pixel'>('All');
  const [cart, setCart] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [frpDeviceIndex, setFrpDeviceIndex] = useState(0);
  const [frpImei, setFrpImei] = useState('');
  const [cryptoOpen, setCryptoOpen] = useState(false);
  const [txid, setTxid] = useState('');
  const [txidSubmitted, setTxidSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredProducts = selectedCategory === 'All' ? products : products.filter((product) => product.category === selectedCategory);
  const cartProducts = cart.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => product !== undefined);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function scrollToCheckout() {
    document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' });
  }

  function addToCart(productId: number) {
    setCart((currentCart) => [...currentCart, productId]);
  }

  function removeFromCart(productId: number) {
    setCart((currentCart) => {
      const index = currentCart.indexOf(productId);
      return index === -1 ? currentCart : [...currentCart.slice(0, index), ...currentCart.slice(index + 1)];
    });
  }

  function openStore() {
    document.getElementById('store')?.scrollIntoView({ behavior: 'smooth' });
  }

  function openCryptoModal() {
    setTxid('');
    setTxidSubmitted(false);
    setCryptoOpen(true);
  }

  function handleTxidSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTxidSubmitted(true);
  }

  function copyAddress() {
    navigator.clipboard.writeText(usdtAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(false);
    });
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Exclusive Mobile Solution home">
          <span className="brand-mark"><ShieldCheck size={27} strokeWidth={2.3} /></span>
          <span className="brand-name">EXCLUSIVE MOBILE SOLUTION</span>
        </a>
        <div className="header-actions">
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Open cart with ${cart.length} items`}>
            <ShoppingBag size={18} /><span>{cart.length}</span>
          </button>
          <button className="button button-small" onClick={scrollToCheckout}>Checkout <ArrowRight size={18} /></button>
        </div>
      </header>

      <div className="ticker-bar" aria-label="Promotional announcements">
        <div className="ticker-track">
          {[...promoMessages, ...promoMessages].map((msg, i) => (
            <span className="ticker-item" key={i}><Check size={14} /> {msg}</span>
          ))}
        </div>
      </div>

      <section className="hero section" id="top">
        <div className="location-pill"><MapPin size={17} /> Pembroke Pines, Florida</div>
        <div className="hero-copy">
          <p className="eyebrow">All mobile device matters</p>
          <h1>EXCLUSIVE<br /><span>MOBILE SOLUTION</span></h1>
          <p className="hero-text">Reliable support for your smartphone — FRP removal, unlocking, Activation Lock assistance for verified owners, repairs, server credits and data transfer. Fast, professional, and confidential service.</p>
          <div className="hero-actions">
            <button className="button" onClick={openStore}>Shop devices <ShoppingBag size={20} /></button>
            <button className="button button-outline" onClick={scrollToCheckout}>Book &amp; pay <ArrowRight size={21} /></button>
            <a className="whatsapp-button" href="https://wa.me/12034235212" target="_blank" rel="noreferrer"><MessageCircle size={22} /> WhatsApp 1-203-423-5212</a>
          </div>
          <div className="ownership-note"><ShieldCheck size={19} /> Proof of ownership may be required.</div>
        </div>
        <div className="image-frame hero-image"><img src={repairImage} alt="Technician repairing a smartphone" /><div className="image-label">Trusted device care</div></div>
      </section>

      <section className="section store-section" id="store">
        <div className="store-heading">
          <div>
            <p className="section-kicker">Available now</p>
            <h2>SHOP DEVICES</h2>
            <p>Quality phones, checked and ready for their next owner. Select a category, add a device, and send your request through WhatsApp.</p>
          </div>
          <div className="category-tabs" role="tablist" aria-label="Device categories">
            {(['All', 'iPhone', 'iPad', 'Samsung', 'Tecno', 'Xiaomi', 'LG', 'Nokia', 'Google Pixel'] as const).map((category) => (
              <button key={category} className={selectedCategory === category ? 'active' : ''} onClick={() => { setSelectedCategory(category); setFrpDeviceIndex(0); setFrpImei(''); }}>{category}</button>
            ))}
          </div>
        </div>
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div className={`device-art ${product.accent}`}><Smartphone size={28} strokeWidth={1.3} /><span>{product.category}</span></div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <strong>{product.price}</strong>
                <button className="add-button" onClick={() => addToCart(product.id)}>Add to cart <Plus size={15} /></button>
              </div>
            </article>
          ))}
          {frpServices.filter((svc) => svc.category === selectedCategory).map((svc) => (
            <article className="frp-service-card" key={svc.category}>
              <div className="frp-service-header">
                <div className="frp-service-icon"><Smartphone size={28} strokeWidth={1.3} /></div>
                <div><span className="product-category">{svc.category}</span><h3>{svc.title}</h3></div>
              </div>
              <div className="frp-service-body">
                <label className="frp-service-label">Select Device
                  <select className="frp-service-select" value={frpDeviceIndex} onChange={(e) => setFrpDeviceIndex(Number(e.target.value))}>
                    {svc.devices.map((device, index) => <option key={device.name} value={index}>{device.name}</option>)}
                  </select>
                  <ChevronDown className="select-icon frp-service-select-icon" size={18} />
                </label>
                <div className="frp-service-price">Price: <strong>{svc.devices[frpDeviceIndex].price}</strong></div>
                <label className="frp-service-label">IMEI / Serial Number
                  <input className="frp-service-input" type="text" placeholder="Enter device IMEI or serial number" value={frpImei} onChange={(e) => setFrpImei(e.target.value)} />
                </label>
                <a className="button frp-service-cta" href={`https://wa.me/12034235212?text=${encodeURIComponent(`Hi, I need ${svc.title} for: ${svc.devices[frpDeviceIndex].name}, Price: ${svc.devices[frpDeviceIndex].price}, IMEI/Serial: ${frpImei || 'Not provided'}`)}`} target="_blank" rel="noreferrer">Request service <ArrowRight size={18} /></a>
              </div>
            </article>
          ))}
        </div>
        <div className="payment-callout">
          <MessageCircle size={25} />
          <div><h3>Checkout &amp; payment information</h3><p>When you place an order, we will confirm the exact price, payment details, and pickup or delivery options directly in your WhatsApp chat.</p></div>
          <button className="text-button" onClick={scrollToCheckout}>Request a quote <ArrowRight size={17} /></button>
        </div>
      </section>

      <section className="section ikey-tool-section" id="ikey-tool">
        <div className="ikey-tool-card">
          <div className="ikey-tool-header">
            <div className="ikey-tool-icon"><Cpu size={32} strokeWidth={2} /></div>
            <div>
              <p className="section-kicker">Ramdisk &middot; V1.5 Released</p>
              <h2>A12&ndash;A13 WINDOWS TOOL</h2>
              <span className="ikey-tool-badge">PASSCODE BYPASS &middot; HELLO SCREEN BYPASS &middot; iOS 15&ndash;26.6</span>
            </div>
          </div>
          <div className="ikey-tool-body">
            <div className="ikey-features-grid">
              <div className="ikey-feature-block">
                <h3 className="ikey-feature-title">What's New</h3>
                <ul className="ikey-feature-list">
                  {ikeyWhatsNew.map((feature) => <li key={feature}><Check size={18} /> {feature}</li>)}
                </ul>
              </div>
              <div className="ikey-feature-block">
                <h3 className="ikey-feature-title">Key Features</h3>
                <ul className="ikey-feature-list">
                  {ikeyKeyFeatures.map((feature) => <li key={feature}><Check size={18} /> {feature}</li>)}
                </ul>
              </div>
            </div>
            <div className="ikey-devices">
              <div className="ikey-device-group">
                <h3 className="ikey-device-title"><Smartphone size={20} /> iPhone</h3>
                <div className="ikey-device-list">
                  {ikeyIphones.map((model) => <span key={model} className="ikey-device-chip">{model}</span>)}
                </div>
              </div>
              <div className="ikey-device-group">
                <h3 className="ikey-device-title"><Tablet size={20} /> iPad</h3>
                <div className="ikey-device-list">
                  {ikeyIpads.map((model) => <span key={model} className="ikey-device-chip">{model}</span>)}
                </div>
              </div>
            </div>
            <a className="button ikey-tool-cta" href={`https://wa.me/12034235212?text=${encodeURIComponent('Hi, I am interested in the Ramdisk A12-A13 Windows Tool V1.5')}`} target="_blank" rel="noreferrer">Get the tool <ArrowRight size={20} /></a>
          </div>
        </div>
      </section>

      <section className="section pixel-catalog-section" id="pixel-catalog">
        <div className="section-intro">
          <p className="section-kicker">Google Pixel Services</p>
          <h2>PIXEL SERVICE CATALOG</h2>
          <p className="pixel-catalog-desc">Full range of Google Pixel unlocking and service tools — from one-click carrier unlocks to server credits and the all-in-one GPixel Pro package.</p>
        </div>
        <div className="pixel-catalog-grid">
          {pixelServices.map((svc) => (
            <article className="pixel-service-card" key={svc.id}>
              <div className="pixel-service-header">
                <div className="pixel-service-icon"><Monitor size={28} strokeWidth={2} /></div>
                <div>
                  <h3>{svc.title}</h3>
                  <span className="pixel-service-badge">{svc.badge}</span>
                </div>
              </div>
              <div className="pixel-service-body">
                <ul className="pixel-service-features">
                  {svc.features.map((f) => <li key={f}><Check size={16} /> {f}</li>)}
                </ul>
                <div className="pixel-service-price">{svc.price}</div>
                <a className="button pixel-service-cta" href={`https://wa.me/12034235212?text=${encodeURIComponent(svc.ctaText)}`} target="_blank" rel="noreferrer">{svc.ctaLabel} <ArrowRight size={18} /></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section jdm-section" id="jdm">
        <div className="jdm-card">
          <div className="jdm-header">
            <div className="jdm-icon"><Smartphone size={26} strokeWidth={2} /></div>
            <div>
              <p className="section-kicker">Samsung JDM Model</p>
              <h2>FRP BYPASS &mdash; ANDROID 14&ndash;17</h2>
              <span className="jdm-badge">LATEST SECURITY UPDATE SUPPORTED</span>
            </div>
          </div>
          <div className="jdm-body">
            <div className="jdm-models">
              {jdmModels.map((model) => <span key={model} className="jdm-model-chip">{model}</span>)}
              <span className="jdm-model-chip jdm-more">&amp; more</span>
            </div>
            <a className="button jdm-cta" href={`https://wa.me/12034235212?text=${encodeURIComponent('Hi, I need Samsung JDM FRP bypass (Android 14-17)')}`} target="_blank" rel="noreferrer">Request FRP bypass <ArrowRight size={18} /></a>
          </div>
        </div>
      </section>

      <section className="section remote-section" id="remote">
        <div className="remote-card">
          <div className="remote-header">
            <div className="remote-icon"><Globe size={32} strokeWidth={2} /></div>
            <div>
              <p className="section-kicker">Remote service</p>
              <h2>FRP &amp; iCLOUD BYPASS &mdash; REMOTE</h2>
              <span className="remote-badge">ANYDESK / TEAMVIEWER &middot; 30 MIN &ndash; 1 HR</span>
            </div>
          </div>
          <div className="remote-body">
            <div className="remote-requirements">
              <h3 className="remote-req-title"><MonitorSmartphone size={20} /> Requirements</h3>
              <ul className="remote-req-list">
                <li><MonitorSmartphone size={18} /> Anydesk or TeamViewer installed</li>
                <li><Wifi size={18} /> Fast internet &mdash; no hotspot</li>
                <li><Clock size={18} /> 30 minutes to 1 hour session time</li>
              </ul>
            </div>
            <a className="button remote-cta" href={`https://wa.me/12034235212?text=${encodeURIComponent('Hi, I need remote FRP / iCloud bypass service')}`} target="_blank" rel="noreferrer">Request remote session <ArrowRight size={20} /></a>
          </div>
        </div>
      </section>

      <section className="section value-section">
        <div className="image-frame secondary-image"><img src={deviceImage} alt="Technician working on a smartphone at a repair bench" /></div>
        <div className="section-intro"><p className="section-kicker">Why us</p><h2>FAST, PROFESSIONAL, AND CONFIDENTIAL SERVICE.</h2></div>
        <div className="benefit-list">{benefits.map(({ icon: Icon, title, text }) => <article className="benefit" key={title}><div className="icon-tile"><Icon size={24} /></div><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </section>

      <section className="section process-section">
        <div className="section-intro"><p className="section-kicker">How it works</p><h2>FOUR SIMPLE STEPS</h2></div>
        <div className="steps">{steps.map(([number, title, text]) => <article className="step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="section checkout-section" id="checkout">
        <div className="section-intro checkout-intro"><p className="section-kicker">Checkout</p><h2>BOOK &amp; PAY YOUR WAY</h2><p>Choose your service and payment method. Your request is sent to us on WhatsApp, we confirm the price for your exact model, then you pay with Lynk, bank transfer, Payoneer, or crypto.</p></div>
        <div className="checkout-payment-container">
          <h3 className="checkout-payment-title">Select Payment Method</h3>
          <p className="checkout-order-total">Order Total: <strong>USD</strong></p>
          <div className="checkout-method-radios">
            <label className={`checkout-method-option ${payment === 'local' ? 'active' : ''}`}>
              <input type="radio" name="paymentMethod" value="local" checked={payment === 'local'} onChange={() => setPayment('local')} />
              <div><strong>Local Transfer (Lynk, NCB, or Scotiabank)</strong><small>Fast mobile wallet or direct online bank deposit</small></div>
            </label>
            <label className={`checkout-method-option ${payment === 'payoneer' ? 'active' : ''}`}>
              <input type="radio" name="paymentMethod" value="payoneer" checked={payment === 'payoneer'} onChange={() => setPayment('payoneer')} />
              <div><strong>Pay with Payoneer (Credit Card Link)</strong><small>International or local credit/debit card</small></div>
            </label>
            <label className={`checkout-method-option ${payment === 'crypto' ? 'active' : ''}`}>
              <input type="radio" name="paymentMethod" value="crypto" checked={payment === 'crypto'} onChange={() => setPayment('crypto')} />
              <div><strong>Pay with Crypto (USDT / Binance Pay)</strong><small>TRC-20 USDT or Binance Pay — fast &amp; borderless</small></div>
            </label>
          </div>
          {payment === 'local' && (
            <div className="payment-section payment-local">
              <h4 className="payment-local-title">Choose Your Preferred Local Rail</h4>
              <p className="payment-local-hint">Transfer the exact order total using any of the options below, then send your receipt.</p>
              <div className="payment-bank-box payment-bank-lynk"><strong>Option A: Lynk Mobile Wallet</strong><span>Send to Lynk ID / Number: <code>[Insert Lynk Number]</code></span></div>
              <div className="payment-bank-box payment-bank-ncb"><strong>Option B: NCB (National Commercial Bank)</strong><span>Acct Name: [Your Business/Name] | Acct #: [Insert NCB Acct #]</span></div>
              <div className="payment-bank-box payment-bank-scotia"><strong>Option C: Scotiabank Jamaica (BNS)</strong><span>Acct Name: [Your Business/Name] | Acct #: [Insert Scotia Acct #]</span></div>
              <p className="payment-reference-hint">Use your <strong>Order ID</strong> as your transfer reference.</p>
              <a className="payment-whatsapp-btn" href={`https://wa.me/12034235212?text=${encodeURIComponent('Hi, I just placed an order. Here is my local transfer / Lynk receipt.')}`} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Send Transfer Receipt on WhatsApp</a>
            </div>
          )}
          {payment === 'payoneer' && (
            <div className="payment-section payment-payoneer">
              <h4 className="payment-payoneer-title">Payoneer Credit Card Link</h4>
              <p className="payment-payoneer-steps">1. Click the button below to submit your order.<br />2. We will generate your secure Payoneer card link and send it straight to your WhatsApp or email.<br />3. Complete payment safely via card.</p>
              <a className="payment-payoneer-btn" href={`https://wa.me/12034235212?text=${encodeURIComponent('Hi, I would like to place an order and get a Payoneer payment link')}`} target="_blank" rel="noreferrer">Place Order &amp; Request Payoneer Link</a>
            </div>
          )}
          {payment === 'crypto' && (
            <div className="payment-section payment-crypto">
              <h4 className="payment-crypto-title"><Bitcoin size={20} /> Pay with Crypto (USDT)</h4>
              <p className="payment-crypto-hint">Send the exact order total in USDT (TRC-20) to the wallet below, then open the payment form to submit your transaction ID for verification.</p>
              <div className="crypto-wallet-box">
                <span className="crypto-wallet-label">USDT TRC-20 Wallet Address:</span>
                <div className="crypto-wallet-address">
                  <code>{usdtAddress}</code>
                  <button className="crypto-copy-btn" onClick={copyAddress} aria-label="Copy wallet address">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div className="crypto-binance-note">
                <strong>Binance Pay:</strong> Scan our Binance Pay QR or send to Binance ID <code>[Insert Binance ID]</code> — request the QR on WhatsApp.
              </div>
              <button className="payment-crypto-btn" onClick={openCryptoModal}>
                <Bitcoin size={18} /> Open Crypto Payment Form
              </button>
            </div>
          )}
        </div>
        <form className="booking-form" onSubmit={handleSubmit}>
          {submitted ? (
            <div className="success-state">
              <div className="success-icon"><Check size={28} /></div>
              <h3>Request received</h3>
              <p>We will review your device details and message you on WhatsApp with the next step.</p>
              <a className="button" href="https://wa.me/12034235212" target="_blank" rel="noreferrer">Open WhatsApp <ArrowRight size={18} /></a>
            </div>
          ) : (
            <>
              <div className="form-heading"><Wrench size={22} /><span>Tell us what you need</span></div>
              <label>Service
                <select required defaultValue="">
                  <option value="" disabled>Select a service</option>
                  <option>Phone repair</option>
                  <option>FRP removal</option>
                  <option>Anti-crack screen protection</option>
                  <option>Carrier unlock</option>
                  <option>Unlocking</option>
                  <option>Activation Lock assistance</option>
                  <option>Data transfer</option>
                  <option>Google Pixel Carrier Unlock</option>
                  <option>Pixel Service Tool Credits</option>
                  <option>GPixel Pro Package</option>
                </select>
                <ChevronDown className="select-icon" size={18} />
              </label>
              <label>Device model<input required placeholder="e.g. Samsung Galaxy S23" /></label>
              <div className="form-grid">
                <label>Your name<input required placeholder="Your full name" /></label>
                <label>Phone / WhatsApp<input required type="tel" placeholder="+1 000 000 0000" /></label>
              </div>
              <button className="button submit-button" type="submit">Send request <MoveRight size={20} /></button>
              <p className="form-disclaimer"><LockKeyhole size={14} /> Your information stays private and is only used to process your request.</p>
            </>
          )}
        </form>
      </section>

      <footer className="footer">
        <div className="footer-brand"><span className="brand-mark"><ShieldCheck size={22} /></span><strong>EXCLUSIVE MOBILE SOLUTION</strong></div>
        <p>Reliable care for every device. &middot; Remote FRP &amp; iCloud bypass available &mdash; Anydesk/TeamViewer, fast internet, 30 min&ndash;1 hr.</p>
        <a href="#top"><ArrowDown size={17} /> Back to top</a>
      </footer>

      {cartOpen && (
        <div className="cart-overlay" role="presentation" onClick={() => setCartOpen(false)}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" onClick={(event) => event.stopPropagation()}>
            <div className="cart-title">
              <div><span className="section-kicker">Your selection</span><h2>CART <span>({cart.length})</span></h2></div>
              <button className="close-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20} /></button>
            </div>
            {cartProducts.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={42} />
                <h3>Your cart is empty</h3>
                <p>Add a device to start your WhatsApp checkout request.</p>
                <button className="button" onClick={() => setCartOpen(false)}>Browse devices</button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartProducts.map((product, index) => (
                    <div className="cart-item" key={`${product.id}-${index}`}>
                      <div><strong>{product.name}</strong><small>{product.price}</small></div>
                      <button onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.name}`}><Minus size={16} /></button>
                    </div>
                  ))}
                </div>
                <a className="button cart-checkout" href={`https://wa.me/12034235212?text=${encodeURIComponent(`Hi, I would like to ask about: ${cartProducts.map((product) => product.name).join(', ')}`)}`} target="_blank" rel="noreferrer">Checkout on WhatsApp <MessageCircle size={19} /></a>
              </>
            )}
          </aside>
        </div>
      )}

      {cryptoOpen && (
        <div className="crypto-overlay" role="presentation" onClick={() => setCryptoOpen(false)}>
          <aside className="crypto-modal" role="dialog" aria-modal="true" aria-label="Crypto payment form" onClick={(event) => event.stopPropagation()}>
            <div className="crypto-modal-header">
              <div><span className="section-kicker">Crypto Payment</span><h2>USDT / BINANCE PAY</h2></div>
              <button className="close-button" onClick={() => setCryptoOpen(false)} aria-label="Close crypto form"><X size={20} /></button>
            </div>
            {txidSubmitted ? (
              <div className="crypto-pending">
                <div className="crypto-pending-icon"><AlertCircle size={36} /></div>
                <h3>Pending Verification</h3>
                <p>Your transaction ID has been received. We will verify your payment on the blockchain and confirm with you on WhatsApp shortly.</p>
                <p className="crypto-pending-txid">TXID: <code>{txid}</code></p>
                <a className="button crypto-modal-cta" href={`https://wa.me/12034235212?text=${encodeURIComponent(`Hi, I just paid via USDT. My TXID is: ${txid}. Please verify my payment.`)}`} target="_blank" rel="noreferrer">Confirm on WhatsApp <MessageCircle size={18} /></a>
                <button className="text-button crypto-close-secondary" onClick={() => setCryptoOpen(false)}>Close</button>
              </div>
            ) : (
              <form className="crypto-form" onSubmit={handleTxidSubmit}>
                <div className="crypto-form-wallet">
                  <span className="crypto-form-label">USDT TRC-20 Wallet</span>
                  <div className="crypto-wallet-address">
                    <code>{usdtAddress}</code>
                    <button type="button" className="crypto-copy-btn" onClick={copyAddress} aria-label="Copy wallet address">
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="crypto-network-warning">
                  <strong>Important:</strong> Only send USDT on the TRC-20 (Tron) network. Sending on any other network may result in permanent loss of funds.
                </div>
                <label className="crypto-form-label">
                  Your Transaction ID (TXID)
                  <input required type="text" placeholder="Paste your transaction hash / TXID here" value={txid} onChange={(e) => setTxid(e.target.value)} />
                </label>
                <label className="crypto-form-label">
                  Your Name or Order Reference
                  <input type="text" placeholder="So we can match your payment" />
                </label>
                <button className="button crypto-modal-cta" type="submit">Submit for Verification <MoveRight size={18} /></button>
                <a className="crypto-binance-link" href={`https://wa.me/12034235212?text=${encodeURIComponent('Hi, I want to pay via Binance Pay. Please send me your Binance Pay QR or ID.')}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Prefer Binance Pay? Request QR on WhatsApp</a>
              </form>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

export default App;
