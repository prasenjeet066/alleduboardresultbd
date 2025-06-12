import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-bd-green-700">৪০৪</h1>
        <h2 className="text-2xl font-semibold">পৃষ্ঠা পাওয়া যায়নি</h2>
        <p className="text-gray-600">আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা সরানো হয়েছে।</p>
        <Button asChild className="bg-bd-green-600 hover:bg-bd-green-700">
          <Link href="/">হোম পেজে ফিরে যান</Link>
        </Button>
      </div>
    </div>
  )
}
