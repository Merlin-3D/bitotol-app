interface FetchOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
}

class WebInterface {
  private csrfToken: string

  constructor(csrfToken: string) {
    this.csrfToken = csrfToken
  }

  private async fetchWrapper(url: string, options: FetchOptions) {
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': this.csrfToken,
      ...options.headers,
    }

    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return response.json()
  }

  public async get(url: string, headers?: Record<string, string>) {
    return this.fetchWrapper(url, { method: 'GET', headers })
  }

  public async post(url: string, body: any, headers?: Record<string, string>) {
    return this.fetchWrapper(url, { method: 'POST', body, headers })
  }

  public async put(url: string, body: any, headers?: Record<string, string>) {
    return this.fetchWrapper(url, { method: 'PUT', body, headers })
  }

  public async delete(url: string, headers?: Record<string, string>) {
    return this.fetchWrapper(url, { method: 'DELETE', headers })
  }
}

export default WebInterface
