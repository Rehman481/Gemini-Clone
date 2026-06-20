import React, { useContext, useEffect, useRef, useState } from "react";
import "./Main.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";
import ReactMarkdown from "react-markdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Main = () => {
  const {
    input,
    setInput,
    handleSend,
    messages,
    loading,
    activeChat,
    editMessage,
    regenerateResponse,
    setImageDataForChat,
    clearImageData,
  } = useContext(Context);

  const chatRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState(null);
  
  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState('');

  // AUTO SCROLL
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        setInput(fullTranscript);
        
        // Auto-send if final result
        if (finalTranscript) {
          setTimeout(() => {
            handleSendMessage();
          }, 500);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Please allow microphone access! 🎤');
        } else if (event.error === 'no-speech') {
          toast.info('No speech detected. Try again! 🎤');
        } else {
          toast.error('Voice input error: ' + event.error);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setTranscript('');
      };

      setRecognition(recognitionInstance);
    } else {
      console.log('Speech recognition not supported');
    }

    // Cleanup
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognition) {
        recognition.abort();
      }
    };
  }, [recognition]);

  // COPY
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied! 📋");
  };

  // EDIT
  const handleEdit = (index, msg) => {
    const newText = window.prompt("Edit message:", msg.text);
    if (!newText || newText.trim() === msg.text) return;
    editMessage(activeChat, index, newText);
  };

  // SPEAK - Toggle speak/stop
  const handleSpeak = (text) => {
    if (!window.speechSynthesis) {
      toast.error("Speech synthesis not supported in this browser");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeech(null);
      toast.info("Stopped speaking");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || voices.find(voice => 
        voice.lang.startsWith('en')
      ) || voices[0];
      utterance.voice = preferredVoice;
    }

    setIsSpeaking(true);
    setCurrentSpeech(utterance);

    utterance.onstart = () => {
      console.log('Started speaking');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
      setCurrentSpeech(null);
      toast.error('Error speaking message');
    };

    window.speechSynthesis.speak(utterance);
  };

  // VOICE INPUT - Start/Stop listening
  const handleVoiceInput = () => {
    if (!recognition) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      // Stop listening
      recognition.abort();
      setIsListening(false);
      setTranscript('');
      toast.info('Voice input stopped');
      return;
    }

    // Check if user allowed microphone
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          // Start listening
          recognition.start();
          setIsListening(true);
          setInput('');
          toast.success('Listening... Speak now! 🎤');
        })
        .catch((err) => {
          console.error('Microphone error:', err);
          toast.error('Please allow microphone access! 🎤');
        });
    } else {
      toast.error('Microphone not supported in this browser');
    }
  };

  // Handle send with image
  const handleSendMessage = () => {
    if (!input.trim() && !selectedImage) {
      toast.info("Please enter a message or attach an image");
      return;
    }

    if (selectedImage) {
      setImageDataForChat(imagePreview);
    } else {
      clearImageData();
    }

    handleSend();
    clearImage();
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file! 📷");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB! 📏");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setSelectedImage(file);
      toast.success("Image attached! 🖼️");
      setTimeout(() => {
        document.querySelector('.search-box input')?.focus();
      }, 100);
    };
    reader.readAsDataURL(file);
  };

  // Clear selected image
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    clearImageData();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle send with Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="main">

      <ToastContainer 
        position="top-right" 
        autoClose={1500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      {/* NAV */}
      <div className="nav">
        <div className="nav-left">
          <p className="nav-logo">✨ Gemini</p>
          <span className="nav-status">● Online</span>
        </div>
        <div className="nav-right">
          <img 
            src={assets.user_icon} 
            alt="user" 
            className="nav-avatar"
          />
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="chat-wrapper">

        <div className="chat-box" ref={chatRef}>

          {messages.length === 0 && (
            <div className="greet">
              <div className="greet-emoji">👋</div>
              <p className="greet-title"><span>Hello</span></p>
              <p className="greet-subtitle">How can I help you today?</p>
              <p className="greet-features">💬 Ask me anything • 📷 Upload images • 🎤 Voice input • 🤖 AI recognizes images</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isLastAI = msg.role === "ai" && index === messages.length - 1;
            const isUser = msg.role === "user";

            return (
              <div 
                key={index} 
                className={`msg ${msg.role}`}
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <div className="msg-avatar">
                  {isUser ? (
                    <img src={assets.user_icon} alt="user" />
                  ) : (
                    <div className="ai-avatar">🤖</div>
                  )}
                </div>

                <div className="msg-content-wrapper">
                  <div className="msg-content">
                    {msg.image && (
                      <div className="msg-image">
                        <img src={msg.image} alt="attached" />
                        <div className="image-badge">🖼️ Attached</div>
                      </div>
                    )}
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  
                  <div className="msg-actions">
                    {msg.role === "ai" && (
                      <>
                        <button 
                          className={`action-btn ${isSpeaking ? 'speaking' : ''}`} 
                          onClick={() => handleSpeak(msg.text)}
                          title={isSpeaking ? "Stop speaking" : "Listen"}
                        >
                          {isSpeaking ? '⏹️' : '🔊'}
                        </button>
                        <button 
                          className="action-btn" 
                          onClick={() => handleCopy(msg.text)}
                          title="Copy"
                        >
                          📋
                        </button>
                      </>
                    )}
                    {msg.role === "user" && (
                      <button 
                        className="action-btn" 
                        onClick={() => handleEdit(index, msg)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                    )}
                    {isLastAI && (
                      <button 
                        className="action-btn" 
                        onClick={() => regenerateResponse(activeChat, index)}
                        title="Regenerate"
                      >
                        🔄
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="msg ai">
              <div className="msg-avatar">
                <div className="ai-avatar">🤖</div>
              </div>
              <div className="msg-content-wrapper">
                <div className="msg-content typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="typing-label">Analyzing image...</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* INPUT FIXED AT BOTTOM */}
        <div className="main-bottom">

          {/* Voice Input Status */}
          {isListening && (
            <div className="voice-status">
              <span className="voice-pulse"></span>
              <span className="voice-text">Listening... Speak now</span>
              <span className="voice-transcript">{transcript || '🎤'}</span>
            </div>
          )}

          <div className={`search-box ${isFocused ? "focused" : ""}`}>

            <input
              type="text"
              placeholder={isListening ? "Listening..." : (selectedImage ? "Add a caption (optional)..." : "Enter a prompt...")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={loading || isListening}
            />

            <div className="search-icons">
              {/* Gallery Button */}
              <button 
                className={`icon-btn gallery-btn ${selectedImage ? "has-image" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                title="Attach image"
                disabled={loading}
              >
                🖼️
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
                multiple={false}
              />

              {/* Voice Input Button */}
              <button 
                className={`icon-btn mic-btn ${isListening ? 'listening' : ''}`}
                title={isListening ? "Stop listening" : "Voice input"}
                disabled={loading}
                onClick={handleVoiceInput}
              >
                {isListening ? '⏹️' : '🎤'}
              </button>

              {/* Send Button */}
              <button 
                className="send-btn" 
                onClick={handleSendMessage}
                disabled={(!input.trim() && !selectedImage) || loading}
                title="Send message"
              >
                {loading ? (
                  <span className="send-loading">⟳</span>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 2L11 13" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>

          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="image-preview-container">
              <div className="image-preview">
                <img src={imagePreview} alt="preview" />
                <button 
                  className="remove-image-btn"
                  onClick={clearImage}
                  title="Remove image"
                >
                  ✕
                </button>
                <span className="preview-label">Will be analyzed by AI</span>
              </div>
            </div>
          )}

          <div className="bottom-hint">
            <span>Press Enter to send</span>
            <span className="hint-dot">•</span>
            <span>🎤 Voice input</span>
            <span className="hint-dot">•</span>
            <span>🖼️ Upload images</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Main;