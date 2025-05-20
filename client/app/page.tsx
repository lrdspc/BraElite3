import React from 'react'
import { Button } from '@/src/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Sistema de Vistorias BraElite3</h1>
      <div className="flex flex-col gap-4">
        <Link href="/inspection/new">
          <Button className="w-full md:w-auto">
            Nova Vistoria
          </Button>
        </Link>
      </div>
    </div>
  )
}
