import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Layout, Typography, Button, Space, Row, Col } from 'antd'
import { SearchOutlined, HomeOutlined, SafetyOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons'
import WelcomePage from './pages/WelcomePage'
import SearchPage from './pages/SearchPage'

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text } = Typography

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh', background: '#f6ffed' }}>
        <Header style={{ background: 'white', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
            <Link to="/" style={{ color: 'black', textDecoration: 'none' }}>
              <Title level={3} style={{ color: 'black', margin: 0 }}>
                <SafetyOutlined /> ID Finder Ghana
              </Title>
            </Link>
            <Space>
              <Link to="/">
                <Button type="text" style={{ color: 'black' }} icon={<HomeOutlined />}>
                  Home
                </Button>
              </Link>
              <Link to="/search">
                <Button type="text" style={{ color: 'black' }} icon={<SearchOutlined />}>
                  Search
                </Button>
              </Link>
            </Space>
          </div>
        </Header>
        
        <Content style={{ background: '#f6ffed' }}>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </Content>
        
        <Footer style={{
          background: 'white',
          color: '#2c3e50',
          padding: '48px 24px 24px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Row gutter={[32, 32]}>
              <Col xs={24} sm={12} md={8}>
                <div>
                  <Title level={4} style={{ color: '#2c3e50', marginBottom: 16 }}>
                    <SafetyOutlined /> ID Finder Ghana
                  </Title>
                  <Paragraph style={{ color: '#7f8c8d', marginBottom: 16 }}>
                    Helping reunite Ghanaians with their lost identification cards through our secure and efficient system.
                  </Paragraph>
                  <Text style={{ color: '#95a5a6', fontSize: '0.9rem' }}>
                    © 2025 ID Finder Ghana. All rights reserved.
                  </Text>
			</div>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <div>
                  <Title level={4} style={{ color: '#2c3e50', marginBottom: 16 }}>
                    Quick Links
                  </Title>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Link to="/" style={{ color: '#7f8c8d', textDecoration: 'none' }}>
                      Home
                    </Link>
                    <Link to="/search" style={{ color: '#7f8c8d', textDecoration: 'none' }}>
                      Search for ID
                    </Link>
                    <Text style={{ color: '#7f8c8d' }}>How it Works</Text>
                    <Text style={{ color: '#7f8c8d' }}>Privacy Policy</Text>
                  </div>
				</div>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <div>
                  <Title level={4} style={{ color: '#2c3e50', marginBottom: 16 }}>
                    Contact Info
                  </Title>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PhoneOutlined style={{ color: '#52c41a' }} />
                      <Text style={{ color: '#7f8c8d' }}>+233 123 456 789</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MailOutlined style={{ color: '#52c41a' }} />
                      <Text style={{ color: '#7f8c8d' }}>info@idfindergh.com</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <EnvironmentOutlined style={{ color: '#52c41a' }} />
                      <Text style={{ color: '#7f8c8d' }}>Accra, Ghana</Text>
                    </div>
                  </div>
		</div>
              </Col>
            </Row>
          </div>
        </Footer>
      </Layout>
    </Router>
	)
}

export default App