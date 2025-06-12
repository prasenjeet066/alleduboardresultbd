import { type NextRequest, NextResponse } from "next/server"
import { staticCookieManager } from "@/lib/static-cookie-manager"

const API_BASE_URL = "https://eboardresults.com/v2/getres"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Build query parameters
    const params = new URLSearchParams()
    params.append("exam", body.exam || "")
    params.append("year", body.year || "")
    params.append("board", body.board || "")
    params.append("result_type", body.resultType || "1")

    if (body.resultType === "1") {
      params.append("roll", body.roll || "")
      params.append("reg", body.reg || "")
    } else if (body.resultType === "2") {
      params.append("eiin", body.eiin || "")
    } else if (body.resultType === "7") {
      // For board analysis, ensure we're using the correct result_type
      params.set("result_type", "7")
      // Add any additional parameters that might be needed
      params.append("dcode", "")
      params.append("ccode", "")
    }

    params.append("dcode", "")
    params.append("ccode", "")
    params.append("captcha", body.captcha || "")

    const apiUrl = `${API_BASE_URL}?${params.toString()}`

    console.log("Calling eboardresults API:", apiUrl)

    // Get session data with static cookies
    const { cookieString, headers } = staticCookieManager.getSessionData()
    console.log("Using static cookies:", cookieString)

    // Make the API request with static cookies
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        ...headers,
        Cookie: cookieString,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      // If request fails, try refreshing session (same cookies, new headers)
      if (response.status === 403 || response.status === 401 || response.status === 429) {
        console.log("Authentication failed, refreshing session...")
        const { cookieString: newCookieString, headers: newHeaders } = staticCookieManager.refreshSession()

        // Wait a bit before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

        // Retry with refreshed session
        const retryResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            ...newHeaders,
            Cookie: newCookieString,
          },
          cache: "no-store",
        })

        if (!retryResponse.ok) {
          throw new Error(`HTTP error after retry! status: ${retryResponse.status}`)
        }

        const retryData = await retryResponse.json()
        return NextResponse.json(handleApiResponse(retryData, body))
      }

      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("API Response status:", data.status)

    return NextResponse.json(handleApiResponse(data, body))
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        status: 1,
        msg: "API সংযোগে সমস্যা হয়েছে। স্ট্যাটিক কুকি ব্যবহার করা হচ্ছে।",
        error: (error as Error).message,
        sessionStatus: staticCookieManager.getSessionStatus(),
      },
      { status: 500 },
    )
  }
}

function handleApiResponse(data: any, requestData: any) {
  // Handle response
  if (data.status === 0) {
    // Check if it's board analysis (result_type = 7)
    if (requestData.resultType === "7" && data.extra) {
      return createBoardAnalysisResponse(data, requestData)
    }
    // Check if it's an institutional result (result_type = 2)
    else if (requestData.resultType === "2" && data.extra && data.extra.content) {
      return createInstitutionalResponse(data, requestData)
    } else {
      // Individual result
      return createSuccessResponse(data, requestData)
    }
  } else {
    // Return the actual error from the API
    return {
      status: data.status,
      msg: data.msg || "ফলাফল পেতে ব্যর্থ হয়েছে।",
      apiError: true,
    }
  }
}

