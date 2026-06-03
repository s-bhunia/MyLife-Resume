import React, { useState } from 'react';

export default function FeedbackView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = async () => {
    const payload = { name: name.trim() || 'Anonymous', email: email.trim(), message: feedback, hasVoice: isRecording };
    console.log("Transmitting:", payload);
    setFeedback('');
    setIsRecording(false);
  };

  const isSubmitDisabled = !feedback.trim() && !isRecording;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex space-x-2">
        <input 
          type="text" placeholder="Name (Optional)" value={name} onChange={e => setName(e.target.value)} 
          className="w-1/2 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white/80 focus:border-[#ffe4c4] focus:ring-4 focus:ring-[#ffe4c4]/40 transition-all placeholder-gray-500 text-gray-800 shadow-inner" 
        />
        <input 
          type="email" placeholder="Email (Optional)" value={email} onChange={e => setEmail(e.target.value)} 
          className="w-1/2 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white/80 focus:border-[#ffe4c4] focus:ring-4 focus:ring-[#ffe4c4]/40 transition-all placeholder-gray-500 text-gray-800 shadow-inner" 
        />
      </div>

      <div className="relative flex-1">
        <textarea 
          placeholder="Leave a message or report a bug..." value={feedback} onChange={e => setFeedback(e.target.value)} 
          className="w-full h-full resize-none bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl p-3 text-sm outline-none focus:bg-white/80 focus:border-[#ffe4c4] focus:ring-4 focus:ring-[#ffe4c4]/40 transition-all pb-12 placeholder-gray-500 text-gray-800 shadow-inner" 
        />
        <button 
          onClick={() => setIsRecording(!isRecording)}
          className={`absolute bottom-3 right-3 p-3 rounded-full transition-all shadow-md flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
        >
          {isRecording ? '⏹' : '🎤'}
        </button>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-sm font-medium text-gray-700 bg-white/40 px-3 py-1 rounded-lg border border-white/30 backdrop-blur-sm">
          {name.trim() ? `Thank you, ${name}!` : 'I dont wanna add my details'}
        </span>
        <button 
          onClick={handleSubmit} disabled={isSubmitDisabled} 
          className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Send
        </button>
      </div>
    </div>
  );
}