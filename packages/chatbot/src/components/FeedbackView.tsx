import { useState, useRef, useEffect } from "react";
import { ChatbotAPI } from "../lib/api";

type SentItem = {
  id: number;
  type: "text" | "voice";
  message: string;
  audioUrl?: string;
};

export default function FeedbackView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");

  // History State
  const [sentHistory, setSentHistory] = useState<SentItem[]>([]);

  // UI States
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the history log when a new item is added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sentHistory]);

  // --- STRICT VOICE PIPELINE (With History Preview) ---
  const startRecording = async () => {
    try {
      setStatusMsg("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        setIsSending(true);
        setStatusMsg("Sending voice note...");

        try {
          // 1. Send to API
          await ChatbotAPI.sendVoiceFeedback(blob, name.trim(), email.trim());

          // 2. Create a local URL for the history playback
          const audioUrl = URL.createObjectURL(blob);

          // 3. Add to History
          setSentHistory((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: "voice",
              message: "Voice note",
              audioUrl: audioUrl,
            },
          ]);

          setStatusMsg("Voice note sent!");
          setTimeout(() => setStatusMsg(""), 3000);
        } catch (error) {
          console.error(error);
          setStatusMsg("Failed to send voice note.");
        } finally {
          setIsSending(false);
          setIsRecording(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required to record voice feedback.");
    }
  };

  const stopRecordingAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // --- STRICT TEXT PIPELINE (With History Preview) ---
  const handleTextSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSending(true);
    setStatusMsg("Sending message...");

    const currentMessage = feedback; // Capture it before clearing

    try {
      // 1. Send to API
      await ChatbotAPI.sendTextFeedback({
        name: name.trim() || "Anonymous",
        email: email.trim(),
        message: currentMessage,
      });

      // 2. Add to History
      setSentHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "text",
          message: currentMessage,
        },
      ]);

      setFeedback("");
      setStatusMsg("Message sent!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (error) {
      console.error(error);
      setStatusMsg("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Optional Details */}
      <div className="flex space-x-2 shrink-0">
        <input
          type="text"
          placeholder="Name (Optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isRecording || isSending}
          className="w-1/2 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white/80 focus:border-[#ffe4c4] transition-all text-gray-800 disabled:opacity-50 shadow-inner"
        />
        <input
          type="email"
          placeholder="Email (Optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isRecording || isSending}
          className="w-1/2 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl px-3 py-2 text-xs outline-none focus:bg-white/80 focus:border-[#ffe4c4] transition-all text-gray-800 disabled:opacity-50 shadow-inner"
        />
      </div>

      {/* Dynamic Area: History Log + Input */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Sent History Log */}
        {sentHistory.length > 0 && (
          <div
            className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 custom-scrollbar shrink-0"
            ref={scrollRef}
          >
            {sentHistory.map((item) => (
              <div key={item.id} className="flex justify-end">
                <div className="bg-white/70 backdrop-blur-sm border border-white/40 text-gray-800 text-sm py-2 px-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%]">
                  <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wide">
                    Sent
                  </div>

                  {item.type === "voice" && item.audioUrl && (
                    <audio
                      controls
                      src={item.audioUrl}
                      className="h-8 w-48 mb-1"
                    />
                  )}
                  {item.type === "text" && (
                    <div className="font-medium text-gray-700">
                      {item.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="relative flex flex-col flex-none min-h-[4rem] transition-all duration-300">
          <textarea
            placeholder="Leave a text message..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isRecording || isSending}
            className="w-full h-full resize-none bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl p-3 text-sm outline-none focus:bg-white/80 focus:border-[#ffe4c4] transition-all pb-14 text-gray-800 disabled:opacity-50 shadow-inner"
          />

          {/* Status Indicator */}
          {statusMsg && (
            <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-md text-xs font-semibold px-2 py-1 rounded shadow-sm text-blue-600 animate-pulse">
              {statusMsg}
            </div>
          )}

          {/* Dedicated Voice Button */}
          <button
            onClick={isRecording ? stopRecordingAndSend : startRecording}
            disabled={isSending || feedback.trim().length > 0}
            className={`absolute bottom-3 right-3 p-3 rounded-full transition-all shadow-md flex items-center justify-center ${isRecording ? "bg-red-500 text-white animate-pulse shadow-red-500/50" : "bg-white/80 text-gray-700 hover:bg-white disabled:opacity-30"}`}
            title={isRecording ? "Stop & Send" : "Hold or Click to Record"}
          >
            {isRecording ? "⏹" : "🎤"}
          </button>
        </div>
      </div>

      {/* Dedicated Text Send Button */}
      <div className="flex items-center justify-between shrink-0 pt-1">
        <span className="text-xs font-medium text-gray-500 px-1">
          {name.trim() ? `Sending as ${name}` : "Sending Anonymously"}
        </span>
        <button
          onClick={handleTextSubmit}
          disabled={!feedback.trim() || isRecording || isSending}
          className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 transition-all shadow-lg"
        >
          Send Text
        </button>
      </div>
    </div>
  );
}
