"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
function Subscribe() {
  const searchParams = useSearchParams()
 
  const id = searchParams.get('id')

  useEffect(() => {
    if(id) {
      fetch('/api/confirm', {
        method: 'POST',
        body: JSON.stringify({ id }),
      })
    }
  }, [id])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="mb-4 text-lg">
         Thank you for subscribing and supporting this idea!
        </p>
      </div>
    </div>
  )
}
export default function SubscribePage() {
  return (
    <Suspense>
      <Subscribe />
    </Suspense>
  )
}

