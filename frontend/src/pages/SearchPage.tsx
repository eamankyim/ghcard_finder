import { useMemo, useState } from 'react'
import { Tabs, Form, Input, Select, DatePicker, Button, List, Typography, Space, message, Row, Col, Card } from 'antd'
import dayjs from 'dayjs'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const { Title, Text } = Typography

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

function SearchPage() {
	const [loading, setLoading] = useState(false)
	const [results, setResults] = useState<CardResult[]>([])
	const [formId] = Form.useForm()
	const [formPerson] = Form.useForm()

	const years = useMemo(() => {
		const y: number[] = []
		const now = new Date().getFullYear()
		for (let i = now; i >= 1900; i--) y.push(i)
		return y
	}, [])

	async function searchById(values: any) {
		setLoading(true)
		setResults([])
		try {
			const p = new URLSearchParams({ idNumber: values.idNumber, cardType: values.cardType })
			const res = await fetch(`/api/public/search/by-id?${p.toString()}`)
			if (!res.ok) throw new Error('Search failed')
			setResults(await res.json())
		} catch (e: any) {
			message.error(e.message || 'Error during search')
		} finally {
			setLoading(false)
		}
	}

	async function searchByPerson(values: any) {
		setLoading(true)
		setResults([])
		try {
			const dob = values.dob as dayjs.Dayjs | undefined
			const dobYear = dob ? String(dob.year()) : ''
			const dobMonth = dob ? String(dob.month() + 1) : ''
			const p = new URLSearchParams({
				firstName: values.firstName,
				lastName: values.lastName,
				dobYear,
				dobMonth,
			})
			const res = await fetch(`/api/public/search/by-person?${p.toString()}`)
			if (!res.ok) throw new Error('Search failed')
			setResults(await res.json())
		} catch (e: any) {
			message.error(e.message || 'Error during search')
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
			message.success(`Claim created. Reference: ${data.referenceCode}`)
		} catch (e: any) {
			message.error(e.message || 'Error creating claim')
		}
	}

	return (
		<div style={{ padding: '48px 24px', maxWidth: 800, margin: '0 auto' }}>
			<Space direction="vertical" size={32} style={{ width: '100%' }}>
				<div style={{ textAlign: 'center' }}>
					<Link to="/">
						<Button icon={<ArrowLeftOutlined />} type="text" style={{ marginBottom: 16 }}>
							Back to Home
						</Button>
					</Link>
					<Title level={2} style={{ color: '#52c41a', marginBottom: 8 }}>Search for Your ID</Title>
					<Text type="secondary" style={{ fontSize: 16 }}>Find your lost identification card using ID number or personal details</Text>
				</div>
				
				<Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)' }}>
					<Tabs
						centered
						items={[
							{
								key: 'id',
								label: 'Search by ID Number',
								children: (
									<div style={{ padding: '24px 0' }}>
										<Form form={formId} layout="vertical" onFinish={searchById}>
											<Form.Item name="idNumber" label="ID Number" rules={[{ required: true, message: 'Enter ID number' }]}>
												<Input 
													placeholder="e.g. GHA-1234-5678" 
													size="large"
													style={{ width: '100%' }}
												/>
											</Form.Item>
											<Form.Item name="cardType" label="Card Type" initialValue="GHANA_CARD" rules={[{ required: true }]}>
												<Select
													size="large"
													style={{ width: '100%' }}
													options={[
														{ value: 'GHANA_CARD', label: 'Ghana Card' },
														{ value: 'DRIVERS_LICENSE', label: "Driver's License" },
														{ value: 'VOTER_ID', label: 'Voter ID' },
														{ value: 'NHIS', label: 'NHIS' },
														{ value: 'PASSPORT', label: 'Passport' },
													]}
												/>
											</Form.Item>
											<Form.Item style={{ textAlign: 'center', marginTop: 32 }}>
												<Button type="primary" htmlType="submit" loading={loading} size="large" style={{ minWidth: 120 }}>
													Search
												</Button>
											</Form.Item>
										</Form>
									</div>
								),
							},
							{
								key: 'person',
								label: 'Search by Personal Details',
								children: (
									<div style={{ padding: '24px 0' }}>
										<Form form={formPerson} layout="vertical" onFinish={searchByPerson}>
											<Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
												<Input 
													placeholder="Enter your first name" 
													size="large"
													style={{ width: '100%' }}
												/>
											</Form.Item>
											<Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
												<Input 
													placeholder="Enter your last name" 
													size="large"
													style={{ width: '100%' }}
												/>
											</Form.Item>
											<Form.Item name="dob" label="Date of Birth (Year/Month)" rules={[{ required: true }]}>
												<DatePicker 
													picker="month" 
													size="large"
													style={{ width: '100%' }} 
												/>
											</Form.Item>
											<Form.Item style={{ textAlign: 'center', marginTop: 32 }}>
												<Button type="primary" htmlType="submit" loading={loading} size="large" style={{ minWidth: 120 }}>
													Search
												</Button>
											</Form.Item>
										</Form>
									</div>
								),
							},
						]}
					/>
				</Card>

				{results.length > 0 && (
					<Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)' }}>
						<Title level={4} style={{ color: '#52c41a', textAlign: 'center', marginBottom: 24 }}>
							Search Results ({results.length})
						</Title>
						<List
							loading={loading}
							dataSource={results}
							locale={{ emptyText: 'No results found' }}
							renderItem={(r) => (
								<List.Item
									style={{ 
										padding: '20px 0',
										borderBottom: '1px solid #f0f0f0'
									}}
									actions={[
										<Button key="claim" type="primary" size="large" onClick={() => claim(r.id)}>
											Claim This ID
										</Button>
									]}
								>
									<List.Item.Meta
										title={
											<Space>
												<Text strong style={{ fontSize: 16 }}>{r.cardType}</Text>
												<Text type="secondary" style={{ fontSize: 14 }}>{r.maskedPublicId}</Text>
											</Space>
										}
										description={
											<div style={{ fontSize: 14, lineHeight: 1.6 }}>
												<div><strong>Name:</strong> {r.firstNameInitial}. {r.lastName}</div>
												<div><strong>Year of birth:</strong> {r.dobYear}</div>
												{r.holdingLocation && (
													<div>
														<strong>Pickup location:</strong> {r.holdingLocation.name}<br/>
														<Text type="secondary">{r.holdingLocation.address}, {r.holdingLocation.region}</Text>
													</div>
												)}
											</div>
										}
									/>
								</List.Item>
							)}
						/>
					</Card>
				)}
			</Space>
		</div>
	)
}

export default SearchPage
