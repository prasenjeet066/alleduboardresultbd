"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, Download, TrendingUp, Users, Award, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

// Enhanced content parsing function
const parseStatistics = (content: string) => {
  const stats = {
    totalAppeared: 0,
    maleAppeared: 0,
    femaleAppeared: 0,
    totalPassed: 0,
    malePassed: 0,
    femalePassed: 0,
    passPercentage: "N/A",
    totalGPA5: 0,
    maleGPA5: 0,
    femaleGPA5: 0,
  }

  try {
    // Enhanced regex patterns to handle the actual API response format
    const statementMatch = content.match(
      /Total (\d+) $$(\d+) male and (\d+) female$$ students appeared\. Among them (\d+) $$(\d+) male and (\d+) female$$ students passed.*?Percentage of Pass is ([^.]+)\. Total (\d+) $$(\d+) male and (\d+) female$$ students secured GPA 5\.00/,
    )

    if (statementMatch) {
      stats.totalAppeared = Number.parseInt(statementMatch[1])
      stats.maleAppeared = Number.parseInt(statementMatch[2])
      stats.femaleAppeared = Number.parseInt(statementMatch[3])
      stats.totalPassed = Number.parseInt(statementMatch[4])
      stats.malePassed = Number.parseInt(statementMatch[5])
      stats.femalePassed = Number.parseInt(statementMatch[6])
      stats.passPercentage = statementMatch[7]
      stats.totalGPA5 = Number.parseInt(statementMatch[8])
      stats.maleGPA5 = Number.parseInt(statementMatch[9])
      stats.femaleGPA5 = Number.parseInt(statementMatch[10])
    }
  } catch (error) {
    console.error("Error parsing statistics:", error)
  }

  return stats
}

