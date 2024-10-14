import dynamic from 'next/dynamic'

const MyWhirld = dynamic(() => import('@/components/myWhirld'), { ssr: false })

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <MyWhirld />
    </main>
  )
}
