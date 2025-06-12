interface SessionData {
  cookies: Record<string, string>
  headers: Record<string, string>
  timestamp: number
  expiresAt: number
  sessionId: string
  userAgent: string
}

class AdvancedCookieManager {
  private static instance: AdvancedCookieManager
  private sessions: SessionData[] = []
  private currentSessionIndex = 0
  private readonly SESSION_LIFETIME = 45 * 60 * 1000 // 45 minutes
  private readonly MAX_SESSIONS = 3

  private constructor() {}

  static getInstance(): AdvancedCookieManager {
    if (!AdvancedCookieManager.instance) {
      AdvancedCookieManager.instance = new AdvancedCookieManager()
    }
    return AdvancedCookieManager.instance
  }

  // Generate realistic browser fingerprint
  private generateBrowserFingerprint() {
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ]

    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)]

    return {
      userAgent,
      acceptLanguage: "en-US,en;q=0.9,bn;q=0.8",
      acceptEncoding: "gzip, deflate, br",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      secFetchDest: "document",
      secFetchMode: "navigate",
      secFetchSite: "none",
      secFetchUser: "?1",
      upgradeInsecureRequests: "1",
      dnt: "1",
      connection: "keep-alive",
    }
  }

  // Generate realistic EBRSESSID2 based on actual patterns
  private generateEBRSESSID2(): string {
    // Pattern: ebr + 8-digit hex + random string
    const timestamp = Date.now().toString(16).slice(-8)
    const random1 = Math.random().toString(16).slice(2, 10)
    const random2 = Math.random().toString(16).slice(2, 8)
    return `ebr${timestamp}${random1}${random2}`
  }

  // Generate realistic __nobotA2 token
  private generateNobotA2(): string {
    // This appears to be a base64-encoded security token
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    let result = "CgAC" // Common prefix observed

    // Generate 16 more characters
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return result + "=="
  }

  // Generate additional security cookies that might be needed
  private generateSecurityCookies(): Record<string, string> {
    const now = Date.now()
    const sessionId = Math.random().toString(36).substring(2, 15)

    return {
      EBRSESSID2: this.generateEBRSESSID2(),
      __nobotA2: this.generateNobotA2(),
      _ga: `GA1.2.${Math.floor(Math.random() * 1000000000)}.${Math.floor(now / 1000)}`,
      _gid: `GA1.2.${Math.floor(Math.random() * 1000000000)}`,
      _gat: "1",
      __utma: `${Math.floor(Math.random() * 1000000000)}.${Math.floor(Math.random() * 1000000000)}.${Math.floor(now / 1000)}.${Math.floor(now / 1000)}.${Math.floor(now / 1000)}.1`,
      __utmz: `${Math.floor(Math.random() * 1000000000)}.${Math.floor(now / 1000)}.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)`,
      _fbp: `fb.1.${now}.${Math.floor(Math.random() * 1000000000)}`,
      session_id: sessionId,
    }
  }

  // Simulate visiting the main site to establish session
  private async establishSession(): Promise<SessionData | null> {
    try {
      const fingerprint = this.generateBrowserFingerprint()
      const sessionId = Math.random().toString(36).substring(2, 15)

      console.log("Establishing new session with eboardresults.com...")

      // First, visit the main page
      const mainPageResponse = await fetch("https://eboardresults.com/", {
        method: "GET",
        headers: {
          "User-Agent": fingerprint.userAgent,
          Accept: fingerprint.accept,
          "Accept-Language": fingerprint.acceptLanguage,
          "Accept-Encoding": fingerprint.acceptEncoding,
          "Cache-Control": "no-cache",
          "Sec-Fetch-Dest": fingerprint.secFetchDest,
          "Sec-Fetch-Mode": fingerprint.secFetchMode,
          "Sec-Fetch-Site": fingerprint.secFetchSite,
          "Sec-Fetch-User": fingerprint.secFetchUser,
          "Upgrade-Insecure-Requests": fingerprint.upgradeInsecureRequests,
          DNT: fingerprint.dnt,
          Connection: fingerprint.connection,
        },
        redirect: "follow",
        cache: "no-store",
      })

      let extractedCookies: Record<string, string> = {}

      // Extract cookies from response
      const setCookieHeader = mainPageResponse.headers.get("set-cookie")
      if (setCookieHeader) {
        extractedCookies = this.parseCookieHeader(setCookieHeader)
        console.log("Extracted cookies from main page:", Object.keys(extractedCookies))
      }

      // Generate additional security cookies
      const securityCookies = this.generateSecurityCookies()

      // Merge extracted and generated cookies
      const allCookies = { ...securityCookies, ...extractedCookies }

      // Wait a bit to simulate human behavior
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Visit a few more pages to establish session
      const additionalPages = ["/", "/result.php"]

      for (const page of additionalPages) {
        try {
          await fetch(`https://eboardresults.com${page}`, {
            method: "GET",
            headers: {
              "User-Agent": fingerprint.userAgent,
              Accept: fingerprint.accept,
              "Accept-Language": fingerprint.acceptLanguage,
              Referer: "https://eboardresults.com/",
              Cookie: this.formatCookies(allCookies),
              "Cache-Control": "no-cache",
            },
            cache: "no-store",
          })

          // Small delay between requests
          await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))
        } catch (error) {
          console.log(`Failed to visit ${page}:`, error)
        }
      }

      const sessionData: SessionData = {
        cookies: allCookies,
        headers: {
          "User-Agent": fingerprint.userAgent,
          Accept: "application/json, text/plain, */*",
          "Accept-Language": fingerprint.acceptLanguage,
          "Accept-Encoding": fingerprint.acceptEncoding,
          Referer: "https://eboardresults.com/",
          Origin: "https://eboardresults.com",
          "Cache-Control": "no-cache",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          DNT: fingerprint.dnt,
        },
        timestamp: Date.now(),
        expiresAt: Date.now() + this.SESSION_LIFETIME,
        sessionId,
        userAgent: fingerprint.userAgent,
      }

      console.log("Session established successfully:", sessionId)
      return sessionData
    } catch (error) {
      console.error("Failed to establish session:", error)
      return this.createFallbackSession()
    }
  }

  // Create fallback session with generated data
  private createFallbackSession(): SessionData {
    const fingerprint = this.generateBrowserFingerprint()
    const sessionId = Math.random().toString(36).substring(2, 15)

    return {
      cookies: this.generateSecurityCookies(),
      headers: {
        "User-Agent": fingerprint.userAgent,
        Accept: "application/json, text/plain, */*",
        "Accept-Language": fingerprint.acceptLanguage,
        "Accept-Encoding": fingerprint.acceptEncoding,
        Referer: "https://eboardresults.com/",
        Origin: "https://eboardresults.com",
        "Cache-Control": "no-cache",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        DNT: fingerprint.dnt,
      },
      timestamp: Date.now(),
      expiresAt: Date.now() + this.SESSION_LIFETIME,
      sessionId,
      userAgent: fingerprint.userAgent,
    }
  }

  // Parse cookie header
  private parseCookieHeader(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {}

    cookieHeader.split(",").forEach((cookie) => {
      const parts = cookie.trim().split(";")[0].split("=")
      if (parts.length === 2) {
        const key = parts[0].trim()
        const value = parts[1].trim()
        if (key && value) {
          cookies[key] = value
        }
      }
    })

    return cookies
  }

  // Format cookies for request header
  private formatCookies(cookies: Record<string, string>): string {
    return Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ")
  }

  // Get valid session (create new if needed)
  private async getValidSession(): Promise<SessionData> {
    // Clean expired sessions
    this.sessions = this.sessions.filter((session) => Date.now() < session.expiresAt)

    // If no valid sessions, create new ones
    if (this.sessions.length === 0) {
      console.log("No valid sessions, creating new ones...")

      for (let i = 0; i < this.MAX_SESSIONS; i++) {
        const session = await this.establishSession()
        if (session) {
          this.sessions.push(session)
        }

        // Delay between session creation
        if (i < this.MAX_SESSIONS - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000))
        }
      }
    }

    // If still no sessions, create fallback
    if (this.sessions.length === 0) {
      console.log("Creating fallback session...")
      this.sessions.push(this.createFallbackSession())
    }

    // Rotate sessions
    this.currentSessionIndex = (this.currentSessionIndex + 1) % this.sessions.length
    return this.sessions[this.currentSessionIndex]
  }

  // Get session data for API requests
  async getSessionData(): Promise<{ cookieString: string; headers: Record<string, string> }> {
    const session = await this.getValidSession()

    return {
      cookieString: this.formatCookies(session.cookies),
      headers: session.headers,
    }
  }

  // Force refresh all sessions
  async refreshSessions(): Promise<void> {
    console.log("Force refreshing all sessions...")
    this.sessions = []
    this.currentSessionIndex = 0
    await this.getValidSession()
  }

  // Get session status for debugging
  getSessionStatus() {
    const validSessions = this.sessions.filter((session) => Date.now() < session.expiresAt)

    return {
      totalSessions: this.sessions.length,
      validSessions: validSessions.length,
      currentSession: this.currentSessionIndex,
      sessions: this.sessions.map((session) => ({
        sessionId: session.sessionId,
        age: Date.now() - session.timestamp,
        expiresIn: session.expiresAt - Date.now(),
        valid: Date.now() < session.expiresAt,
        userAgent: session.userAgent.substring(0, 50) + "...",
      })),
    }
  }
}

export const advancedCookieManager = AdvancedCookieManager.getInstance()
