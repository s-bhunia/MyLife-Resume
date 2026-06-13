const runtimeEnv = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env;
const API_BASE_URL =
  runtimeEnv?.VITE_API_BASE_URL ?? "https://mylife-backend-54ih.onrender.com";

const request = async <T>(url: string, init: RequestInit): Promise<T> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      
      try {
        const errorBody = await response.json();
        // Parse FastAPI validation errors
        if (errorBody.detail) {
          if (Array.isArray(errorBody.detail)) {
            errorMessage = errorBody.detail[0].msg; // Extracts: "value is not a valid email address..."
          } else if (typeof errorBody.detail === "string") {
            errorMessage = errorBody.detail;
          }
        }
      } catch (e) {
        // Fallback to default error if response isn't JSON
      }
      
      throw new Error(errorMessage);
    }
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
};
export interface IntentResponse {
  action: string;
  reply: string;
}

export const ChatbotAPI = {
  async getIntent(text: string): Promise<IntentResponse> {
    const response = await request<IntentResponse>(`${API_BASE_URL}/api/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (typeof response.action !== "string" || typeof response.reply !== "string") {
      throw new Error("Invalid intent response");
    }
    return response;
  },

 async sendTextFeedback(payload: { name?: string; email?: string; message: string }) {
    return request(`${API_BASE_URL}/api/feedback/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async sendVoiceFeedback(audioBlob: Blob, name?: string, email?: string) {
    const formData = new FormData();
    // MATCHES FASTAPI: file: UploadFile = File(...)
    formData.append('file', audioBlob, 'voice.webm'); 
    
    // MATCHES FASTAPI: name: str = Form(...), email: str = Form(...)
    if (name) formData.append('name', name);
    if (email) formData.append('email', email);

    return request(`${API_BASE_URL}/api/feedback/voice`, {
      method: 'POST',
      body: formData, // Browser automatically sets the correct multipart boundary
    });
    
  }
};
