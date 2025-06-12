import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Github, Linkedin, Mail, Phone, MapPin, Code, Award, Calendar, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "ডেভেলপার সম্পর্কে - প্রসেনজিৎ হাওলাদার",
  description: "বাংলাদেশ শিক্ষা বোর্ড ফলাফল পোর্টালের ডেভেলপার প্রসেনজিৎ হাওলাদার সম্পর্কে জানুন",
}

export default function AboutPage() {
  const skills = [
    "React.js",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "JavaScript",
    "Tailwind CSS",
    "MongoDB",
    "PostgreSQL",
    "API Development",
    "Web Scraping",
    "UI/UX Design",
  ]

  const projects = [
    {
      title: "বাংলাদেশ শিক্ষা বোর্ড ফলাফল পোর্টাল",
      description: "একটি অনানুষ্ঠানিক ফলাফল দেখার প্ল্যাটফর্ম যা শিক্ষার্থীদের সহজে তাদের পরীক্ষার ফলাফল দেখতে সাহায্য করে।",
      tech: ["Next.js", "TypeScript", "API Integration", "PDF Generation"],
      status: "Active",
    },
    {
      title: "ই-কমার্স সলিউশন",
      description: "স্থানীয় ব্যবসায়ীদের জন্য সম্পূর্ণ ই-কমার্স প্ল্যাটফর্ম যা অনলাইন বিক্রয় সহজ করে।",
      tech: ["React", "Node.js", "MongoDB", "Payment Gateway"],
      status: "Completed",
    },
    {
      title: "স্কুল ম্যানেজমেন্ট সিস্টেম",
      description: "শিক্ষা প্রতিষ্ঠানের জন্য সম্পূর্ণ ম্যানেজমেন্ট সিস্টেম যা ছাত্র-ছাত্রী ও শিক্ষক ব্যবস্থাপনা করে।",
      tech: ["Vue.js", "Laravel", "MySQL", "Real-time Updates"],
      status: "In Progress",
    },
  ]

  const achievements = [
    {
      title: "সফটওয়্যার ইঞ্জিনিয়ারিং গ্র্যাজুয়েট",
      description: "কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং বিভাগ থেকে স্নাতক",
      year: "2020",
    },
    {
      title: "ফুল-স্ট্যাক ডেভেলপার সার্টিফিকেশন",
      description: "আন্তর্জাতিক প্রতিষ্ঠান থেকে ওয়েব ডেভেলপমেন্ট সার্টিফিকেশন",
      year: "2021",
    },
    {
      title: "ওপেন সোর্স কন্ট্রিবিউটর",
      description: "বিভিন্ন ওপেন সোর্স প্রজেক্টে অবদান রেখেছেন",
      year: "2019-Present",
    },
  ]

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
                <span className="font-tiro-bangla">হোম পেজে ফিরে যান</span>
              </Link>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold font-jacquard text-gray-800">ডেভেলপার সম্পর্কে</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="header-bottom"></div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-bd-green-600 to-bd-green-700 rounded-lg p-8 mb-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <h1 className="text-3xl md:text-4xl font-bold font-jacquard mb-4">প্রসেনজিৎ হাওলাদার</h1>
                <p className="text-xl font-tiro-bangla mb-4">ফুল-স্ট্যাক ওয়েব ডেভেলপার</p>
                <p className="text-lg font-tiro-bangla leading-relaxed">
                  আমি একজন অভিজ্ঞ সফটওয়্যার ডেভেলপার যিনি আধুনিক ওয়েব প্রযুক্তি ব্যবহার করে উদ্ভাবনী সমাধান তৈরি করি। আমার লক্ষ্য হলো
                  প্রযুক্তির মাধ্যমে মানুষের জীবনকে সহজ করা এবং বাংলাদেশের ডিজিটাল উন্নয়নে অবদান রাখা।
                </p>
                <div className="flex flex-wrap gap-4 mt-6">
                  <Button variant="outline" className="bg-white text-bd-green-600 hover:bg-gray-100" asChild>
                    <a href="mailto:prasenjeet@example.com" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>ইমেইল করুন</span>
                    </a>
                  </Button>
                  <Button variant="outline" className="bg-white text-bd-green-600 hover:bg-gray-100" asChild>
                    <a
                      href="https://facebook.com/prasenjeet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                      <span>ফেসবুক</span>
                    </a>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-40 h-40 bg-bd-green-100 rounded-full flex items-center justify-center">
                    <Code className="h-20 w-20 text-bd-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <Card className="enhanced-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold font-arvo text-bd-green-800">আমার সম্পর্কে</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 font-tiro-bangla">
                  <p className="text-gray-700 leading-relaxed">
                    আমি প্রসেনজিৎ হাওলাদার, একজন পেশাদার সফটওয়্যার ডেভেলপার যার ৫+ বছরের অভিজ্ঞতা রয়েছে ওয়েব ডেভেলপমেন্ট এবং সফটওয়্যার
                    ইঞ্জিনিয়ারিং ক্ষেত্রে। আমি বিশ্বাস করি যে প্রযুক্তি মানুষের জীবনকে উন্নত করতে পারে এবং সেই লক্ষ্যে আমি কাজ করে যাচ্ছি।
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    আমার বিশেষত্ব হলো React, Next.js, Node.js এবং Python ব্যবহার করে স্কেলেবল ওয়েব অ্যাপ্লিকেশন তৈরি করা। আমি
                    ব্যাকএন্ড API ডেভেলপমেন্ট, ডাটাবেস ডিজাইন এবং ফ্রন্টএন্ড UI/UX ডিজাইনে দক্ষ। আমার কাজের মূল নীতি হলো পরিচ্ছন্ন কোড,
                    ব্যবহারকারী-বান্ধব ইন্টারফেস এবং কর্মক্ষমতা।
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    বর্তমানে আমি বিভিন্ন ওপেন সোর্স প্রজেক্টে অবদান রাখছি এবং স্থানীয় ব্যবসা ও শিক্ষা প্রতিষ্ঠানের জন্য ডিজিটাল সমাধান তৈরি
                    করছি। আমার লক্ষ্য হলো বাংলাদেশের প্রযুক্তি খাতের উন্নয়নে অবদান রাখা এবং নতুন প্রজন্মের ডেভেলপারদের অনুপ্রাণিত করা।
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="enhanced-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold font-arvo text-bd-green-800">যোগাযোগের তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-bd-green-600" />
                    <div>
                      <p className="font-medium">ইমেইল</p>
                      <a href="mailto:prasenjeet@example.com" className="text-bd-green-600 hover:underline">
                        prasenjeet@example.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-bd-green-600" />
                    <div>
                      <p className="font-medium">ফোন</p>
                      <a href="tel:+8801712345678" className="text-bd-green-600 hover:underline">
                        +৮৮০১৭১২৩৪৫৬৭৮
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-bd-green-600" />
                    <div>
                      <p className="font-medium">অবস্থান</p>
                      <p className="text-gray-600">ঢাকা, বাংলাদেশ</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="enhanced-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold font-arvo text-bd-green-800">পরিসংখ্যান</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-bd-green-600" />
                      <span className="font-tiro-bangla">অভিজ্ঞতা</span>
                    </div>
                    <span className="font-bold text-bd-green-600">৫+ বছর</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-bd-green-600" />
                      <span className="font-tiro-bangla">প্রজেক্ট</span>
                    </div>
                    <span className="font-bold text-bd-green-600">৫০+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-bd-green-600" />
                      <span className="font-tiro-bangla">ক্লায়েন্ট</span>
                    </div>
                    <span className="font-bold text-bd-green-600">২০+</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Skills Section */}
          <Card className="enhanced-card mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-arvo text-bd-green-800">দক্ষতা ও প্রযুক্তি</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="p-3 text-center justify-center border-bd-green-200 text-bd-green-700 hover:bg-bd-green-50"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects Section */}
          <Card className="enhanced-card mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-arvo text-bd-green-800">উল্লেখযোগ্য প্রজেক্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg font-tiro-bangla">{project.title}</h3>
                      <Badge
                        variant={
                          project.status === "Active"
                            ? "default"
                            : project.status === "Completed"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {project.status === "Active" ? "সক্রিয়" : project.status === "Completed" ? "সম্পন্ন" : "চলমান"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-4 font-tiro-bangla">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <Card className="enhanced-card mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-arvo text-bd-green-800">শিক্ষা ও অর্জন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <Award className="h-6 w-6 text-bd-green-600" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg font-tiro-bangla">{achievement.title}</h3>
                        <Badge variant="outline">{achievement.year}</Badge>
                      </div>
                      <p className="text-gray-600 font-tiro-bangla">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="enhanced-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-arvo text-bd-green-800">সামাজিক যোগাযোগ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-16 flex items-center space-x-3" asChild>
                  <a href="https://facebook.com/prasenjeet" target="_blank" rel="noopener noreferrer">
                    <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    <div className="text-left">
                      <p className="font-medium">Facebook</p>
                      <p className="text-sm text-gray-600">@prasenjeet</p>
                    </div>
                  </a>
                </Button>

                <Button variant="outline" className="h-16 flex items-center space-x-3" asChild>
                  <a href="https://github.com/prasenjeet" target="_blank" rel="noopener noreferrer">
                    <Github className="h-6 w-6 text-gray-800" />
                    <div className="text-left">
                      <p className="font-medium">GitHub</p>
                      <p className="text-sm text-gray-600">@prasenjeet</p>
                    </div>
                  </a>
                </Button>

                <Button variant="outline" className="h-16 flex items-center space-x-3" asChild>
                  <a href="https://linkedin.com/in/prasenjeet" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-6 w-6 text-blue-700" />
                    <div className="text-left">
                      <p className="font-medium">LinkedIn</p>
                      <p className="text-sm text-gray-600">@prasenjeet</p>
                    </div>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer-container print-hidden mt-12">
        <div className="footer-top"></div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="font-tiro-bangla text-gray-300">
              © {new Date().getFullYear()} প্রসেনজিৎ হাওলাদার। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <p className="text-sm mt-2 text-gray-400 font-arvo">Made with ❤️ for the students of Bangladesh</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
