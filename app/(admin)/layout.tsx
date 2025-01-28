import CmsNavbar from '@/components/CmsNavbar'
import { Provider } from '@/utils/Provider'
import './globals.css'

export const metadata = {
  title: 'Dev Scribe - A blog for developers',
  description: 'A blog for developers by developers!'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <CmsNavbar />
          {children}
        </Provider>
      </body>
    </html>
  )
}
