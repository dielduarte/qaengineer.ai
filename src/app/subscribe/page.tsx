"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between m-auto">
          <div className="flex items-center gap-2">
            <div className="font-bold text-xl">Qaengineer.ai</div>
          </div>
        </div>
      </header>
        <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-background/90">
          <div className="container px-4 md:px-6 m-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-sm font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Thank you for subscribing.
              </h1>

              <Button className="px-8" type="submit" asChild>
                <Link href="/">Go to home page</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
export default function SubscribePage() {
  return (
    <Subscribe />
  )
}

