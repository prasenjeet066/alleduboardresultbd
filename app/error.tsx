"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-bd-red-600">ত্রুটি</h1>
        <h2 className="text-2xl font-semibold">কিছু একটা ভুল হয়েছে</h2>
        <p className="text-gray-600">
          আমরা অসুবিধার জন্য দুঃখিত। অনুগ্রহ করে পরে আবার চেষ্টা করুন বা সমস্যা অব্যাহত থাকলে সাপোর্টের সাথে যোগাযোগ করুন।
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} className="bg-bd-green-600 hover:bg-bd-green-700">
            আবার চেষ্টা করুন
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">হোম পেজে ফিরে যান</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
