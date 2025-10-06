'use client'

import { Connect } from '@stacks/connect-react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Connect
      authOptions={{
        appDetails: {
          name: 'BitBond',
          icon: '/icon.svg',
        },
        redirectTo: '/',
        onFinish: () => {
          console.log('Wallet connected successfully')
        },
        onCancel: () => {
          console.log('Connection cancelled')
        },
      }}
    >
      {children}
    </Connect>
  )
}
