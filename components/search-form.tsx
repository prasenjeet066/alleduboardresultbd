"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2, RefreshCw, AlertTriangle, Info, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z
  .object({
    exam: z.string().min(1, "অনুগ্রহ করে একটি পরীক্ষা নির্বাচন করুন"),
    year: z.string().min(1, "অনুগ্রহ করে একটি বছর নির্বাচন করুন"),
    board: z.string().min(1, "অনুগ্রহ করে একটি বোর্ড নির্বাচন করুন"),
    resultType: z.string().min(1, "ফলাফলের ধরন নির্বাচন করুন"),
    roll: z.string().optional(),
    reg: z.string().optional(),
    eiin: z.string().optional(),
    captcha: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.resultType === "1") {
        return data.roll && data.roll.length >= 6 && data.reg && data.reg.length >= 6
      }
      return true
    },
    {
      message: "রোল নম্বর এবং রেজিস্ট্রেশন নম্বর কমপক্ষে ৬ অক্ষর হতে হবে",
      path: ["roll"],
    },
  )
  .refine(
    (data) => {
      if (data.resultType === "2") {
        return data.eiin && data.eiin.length > 0
      }
      return true
    },
    {
      message: "EIIN নম্বর লিখুন",
      path: ["eiin"],
    },
  )

export function SearchForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaUrl, setCaptchaUrl] = useState("")
  const [captchaError, setCaptchaError] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exam: "",
      year: "",
      board: "",
      resultType: "1",
      roll: "",
      reg: "",
      captcha: "",
      eiin: "",
    },
  })
 
  const loadCaptcha = () => {
    try {
      const timestamp = Date.now()
      setCaptchaUrl(`/api/captcha?t=${timestamp}`)
      setCaptchaError(false)
    } catch (error) {
      console.error("Error loading captcha:", error)
      setCaptchaError(true)
    }
  }

  const refreshCaptcha = () => {
    form.setValue("captcha", "")
    loadCaptcha()
  }

  const redirectToResults = (values: any, data: any, message: string) => {
    try {
      // Check if it's board analysis
      if (values.resultType === "7" || data.resultType === "board_analysis") {
        // Ensure data is properly structured before encoding
        const cleanData = {
          status: data.status || 0,
          resultType: "board_analysis",
          board: values.board || data.board || "dhaka",
          exam: values.exam || data.exam || "ssc",
          year: values.year || data.year || "2024",
          extra: data.extra || {},
          msg: data.msg || "Board analysis data",
        }

        const queryParams = new URLSearchParams({
          board: cleanData.board,
          exam: cleanData.exam,
          year: cleanData.year,
          resultData: encodeURIComponent(JSON.stringify(cleanData)),
        })

        router.push(`/board-analysis?${queryParams.toString()}`)
        toast({ title: "সফল", description: message })
        return
      }

      // Check if it's an institutional result
      if (values.resultType === "2" || data.resultType === "institutional") {
        const cleanData = {
          status: data.status || 0,
          resultType: "institutional",
          institutionName: data.institutionName || "শিক্ষা প্রতিষ্ঠান",
          eiin: values.eiin || data.eiin || "",
          board: values.board || data.board || "dhaka",
          exam: values.exam || data.exam || "ssc",
          year: values.year || data.year || "2024",
          stats: data.stats || {},
          groupResults: data.groupResults || [],
          pdfUrl: data.pdfUrl || null,
          rawContent: data.rawContent || "",
        }

        const queryParams = new URLSearchParams({
          eiin: cleanData.eiin,
          board: cleanData.board,
          exam: cleanData.exam,
          year: cleanData.year,
          resultData: encodeURIComponent(JSON.stringify(cleanData)),
        })

        router.push(`/institution-results?${queryParams.toString()}`)
        toast({ title: "সফল", description: message })
        return
      }

      // Individual result
      const cleanData = {
        status: data.status || 0,
        resultType: "individual",
        name: data.name || "শিক্ষার্থীর নাম",
        fname: data.fname || "পিতার নাম",
        mname: data.mname || "মাতার নাম",
        roll: values.roll || data.roll || "123456",
        reg: values.reg || data.reg || "1234567890",
        inst: data.inst || "শিক্ষা প্রতিষ্ঠান",
        group: data.group || "সাধারণ",
        gpa: data.gpa || "0.00",
        table: data.table || [],
        board: values.board || data.board || "dhaka",
        year: values.year || data.year || "2024",
        exam: values.exam || data.exam || "ssc",
        notice: data.notice || "",
      }

      const queryParams = new URLSearchParams({
        roll: cleanData.roll,
        board: cleanData.board,
        exam: cleanData.exam,
        year: cleanData.year,
        reg: cleanData.reg,
        resultData: encodeURIComponent(JSON.stringify(cleanData)),
      })

      router.push(`/results?${queryParams.toString()}`)
      toast({ title: "সফল", description: message })
    } catch (error) {
      console.error("Error redirecting to results:", error)
      toast({
        title: "ত্রুটি",
        description: "ফলাফল পৃষ্ঠায় যেতে ব্যর্থ হয়েছে।",
        variant: "destructive",
      })

      // Fallback to home page
      setTimeout(() => {
        router.push("/")
      }, 2000)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Special handling for board analysis to provide fallback data if needed
      if (values.resultType === "7") {
        try {
          const response = await fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exam: values.exam,
              year: values.year,
              board: values.board,
              resultType: values.resultType,
            }),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()

          if (data.status === 0) {
            redirectToResults(values, data, "বোর্ড বিশ্লেষণ সফলভাবে পাওয়া গেছে।")
          } else {
            // Create fallback data for board analysis
            const fallbackData = {
              status: 0,
              resultType: "board_analysis",
              board: values.board,
              exam: values.exam,
              year: values.year,
              extra: {
                content: `<center>BOARD OF INTERMEDIATE & SECONDARY EDUCATION, ${values.board.toUpperCase()}<br />
                  RESULT OF ${values.exam.toUpperCase()} EXAMINATION, ${values.year}<br />
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
                    title: `Passed vs Not Passed [Year: ${values.year}]`,
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
                    title: `GPA Countdown [Year: ${values.year}]`,
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
                      [values.year, 750, 250],
                      [(Number(values.year) - 1).toString(), 700, 250],
                      [(Number(values.year) - 2).toString(), 650, 250],
                      [(Number(values.year) - 3).toString(), 620, 280],
                      [(Number(values.year) - 4).toString(), 600, 300],
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
                      [values.year, 1000, 750, 250, "75.0", 150, "20.0"],
                      [(Number(values.year) - 1).toString(), 950, 700, 250, "73.7", 140, "20.0"],
                      [(Number(values.year) - 2).toString(), 900, 650, 250, "72.2", 130, "20.0"],
                    ],
                  },
                ],
              },
              msg: "Fallback board analysis data generated due to API issues",
            }

            redirectToResults(values, fallbackData, "ডেমো বোর্ড বিশ্লেষণ দেখানো হচ্ছে।")
            toast({
              title: "সতর্কতা",
              description: "API সংযোগে সমস্যা হয়েছে। ডেমো ডেটা দেখানো হচ্ছে।",
              variant: "warning",
            })
          }
          return
        } catch (error) {
          console.error("Board analysis error:", error)
          // Continue to fallback data
          const fallbackData = {
            status: 0,
            resultType: "board_analysis",
            board: values.board,
            exam: values.exam,
            year: values.year,
            extra: {
              content: `<center>BOARD OF INTERMEDIATE & SECONDARY EDUCATION, ${values.board.toUpperCase()}<br />
                RESULT OF ${values.exam.toUpperCase()} EXAMINATION, ${values.year}<br />
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
                  title: `Passed vs Not Passed [Year: ${values.year}]`,
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
                  title: `GPA Countdown [Year: ${values.year}]`,
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
                  title: "[History] Passed vs Not Passed (Among Appeared) (% of GPA 5 among passed)",
                  type: "table",
                  data: [
                    ["Year", "Appeared", "Passed", "Not Passed", "% of Pass", "GPA 5", "% of GPA 5"],
                    [values.year, 1000, 750, 250, "75.0", 150, "20.0"],
                    [(Number(values.year) - 1).toString(), 950, 700, 250, "73.7", 140, "20.0"],
                    [(Number(values.year) - 2).toString(), 900, 650, 250, "72.2", 130, "20.0"],
                  ],
                },
              ],
            },
            msg: "Fallback board analysis data generated due to API issues",
          }

          redirectToResults(values, fallbackData, "ডেমো বোর্ড বিশ্লেষণ দেখানো হচ্ছে।")
          toast({
            title: "সতর্কতা",
            description: "API সংযোগে সমস্যা হয়েছে। ডেমো ডেটা দেখানো হচ্ছে।",
            variant: "warning",
          })
          return
        }
      }

      // Regular API call for other result types
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam: values.exam,
          year: values.year,
          board: values.board,
          resultType: values.resultType,
          roll: values.roll,
          reg: values.reg,
          captcha: values.captcha,
          eiin: values.eiin,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 0) {
        redirectToResults(values, data, "ফলাফল সফলভাবে পাওয়া গেছে।")
      } else {
        // Check if it's a security token error
        if (data.msg && data.msg.includes("Securit")) {
          toast({
            title: "নিরাপত্তা ত্রুটি",
            description: "API নিরাপত্তা টোকেন সমস্যা। সঠিক কুকি সেট করা আছে কিনা নিশ্চিত করুন।",
            variant: "destructive",
          })
        } else {
          toast({
            title: "ত্রুটি",
            description: data.msg || "ফলাফল পেতে ব্যর্থ হয়েছে।",
            variant: "destructive",
          })
        }
        refreshCaptcha()
      }
    } catch (error) {
      console.error("Error fetching result:", error)
      toast({
        title: "নেটওয়ার্ক ত্রুটি",
        description: "সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer Alert */}
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
        <AlertDescription className="text-red-800 font-tiro-bangla">
          <strong>বিজ্ঞপ্তি:</strong> এটি বাংলাদেশ শিক্ষা বোর্ডের অফিসিয়াল ওয়েবসাইট নয়। অফিসিয়াল ফলাফলের জন্য{" "}
          <a
            href="http://www.educationboardresults.gov.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold hover:text-red-900"
          >
            educationboardresults.gov.bd
          </a>{" "}
          ভিজিট করুন।
        </AlertDescription>
      </Alert>

      <Alert className="bg-blue-50 hide border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 font-tiro-bangla">
          <strong>eboardresults.com:</strong> এই API ব্যবহার করতে সঠিক কুকি প্রয়োজন।
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="exam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium font-tiro-bangla">পরীক্ষা</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white font-tiro-bangla">
                        <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="jsc" className="font-tiro-bangla">
                        জুনিয়র স্কুল সার্টিফিকেট (জেএসসি)
                      </SelectItem>
                      <SelectItem value="ssc" className="font-tiro-bangla">
                        মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি)
                      </SelectItem>
                      <SelectItem value="hsc" className="font-tiro-bangla">
                        উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি)
                      </SelectItem>
                      <SelectItem value="dibs" className="font-tiro-bangla">
                        ডিআইবিএস (DIBS)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="font-tiro-bangla" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium font-tiro-bangla">পাসের বছর</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white font-tiro-bangla">
                        <SelectValue placeholder="বছর নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2025" className="font-tiro-bangla">
                        ২০২৫
                      </SelectItem>
                      <SelectItem value="2024" className="font-tiro-bangla">
                        ২০২৪
                      </SelectItem>
                      <SelectItem value="2023" className="font-tiro-bangla">
                        ২০২৩
                      </SelectItem>
                      <SelectItem value="2022" className="font-tiro-bangla">
                        ২০২২
                      </SelectItem>
                      <SelectItem value="2021" className="font-tiro-bangla">
                        ২০২১
                      </SelectItem>
                      <SelectItem value="2020" className="font-tiro-bangla">
                        ২০২০
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="font-tiro-bangla" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="board"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium font-tiro-bangla">শিক্ষা বোর্ড</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white font-tiro-bangla">
                      <SelectValue placeholder="বোর্ড নির্বাচন করুন" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dhaka" className="font-tiro-bangla">
                      ঢাকা
                    </SelectItem>
                    <SelectItem value="rajshahi" className="font-tiro-bangla">
                      রাজশাহী
                    </SelectItem>
                    <SelectItem value="chittagong" className="font-tiro-bangla">
                      চট্টগ্রাম
                    </SelectItem>
                    <SelectItem value="khulna" className="font-tiro-bangla">
                      খুলনা
                    </SelectItem>
                    <SelectItem value="sylhet" className="font-tiro-bangla">
                      সিলেট
                    </SelectItem>
                    <SelectItem value="barisal" className="font-tiro-bangla">
                      বরিশাল
                    </SelectItem>
                    <SelectItem value="comilla" className="font-tiro-bangla">
                      কুমিল্লা
                    </SelectItem>
                    <SelectItem value="dinajpur" className="font-tiro-bangla">
                      দিনাজপুর
                    </SelectItem>
                    <SelectItem value="jessore" className="font-tiro-bangla">
                      যশোর
                    </SelectItem>
                    <SelectItem value="mymensingh" className="font-tiro-bangla">
                      ময়মনসিংহ
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="font-tiro-bangla" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resultType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium font-tiro-bangla">ফলাফলের ধরন</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white font-tiro-bangla">
                      <SelectValue placeholder="ফলাফলের ধরন নির্বাচন করুন" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1" className="font-tiro-bangla">
                      ব্যক্তিগত ফলাফল
                    </SelectItem>
                    <SelectItem value="2" className="font-tiro-bangla">
                      প্রতিষ্ঠানের ফলাফল
                    </SelectItem>
                    <SelectItem value="7" className="font-tiro-bangla">
                      বোর্ড বিশ্লেষণ
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="font-tiro-bangla" />
              </FormItem>
            )}
          />

          {/* Show roll and reg fields only for individual results */}
          {form.watch("resultType") === "1" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="roll"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium font-tiro-bangla">পরীক্ষার রোল নম্বর</FormLabel>
                    <FormControl>
                      <Input placeholder="আপনার রোল নম্বর লিখুন" {...field} className="bg-white font-tiro-bangla" />
                    </FormControl>
                    <FormMessage className="font-tiro-bangla" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium font-tiro-bangla">রেজিস্ট্রেশন নম্বর</FormLabel>
                    <FormControl>
                      <Input placeholder="আপনার রেজিস্ট্রেশন নম্বর লিখুন" {...field} className="bg-white font-tiro-bangla" />
                    </FormControl>
                    <FormMessage className="font-tiro-bangla" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Show EIIN field for institutional results */}
          {form.watch("resultType") === "2" && (
            <FormField
              control={form.control}
              name="eiin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium font-tiro-bangla">EIIN নম্বর</FormLabel>
                  <FormControl>
                    <Input placeholder="প্রতিষ্ঠানের EIIN নম্বর লিখুন" {...field} className="bg-white font-tiro-bangla" />
                  </FormControl>
                  <FormMessage className="font-tiro-bangla" />
                </FormItem>
              )}
            />
          )}

          {/* Show info for board analysis */}
          {form.watch("resultType") === "7" && (
            <Alert className="bg-green-50 border-green-200">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 font-tiro-bangla">
                <strong>বোর্ড বিশ্লেষণ:</strong> এই অপশনটি নির্বাচিত বোর্ডের সামগ্রিক পরীক্ষার ফলাফল বিশ্লেষণ প্রদান করবে। এতে পাসের
                হার, জিপিএ বিতরণ এবং ঐতিহাসিক তুলনা অন্তর্ভুক্ত থাকবে।
              </AlertDescription>
            </Alert>
          )}

          {/* Show captcha if API is online */}
          <FormField
            control={form.control}
            name="captcha"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium font-tiro-bangla">ক্যাপচা কোড</FormLabel>
                <div className="space-y-3">
                  {captchaError ? (
                    <Alert variant="destructive" className="py-2">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <AlertDescription className="font-tiro-bangla">ক্যাপচা লোড করতে সমস্যা হয়েছে।</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="flex items-center space-x-3">
                      {captchaUrl && (
                        <img
                          src={captchaUrl || "https://placehold.co/200x60/e2e8f0/64748b?text=CAPTCHA"}
                          alt="Captcha"
                          className="border border-gray-300 rounded max-w-[200px] h-[60px] object-contain bg-white"
                          onError={() => {
                            console.log("Captcha failed to load")
                            setCaptchaError(true)
                          }}
                        />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        id="capt_btn"
                        size="sm"
                        onClick={refreshCaptcha}
                        className="flex items-center space-x-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span className="font-tiro-bangla">নতুন কোড</span>
                      </Button>
                    </div>
                  )}
                  <FormControl>
                    <Input placeholder="ক্যাপচা কোড লিখুন" {...field} className="max-w-[200px] bg-white font-tiro-bangla" />
                  </FormControl>
                </div>
                <FormMessage className="font-tiro-bangla" />
              </FormItem>
            )}
          />

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              className="w-full md:w-auto px-8 bg-bd-green-600 hover:bg-bd-green-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="font-tiro-bangla">ফলাফল আনা হচ্ছে...</span>
                </>
              ) : (
                <span className="font-tiro-bangla">ফলাফল দেখুন</span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
