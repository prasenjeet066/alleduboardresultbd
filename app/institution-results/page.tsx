"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, Download, FileText, School, Users, Award, BarChart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// Get board name from code
const getBoardName = (code: string) => {
  const boards: { [key: string]: string } = {
    dhaka: "ঢাকা বোর্ড",
    rajshahi: "রাজশাহী বোর্ড",
    chittagong: "চট্টগ্রাম বোর্ড",
    khulna: "খুলনা বোর্ড",
    sylhet: "সিলেট বোর্ড",
    barisal: "বরিশাল বোর্ড",
    comilla: "কুমিল্লা বোর্ড",
    dinajpur: "দিনাজpur বোর্ড",
    jessore: "যশোর বোর্ড",
    mymensingh: "ময়মনসিংহ বোর্ড",
  }
  return boards[code] || code
}

// Get exam name from code
const getExamName = (code: string) => {
  const exams: { [key: string]: string } = {
    ssc: "মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি)",
    hsc: "উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি)",
    jsc: "জুনিয়র স্কুল সার্টিফিকেট (জেএসসি)",
    dibs: "ডিআইবিএস (DIBS)",
  }
  return exams[code] || code
}

export default function InstitutionResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resultData, setResultData] = useState<any>(null)
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Get query parameters
        const board = searchParams.get("board")
        const exam = searchParams.get("exam")
        const year = searchParams.get("year")
        const eiin = searchParams.get("eiin")
        const resultDataParam = searchParams.get("resultData")

        // Validate parameters
        if (!board || !exam || !year || !eiin) {
          setError("প্রয়োজনীয় তথ্য অনুপস্থিত। অনুগ্রহ করে ফিরে গিয়ে সমস্ত ক্ষেত্র পূরণ করুন।")
          setLoading(false)
          return
        }

        if (resultDataParam) {
          // Parse the result data from URL params
          const parsedData = JSON.parse(decodeURIComponent(resultDataParam))
          setResultData(parsedData)
        } else {
          // If no result data in URL, fetch from API
          const response = await fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exam,
              year,
              board,
              eiin,
              resultType: "2", // Institutional result
            }),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()

          if (data.status === 0) {
            setResultData(data)
          } else {
            setError(data.msg || "ফলাফল পেতে ব্যর্থ হয়েছে।")
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error processing results:", err)
        setError("ফলাফল প্রক্রিয়া করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।")
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams])

  const handlePrint = () => {
    window.print()
  }

  const handlePDFDownload = async () => {
    try {
      setIsGenerating(true)
      toast({
        title: "অপেক্ষা করুন",
        description: "পিডিএফ তৈরি হচ্ছে...",
      })

      // Import html2canvas and jsPDF dynamically for client-side only
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")

      // Get the result card element
      const resultCard = document.querySelector(".result-card") as HTMLElement
      if (!resultCard) {
        throw new Error("Result card element not found")
      }

      // Create a clone of the element to modify for PDF
      const clone = resultCard.cloneNode(true) as HTMLElement

      // Add necessary styles for PDF rendering
      clone.style.width = "800px"
      clone.style.padding = "20px"
      clone.style.backgroundColor = "white"
      clone.style.position = "absolute"
      clone.style.left = "-9999px"
      clone.style.top = "-9999px"

      // Remove print-hidden elements
      const printHiddenElements = clone.querySelectorAll(".print-hidden")
      printHiddenElements.forEach((el) => {
        el.parentNode?.removeChild(el)
      })

      // Add the clone to the document body temporarily
      document.body.appendChild(clone)

      // Use html2canvas to convert the element to a canvas
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      // Remove the clone from the document
      document.body.removeChild(clone)

      // Create PDF with proper dimensions
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calculate dimensions to fit the image properly on the page
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add the image to the PDF
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

      // Save the PDF
      const eiin = searchParams.get("eiin")
      const year = searchParams.get("year")
      pdf.save(`প্রতিষ্ঠান-ফলাফল-${eiin}-${year}.pdf`)

      toast({
        title: "সফল",
        description: "পিডিএফ ডাউনলোড সম্পন্ন হয়েছে।",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "ত্রুটি",
        description: "পিডিএফ তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-bd-green-700 text-white py-3 shadow-md border-b-4 border-bd-red-700 print-hidden">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span>অনুসন্ধানে ফিরে যান</span>
            </Link>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold">বাংলাদেশ শিক্ষা বোর্ড ফলাফল</h1>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-bd-green-600"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              প্রিন্ট করুন
            </Button>
            {resultData && (
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-bd-green-600"
                onClick={handlePDFDownload}
                disabled={isGenerating}
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? "তৈরি হচ্ছে..." : "পিডিএফ ডাউনলোড"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
                <div>
                  <Skeleton className="h-64 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>ত্রুটি</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-4">
                <Button variant="outline" onClick={() => router.push("/")}>
                  অনুসন্ধানে ফিরে যান
                </Button>
              </div>
            </Alert>
          ) : resultData ? (
            <Card className="border-2 border-gray-200 print:border-0 result-card">
              <CardHeader className="text-center border-b pb-6 bg-gradient-to-r from-bd-green-50 to-white print:bg-white">
                <div className="hidden print:block mb-4">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 national-emblem"></div>
                  </div>
                  <h1 className="text-xl font-bold mt-2">বাংলাদেশ শিক্ষা বোর্ড</h1>
                </div>
                <CardTitle className="text-2xl text-bd-green-800">প্রতিষ্ঠানের ফলাফল</CardTitle>
                <CardDescription className="text-lg">
                  {getExamName(searchParams.get("exam") || "")} - {searchParams.get("year")}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Institution Information */}
                <div className="bg-bd-green-50 p-4 rounded-lg border border-bd-green-100">
                  <div className="flex items-center justify-center mb-4">
                    <School className="h-8 w-8 text-bd-green-600 mr-2" />
                    <h2 className="text-xl font-semibold text-bd-green-800">{resultData.institutionName}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <span className="font-semibold">EIIN:</span> {resultData.eiin}
                      </p>
                      <p>
                        <span className="font-semibold">বোর্ড:</span> {getBoardName(searchParams.get("board") || "")}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-semibold">পরীক্ষা:</span> {getExamName(searchParams.get("exam") || "")}
                      </p>
                      <p>
                        <span className="font-semibold">বছর:</span> {searchParams.get("year")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-center border-b pb-2">পরীক্ষার্থীদের তথ্য</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <Users className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                      <p className="text-sm text-gray-600">পরীক্ষার্থী</p>
                      <p className="text-lg font-semibold">{resultData.stats.examinees}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <Users className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                      <p className="text-sm text-gray-600">উপস্থিত</p>
                      <p className="text-lg font-semibold">{resultData.stats.appeared}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <Award className="h-5 w-5 mx-auto text-green-600 mb-1" />
                      <p className="text-sm text-gray-600">উত্তীর্ণ</p>
                      <p className="text-lg font-semibold">{resultData.stats.passed}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg text-center">
                      <BarChart className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
                      <p className="text-sm text-gray-600">পাসের হার</p>
                      <p className="text-lg font-semibold">{resultData.stats.passPercentage}%</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <Award className="h-5 w-5 mx-auto text-red-600 mb-1" />
                      <p className="text-sm text-gray-600">জিপিএ-৫</p>
                      <p className="text-lg font-semibold">{resultData.stats.gpa5}</p>
                    </div>
                  </div>
                </div>

                {/* Group Results */}
                {resultData.groupResults && resultData.groupResults.length > 0 && (
                  <div className="overflow-x-auto print-break-inside-avoid">
                    <h3 className="text-lg font-semibold mb-4 text-center">বিভাগ অনুযায়ী ফলাফল</h3>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-bd-green-50">
                          <th className="border border-gray-300 p-2 text-left">বিভাগ</th>
                          <th className="border border-gray-300 p-2 text-center">উত্তীর্ণ</th>
                          <th className="border border-gray-300 p-2 text-center">অনুত্তীর্ণ</th>
                          <th className="border border-gray-300 p-2 text-center">জিপিএ-৫</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultData.groupResults.map((group: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border border-gray-300 p-2 font-medium">{group.name}</td>
                            <td className="border border-gray-300 p-2 text-center text-green-600">{group.passed}</td>
                            <td className="border border-gray-300 p-2 text-center text-red-600">{group.failed}</td>
                            <td className="border border-gray-300 p-2 text-center font-semibold">{group.gpa5}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* PDF Link */}
                {resultData.pdfUrl && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                    <p className="mb-2">বিস্তারিত ফলাফল পিডিএফ আকারে দেখুন</p>
                    <Button
                      variant="outline"
                      className="bg-white border-blue-200 hover:bg-blue-50 text-blue-700"
                      asChild
                    >
                      <a href={resultData.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        পিডিএফ দেখুন
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 border-t pt-6">
                <div className="flex justify-center space-x-4 print-hidden">
                  <Button variant="outline" onClick={handlePrint} className="flex items-center space-x-2">
                    <Printer className="h-4 w-4" />
                    <span>প্রিন্ট করুন</span>
                  </Button>
                  <Button
                    variant="default"
                    className="flex items-center space-x-2 bg-bd-green-600 hover:bg-bd-green-700"
                    onClick={handlePDFDownload}
                    disabled={isGenerating}
                  >
                    <FileText className="h-4 w-4" />
                    <span>{isGenerating ? "তৈরি হচ্ছে..." : "পিডিএফ ডাউনলোড"}</span>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>এটি একটি অনানুষ্ঠানিক ফলাফল পোর্টাল। অফিসিয়াল ফলাফলের জন্য educationboardresults.gov.bd ভিজিট করুন।</p>
                </div>
                <div className="flex justify-between w-full text-xs text-muted-foreground">
                  <p>ইস্যু তারিখ: {new Date().toLocaleDateString()}</p>
                  <p>
                    রেফারেন্স: {searchParams.get("eiin")}/{searchParams.get("year")}
                  </p>
                </div>
              </CardFooter>
            </Card>
          ) : null}
        </div>
      </main>

      <footer className="bg-bd-green-800 text-white p-4 mt-12 border-t-4 border-bd-red-700 print-hidden">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p>© {new Date().getFullYear()} অনানুষ্ঠানিক বাংলাদেশ শিক্ষা বোর্ড ফলাফল পোর্টাল। সর্বস্বত্ব সংরক্ষিত।</p>
              <p className="text-sm mt-1">এটি কোনো সরকারি ওয়েবসাইট নয় - শুধুমাত্র তথ্যের উদ্দেশ্যে</p>
            </div>
            <div className="text-center md:text-right">
              <p className="font-medium">ডেভেলপার পরিচিতি</p>
              <p className="text-sm mt-1">
                <span className="mr-2">প্রসেনজিৎ হাওলাদার</span>
                <a
                  href="https://facebook.com/prasenjeet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-white hover:text-blue-200 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  Facebook
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
