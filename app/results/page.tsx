"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, FileText, CheckCircle, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
    dinajpur: "দিনাজপুর বোর্ড",
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

// Get result status based on GPA
const getResultStatus = (gpa: string | number) => {
  const gpaNum = typeof gpa === "string" ? Number.parseFloat(gpa) : gpa
  if (isNaN(gpaNum)) return "ফলাফল প্রক্রিয়াধীন"

  if (gpaNum >= 5.0) return "A+ (বিশেষ কৃতিত্বসহ উত্তীর্ণ)"
  if (gpaNum >= 4.0) return "A (কৃতিত্বসহ উত্তীর্ণ)"
  if (gpaNum >= 3.5) return "A- (উত্তীর্ণ)"
  if (gpaNum >= 3.0) return "B (উত্তীর্ণ)"
  if (gpaNum >= 2.0) return "C (উত্তীর্ণ)"
  if (gpaNum >= 1.0) return "D (উত্তীর্ণ)"
  return "F (অনুত্তীর্ণ)"
}

export default function ResultsPage() {
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
        const roll = searchParams.get("roll")
        const board = searchParams.get("board")
        const exam = searchParams.get("exam")
        const year = searchParams.get("year")
        const reg = searchParams.get("reg")
        const resultDataParam = searchParams.get("resultData")

        // Validate parameters
        if (!roll || !board || !exam || !year || !reg) {
          setError("প্রয়োজনীয় তথ্য অনুপস্থিত। অনুগ্রহ করে ফিরে গিয়ে সমস্ত ক্ষেত্র পূরণ করুন।")
          setLoading(false)
          return
        }

        if (resultDataParam) {
          try {
            // Parse the result data from URL params
            const parsedData = JSON.parse(decodeURIComponent(resultDataParam))
            console.log("Parsed result data:", parsedData)
            setResultData(parsedData)
          } catch (parseError) {
            console.error("Error parsing result data:", parseError)
            setError("ফলাফল ডেটা পার্স করতে ব্যর্থ হয়েছে।")
          }
        } else {
          // If no result data in URL, fetch from API
          const response = await fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exam,
              year,
              board,
              roll,
              reg,
              resultType: "1", // Individual result
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

  const handleTranscriptDownload = async () => {
    try {
      setIsGenerating(true)
      toast({
        title: "অপেক্ষা করুন",
        description: "অফিসিয়াল ট্রান্সক্রিপ্ট তৈরি হচ্ছে...",
      })

      // Import the PDF generator
      const { generatePDF } = await import("@/components/pdf-generator")

      await generatePDF({
        studentData: {
          ...resultData,
          centre: resultData.centre || resultData.inst?.split("(")[0]?.trim() || "",
        },
        examData: {
          roll: searchParams.get("roll") || "",
          reg: searchParams.get("reg") || "",
          board: searchParams.get("board") || "",
          exam: searchParams.get("exam") || "",
          year: searchParams.get("year") || "",
        },
      })

      toast({
        title: "সফল",
        description: "অফিসিয়াল ট্রান্সক্রিপ্ট ডাউনলোড সম্পন্ন হয়েছে।",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "ত্রুটি",
        description: "ট্রান্সক্রিপ্ট তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-800 hover:text-bd-green-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-tiro-bangla">অনুসন্ধানে ফিরে যান</span>
              </Link>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold font-jacquard text-gray-800">বাংলাদেশ শিক্ষা বোর্ড ফলাফল</h1>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-bd-green-600 text-bd-green-600 hover:bg-bd-green-50"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                <span className="font-tiro-bangla">প্রিন্ট করুন</span>
              </Button>
              {resultData && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-bd-green-600 text-bd-green-600 hover:bg-bd-green-50"
                  onClick={handleTranscriptDownload}
                  disabled={isGenerating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="font-tiro-bangla">{isGenerating ? "তৈরি হচ্ছে..." : "ট্রান্সক্রিপ্ট ডাউনলোড"}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="header-bottom"></div>
      </div>

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
              <AlertTitle className="font-arvo">ত্রুটি</AlertTitle>
              <AlertDescription className="font-tiro-bangla">{error}</AlertDescription>
              <div className="mt-4 space-x-2">
                <Button variant="outline" onClick={() => window.location.reload()} className="font-tiro-bangla">
                  আবার চেষ্টা করুন
                </Button>
                <Button variant="outline" onClick={() => router.push("/")} className="font-tiro-bangla">
                  হোম পেজে ফিরে যান
                </Button>
              </div>
            </Alert>
          ) : resultData ? (
            <Card className="border-2 border-gray-200 print:border-0 result-card enhanced-card">
              <CardHeader className="text-center border-b pb-6 bg-gray-50 print:bg-white">
                <div className="hidden print:block mb-4">
                  <h2 className="text-lg font-bold font-jacquard text-gray-800">
                    {getBoardName(searchParams.get("board") || resultData.board || "")}
                  </h2>
                </div>
                <div className="flex justify-center items-center space-x-4">
                  <h2 className="text-lg font-bold font-jacquard text-gray-800">
                    {getExamName(searchParams.get("exam") || resultData.exam || "")}
                  </h2>
                  <p className="text-lg font-bold font-jacquard text-gray-800">
                    ({searchParams.get("year") || resultData.year || ""})
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Student Information */}
                <div className="bg-bd-green-50 p-4 rounded-lg border border-bd-green-100">
                  <h3 className="text-lg font-semibold text-bd-green-800 mb-4 text-center">শিক্ষার্থীর তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">নাম</p>
                      <p className="font-semibold">{resultData.name || "শিক্ষার্থীর নাম"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">রোল নম্বর</p>
                      <p className="font-semibold">{resultData.roll || searchParams.get("roll")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">পিতার নাম</p>
                      <p className="font-semibold">{resultData.fname || "পিতার নাম"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">রেজিস্ট্রেশন নম্বর</p>
                      <p className="font-semibold">{resultData.reg || searchParams.get("reg")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">মাতার নাম</p>
                      <p className="font-semibold">{resultData.mname || "মাতার নাম"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">গ্রুপ</p>
                      <p className="font-semibold">{resultData.group || "সাধারণ"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">প্রতিষ্ঠান</p>
                      <p className="font-semibold">{resultData.inst || "শিক্ষা প্রতিষ্ঠান"}</p>
                    </div>
                  </div>
                </div>

                {/* Results Table */}
                {resultData.table && resultData.table.length > 0 ? (
                  <div className="overflow-x-auto">
                    <h3 className="text-lg font-semibold mb-4 text-center">বিষয়ভিত্তিক ফলাফল</h3>
                    <table className="w-full border-collapse enhanced-table">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-3 text-left">বিষয়ের কোড</th>
                          <th className="border border-gray-300 p-3 text-left">বিষয়ের নাম</th>
                          <th className="border border-gray-300 p-3 text-center">গ্রেড</th>
                          <th className="border border-gray-300 p-3 text-center">পয়েন্ট</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultData.table.map((subject: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border border-gray-300 p-3">{subject.code || "---"}</td>
                            <td className="border border-gray-300 p-3 font-medium">{subject.name || "বিষয়"}</td>
                            <td className="border border-gray-300 p-3 text-center font-semibold">
                              {subject.grade || "---"}
                            </td>
                            <td className="border border-gray-300 p-3 text-center">{subject.point || "---"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">বিষয়ভিত্তিক ফলাফল পাওয়া যায়নি।</p>
                  </div>
                )}

                {/* GPA and Result Status */}
                <div className="bg-white p-6 rounded-lg border-2 border-bd-green-200 text-center">
                  <h3 className="text-xl font-semibold mb-4">সামগ্রিক ফলাফল</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">জিপিএ (GPA)</p>
                      <p className="text-3xl font-bold text-bd-green-600">{resultData.gpa || "0.00"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">ফলাফল</p>
                      <p className="text-lg font-semibold text-bd-green-800">
                        {getResultStatus(resultData.gpa || "0")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notice */}
                {resultData.notice && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">বিশেষ নোটিশ</h4>
                    <p className="text-blue-700">{resultData.notice}</p>
                  </div>
                )}

                {/* Download Section */}
                {resultData && (
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-center">ডাউনলোড অপশন</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                        <Printer className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                        <h4 className="font-medium mb-2">প্রিন্ট করুন</h4>
                        <p className="text-sm text-gray-600 mb-4">ফলাফল সরাসরি প্রিন্ট করুন</p>
                        <Button variant="outline" onClick={handlePrint} className="w-full">
                          <Printer className="h-4 w-4 mr-2" />
                          <span>প্রিন্ট করুন</span>
                        </Button>
                      </div>

                      <div className="bg-bd-green-50 p-4 rounded-lg border border-bd-green-100 text-center">
                        <FileText className="h-6 w-6 mx-auto mb-2 text-bd-green-600" />
                        <h4 className="font-medium mb-2">অফিসিয়াল ট্রান্সক্রিপ্ট</h4>
                        <p className="text-sm text-gray-600 mb-4">অফিসিয়াল ট্রান্সক্রিপ্ট ডাউনলোড করুন</p>
                        <Button
                          onClick={handleTranscriptDownload}
                          className="w-full bg-bd-green-600 hover:bg-bd-green-700"
                          disabled={isGenerating}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          <span>{isGenerating ? "তৈরি হচ্ছে..." : "ট্রান্সক্রিপ্ট ডাউনলোড"}</span>
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-blue-800">অফিসিয়াল ট্রান্সক্রিপ্টে নিম্নলিখিত বৈশিষ্ট্য রয়েছে:</p>
                          <ul className="text-xs text-blue-700 mt-1 list-disc pl-5 space-y-1">
                            <li>অফিসিয়াল ফরম্যাট অনুযায়ী ডিজাইন</li>
                            <li>সমস্ত শিক্ষার্থীর তথ্য</li>
                            <li>বিষয়ভিত্তিক ফলাফল</li>
                            <li>সিরিয়াল নম্বর এবং ভেরিফিকেশন কোড</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertTitle className="font-arvo">কোনো ফলাফল পাওয়া যায়নি</AlertTitle>
              <AlertDescription className="font-tiro-bangla">
                দুঃখিত, আপনার প্রদত্ত তথ্যের জন্য কোনো ফলাফল পাওয়া যায়নি।
              </AlertDescription>
              <div className="mt-4">
                <Button variant="outline" onClick={() => router.push("/")} className="font-tiro-bangla">
                  হোম পেজে ফিরে যান
                </Button>
              </div>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}
