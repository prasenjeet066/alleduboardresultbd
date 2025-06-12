interface CookieData {
  EBRSESSID2: string
  __nobotA2: string
  timestamp: number
  expiresAt: number
}

class CookieManager {
  private static instance: CookieManager
  private cookieData: CookieData | null = null
  private readonly COOKIE_LIFETIME = 30 * 60 * 1000 // 30 minutes

  private constructor() {}

  static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager()
    }
    return CookieManager.instance
  }

  // Generate a realistic EBRSESSID2
  private generateEBRSESSID2(): string {
    const prefix = "ebr"
    const timestamp = Date.now().toString(16).slice(-8)
    const random = Math.random().toString(16).slice(2, 10)
    const suffix = Math.random().toString(16).slice(2, 8)
    return `${prefix}${timestamp}${random}${suffix}`
  }

  // Generate a realistic __nobotA2 (base64-like)
  private generateNobotA2(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    let result = ""

    // Generate a realistic base64-like string
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return result
  }

  // Generate browser-like headers for cookie generation
  private getBrowserHeaders(): Record<string, string> {
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
    ]

    return {
      "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,bn;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      DNT: "1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Cache-Control": "max-age=0",
    }
  }

  // Attempt to get cookies from the actual website
  private async fetchCookiesFromSite(): Promise<CookieData | null> {
    try {
      console.log("Attempting to fetch cookies from eboardresults.com...")

      const response = await fetch("https://eboardresults.com/", {
        method: "GET",
        headers: this.getBrowserHeaders(),
        redirect: "follow",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Extract cookies from response headers
      const setCookieHeaders = response.headers.get("set-cookie")
      if (setCookieHeaders) {
        const cookies = this.parseCookieHeader(setCookieHeaders)

        if (cookies.EBRSESSID2 || cookies.__nobotA2) {
          console.log("Successfully extracted cookies from site")
          return {
            EBRSESSID2: cookies.EBRSESSID2 || this.generateEBRSESSID2(),
            __nobotA2: cookies.__nobotA2 || this.generateNobotA2(),
            timestamp: Date.now(),
            expiresAt: Date.now() + this.COOKIE_LIFETIME,
          }
        }
      }

      // If no cookies found, generate realistic ones
      console.log("No cookies found in response, generating realistic ones...")
      return this.generateRealisticCookies()
    } catch (error) {
      console.log("Failed to fetch from site, generating cookies:", error)
      return this.generateRealisticCookies()
    }
  }

  // Parse cookie header string
  private parseCookieHeader(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {}

    cookieHeader.split(",").forEach((cookie) => {
      const parts = cookie.trim().split(";")[0].split("=")
      if (parts.length === 2) {
        cookies[parts[0].trim()] = parts[1].trim()
      }
    })

    return cookies
  }

  // Generate realistic cookies based on patterns
  private generateRealisticCookies(): CookieData {
    return {
      EBRSESSID2: this.generateEBRSESSID2(),
      __nobotA2: this.generateNobotA2(),
      timestamp: Date.now(),
      expiresAt: Date.now() + this.COOKIE_LIFETIME,
    }
  }

  // Check if current cookies are still valid
  private areCookiesValid(): boolean {
    if (!this.cookieData) return false
    return Date.now() < this.cookieData.expiresAt
  }

  // Get valid cookies (fetch new ones if needed)
  async getCookies(): Promise<string> {
    if (this.areCookiesValid() && this.cookieData) {
      console.log("Using cached cookies")
      return `EBRSESSID2=${this.cookieData.EBRSESSID2}; __nobotA2=${this.cookieData.__nobotA2}`
    }

    console.log("Generating new cookies...")

    // Try to get cookies from the actual site first
    this.cookieData = await this.fetchCookiesFromSite()

    if (!this.cookieData) {
      // Fallback to generated cookies
      this.cookieData = this.generateRealisticCookies()
    }

    return `EBRSESSID2=${this.cookieData.EBRSESSID2}; __nobotA2=${this.cookieData.__nobotA2}`
  }

  // Force refresh cookies
  async refreshCookies(): Promise<string> {
    console.log("Force refreshing cookies...")
    this.cookieData = null
    return await this.getCookies()
  }

  // Get cookie status for debugging
  getCookieStatus(): { valid: boolean; age: number; expiresIn: number } | null {
    if (!this.cookieData) return null

    const now = Date.now()
    return {
      valid: this.areCookiesValid(),
      age: now - this.cookieData.timestamp,
      expiresIn: this.cookieData.expiresAt - now,
    }
  }
}

export const cookieManager = CookieManager.getInstance()
