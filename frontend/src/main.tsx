import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ConfigProvider, theme } from 'antd'
import 'antd/dist/reset.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ConfigProvider
			theme={{
				algorithm: theme.defaultAlgorithm,
				token: {
					colorPrimary: '#52c41a',
					colorBgBase: '#f6ffed',
				},
			}}
		>
			<App />
		</ConfigProvider>
	</React.StrictMode>,
)