function createBoardAnalysisResponse(apiData: any, requestData: any) {
  // Check if we have the expected data structure from the actual API
  if (!apiData.extra) {
    console.error("Invalid board analysis data structure:", apiData)
    return createFallbackBoardAnalysis(requestData)
  }

  // Ensure the data structure is clean and serializable
  const cleanExtra = {
    content: apiData.extra.content || "",
    charts: Array.isArray(apiData.extra.charts) ? apiData.extra.charts : [],
    charts_alt: Array.isArray(apiData.extra.charts_alt) ? apiData.extra.charts_alt : [],
    tree: apiData.extra.tree || null,
    have_alt: apiData.extra.have_alt || 0,
  }

  // Validate that charts have proper data structure
  cleanExtra.charts = cleanExtra.charts.filter(
    (chart) => chart && chart.data && Array.isArray(chart.data) && chart.data.length > 0 && chart.title && chart.type,
  )

  cleanExtra.charts_alt = cleanExtra.charts_alt.filter(
    (chart) => chart && chart.data && Array.isArray(chart.data) && chart.data.length > 0 && chart.title && chart.type,
  )

  return {
    status: 0,
    resultType: "board_analysis",
    board: requestData.board,
    exam: requestData.exam,
    year: requestData.year,
    extra: cleanExtra,
    msg: apiData.msg || "Board analysis retrieved successfully",
  }
}

