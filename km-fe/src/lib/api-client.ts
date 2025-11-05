const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787/api"

type RequestOptions = {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  rawBody?: BodyInit
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  }

  let body: BodyInit | undefined

  if (options.rawBody !== undefined) {
    body = options.rawBody
  } else if (options.body !== undefined) {
    body = JSON.stringify(options.body)
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(url, {
    method: options.method ?? (options.body || options.rawBody ? "POST" : "GET"),
    headers,
    body,
    credentials: "include",
  })

  if (!response.ok) {
    const message = await response
      .json()
      .catch(() => ({ message: response.statusText }))
    throw new Error(message?.message ?? `Request failed with status ${response.status}`)
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>
  }

  return (await response.text()) as unknown as T
}

export function buildFormData(data: Record<string, FormDataEntryValue | Blob | undefined>): FormData {
  const form = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      form.append(key, value)
    }
  })
  return form
}
