import { useEffect, useMemo, useState } from 'react'
import './App.css'

type CardResult = {
	id: string
	cardType: string
	maskedPublicId: string
	firstNameInitial: string
	lastName: string
	dobYear: number
	imageUrl?: string | null
	holdingLocation?: {
		id: string
		name: string
		address: string
		region: string
		phone?: string | null
		hours?: string | null
	} | null
	status: string
}

function App() {
	const [tab, setTab] = useState<'id' | 'person'>('id')
	const [loading, setLoading] = useState(false)
	const [results, setResults] = useState<CardResult[]>([])
	const [error, setError] = useState<string | null>(null)

	// by id
	const [idNumber, setIdNumber] = useState('')
	const [cardType, setCardType] = useState('GHANA_CARD')

	// by person
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [dobYear, setDobYear] = useState('')
	const [dobMonth, setDobMonth] = useState('')

	const years = useMemo(() => {
		const y: number[] = []
		const now = new Date().getFullYear()
		for (let i = now; i >= 1900; i--) y.push(i)
		return y
	}, [])

	async function search() {
		setLoading(true)
		setError(null)
		setResults([])
		try {
			let url = ''
			if (tab === 'id') {
				const p = new URLSearchParams({ idNumber, cardType })
				url = `/api/public/search/by-id?${p.toString()}`
			} else {
				const p = new URLSearchParams({ firstName, lastName, dobYear, dobMonth })
				url = `/api/public/search/by-person?${p.toString()}`
			}
			const res = await fetch(url)
			if (!res.ok) throw new Error('Search failed')
			const data: CardResult[] = await res.json()
			setResults(data)
		} catch (e: any) {
			setError(e.message || 'Error')
		} finally {
			setLoading(false)
		}
	}

	async function claim(cardId: string) {
		try {
			const res = await fetch('/api/public/claims', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ cardId, contactPhone: '0000000000' }),
			})
			if (!res.ok) throw new Error('Claim failed')
			const data = await res.json()
			alert(`Claim created. Reference: ${data.referenceCode}`)
		} catch (e: any) {
			alert(e.message || 'Error creating claim')
		}
	}

	return (
		<div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
			<h1>ID Finder (Ghana)</h1>
			<div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
				<button onClick={() => setTab('id')} disabled={tab === 'id'}>Search by ID</button>
				<button onClick={() => setTab('person')} disabled={tab === 'person'}>Search by Person</button>
			</div>

			{tab === 'id' ? (
				<div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr 1fr auto' }}>
					<input placeholder="ID number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
					<select value={cardType} onChange={(e) => setCardType(e.target.value)}>
						<option value="GHANA_CARD">Ghana Card</option>
						<option value="DRIVERS_LICENSE">Driver's License</option>
						<option value="VOTER_ID">Voter ID</option>
						<option value="NHIS">NHIS</option>
						<option value="PASSPORT">Passport</option>
					</select>
					<button onClick={search} disabled={loading}>Search</button>
				</div>
			) : (
				<div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr 1fr 1fr auto' }}>
					<input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
					<input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
					<select value={dobYear} onChange={(e) => setDobYear(e.target.value)}>
						<option value="">Year</option>
						{years.map((y) => (
							<option key={y} value={y}>{y}</option>
						))}
					</select>
					<select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)}>
						<option value="">Month</option>
						{Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
							<option key={m} value={m}>{m}</option>
						))}
					</select>
					<button onClick={search} disabled={loading || !dobYear}>Search</button>
				</div>
			)}

			{error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}

			<div style={{ marginTop: 16 }}>
				{loading ? (
					<div>Loading...</div>
				) : (
					<ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}>
						{results.map((r) => (
							<li key={r.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
									{r.imageUrl ? <img src={r.imageUrl} alt="card" width={64} height={40} /> : <div style={{ width: 64, height: 40, background: '#eee' }} />}
									<div style={{ flex: 1 }}>
										<div><strong>{r.cardType}</strong> - {r.maskedPublicId}</div>
										<div>Name: {r.firstNameInitial}. {r.lastName}</div>
										<div>Year of birth: {r.dobYear}</div>
										{r.holdingLocation && (
											<div>Pickup: {r.holdingLocation.name}, {r.holdingLocation.address} ({r.holdingLocation.region})</div>
										)}
									</div>
									<button onClick={() => claim(r.id)}>Claim</button>
								</div>
							</li>
						))}
						{!loading && results.length === 0 && <div>No results</div>}
					</ul>
				)}
			</div>
		</div>
	)
}

export default App
