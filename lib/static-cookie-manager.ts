interface SessionData {
  cookies: Record<string, string>
  headers: Record<string, string>
  timestamp: number
  expiresAt: number
  sessionId: string
}

class StaticCookieManager {
  private static instance: StaticCookieManager
  private sessionData: SessionData | null = null
  private readonly SESSION_LIFETIME = 60 * 60 * 1000 // 60 minutes

  // Use the provided static cookies
  private readonly STATIC_COOKIES = {
    EBRSESSID2: "ebr68442e0775276636850",
    __nobotA2: "CgABnWhELgcNLwqaA3WoAg==",
  }

  private constructor() {}

  static getInstance(): StaticCookieManager {
    if (!StaticCookieManager.instance) {
      StaticCookieManager.instance = new StaticCookieManager()
    }
    return StaticCookieManager.instance
  }

  // Generate realistic browser headers
  private getBrowserHeaders(): Record<string, string> {
    return {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9,bn;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      Referer: "https://eboardresults.com/",
      Origin: "https://eboardresults.com",
      "Cache-Control": "no-cache",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      DNT: "1",
      Connection: "keep-alive",
    }
  }

  // Create session with static cookies
  private createSession(): SessionData {
    const sessionId = Math.random().toString(36).substring(2, 15)

    return {
      cookies: this.STATIC_COOKIES,
      headers: this.getBrowserHeaders(),
      timestamp: Date.now(),
      expiresAt: Date.now() + this.SESSION_LIFETIME,
      sessionId,
    }
  }

  // Check if current session is still valid
  private isSessionValid(): boolean {
    if (!this.sessionData) return false
    return Date.now() < this.sessionData.expiresAt
  }

  // Get valid session data
  getSessionData(): { cookieString: string; headers: Record<string, string> } {
    if (!this.isSessionValid()) {
      console.log("Creating new session with static cookies...")
      this.sessionData = this.createSession()
    }

    const cookieString = Object.entries(this.sessionData.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ")

    return {
      cookieString,
      headers: this.sessionData.headers,
    }
  }

  // Force refresh session (recreate with same static cookies)
  refreshSession(): { cookieString: string; headers: Record<string, string> } {
    console.log("Force refreshing session with static cookies...")
    this.sessionData = this.createSession()
    return this.getSessionData()
  }

  // Get session status for debugging
  getSessionStatus() {
    if (!this.sessionData) {
      return {
        valid: false,
        age: 0,
        expiresIn: 0,
        sessionId: null,
        cookies: this.STATIC_COOKIES,
      }
    }

    const now = Date.now()
    return {
      valid: this.isSessionValid(),
      age: now - this.sessionData.timestamp,
      expiresIn: this.sessionData.expiresAt - now,
      sessionId: this.sessionData.sessionId,
      cookies: this.STATIC_COOKIES,
    }
  }
}

export const staticCookieManager = StaticCookieManager.getInstance()
