import type { Metadata } from "next"
import Link from "next/link"
import { SearchForm } from "@/components/search-form"
import { Suspense } from "react"
import { AlertTriangle, Info } from "lucide-react"

export const metadata: Metadata = {
  title: "বাংলাদেশ শিক্ষা বোর্ড ফলাফল",
  description: "অনলাইনে আপনার পরীক্ষার ফলাফল দেখুন",
}

function SearchFormWrapper() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bd-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
        </div>
      }
    >
      <SearchForm />
    </Suspense>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Improved Header */}
      <div className="header-container print-hidden">
        <div className="header-top">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-arvo">অফিসিয়াল ফলাফলের জন্য: educationboardresults.gov.bd</p>
              <p className="text-sm font-arvo">আজ: {new Date().toLocaleDateString("bn-BD")}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="header-main">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-jacquard text-gray-800">বাংলাদেশ শিক্ষা বোর্ড ফলাফল</h1>
              <p className="text-gray-600 font-arvo mt-1">অনানুষ্ঠানিক ফলাফল পোর্টাল</p>
            </div>

            <nav className="header-nav print-hidden">
              <ul className="flex space-x-8">
                <li>
                  <Link
                    href="/"
                    className="text-gray-800 hover:text-bd-green-600 font-medium transition-colors duration-300 font-arvo"
                  >
                    হোম
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-800 hover:text-bd-green-600 transition-colors duration-300 font-arvo"
                  >
                    সম্পর্কে
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-800 hover:text-bd-green-600 transition-colors duration-300 font-arvo"
                  >
                    যোগাযোগ
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="header-bottom"></div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Main Search Form */}
          <div className="form-container mb-10">
            <div className="form-header">
              <h2 className="text-2xl md:text-3xl font-bold font-jacquard">পরীক্ষার ফলাফল অনুসন্ধান</h2>
              <div className="h-1 w-24 bg-yellow-400 rounded-full mx-auto mt-4"></div>
            </div>

            <div className="form-content bg-white">
              <div className="mb-8 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-3 font-arvo">
                  বাংলাদেশ শিক্ষা বোর্ড ফলাফল পোর্টালে আপনাকে স্বাগতম
                </h3>
                <p className="text-gray-600 font-tiro-bangla">আপনার ফলাফল দেখতে নিচের তথ্য প্রদান করুন</p>
              </div>

              <SearchFormWrapper />
            </div>
          </div>

          {/* Warning Notice */}
          <div className="notice-box warning-box mb-8">
            <div className="notice-box-header">
              <div className="notice-box-icon">
                <AlertTriangle size={18} />
              </div>
              <h3 className="notice-box-title font-arvo">গুরুত্বপূর্ণ বিজ্ঞপ্তি</h3>
            </div>
            <div className="notice-box-content">
              <p className="font-bold text-amber-800 mb-3 font-tiro-bangla">
                এটি বাংলাদেশ শিক্ষা বোর্ডের কোনো অফিসিয়াল ওয়েবসাইট নয়।
              </p>
              <ul className="list-disc pl-6 space-y-2 text-amber-800 font-tiro-bangla">
                <li style="display:none">এটি একটি অনানুষ্ঠানিক সেবা যা তৃতীয় পক্ষের API ব্যবহার করে ফলাফল প্রদর্শন করে</li>
                <li>
                  অফিসিয়াল ফলাফলের জন্য অনুগ্রহ করে{" "}
                  <a
                    href="http://www.educationboardresults.gov.bd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold hover:text-amber-900 transition-colors"
                  >
                    educationboardresults.gov.bd
                  </a>{" "}
                  ভিজিট করুন
                </li>
                <li>এই ওয়েবসাইটের মাধ্যমে প্রাপ্ত ফলাফল শুধুমাত্র তথ্যের উদ্দেশ্যে</li>
                <li>কোনো আইনি বা অফিসিয়াল কাজে এই ফলাফল ব্যবহার করবেন না</li>
              </ul>
            </div>
          </div>

          {/* Info Notice */}
          <div className="notice-box info-box">
            <div className="notice-box-header">
              <div className="notice-box-icon">
                <Info size={18} />
              </div>
              <h3 className="notice-box-title font-arvo">গুরুত্বপূর্ণ নোটিশ</h3>
            </div>
            <div className="notice-box-content">
              <ul className="list-disc pl-6 space-y-2 text-blue-800 font-tiro-bangla">
                <li>২০২৫ সালের মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) পরীক্ষার ফলাফল শীঘ্রই প্রকাশিত হবে</li>
                <li>উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি) ফলাফল এখন উপলব্ধ</li>
                <li>যেকোনো প্রযুক্তিগত সমস্যার জন্য, অনুগ্রহ করে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন</li>
                <li>শিক্ষার্থীরা এসএমএসের মাধ্যমেও ফলাফল দেখতে পারেন। বিস্তারিত জানতে সম্পর্কে পৃষ্ঠা দেখুন</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Improved Footer */}
      <footer className="footer-container print-hidden">
        <div className="footer-top"></div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold mb-4 font-arvo text-white">যোগাযোগ</h4>
              <p className="font-tiro-bangla text-gray-300">
                © {new Date().getFullYear()} অনানুষ্ঠানিক বাংলাদেশ শিক্ষা বোর্ড ফলাফল পোর্টাল।
                <br />
                সর্বস্বত্ব সংরক্ষিত।
              </p>
              <p className="text-sm mt-2 text-gray-400 font-arvo">এটি কোনো সরকারি ওয়েবসাইট নয় - শুধুমাত্র তথ্যের উদ্দেশ্যে</p>
            </div>

            <div className="text-center">
              <h4 className="text-xl font-bold mb-4 font-arvo text-white">দ্রুত লিংক</h4>
              <ul className="space-y-2 font-tiro-bangla text-gray-300">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    হোম পেজ
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    ডেভেলপার সম্পর্কে
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    সাহায্য
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    যোগাযোগ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center md:text-right">
              <h4 className="text-xl font-bold mb-4 font-arvo text-white">ডেভেলপার</h4>
              <p className="font-bold font-arvo text-gray-300">প্রসেনজিৎ হাওলাদার</p>
              <a
                href="https://facebook.com/prasenjeet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-gray-300 hover:text-white transition-colors mt-2 font-arvo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                Facebook
              </a>
              <div className="mt-2">
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors font-arvo">
                  বিস্তারিত দেখুন →
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 font-arvo">Made with ❤️ for the students of Bangladesh</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
