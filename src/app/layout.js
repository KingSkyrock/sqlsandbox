import './globals.scss'

export const metadata = {
  title: 'Sandbox SQL',
  description: 'Learn and play around with SQL',
}

export default function RootLayout({ children }) {
  return (
    <html id="root" lang="en">
      <body>{children}</body>
    </html>
  )
}
