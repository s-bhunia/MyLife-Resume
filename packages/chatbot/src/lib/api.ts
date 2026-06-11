// Read the base URL from the environment, defaulting to local FastAPI for development
const API_BASE_URL = 'https://mylife-backend-54ih.onrender.com';

export const ChatbotAPI = {
  async getIntent(text: string) {
    const response = await fetch(`${API_BASE_URL}/api/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) throw new Error('Failed to fetch intent');
    return response.json();
  },

 async sendTextFeedback(payload: { name?: string; email?: string; message: string }) {
    const response = await fetch(`${API_BASE_URL}/api/feedback/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to send text feedback');
    return response.json();
  },

  async sendVoiceFeedback(audioBlob: Blob, name?: string, email?: string) {
    const formData = new FormData();
    // MATCHES FASTAPI: file: UploadFile = File(...)
    formData.append('file', audioBlob, 'voice.webm'); 
    
    // MATCHES FASTAPI: name: str = Form(...), email: str = Form(...)
    if (name) formData.append('name', name);
    if (email) formData.append('email', email);

    const response = await fetch(`${API_BASE_URL}/api/feedback/voice`, {
      method: 'POST',
      body: formData, // Browser automatically sets the correct multipart boundary
    });
    
    if (!response.ok) throw new Error('Failed to send voice feedback');
    return response.json();
  }
};