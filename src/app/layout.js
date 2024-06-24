import './globals.scss'
import { GoogleOAuthProvider } from '@react-oauth/google';
import oauthConfig from '../../oauth.config.js'

export const metadata = {
  title: 'Sandbox SQL',
  description: 'Learn and play around with SQL! Sandbox SQL is a online SQL editor and compiler where you can write and execute SQLite queries online.',
	openGraph: {
		title: 'Sandbox SQL',
		description:
			'Learn and play around with SQL! Sandbox SQL is a online SQL editor and compiler where you can write and execute SQLite queries online.',
		url: 'https://sandboxsql.com',
		type: 'website',
		images: [
			{
				url: '/images/sandboxsqllogo.png',
				alt: 'Sandbox SQL',
			},
		],
	},
}

export default function RootLayout({ children }) {
  return (
    <html id="root" lang="en">
      <head>
				<link
					rel="icon"
					type="image/png"
					href="/images/sandboxsqllogo.png"
				/>
			</head>
			<body><GoogleOAuthProvider clientId={oauthConfig.clientid}>{children}</GoogleOAuthProvider></body>
    </html>
  )
}
