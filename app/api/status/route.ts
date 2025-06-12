import { NextResponse } from "next/server"
import { staticCookieManager } from "@/lib/static-cookie-manager"

export async function GET() {
  try {
    // Get session data with static cookies
    const { cookieString, headers } = staticCookieManager.getSessionData()
    const sessionStatus = staticCookieManager.getSessionStatus()

    const response = await fetch("https://eboardresults.com/v2/captcha", {
      method: "HEAD",
      headers: {
        ...headers,
        Cookie: cookieString,
      },
      cache: "no-store",
    })

    if (response.ok) {
      return NextResponse.json({
        status: "online",
        message: "API is accessible with static cookies",
        sessionStatus: sessionStatus,
        cookies: sessionStatus.cookies,
      })
    } else {
      // Try refreshing session
      staticCookieManager.refreshSession()
      return NextResponse.json({
        status: "offline",
        message: "API is not accessible, session refreshed",
        sessionStatus: staticCookieManager.getSessionStatus(),
      })
    }
  } catch (error) {
    console.error("API Status Check Error:", error)
    return NextResponse.json({
      status: "offline",
      message: "API is not accessible",
      error: (error as Error).message,
      sessionStatus: staticCookieManager.getSessionStatus(),
    })
  }
}
