import './globals.css'

export const metadata = {
  title: 'AI Mentor App',
  description: 'Goal Tracker mit KI-Mentor',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