// Enhanced chart components that handle the actual API data format
const PieChartComponent = ({ data, title }: { data: any[]; title: string }) => {
  // Ensure data is valid and has the expected structure
  if (!data || !Array.isArray(data) || data.length < 2) {
    return (
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle className="text-lg font-tiro-bangla text-center">{title || "চার্ট"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 font-tiro-bangla">কোনো ডেটা পাওয়া যায়নি</div>
        </CardContent>
      </Card>
    )
  }

  const headers = data[0] // ["Type", "Count"]
  const chartData = data.slice(1) // Remove header row
  const total = chartData.reduce((sum, item) => {
    const value = typeof item[1] === "number" ? item[1] : Number.parseInt(item[1]) || 0
    return sum + value
  }, 0)

  return (
    <Card className="enhanced-card">
      <CardHeader>
        <CardTitle className="text-lg font-tiro-bangla text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chartData.map((item, index) => {
            const value = typeof item[1] === "number" ? item[1] : Number.parseInt(item[1]) || 0
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0"
            const colors = ["bg-green-500", "bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500"]

            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
                  <span className="font-tiro-bangla text-sm">{item[0]}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{value.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{percentage}%</div>
                </div>
              </div>
            )
          })}
        </div>
        {total === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 font-tiro-bangla">এই বছরের জন্য কোনো ডেটা পাওয়া যায়নি</div>
            <div className="text-sm text-gray-400 mt-2">পরীক্ষার ফলাফল এখনো প্রকাশিত হয়নি বা ডেটা উপলব্ধ নেই</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced bar chart component
const BarChartComponent = ({ data, title }: { data: any[]; title: string }) => {
  if (!data || !Array.isArray(data) || data.length < 2) {
    return (
      <Card className="enhanced-card">
        <CardHeader>
          <CardTitle className="text-lg font-tiro-bangla text-center">{title || "চার্ট"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 font-tiro-bangla">কোনো ডেটা পাওয়া যায়নি</div>
        </CardContent>
      </Card>
    )
  }

  const headers = data[0]
  const chartData = data.slice(1)

  // Calculate max value for scaling
  let maxValue = 0
  chartData.forEach((row) => {
    row.slice(1).forEach((val: any) => {
      const numValue = typeof val === "number" ? val : Number.parseInt(val) || 0
      if (numValue > maxValue) {
        maxValue = numValue
      }
    })
  })

  return (
    <Card className="enhanced-card">
      <CardHeader>
        <CardTitle className="text-lg font-tiro-bangla text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {chartData.map((row, index) => (
            <div key={index} className="space-y-3">
              <div className="font-semibold font-tiro-bangla text-center bg-gray-100 py-2 rounded">{row[0]}</div>
              <div className="grid grid-cols-1 gap-3">
                {row.slice(1).map((value: any, valueIndex: number) => {
                  const numValue = typeof value === "number" ? value : Number.parseInt(value) || 0
                  const width = maxValue > 0 ? Math.max((numValue / maxValue) * 100, 2) : 0
                  const colors = ["bg-green-500", "bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500"]
                  const headerLabel =
                    headers && headers[valueIndex + 1] ? headers[valueIndex + 1] : `Value ${valueIndex + 1}`

                  return (
                    <div key={valueIndex} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-tiro-bangla">{headerLabel}</span>
                        <span className="font-semibold">{numValue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${colors[valueIndex % colors.length]}`}
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        {maxValue === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 font-tiro-bangla">এই বছরের জন্য কোনো ডেটা পাওয়া যায়নি</div>
            <div className="text-sm text-gray-400 mt-2">পরীক্ষার ফলাফল এখনো প্রকাশিত হয়নি বা ডেটা উপলব্ধ নেই</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Add after the existing components, before the main component
const TreeViewComponent = ({ treeUrl }: { treeUrl: string }) => {
  return (
    <Card className="enhanced-card">
      <CardHeader>
        <CardTitle className="text-lg font-tiro-bangla text-center">ট্রি ভিউ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-gray-600 mb-4 font-tiro-bangla">বিস্তারিত ট্রি ভিউ দেখতে নিচের লিংকে ক্লিক করুন</p>
          <Button asChild className="bg-bd-green-600 hover:bg-bd-green-700">
            <a href={`https://eboardresults.com${treeUrl}`} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4 mr-2" />
              ট্রি ভিউ দেখুন
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Table component for tabular data
const DataTableComponent = ({ data, title }: { data: any[]; title: string }) => {
  const headers = data[0]
  const rows = data.slice(1)

  return (
    <Card className="enhanced-card">
      <CardHeader>
        <CardTitle className="text-lg font-tiro-bangla text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse enhanced-table">
            <thead>
              <tr className="bg-bd-green-50">
                {headers.map((header: string, index: number) => (
                  <th key={index} className="border border-gray-300 p-3 text-center font-tiro-bangla">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any[], rowIndex: number) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {row.map((cell: any, cellIndex: number) => (
                    <td key={cellIndex} className="border border-gray-300 p-3 text-center">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <div className="text-center py-8 text-gray-500 font-tiro-bangla">কোনো ডেটা পাওয়া যায়নি</div>}
      </CardContent>
    </Card>
  )
}

export default function BoardAnalysisPage() {
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
        const resultDataParam = searchParams.get("resultData")

        // Validate parameters
        if (!board || !exam || !year) {
          setError("প্রয়োজনীয় তথ্য অনুপস্থিত। অনুগ্রহ করে ফিরে গিয়ে সমস্ত ক্ষেত্র পূরণ করুন।")
          setLoading(false)
          return
        }

        if (resultDataParam) {
          try {
            // First decode the URI component
            const decodedData = decodeURIComponent(resultDataParam)
            console.log("Decoded data:", decodedData)

            // Then parse the JSON
            const parsedData = JSON.parse(decodedData)
            console.log("Parsed data:", parsedData)

            // Validate the parsed data structure
            if (parsedData && typeof parsedData === "object") {
              setResultData(parsedData)
            } else {
              throw new Error("Invalid data structure")
            }
          } catch (parseError) {
            console.error("Error parsing result data:", parseError)

            // Create fallback data instead of showing error
            const board = searchParams.get("board") || "dhaka"
            const exam = searchParams.get("exam") || "ssc"
            const year = searchParams.get("year") || "2024"

            const fallbackData = {
              status: 0,
              resultType: "board_analysis",
              board: board,
              exam: exam,
              year: year,
              extra: {
                content: `<center>BOARD OF INTERMEDIATE & SECONDARY EDUCATION, ${board.toUpperCase()}<br />
          RESULT OF ${exam.toUpperCase()} EXAMINATION, ${year}<br />
        </center><br/><center><h4><u>RESULT ANALYTICS</u></h4></center>
        <div class="alert alert-info text-center" id="err_msg">
          <i><u>Note:</u> This is a fallback display due to data parsing issues.
          <br/><u>Disclaimer:</u> This is Unofficial Analytics Report.</i>
        </div>
        <div class="alert alert-success text-center" id="stmt">
          <b><u>Statement:</u></b> Total 1000 (550 male and 450 female) students appeared. 
          Among them 750 (400 male and 350 female) students passed. Percentage of Pass is 75.0%. 
          Total 150 (80 male and 70 female) students secured GPA 5.00.
        </div>`,
                charts: [
                  {
                    id: "pass_fail_pie",
                    type: "pie",
                    attr: "3d",
                    title: `Passed vs Not Passed [Year: ${year}]`,
                    data: [
                      ["Type", "Count"],
                      ["Passed (750)", 750],
                      ["Not Passed (250)", 250],
                    ],
                  },
                  {
                    id: "gpa_pass_pie",
                    type: "pie",
                    attr: "3d",
                    title: `GPA Countdown [Year: ${year}]`,
                    data: [
                      ["Type", "Count"],
                      ["GPA 5.00 (150)", 150],
                      ["GPA 4.x (300)", 300],
                      ["GPA 3.x (200)", 200],
                      ["GPA 2.x (80)", 80],
                      ["GPA 1.x (20)", 20],
                    ],
                  },
                ],
                charts_alt: [
                  {
                    id: "pass_fail_history",
                    title: "[History] Passed vs Not Passed (Among Appeared)",
                    type: "table",
                    data: [
                      ["Year", "Appeared", "Passed", "Not Passed", "% of Pass", "GPA 5", "% of GPA 5"],
                      [year, 1000, 750, 250, "75.0", 150, "20.0"],
                      [(Number(year) - 1).toString(), 950, 700, 250, "73.7", 140, "20.0"],
                      [(Number(year) - 2).toString(), 900, 650, 250, "72.2", 130, "20.0"],
                    ],
                  },
                ],
              },
              msg: "Fallback board analysis data generated due to parsing issues",
            }

            setResultData(fallbackData)
            toast({
              title: "সতর্কতা",
              description: "ডেটা পার্স করতে সমস্যা হয়েছে। ডেমো ডেটা দেখানো হচ্ছে।",
              variant: "warning",
            })
          }
        } else {
          // If no result data in URL, fetch from API
          try {
            const response = await fetch("/api/results", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                exam,
                year,
                board,
                resultType: "7", // Board analysis
              }),
              cache: "no-store",
            })

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (data.status === 0) {
              setResultData(data)
            } else {
              setError(data.msg || "বোর্ড বিশ্লেষণ পেতে ব্যর্থ হয়েছে।")
            }
          } catch (apiError) {
            console.error("API Error:", apiError)

            // Create fallback data for demonstration
            const fallbackData = {
              status: 0,
              resultType: "board_analysis",
              board: board,
              exam: exam,
              year: year,
              extra: {
                content: `<center>BOARD OF INTERMEDIATE & SECONDARY EDUCATION, ${board.toUpperCase()}<br />
                  RESULT OF ${exam.toUpperCase()} EXAMINATION, ${year}<br />
                </center><br/><center><h4><u>RESULT ANALYTICS</u></h4></center>
                <div class="alert alert-info text-center" id="err_msg">
                  <i><u>Note:</u> This is a fallback display as we couldn't retrieve the actual data from the server.
                  <br/><u>Disclaimer:</u> This is Unofficial Analytics Report.</i>
                </div>
                <div class="alert alert-success text-center" id="stmt">
                  <b><u>Statement:</u></b> Total 1000 (550 male and 450 female) students appeared. 
                  Among them 750 (400 male and 350 female) students passed. Percentage of Pass is 75.0%. 
                  Total 150 (80 male and 70 female) students secured GPA 5.00.
                </div>`,
                charts: [
                  {
                    id: "pass_fail_pie",
                    type: "pie",
                    attr: "3d",
                    title: `Passed vs Not Passed [Year: ${year}]`,
                    data: [
                      ["Type", "Count"],
                      ["Passed (750)", 750],
                      ["Not Passed (250)", 250],
                    ],
                  },
                  {
                    id: "gpa_pass_pie",
                    type: "pie",
                    attr: "3d",
                    title: `GPA Countdown [Year: ${year}]`,
                    data: [
                      ["Type", "Count"],
                      ["GPA 5.00 (150)", 150],
                      ["GPA 4.x (300)", 300],
                      ["GPA 3.x (200)", 200],
                      ["GPA 2.x (80)", 80],
                      ["GPA 1.x (20)", 20],
                    ],
                  },
                  {
                    id: "pass_fail_history",
                    type: "bar",
                    attr: "stacked",
                    title: "[History] Passed vs Not Passed (Among Appeared)",
                    data: [
                      ["Year", "Passed", "Not Passed"],
                      [year, 750, 250],
                      [(Number(year) - 1).toString(), 700, 250],
                      [(Number(year) - 2).toString(), 650, 250],
                      [(Number(year) - 3).toString(), 620, 280],
                      [(Number(year) - 4).toString(), 600, 300],
                    ],
                  },
                  {
                    id: "gpa_pass_history",
                    type: "bar",
                    attr: "stacked",
                    title: "[History] GPA Countdown (Among Passed)",
                    data: [
                      ["Year", "GPA 5.00", "GPA 4.x", "GPA 3.x", "GPA 2.x", "GPA 1.x"],
                      [year, 150, 300, 200, 80, 20],
                      [(Number(year) - 1).toString(), 140, 280, 190, 70, 20],
                      [(Number(year) - 2).toString(), 130, 260, 180, 60, 20],
                      [(Number(year) - 3).toString(), 120, 250, 170, 60, 20],
                      [(Number(year) - 4).toString(), 110, 240, 170, 60, 20],
                    ],
                  },
                ],
                charts_alt: [
                  {
                    id: "pass_fail_history",
                    title: "[History] Passed vs Not Passed (Among Appeared) (% of GPA 5 among passed)",
                    type: "table",
                    data: [
                      ["Year", "Appeared", "Passed", "Not Passed", "% of Pass", "GPA 5", "% of GPA 5"],
                      [year, 1000, 750, 250, "75.0", 150, "20.0"],
                      [(Number(year) - 1).toString(), 950, 700, 250, "73.7", 140, "20.0"],
                      [(Number(year) - 2).toString(), 900, 650, 250, "72.2", 130, "20.0"],
                      [(Number(year) - 3).toString(), 900, 620, 280, "68.9", 120, "19.4"],
                      [(Number(year) - 4).toString(), 900, 600, 300, "66.7", 110, "18.3"],
                    ],
                  },
                  {
                    id: "gpa_pass_history",
                    type: "table",
                    title: "[History] GPA Countdown (Among Passed)",
                    data: [
                      ["Year", "GPA 5.00", "GPA 4.x", "GPA 3.x", "GPA 2.x", "GPA 1.x"],
                      [year, 150, 300, 200, 80, 20],
                      [(Number(year) - 1).toString(), 140, 280, 190, 70, 20],
                      [(Number(year) - 2).toString(), 130, 260, 180, 60, 20],
                      [(Number(year) - 3).toString(), 120, 250, 170, 60, 20],
                      [(Number(year) - 4).toString(), 110, 240, 170, 60, 20],
                    ],
                  },
                ],
              },
              msg: "Fallback board analysis data generated due to API issues",
            }

            setResultData(fallbackData)
            toast({
              title: "সতর্কতা",
              description: "API সংযোগে সমস্যা হয়েছে। ডেমো ডেটা দেখানো হচ্ছে।",
              variant: "warning",
            })
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error processing board analysis:", err)
        setError("বোর্ড বিশ্লেষণ প্রক্রিয়া করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।")
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
        description: "বোর্ড বিশ্লেষণ পিডিএফ তৈরি হচ্ছে...",
      })

      // Import html2canvas and jsPDF dynamically for client-side only
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")

      // Get the analysis card element
      const analysisCard = document.querySelector(".analysis-card") as HTMLElement
      if (!analysisCard) {
        throw new Error("Analysis card element not found")
      }

      // Create a clone of the element to modify for PDF
      const clone = analysisCard.cloneNode(true) as HTMLElement

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
      const board = searchParams.get("board")
      const exam = searchParams.get("exam")
      const year = searchParams.get("year")
      pdf.save(`বোর্ড-বিশ্লেষণ-${board}-${exam}-${year}.pdf`)

      toast({
        title: "সফল",
        description: "বোর্ড বিশ্লেষণ পিডিএফ ডাউনলোড সম্পন্ন হয়েছে।",
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

  // Parse statistics from content
  const statistics = resultData?.extra?.content ? parseStatistics(resultData.extra.content) : null

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
              <h1 className="text-xl font-bold">বাংলাদেশ শিক্ষা বোর্ড বিশ্লেষণ</h1>
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
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
                <Skeleton className="h-64 w-full" />
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
            <div className="analysis-card space-y-8">
              {/* Header */}
              <Card className="border-2 border-gray-200 print:border-0">
                <CardHeader className="text-center border-b pb-6 bg-gradient-to-r from-bd-green-50 to-white print:bg-white">
                  <div className="hidden print:block mb-4">
                    <div className="flex justify-center">
                      <div className="h-20 w-20 national-emblem"></div>
                    </div>
                    <h1 className="text-xl font-bold mt-2">বাংলাদেশ শিক্ষা বোর্ড</h1>
                  </div>
                  <CardTitle className="text-2xl text-bd-green-800">বোর্ড বিশ্লেষণ রিপোর্ট</CardTitle>
                  <CardDescription className="text-lg">
                    {getBoardName(searchParams.get("board") || "")} - {getExamName(searchParams.get("exam") || "")} -{" "}
                    {searchParams.get("year")}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Statistics Overview */}
              {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="enhanced-card">
                    <CardContent className="p-6 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-gray-600">মোট পরীক্ষার্থী</p>
                      <p className="text-2xl font-bold text-blue-600">{statistics.totalAppeared}</p>
                      <p className="text-xs text-gray-500">
                        পুরুষ: {statistics.maleAppeared}, মহিলা: {statistics.femaleAppeared}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="enhanced-card">
                    <CardContent className="p-6 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-gray-600">মোট উত্তীর্ণ</p>
                      <p className="text-2xl font-bold text-green-600">{statistics.totalPassed}</p>
                      <p className="text-xs text-gray-500">
                        পুরুষ: {statistics.malePassed}, মহিলা: {statistics.femalePassed}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="enhanced-card">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm text-gray-600">পাসের হার</p>
                      <p className="text-2xl font-bold text-purple-600">{statistics.passPercentage}</p>
                      <p className="text-xs text-gray-500">সামগ্রিক পারফরম্যান্স</p>
                    </CardContent>
                  </Card>

                  <Card className="enhanced-card">
                    <CardContent className="p-6 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-sm text-gray-600">জিপিএ ৫.০০</p>
                      <p className="text-2xl font-bold text-yellow-600">{statistics.totalGPA5}</p>
                      <p className="text-xs text-gray-500">
                        পুরুষ: {statistics.maleGPA5}, মহিলা: {statistics.femaleGPA5}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tree View Section */}
              {resultData.extra?.tree && <TreeViewComponent treeUrl={resultData.extra.tree} />}

              {/* Charts and Tables */}
              {resultData.extra?.charts && resultData.extra.charts.length > 0 && (
                <Tabs defaultValue="charts" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="charts" className="font-tiro-bangla">
                      চার্ট ভিউ
                    </TabsTrigger>
                    <TabsTrigger value="tables" className="font-tiro-bangla">
                      টেবিল ভিউ
                    </TabsTrigger>
                    {resultData.extra?.tree && (
                      <TabsTrigger value="tree" className="font-tiro-bangla">
                        ট্রি ভিউ
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="charts" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {resultData.extra.charts.map((chart: any, index: number) => {
                        if (chart.type === "pie") {
                          return <PieChartComponent key={index} data={chart.data} title={chart.title} />
                        } else if (chart.type === "bar") {
                          return <BarChartComponent key={index} data={chart.data} title={chart.title} />
                        }
                        return null
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="tables" className="space-y-6">
                    {resultData.extra.charts_alt &&
                      resultData.extra.charts_alt.map((chart: any, index: number) => {
                        if (chart.type === "table") {
                          return <DataTableComponent key={index} data={chart.data} title={chart.title} />
                        }
                        return null
                      })}
                  </TabsContent>

                  {resultData.extra?.tree && (
                    <TabsContent value="tree">
                      <TreeViewComponent treeUrl={resultData.extra.tree} />
                    </TabsContent>
                  )}
                </Tabs>
              )}

              {/* Content Display */}
              {resultData.extra?.content && (
                <Card className="enhanced-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-bd-green-800">বিস্তারিত বিবরণ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose max-w-none font-tiro-bangla"
                      dangerouslySetInnerHTML={{
                        __html: resultData.extra.content
                          .replace(/<center>/g, '<div class="text-center">')
                          .replace(/<\/center>/g, "</div>")
                          .replace(/<br\s*\/?>/g, "<br />")
                          .replace(
                            /class="alert alert-info"/g,
                            'class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"',
                          )
                          .replace(
                            /class="alert alert-success"/g,
                            'class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"',
                          ),
                      }}
                    />

                    {/* Add explanation for empty data */}
                    {statistics && statistics.totalAppeared === 0 && (
                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2 font-tiro-bangla">তথ্য সম্পর্কে</h4>
                        <p className="text-yellow-700 font-tiro-bangla">
                          এই বোর্ড এবং পরীক্ষার জন্য বর্তমানে কোনো ডেটা উপলব্ধ নেই। এটি হতে পারে কারণ:
                        </p>
                        <ul className="list-disc pl-6 mt-2 text-yellow-700 font-tiro-bangla">
                          <li>পরীক্ষার ফলাফল এখনো প্রকাশিত হয়নি</li>
                          <li>এই বোর্ডে এই পরীক্ষা অনুষ্ঠিত হয়নি</li>
                          <li>ডেটা এখনো সিস্টেমে আপডেট করা হয়নি</li>
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Footer */}
              <Card className="enhanced-card">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4 border-t pt-6">
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
                    <div className="text-sm text-muted-foreground text-center">
                      <p>এটি একটি অনানুষ্ঠানিক বিশ্লেষণ রিপোর্ট। অফিসিয়াল তথ্যের জন্য educationboardresults.gov.bd ভিজিট করুন।</p>
                    </div>
                    <div className="flex justify-between w-full text-xs text-muted-foreground">
                      <p>তৈরি তারিখ: {new Date().toLocaleDateString()}</p>
                      <p>
                        রেফারেন্স: {searchParams.get("board")?.toUpperCase()}/{searchParams.get("exam")?.toUpperCase()}/
                        {searchParams.get("year")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
