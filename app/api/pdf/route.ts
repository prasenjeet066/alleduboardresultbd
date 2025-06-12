import { type NextRequest, NextResponse } from "next/server"
import { staticCookieManager } from "@/lib/static-cookie-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const file = searchParams.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file specified" }, { status: 400 })
    }

    // Get session data with static cookies
    const { cookieString, headers } = staticCookieManager.getSessionData()

    const response = await fetch(`https://eboardresults.com/v2/pdl?file=${file}`, {
      headers: {
        ...headers,
        Accept: "application/pdf",
        Cookie: cookieString,
      },
    })

    if (!response.ok) {
      // Try refreshing session if PDF fails
      if (response.status === 403 || response.status === 401 || response.status === 429) {
        const { cookieString: newCookieString, headers: newHeaders } = staticCookieManager.refreshSession()

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

        const retryResponse = await fetch(`https://eboardresults.com/v2/pdl?file=${file}`, {
          headers: {
            ...newHeaders,
            Accept: "application/pdf",
            Cookie: newCookieString,
          },
        })

        if (!retryResponse.ok) {
          throw new Error(`HTTP error after retry! status: ${retryResponse.status}`)
        }

        const pdfBuffer = await retryResponse.arrayBuffer()
        return new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${file}"`,
          },
        })
      }

      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const pdfBuffer = await response.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${file}"`,
      },
    })
  } catch (error) {
    console.error("PDF Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch PDF",
        sessionStatus: staticCookieManager.getSessionStatus(),
      },
      { status: 500 },
    )
  }
}