function createFallbackBoardAnalysis(requestData: any) {
  return {
    status: 0,
    resultType: "board_analysis",
    board: requestData.board,
    exam: requestData.exam,
    year: requestData.year,
    extra: {
      content: `<center>BOARD OF INTERMEDIATE & SECONDARY EDUCATION, ${requestData.board.toUpperCase()}<br />
        RESULT OF ${requestData.exam.toUpperCase()} EXAMINATION, ${requestData.year}<br />
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
          title: `Passed vs Not Passed [Year: ${requestData.year}]`,
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
          title: `GPA Countdown [Year: ${requestData.year}]`,
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
            [requestData.year, 1000, 750, 250, "75.0", 150, "20.0"],
            [(Number(requestData.year) - 1).toString(), 950, 700, 250, "73.7", 140, "20.0"],
            [(Number(requestData.year) - 2).toString(), 900, 650, 250, "72.2", 130, "20.0"],
          ],
        },
      ],
      tree: null,
      have_alt: 1,
    },
    msg: "Fallback board analysis data generated due to API issues",
  }
}

function createInstitutionalResponse(apiData: any, requestData: any) {
  const content = apiData.extra.content || ""

  // Extract institution name
  const instMatch = content.match(/Institution:\s*([^(]+)/i)
  const instName = instMatch ? instMatch[1].trim() : "শিক্ষা প্রতিষ্ঠান"

  // Extract EIIN
  const eiinMatch = content.match(/EIIN:\s*(\d+)/i)
  const eiin = eiinMatch ? eiinMatch[1] : requestData.eiin

  // Extract student stats
  const statsMatch = content.match(
    /No\. of Students:\s*{\s*Examinee:\s*(\d+),\s*Appeared:\s*(\d+),\s*Passed:\s*(\d+),\s*Percentage of Pass:\s*([\d.]+),\s*GPA 5:\s*(\d+)/i,
  )

  const stats = {
    examinees: statsMatch ? statsMatch[1] : "0",
    appeared: statsMatch ? statsMatch[2] : "0",
    passed: statsMatch ? statsMatch[3] : "0",
    passPercentage: statsMatch ? statsMatch[4] : "0",
    gpa5: statsMatch ? statsMatch[5] : "0",
  }

  // Extract group results
  const groupResults = []

  // Business Studies
  const businessMatch = content.match(/BUSINESS STUDIES[^:]*:\s*PASSED=(\d+);\s*NOT PASSED=(\d+);\s*GPA5=(\d+)/i)
  if (businessMatch) {
    groupResults.push({
      name: "ব্যবসায় শিক্ষা",
      passed: businessMatch[1],
      failed: businessMatch[2],
      gpa5: businessMatch[3],
    })
  }

  // Humanities
  const humanitiesMatch = content.match(/HUMANITIES[^:]*:\s*PASSED=(\d+);\s*NOT PASSED=(\d+);\s*GPA5=(\d+)/i)
  if (humanitiesMatch) {
    groupResults.push({
      name: "মানবিক",
      passed: humanitiesMatch[1],
      failed: humanitiesMatch[2],
      gpa5: humanitiesMatch[3],
    })
  }

  // Science
  const scienceMatch = content.match(/SCIENCE[^:]*:\s*PASSED=(\d+);\s*NOT PASSED=(\d+);\s*GPA5=(\d+)/i)
  if (scienceMatch) {
    groupResults.push({
      name: "বিজ্ঞান",
      passed: scienceMatch[1],
      failed: scienceMatch[2],
      gpa5: scienceMatch[3],
    })
  }

  return {
    status: 0,
    resultType: "institutional",
    institutionName: instName,
    eiin: eiin,
    board: requestData.board,
    exam: requestData.exam,
    year: requestData.year,
    stats: stats,
    groupResults: groupResults,
    pdfUrl: apiData.extra.pdfname ? `/api/pdf?file=${apiData.extra.pdfname}` : null,
    rawContent: content,
  }
}

function createSuccessResponse(apiData: any, requestData: any) {
  // Handle the actual API response structure
  if (apiData.res && typeof apiData.res === "object") {
    const res = apiData.res

    // Parse the display_details to get subject grades
    const subjects = []
    if (res.display_details && apiData.sub_details) {
      const gradeString = res.display_details // "101:A-,107:C ,174:B ,176:A ,178:A+,275:A ,265:A"
      const gradePairs = gradeString.split(",")

      for (let i = 0; i < gradePairs.length; i++) {
        const pair = gradePairs[i].trim()
        const [code, grade] = pair.split(":")

        if (code && grade) {
          // Find subject name from sub_details
          let subjectName = code
          for (let j = 0; j < apiData.sub_details.length; j++) {
            if (apiData.sub_details[j].SUB_CODE === code) {
              subjectName = apiData.sub_details[j].SUB_NAME
              break
            }
          }

          // Convert English subject names to Bengali
          const bengaliNames: Record<string, string> = {
            BANGLA: "বাংলা",
            ENGLISH: "ইংরেজি",
            PHYSICS: "পদার্থবিজ্ঞান",
            CHEMISTRY: "রসায়ন",
            BIOLOGY: "জীববিজ্ঞান",
            "HIGHER MATHEMATICS": "উচ্চতর গণিত",
            MATHEMATICS: "গণিত",
            "INFORMATION & COMMUNICATION TECHNOLOGY": "তথ্য ও যোগাযোগ প্রযুক্তি",
            "GENERAL SCIENCE": "সাধারণ বিজ্ঞান",
            "SOCIAL SCIENCE": "সামাজিক বিজ্ঞান",
            RELIGION: "ধর্ম",
          }

          const bengaliName = bengaliNames[subjectName] || subjectName

          subjects.push({
            code: code,
            name: bengaliName,
            grade: grade.trim(),
            point: grade.trim(),
          })
        }
      }
    }

    return {
      status: 0,
      resultType: "individual",
      name: res.name || "শিক্ষার্থীর নাম",
      fname: res.fname || "পিতার নাম",
      mname: res.mname || "মাতার নাম",
      roll: res.roll_no || requestData.roll,
      reg: res.regno || requestData.reg,
      inst: res.inst_name || "শিক্ষা প্রতিষ্ঠান",
      group: res.stud_group || "সাধারণ",
      gpa: res.gpa || "0.00",
      table: subjects,
      board: res.board_name || requestData.board,
      year: res.pass_year || requestData.year,
      exam: res.exam_name || requestData.exam,
      notice: apiData.notice || "",
    }
  }

  // Fallback for other response formats
  return {
    status: 0,
    resultType: "individual",
    name: apiData.name || "শিক্ষার্থীর নাম",
    fname: apiData.fname || "পিতার নাম",
    mname: apiData.mname || "মাতার নাম",
    roll: requestData.roll,
    reg: requestData.reg,
    inst: apiData.inst || "শিক্ষা প্রতিষ্ঠান",
    group: apiData.group || "সাধারণ",
    gpa: apiData.gpa || "0.00",
    table: apiData.table || [],
  }
}
