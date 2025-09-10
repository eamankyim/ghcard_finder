import { Typography, Button, Row, Col } from 'antd'
import { Link } from 'react-router-dom'
import { SearchOutlined, SafetyOutlined } from '@ant-design/icons'
import heroImage from '../assets/images/compressed-original.webp'

const { Title, Paragraph } = Typography

function WelcomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '0 24px'
    }}>
      {/* Hero Banner Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.3
      }} />
      
      {/* Hero Content Container */}
      <div style={{ 
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        zIndex: 1
      }}>
        <Row gutter={[48, 48]} align="middle">
          {/* Left Side - Hero Text */}
          <Col xs={24} lg={12}>
            <div style={{ textAlign: 'left' }}>
              {/* Hero Icon */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: 'inline-block',
                  padding: '16px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                  <SafetyOutlined style={{ 
                    fontSize: 60, 
                    color: 'white'
                  }} />
                </div>
              </div>
              
              {/* Hero Text */}
              <Title level={1} style={{ 
                color: 'white', 
                fontSize: '3.5rem',
                fontWeight: '900',
                marginBottom: 20,
                lineHeight: 1.1,
                letterSpacing: '1px'
              }}>
                FIND YOUR LOST ID
              </Title>
              
              <Title level={2} style={{ 
                color: 'rgba(255,255,255,0.95)', 
                fontSize: '1.6rem',
                fontWeight: '700',
                marginBottom: 32,
                letterSpacing: '0.5px'
              }}>
                Reuniting Ghanaians with their identification cards
              </Title>
              
              {/* Hero Button */}
              <div style={{ marginBottom: 32 }}>
                <Link to="/search">
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<SearchOutlined />}
                    style={{
                      height: 60,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      padding: '0 40px',
                      background: 'white',
                      color: '#52c41a',
                      border: 'none',
                      borderRadius: 30,
                      transition: 'all 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    }}
                  >
                    FIND MY DOCUMENT
                  </Button>
                </Link>
              </div>
              
              {/* Hero Subtitle */}
              <Paragraph style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '1.1rem',
                fontWeight: '500',
                lineHeight: 1.6,
                maxWidth: 500
              }}>
                Lost your Ghana Card, Driver's License, or other ID? Our secure system helps you find and reclaim 
                your identification cards when they're found by good samaritans across Ghana.
              </Paragraph>
            </div>
          </Col>
          
          {/* Right Side - Hero Image */}
          <Col xs={24} lg={12}>
            <img 
              src={heroImage} 
              alt="Hero Image" 
              style={{
                width: '100%',
                height: 'auto',
                animation: 'float 8s ease-in-out infinite'
              }}
            />
          </Col>
        </Row>
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes float {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(10px, -15px) rotate(1deg); }
          50% { transform: translate(-5px, -25px) rotate(-1deg); }
          75% { transform: translate(-10px, -10px) rotate(0.5deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
      `}</style>
    </div>
  )
}

export default WelcomePage
