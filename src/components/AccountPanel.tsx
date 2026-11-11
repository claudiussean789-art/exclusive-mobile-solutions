import { sendTelegramAlert } from '../utils/telegram';
import { useEffect, useState, type FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { submitPayoneerRequest } from '../lib/payoneer';
import {
	getSupabase,
	getWalletBalance,
	isSupabaseConfigured,
	type WalletOrder,
	type WalletProfile,
	type WalletTopup,
	type WalletTransaction,
} from '../lib/supabase';

type AccountPanelProps = {
	user: User | null;
	onClose: () => void;
	onBalanceChange: (balance: number) => void;
	onUserChange: (user: User | null) => void;
	notice?: string;
};

const topupPresets = [10, 25, 50, 100];
const currency = (amount: number | string | null, code = 'USD') =>
	amount === null
		? 'Price to be confirmed'
		: new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(Number(amount));
const walletCurrency = (amount: number) =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
const dateTime = (value: string) =>
	new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const displayError = (error: unknown) => error instanceof Error ? error.message : 'The request could not be completed.';
type OrderStats = {
	successful_count: number;
	successful_total: number;
	in_progress_count: number;
	in_progress_total: number;
	failed_count: number;
	failed_total: number;
	total_count: number;
};
type PayoneerStatus = {
	wallet_order_id: string | null;
	wallet_topup_id: string | null;
	status: 'Pending Approval' | 'Approved' | 'Awaiting Payment Link' | 'Link Sent' | 'Paid' | 'Rejected';
};
const orderStatusLabel = (order: WalletOrder) => {
	if (order.fulfillment_status === 'completed') return 'Completed';
	if (order.fulfillment_status === 'failed') return 'Failed';
	if (order.status === 'cancelled') return 'Cancelled';
	if (order.status === 'pending_verification') return 'Pending verification';
	if (order.status === 'paid' || order.status === 'requested' || order.fulfillment_status === 'in_progress') return 'In process';
	return 'Pending';
};

export default function AccountPanel({
	user,
	onClose,
	onBalanceChange,
	onUserChange,
	notice,
}: AccountPanelProps) {
	const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
	const [fullName, setFullName] = useState('');
	const [username, setUsername] = useState('');
	const [phone, setPhone] = useState('');
	const [address, setAddress] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [amount, setAmount] = useState('25');
	const [selectedPreset, setSelectedPreset] = useState<number | null>(25);
	const [, setStats] = useState<OrderStats>({
		successful_count: 0,
		successful_total: 0,
		in_progress_count: 0,
		in_progress_total: 0,
		failed_count: 0,
		failed_total: 0,
		total_count: 0,
	});
	const [topupMethod, setTopupMethod] = useState<'paypal' | 'payoneer'>('paypal');
	const [payoneerRail, setPayoneerRail] = useState<'card' | 'bank'>('card');
	const [payoneerName, setPayoneerName] = useState<string | null>(null);
	const [profile, setProfile] = useState<WalletProfile | null>(null);
	const [topups, setTopups] = useState<WalletTopup[]>([]);
	const [orders, setOrders] = useState<WalletOrder[]>([]);
	const [payoneerStatuses, setPayoneerStatuses] = useState<PayoneerStatus[]>([]);
	const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
	const [loading, setLoading] = useState(false);
	const [busy, setBusy] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	useEffect(() => {
		setPayoneerName(null);
	}, [user?.id]);

	useEffect(() => {
		if (!user || !isSupabaseConfigured) {
			setStats({
				successful_count: 0,
				successful_total: 0,
				in_progress_count: 0,
				in_progress_total: 0,
				failed_count: 0,
				failed_total: 0,
				total_count: 0,
			});
			return;
		}

		let active = true;
		void (async () => {
			const { data, error } = await getSupabase().rpc('get_user_order_stats', { p_user_id: user.id });
			if (error || !data || !active) return;
			const row = (Array.isArray(data) ? data[0] : data) as OrderStats | undefined;
			if (row) setStats(row);
		})();

		return () => { active = false; };
	}, [user]);

	useEffect(() => {
		if (!user || !isSupabaseConfigured) {
			setProfile(null);
			setTopups([]);
			setOrders([]);
			setPayoneerStatuses([]);
			setTransactions([]);
			onBalanceChange(0);
			return;
		}

		let active = true;
		setLoading(true);
		setErrorMessage('');
		const client = getSupabase();
		void Promise.all([
			client.from('profiles').select('id,email,full_name,username,phone,address,credit_balance').eq('id', user.id).single(),
			client.from('wallet_topups').select('id,amount,currency,method,status,receipt_path,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
			client.from('wallet_orders').select('id,items,total,currency,payment_method,status,fulfillment_status,payment_reference,crypto_txid,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
			client.from('wallet_transactions').select('id,amount,kind,description,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
			client.from('payoneer_orders').select('wallet_order_id,wallet_topup_id,status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(40),
		]).then(([profileResult, topupResult, orderResult, transactionResult, payoneerResult]) => {
			const failure = profileResult.error ?? topupResult.error ?? orderResult.error ?? transactionResult.error ?? payoneerResult.error;
			if (failure) throw failure;
			if (!active) return;
			const nextProfile = profileResult.data as WalletProfile;
			setProfile(nextProfile);
			setTopups(topupResult.data as WalletTopup[]);
			setOrders(orderResult.data as WalletOrder[]);
			setTransactions(transactionResult.data as WalletTransaction[]);
			setPayoneerStatuses(payoneerResult.data as PayoneerStatus[]);
			onBalanceChange(getWalletBalance(nextProfile));
		}).catch((loadError: unknown) => {
			if (active) setErrorMessage(displayError(loadError));
		}).finally(() => {
			if (active) setLoading(false);
		});

		return () => { active = false; };
	}, [user, onBalanceChange]);

	const handleGoogleSignIn = async () => {
		const client = getSupabase();
		setErrorMessage('');
		const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
		if (error) setErrorMessage(error.message);
	};

	const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setBusy(true);
		setErrorMessage('');
		setSuccessMessage('');
		try {
			const client = getSupabase();
			if (authMode === 'signup') {
				const normalizedUsername = username.trim().toLowerCase();
				if (!/^[a-z0-9_.-]{3,30}$/.test(normalizedUsername)) {
					throw new Error('Username must be 3–30 characters using letters, numbers, dots, underscores, or hyphens.');
				}
				const { data, error } = await client.auth.signUp({
					email: email.trim(),
					password,
					options: {
						data: {
							full_name: fullName.trim(),
							username: normalizedUsername,
							phone: phone.trim(),
							address: address.trim(),
						},
					},
				});
				if (error) throw error;
				if (data.session) onUserChange(data.session.user);
				else setSuccessMessage('Your account was created. Check your email for the confirmation link, then sign in using your email and password.');

				await sendTelegramAlert(
					`<b>🔔 New Account Registration</b>\n\n` +
					`<b>Email:</b> ${email.trim()}\n` +
					`<b>Full Name:</b> ${fullName.trim() || 'N/A'}\n` +
					`<b>Username:</b> ${normalizedUsername}\n` +
					`<b>Portal:</b> Exclusive Mobile Solutions`
				);
			} else {
				const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
				if (error) throw error;
				onUserChange(data.user);
			}
			setPassword('');
		} catch (authError) {
			setErrorMessage(displayError(authError));
		} finally {
			setBusy(false);
		}
	};

	const refreshWallet = async () => {
		if (!user) return;
		const client = getSupabase();
		const [profileResult, topupResult, orderResult, transactionResult, payoneerResult] = await Promise.all([
			client.from('profiles').select('id,email,full_name,username,phone,address,credit_balance').eq('id', user.id).single(),
			client.from('wallet_topups').select('id,amount,currency,method,status,receipt_path,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
			client.from('wallet_orders').select('id,items,total,currency,payment_method,status,fulfillment_status,payment_reference,crypto_txid,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
			client.from('wallet_transactions').select('id,amount,kind,description,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
			client.from('payoneer_orders').select('wallet_order_id,wallet_topup_id,status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(40),
		]);
		const failure = profileResult.error ?? topupResult.error ?? orderResult.error ?? transactionResult.error ?? payoneerResult.error;
		if (failure) throw failure;
		const nextProfile = profileResult.data as WalletProfile;
		setProfile(nextProfile);
		setTopups(topupResult.data as WalletTopup[]);
		setOrders(orderResult.data as WalletOrder[]);
		setTransactions(transactionResult.data as WalletTransaction[]);
		setPayoneerStatuses(payoneerResult.data as PayoneerStatus[]);
		onBalanceChange(getWalletBalance(nextProfile));
	};

	const handleTopup = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setBusy(true);
		setErrorMessage('');
		setSuccessMessage('');
		try {
			const value = Number(amount);
			if (!Number.isFinite(value) || value < 1 || value > 10000 || Number(value.toFixed(2)) !== value) {
				throw new Error('Enter an amount from $1.00 to $10,000.00, up to two decimal places.');
			}
			const client = getSupabase();
			if (topupMethod === 'payoneer') {
				const customerName = (payoneerName ?? profile?.full_name ?? '').trim();
				if (!customerName) throw new Error('Enter your name for the Payoneer request.');
				if (!user?.email) throw new Error('Your account needs an email before requesting a Payoneer top-up.');
				const request = await submitPayoneerRequest({
					type: 'topup',
					customerName,
					customerEmail: user.email,
					amount: value,
					preference: payoneerRail,
				});
				setSuccessMessage(`Payoneer top-up ${request.id} is pending approval. No payment has been taken.`);
				if (!request.notified) setErrorMessage(`Top-up ${request.id} was saved, but the administrator notification failed. Contact support with this reference; do not submit it again.`);
				await refreshWallet();
				return;
			}
			const { data: topup, error } = await client.rpc('request_wallet_topup', {
				p_amount: value,
				p_method: topupMethod,
			});
			

			if (error) throw error;
if (!topup) throw new Error('The top-up request was not created.');

			await sendTelegramAlert(
				`<b>🚨 NEW DEPOSIT REQUEST</b>\n\n` +
				`<b>Amount:</b> $${value} USD\n` +
				`<b>Method:</b> ${topupMethod}\n` +
				`<b>Status:</b> Pending Verification`
			);
			const { data, error: checkoutError } = await client.functions.invoke('create-paypal-order', {
				body: { topupId: topup.id },
			});
			if (checkoutError) throw checkoutError;
			if (typeof data?.approvalUrl !== 'string') throw new Error('PayPal did not return an approval link.');
			window.location.assign(data.approvalUrl);
		} catch (topupError) {
			setErrorMessage(displayError(topupError));
			try {
				await refreshWallet();
			} catch (refreshError) {
				setErrorMessage(`${displayError(topupError)} Wallet history refresh failed: ${displayError(refreshError)}`);
			}
		} finally {
			setBusy(false);
		}
	};

	const handleSignOut = async () => {
		setBusy(true);
		setErrorMessage('');
		try {
			const { error } = await getSupabase().auth.signOut();
			if (error) throw error;
			onUserChange(null);
		} catch (signoutError) {
			setErrorMessage(displayError(signoutError));
		} finally {
			setBusy(false);
		}
	};

	const choosePreset = (preset: number) => {
		setSelectedPreset(preset);
		setAmount(String(preset));
	};

	const updateCustomAmount = (value: string) => {
		setSelectedPreset(null);
		setAmount(value);
	};

	const alertContent = errorMessage || successMessage || notice;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => {
			if (event.target === event.currentTarget) onClose();
		}}>
			<section className="mx-auto my-4 w-full max-w-3xl rounded-2xl border border-[#294572] bg-[#081630] p-5 shadow-2xl sm:my-10 sm:p-7" role="dialog" aria-modal="true" aria-labelledby="account-title">
				<div className="mb-6 flex items-start justify-between gap-4">
					<div>
						<p className="mb-2 text-[10px] font-bold tracking-[.18em] text-sky-400">YOUR ACCOUNT</p>
						<h2 className="text-3xl font-bold leading-tight" id="account-title">{user ? 'Wallet & activity' : 'Sign in or create an account'}</h2>
					</div>
					<button className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#294572] text-slate-300 hover:border-sky-400 hover:text-white" type="button" onClick={onClose} aria-label="Close account panel">×</button>
				</div>

				{!isSupabaseConfigured ? (
					<p className="rounded-xl border border-amber-700/60 bg-amber-950/30 p-4 text-sm leading-6 text-amber-100">
						Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your local .env file and restart the app.
					</p>
				) : !user ? (
					<div>
						<div className="mb-5 flex gap-2 rounded-xl border border-blue-300/15 bg-[#07142e] p-1">
							{(['signin', 'signup'] as const).map((mode) => (
								<button className={`min-h-10 flex-1 rounded-lg text-sm font-semibold ${authMode === mode ? 'bg-sky-500 text-[#03142a]' : 'text-slate-300 hover:bg-white/5'}`} type="button" key={mode} onClick={() => setAuthMode(mode)}>
									{mode === 'signin' ? 'Sign in' : 'Create account'}
								</button>
							))}
						</div>
						<form className="grid gap-4" onSubmit={handleAuth}>
							{authMode === 'signup' && (
								<>
									<p className="text-xs leading-5 text-slate-400">Create your customer profile. Your username is for your profile; sign in with your email address.</p>
									<label className="grid gap-2 text-xs font-semibold text-slate-300">
										Full name
										<input className="h-11 rounded-lg border border-[#294572] bg-[#07142e] px-3 text-sm text-white outline-none focus:border-sky-400" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} />
									</label>
									<label className="grid gap-2 text-xs font-semibold text-slate-300">
										Username
										<input className="h-11 rounded-lg border border-[#294572] bg-[#07142e] px-3 text-sm text-white outline-none focus:border-sky-400" autoComplete="username" minLength={3} maxLength={30} pattern="[A-Za-z0-9_.-]{3,30}" title="Use 3–30 letters, numbers, dots, underscores, or hyphens." required value={username} onChange={(event) => setUsername(event.target.value)} />
									</label>
									<label className="grid gap-2 text-xs font-semibold text-slate-300">
										Telephone number
										<input className="h-11 rounded-lg border border-[#294572] bg-[#07142e] px-3 text-sm text-white outline-none focus:border-sky-400" type="tel" autoComplete="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} />
									</label>
									<label className="grid gap-2 text-xs font-semibold text-slate-300">
										Address
										<textarea className="min-h-20 rounded-lg border border-[#294572] bg-[#07142e] px-3 py-2 text-sm text-white outline-none focus:border-sky-400" autoComplete="street-address" required value={address} onChange={(event) => setAddress(event.target.value)} />
									</label>
								</>
							)}
							<label className="grid gap-2 text-xs font-semibold text-slate-300">
								{authMode === 'signin' ? 'Email address' : 'Email address for sign-in'}
								<input className="h-11 rounded-lg border border-[#294572] bg-[#07142e] px-3 text-sm text-white outline-none focus:border-sky-400" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
							</label>
							<label className="grid gap-2 text-xs font-semibold text-slate-300">
								Password
								<input className="h-11 rounded-lg border border-[#294572] bg-[#07142e] px-3 text-sm text-white outline-none focus:border-sky-400" type="password" autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} />
							</label>
							<button className="min-h-11 rounded-lg bg-sky-500 px-4 text-sm font-bold text-[#03142a] hover:bg-sky-300 disabled:opacity-50" type="submit" disabled={busy}>
								{busy ? 'Please wait…' : authMode === 'signin' ? 'Sign in' : 'Create account'}
							</button>
						</form>
						<button className="min-h-11 rounded-lg border border-[#294572] bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:opacity-50" type="button" disabled={busy} onClick={handleGoogleSignIn}>
							Continue with Google
						</button>
					</div>
				) : (
					<div className="grid gap-6">
						<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
							<div className="min-w-0">
								<p className="break-all text-sm font-semibold text-slate-100">{profile?.full_name || user.email}</p>
								<p className="mt-1 text-xs text-slate-400">{user.email}</p>
								{profile?.username && <p className="mt-1 text-xs text-slate-400">Username: {profile.username}</p>}
								{profile?.phone && <p className="mt-1 text-xs text-slate-400">Phone: {profile.phone}</p>}
								{profile?.address && <p className="mt-1 text-xs text-slate-400">{profile.address}</p>}
							</div>
							<div className="text-right">
								<p className="text-[10px] font-bold tracking-wider text-slate-400">WALLET BALANCE</p>
								<p className="mt-1 text-2xl font-bold text-sky-300">{profile ? walletCurrency(getWalletBalance(profile)) : loading ? 'Loading…' : 'Unavailable'}</p>
							</div>
						</div>

						<form className="grid gap-4 rounded-xl border border-blue-300/15 bg-[#07142e] p-4" onSubmit={handleTopup}>
							<div>
								<h3 className="font-bold text-slate-100">Add wallet credit</h3>
								<p className="mt-1 text-xs leading-5 text-slate-400">Choose a preset or enter a custom amount. Wallet credit is only added after payment verification.</p>
							</div>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
								{topupPresets.map((preset) => (
									<button className={`min-h-10 rounded-lg border text-sm font-semibold ${selectedPreset === preset ? 'border-sky-400 bg-sky-500/15 text-sky-200' : 'border-[#294572] text-slate-300 hover:border-sky-500'}`} type="button" key={preset} aria-pressed={selectedPreset === preset} onClick={() => choosePreset(preset)}>
										{currency(preset)}
									</button>
								))}
							</div>
							<label className="grid gap-2 text-xs font-semibold text-slate-300">
								Custom amount (USD)
								<input className="h-11 rounded-lg border border-[#294572] bg-[#081630] px-3 text-sm text-white outline-none focus:border-sky-400" type="number" min="1" max="10000" step="0.01" inputMode="decimal" value={amount} onChange={(event) => updateCustomAmount(event.target.value)} required />
							</label>
							<div className="grid gap-2 sm:grid-cols-2">
								<label className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${topupMethod === 'paypal' ? 'border-sky-500 bg-sky-500/10 text-white' : 'border-[#294572] text-slate-300'}`}>
									<input type="radio" name="topupMethod" value="paypal" checked={topupMethod === 'paypal'} onChange={() => setTopupMethod('paypal')} />
									PayPal
								</label>
								<label className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${topupMethod === 'payoneer' ? 'border-sky-500 bg-sky-500/10 text-white' : 'border-[#294572] text-slate-300'}`}>
									<input type="radio" name="topupMethod" value="payoneer" checked={topupMethod === 'payoneer'} onChange={() => setTopupMethod('payoneer')} />
									Payoneer
								</label>
								<div className="flex items-center justify-between gap-2 rounded-lg border border-[#294572] p-3 text-sm text-slate-400" aria-label="Visa or debit card, coming soon">
									<span>Visa / Debit Card</span>
									<span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">Coming soon</span>
								</div>
							</div>
							{topupMethod === 'payoneer' && (
								<div className="grid gap-3">
									<label className="grid gap-2 text-xs font-semibold text-slate-300">
										Name for the Payoneer request
										<input className="h-11 rounded-lg border border-[#294572] bg-[#081630] px-3 text-sm text-white outline-none focus:border-sky-400" autoComplete="name" maxLength={150} required value={payoneerName ?? profile?.full_name ?? ''} onChange={(event) => setPayoneerName(event.target.value)} />
									</label>
									<p className="break-all text-xs text-slate-400">Payment link email: {user.email || 'No email on your account'}</p>
									<div className="grid gap-2 sm:grid-cols-2">
										<label className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${payoneerRail === 'card' ? 'border-sky-500 bg-sky-500/10 text-white' : 'border-[#294572] text-slate-300'}`}>
											<input type="radio" name="payoneerRail" checked={payoneerRail === 'card'} onChange={() => setPayoneerRail('card')} />
											Visa / debit card
										</label>
										<label className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${payoneerRail === 'bank' ? 'border-sky-500 bg-sky-500/10 text-white' : 'border-[#294572] text-slate-300'}`}>
											<input type="radio" name="payoneerRail" checked={payoneerRail === 'bank'} onChange={() => setPayoneerRail('bank')} />
											Bank transfer
										</label>
									</div>
								</div>
							)}
							<button className="min-h-11 rounded-lg bg-sky-500 px-4 text-sm font-bold text-[#03142a] hover:bg-sky-300 disabled:opacity-50" type="submit" disabled={busy}>
								{busy ? 'Processing…' : topupMethod === 'paypal' ? 'Continue to PayPal' : 'Request Payoneer invoice'}
							</button>
						</form>

						<div className="grid gap-5 lg:grid-cols-2">
							<section aria-labelledby="topup-history-title">
								<h3 className="mb-3 font-bold" id="topup-history-title">Top-up requests</h3>
								{topups.length ? <ul className="grid gap-2">
									{topups.map((topup) => (
										<li className="flex items-center justify-between gap-3 rounded-lg border border-blue-300/10 bg-[#07142e] p-3 text-sm" key={topup.id}>
											<div><p className="font-semibold">{currency(topup.amount, topup.currency)} · {topup.method === 'paypal' ? 'PayPal' : topup.method === 'payoneer' ? 'Payoneer' : 'NCB bank transfer'}</p><p className="mt-1 text-xs text-slate-500">{dateTime(topup.created_at)}{topup.method === 'manual' && topup.receipt_path ? ' · Receipt submitted' : ''}</p></div>
											<span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${topup.status === 'completed' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-200'}`}>{payoneerStatuses.find((request) => request.wallet_topup_id === topup.id)?.status ?? topup.status}</span>
										</li>
									))}
								</ul> : <p className="rounded-lg border border-blue-300/10 bg-[#07142e] p-3 text-sm text-slate-500">No top-ups yet.</p>}
							</section>

							<section aria-labelledby="order-history-title">
								<h3 className="mb-3 font-bold" id="order-history-title">Orders</h3>
								{orders.length ? <ul className="grid gap-2">
									{orders.map((order) => (
										<li className="rounded-lg border border-blue-300/10 bg-[#07142e] p-3 text-sm" key={order.id}>
											<div className="flex justify-between gap-3"><strong>{order.total === null ? 'Price to be confirmed' : currency(order.total, order.currency)}</strong><span className="text-xs text-slate-400">{payoneerStatuses.find((request) => request.wallet_order_id === order.id)?.status ?? orderStatusLabel(order)} · {order.payment_method}</span></div>
											<p className="mt-2 text-xs leading-5 text-slate-400">{Array.isArray(order.items) ? order.items.map((item) => item.name).join(', ') : 'Order items'} · {dateTime(order.created_at)}</p>
											{order.crypto_txid && <p className="mt-1 break-all text-xs text-slate-500">TXID: {order.crypto_txid}</p>}
										</li>
									))}
								</ul> : <p className="rounded-lg border border-blue-300/10 bg-[#07142e] p-3 text-sm text-slate-500">No orders yet.</p>}
							</section>
						</div>

						<section aria-labelledby="transaction-history-title">
							<h3 className="mb-3 font-bold" id="transaction-history-title">Wallet transactions</h3>
							{transactions.length ? <ul className="grid gap-2 sm:grid-cols-2">
								{transactions.map((transaction) => (
									<li className="flex items-center justify-between gap-3 rounded-lg border border-blue-300/10 bg-[#07142e] p-3 text-sm" key={transaction.id}>
										<div><p className="font-medium">{transaction.description}</p><p className="mt-1 text-xs text-slate-500">{dateTime(transaction.created_at)}</p></div>
										<strong className={Number(transaction.amount) > 0 ? 'text-emerald-300' : 'text-slate-200'}>{Number(transaction.amount) > 0 ? '+' : ''}{currency(transaction.amount)}</strong>
									</li>
								))}
							</ul> : <p className="rounded-lg border border-blue-300/10 bg-[#07142e] p-3 text-sm text-slate-500">No wallet transactions yet.</p>}
						</section>
						<div className="flex flex-wrap justify-between gap-3 border-t border-blue-300/10 pt-4">
							<p className="self-center text-xs text-slate-500">{loading ? 'Refreshing wallet history…' : ''}</p>
							<button className="min-h-10 rounded-lg border border-[#294572] px-4 text-sm text-slate-300 hover:border-sky-400 hover:text-white disabled:opacity-50" type="button" disabled={busy} onClick={() => { setBusy(true); setErrorMessage(''); void refreshWallet().catch((refreshError: unknown) => setErrorMessage(displayError(refreshError))).finally(() => setBusy(false)); }}>
								Refresh
							</button>
							<button className="min-h-10 rounded-lg border border-[#294572] px-4 text-sm text-slate-300 hover:border-red-400 hover:text-red-200 disabled:opacity-50" type="button" disabled={busy} onClick={() => void handleSignOut()}>
								Sign out
							</button>
						</div>
					</div>
				)}

				{alertContent && (
					<p className={`mt-4 rounded-lg border p-3 text-sm leading-5 ${errorMessage ? 'border-red-800 bg-red-950/40 text-red-200' : 'border-emerald-800 bg-emerald-950/30 text-emerald-200'}`} role={errorMessage ? 'alert' : 'status'}>
						{alertContent}
					</p>
				)}
			</section>
		</div>
	);
}
