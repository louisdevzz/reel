import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/wallet')({
  component: WalletPage,
})

function WalletPage() {
  return(
    <div className='bg-[#18181b] min-h-screen'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
            <h1 className='text-2xl font-bold text-white'>Wallet</h1>
        </div>
    </div>
  )
}