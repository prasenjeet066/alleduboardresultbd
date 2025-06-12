"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  exam: z.string().min(1, "অনুগ্রহ করে একটি পরীক্ষা নির্বাচন করুন"),
  year: z.string().min(1, "অনুগ্রহ করে একটি বছর নির্বাচন করুন"),
  board: z.string().min(1, "অনুগ্রহ করে একটি বোর্ড নির্বাচন করুন"),
  roll: z.string().min(6, "রোল নম্বর কমপক্ষে ৬ অক্ষর হতে হবে"),
})

// Mock data for demonstration when API is not available
const mockSubjects = {
  ssc: [
    { name: "বাংলা", code: "101", grade: "A+", point: "5.00" },
    { name: "ইংরেজি", code: "107", grade: "A", point: "4.00" },
    { name: "গণিত", code: "109", grade: "A+", point: "5.00" },
    { name: "বিজ্ঞান", code: "127", grade: "A+", point: "5.00" },
    { name: "সামাজিক বিজ্ঞান", code: "150", grade: "A", point: "4.00" },
    { name: "ধর্ম", code: "111", grade: "A+", point: "5.00" },
  ],
  hsc: [
    { name: "বাংলা", code: "101", grade: "A+", point: "5.00" },
    { name: "ইংরেজি", code: "107", grade: "A", point: "4.00" },
    { name: "পদার্থবিজ্ঞান", code: "174", grade: "A+", point: "5.00" },
    { name: "রসায়ন", code: "176", grade: "A+", point: "5.00" },
    { name: "গণিত", code: "265", grade: "A+", point: "5.00" },
    { name: "জীববিজ্ঞান", code: "178", grade: "A", point: "4.00" },
  ],
}

export function FallbackSearchForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exam: "",
      year: "",
      board: "",
      roll: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate mock result data
      const mockResult = {
        status: 0,
        name: "শিক্ষার্থীর নাম",
        fname: "পিতার নাম",
        mname: "মাতার নাম",
        roll: values.roll,
        reg: "১২৩৪৫৬৭৮৯০",
        inst: "উদাহরণ উচ্চ বিদ্যালয়",
        group: "বিজ্ঞান",
        gpa: "4.67",
        table: mockSubjects[values.exam as keyof typeof mockSubjects] || mockSubjects.ssc,
      }

      const queryParams = new URLSearchParams({
        roll: values.roll,
        board: values.board,
        exam: values.exam,
        year: values.year,
        reg: mockResult.reg,
        resultData: JSON.stringify(mockResult),
      })

      router.push(`/results?${queryParams.toString()}`)

      toast({
        title: "সফল",
        description: "ডেমো ফলাফল লোড করা হয়েছে।",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "ত্রুটি",
        description: "ফলাফল পেতে ব্যর্থ হয়েছে।",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-800" />
        <AlertDescription className="text-yellow-800">
          বর্তমানে API সংযোগে সমস্যা রয়েছে। ডেমো ফলাফল দেখানো হবে।
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
                  <FormLabel className="font-medium">পরীক্ষা</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ssc">মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি)</SelectItem>
                      <SelectItem value="hsc">উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">পাসের বছর</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="বছর নির্বাচন করুন" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2024">২০২৪</SelectItem>
                      <SelectItem value="2023">২০২৩</SelectItem>
                      <SelectItem value="2022">২০২২</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="board"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">শিক্ষা বোর্ড</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="বোর্ড নির্বাচন করুন" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dhaka">ঢাকা</SelectItem>
                    <SelectItem value="rajshahi">রাজশাহী</SelectItem>
                    <SelectItem value="chittagong">চট্টগ্রাম</SelectItem>
                    <SelectItem value="khulna">খুলনা</SelectItem>
                    <SelectItem value="sylhet">সিলেট</SelectItem>
                    <SelectItem value="barisal">বরিশাল</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roll"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">পরীক্ষার রোল নম্বর</FormLabel>
                <FormControl>
                  <Input placeholder="আপনার রোল নম্বর লিখুন (যেকোনো ৬+ অক্ষর)" {...field} />
                </FormControl>
                <FormMessage />
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
                  ডেমো ফলাফল লোড হচ্ছে...
                </>
              ) : (
                "ডেমো ফলাফল দেখুন"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
