export class IpDetection {
  private static cachedIp: string | null = null;

  static async getClientIp(): Promise<string> {
    // Return cached IP if available
    if (this.cachedIp) {
      return this.cachedIp;
    }

    try {
      // Try multiple IP detection services for reliability
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://api.ip.sb/jsonip'
      ];

      for (const serviceUrl of services) {
        try {
          const response = await fetch(serviceUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            const ip = data.ip || data.query;
            
            if (ip) {
              this.cachedIp = ip;
              return ip;
            }
          }
        } catch (error) {
          console.warn(`Failed to get IP from ${serviceUrl}:`, error);
          continue;
        }
      }

      // Fallback to empty string if all services fail
      return '';
    } catch (error) {
      console.error('Failed to detect client IP:', error);
      return '';
    }
  }

  static clearCache(): void {
    this.cachedIp = null;
  }
}