import { type NextRequest, NextResponse } from "next/server"
import { staticCookieManager } from "@/lib/static-cookie-manager"

const CAPTCHA_SVC_URL = "https://eboardresults.com/v2/captcha"

export async function GET(request: NextRequest) {
  try {
    const timestamp = Date.now()
    const url = `${CAPTCHA_SVC_URL}?t=${timestamp}`

    // Get session data with static cookies
    const { cookieString, headers } = staticCookieManager.getSessionData()
    console.log("Captcha API using static cookies:", cookieString)

    const response = await fetch(url, {
      headers: {
        ...headers,
        Accept: "image/png,image/jpeg,image/webp,image/*",
        Cookie: cookieString,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      // Try refreshing session if captcha fails
      if (response.status === 403 || response.status === 401 || response.status === 429) {
        console.log("Captcha auth failed, refreshing session...")
        const { cookieString: newCookieString, headers: newHeaders } = staticCookieManager.refreshSession()

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

        const retryResponse = await fetch(url, {
          headers: {
            ...newHeaders,
            Accept: "image/png,image/jpeg,image/webp,image/*",
            Cookie: newCookieString,
          },
          cache: "no-store",
        })

        if (!retryResponse.ok) {
          throw new Error(`HTTP error after retry! status: ${retryResponse.status}`)
        }

        const imageBuffer = await retryResponse.arrayBuffer()
        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })
      }

      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()

    if (imageBuffer.byteLength < 100) {
      throw new Error("Invalid captcha image")
    }

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Captcha Error:", error)
    return NextResponse.json(
      {
        error: "ক্যাপচা লোড করতে ব্যর্থ হয়েছে।",
        sessionStatus: staticCookieManager.getSessionStatus(),
      },
      { status: 500 },
    )
  }
}
