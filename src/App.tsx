import React, { useEffect, useRef, useState } from "react";
import { Menu, Search, Plus, Settings, User, Send, MessageSquare, Mic, ThumbsUp, ThumbsDown, Trash2, X } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:3000";

const getConvId = (c) => c?.id_conversacion ?? c?.id ?? c?.conversation_id ?? c?.uuid ?? c?.ID;
const getConvTitle = (c) => c?.titulo ?? c?.title ?? c?.nombre ?? `Chat ${getConvId(c) ?? ""}`.trim();
const getConvDate = (c) => c?.fecha_inicio ?? c?.fecha ?? c?.created_at ?? c?.createdAt ?? c?.FECHA ?? null;

const normalizeConv = (c) => ({
  ...c,
  id_conversacion: getConvId(c),
  titulo: getConvTitle(c),
  fecha_inicio: getConvDate(c),
});

const pickArray = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const key of ["conversaciones", "items", "rows", "data", "result", "results"]) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
};

const GlobalStyles = () => (
  <style>{`
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #0a0e1a;
      color: #e8eaed;
    }
    button { cursor: pointer; border: none; outline: none; }
    input, textarea { outline: none; }
    ::-webkit-scrollbar { width: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 5px; }
    ::-webkit-scrollbar-thumb:hover { background: #334155; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-15px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }

    @media (max-width: 768px) {
      ::-webkit-scrollbar { width: 6px; }
    }
  `}</style>
);

const MedicalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("app_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.user_id) {
          setCurrentUser(parsed);
          setView("chat");
        } else {
          localStorage.removeItem("app_user");
        }
      } catch (e) {
        localStorage.removeItem("app_user");
      }
    }
  }, []);

  const handleLogin = async (credentials) => {
    try {
      setAuthLoading(true);
      setAuthError("");
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al iniciar sesión");
      }

      const data = await res.json();
      if (!data.user_id) {
        throw new Error("No se recibió user_id del servidor");
      }

      const profile = { user_id: data.user_id, nombre: data.nombre || "Usuario", correo: credentials.correo };
      localStorage.setItem("app_user", JSON.stringify(profile));
      setCurrentUser(profile);
      setView("chat");
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (payload) => {
    try {
      setAuthLoading(true);
      setAuthError("");
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al registrar");
      }

      const data = await res.json();
      if (!data.user_id) {
        throw new Error("No se recibió user_id del servidor");
      }

      const profile = { user_id: data.user_id, nombre: payload.nombre || "Usuario", correo: payload.correo };
      localStorage.setItem("app_user", JSON.stringify(profile));
      setCurrentUser(profile);
      setView("chat");
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("app_user");
    setCurrentUser(null);
    setView("login");
  };

  return (
    <>
      <GlobalStyles />
      {!currentUser ? (
        <AuthScreen
          view={view}
          setView={setView}
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={authLoading}
          error={authError}
        />
      ) : (
        <ChatApp user={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}

function AuthScreen({ view, setView, onLogin, onRegister, loading, error }) {
  const [formData, setFormData] = useState({ nombre: "", correo: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === "login") {
      onLogin({ correo: formData.correo, password: formData.password });
    } else {
      onRegister(formData);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #10b981 100%)",
      padding: "20px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "48px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 25px 70px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "72px",
            height: "72px",
            margin: "0 auto 20px",
            background: "linear-gradient(135deg, #0ea5e9, #10b981)",
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(14, 165, 233, 0.4)",
            color: "#fff",
          }}>
            <MedicalIcon />
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
            {view === "login" ? "Bienvenido" : "Crear cuenta"}
          </h1>
          <p style={{ color: "#64748b", fontSize: "15px" }}>
            {view === "login" ? "Accede a tu asistente médico" : "Regístrate para comenzar"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {view === "register" && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "15px",
                  transition: "all 0.2s",
                  background: "#f8fafc",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#0ea5e9";
                  e.target.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.background = "#f8fafc";
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={formData.correo}
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              style={{
                width: "100%",
                padding: "13px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "15px",
                transition: "all 0.2s",
                background: "#f8fafc",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#0ea5e9";
                e.target.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.background = "#f8fafc";
              }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: "100%",
                padding: "13px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "15px",
                transition: "all 0.2s",
                background: "#f8fafc",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#0ea5e9";
                e.target.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.background = "#f8fafc";
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "14px 16px",
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: "10px",
              fontSize: "14px",
              marginBottom: "20px",
              border: "1px solid #fecaca",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: loading ? "#94a3b8" : "linear-gradient(135deg, #0ea5e9, #10b981)",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.3s",
              marginBottom: "16px",
              boxShadow: loading ? "none" : "0 4px 14px rgba(14, 165, 233, 0.4)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(14, 165, 233, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 14px rgba(14, 165, 233, 0.4)";
              }
            }}
          >
            {loading ? "Cargando..." : view === "login" ? "Iniciar sesión" : "Registrarse"}
          </button>

          <button
            type="button"
            onClick={() => setView(view === "login" ? "register" : "login")}
            style={{
              width: "100%",
              padding: "14px",
              background: "transparent",
              color: "#0ea5e9",
              fontSize: "14px",
              fontWeight: "600",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.color = "#0284c7"}
            onMouseLeave={(e) => e.target.style.color = "#0ea5e9"}
          >
            {view === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

function FormattedMessage({ content }: { content: string }) {
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;
    let currentSection = null;
    let sectionContent: string[] = [];

    const getIconAndColor = (title: string) => {
      const lower = title.toLowerCase();
      if (lower.includes('diagnóstico') || lower.includes('posible diagnóstico')) return { icon: '🔍', color: '#3b82f6' };
      if (lower.includes('descripción')) return { icon: '📋', color: '#6366f1' };
      if (lower.includes('tratamiento')) return { icon: '💊', color: '#10b981' };
      if (lower.includes('recomendaciones')) return { icon: '💡', color: '#f59e0b' };
      if (lower.includes('recordatorio') || lower.includes('importante')) return { icon: '⚠️', color: '#ef4444' };
      if (lower.includes('opción')) return { icon: '💊', color: '#10b981' };
      return { icon: '📌', color: '#06b6d4' };
    };

    const flushSection = () => {
      if (currentSection && sectionContent.length > 0) {
        const { icon, color } = getIconAndColor(currentSection);

        elements.push(
          <div key={key++} style={{
            marginBottom: '16px',
            background: `${color}08`,
            border: `1px solid ${color}20`,
            borderRadius: '12px',
            padding: '16px 18px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
            }}>
              <span style={{ fontSize: '20px' }}>{icon}</span>
              <span style={{
                fontSize: '16px',
                fontWeight: '700',
                color: color,
                letterSpacing: '0.3px',
              }}>
                {currentSection}
              </span>
            </div>
            <div style={{
              fontSize: '15px',
              color: '#cbd5e1',
              lineHeight: '1.7',
              paddingLeft: '30px',
            }}>
              {sectionContent.map((line, idx) => {
                if (line.startsWith('* ')) {
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: color, flexShrink: 0 }}>•</span>
                      <span>{line.substring(2)}</span>
                    </div>
                  );
                }
                return <div key={idx} style={{ marginBottom: '6px' }}>{line}</div>;
              })}
            </div>
          </div>
        );
      }
      currentSection = null;
      sectionContent = [];
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) return;

      const titleMatch = trimmedLine.match(/^\*\*(.*?):\*\*(.*)$/) || trimmedLine.match(/^(🔍|📋|💊|💡|⚠️)\s+\*\*(.*?)\*\*$/);

      if (titleMatch) {
        flushSection();

        if (trimmedLine.match(/^\*\*(.*?):\*\*(.*)$/)) {
          const [, titlePart, contentPart] = titleMatch;
          currentSection = titlePart.trim();
          const rest = contentPart.trim();
          if (rest) sectionContent.push(rest);
        } else {
          currentSection = titleMatch[2].trim();
        }
      }
      else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        flushSection();
        currentSection = trimmedLine.replace(/\*\*/g, '').trim();
      }
      else if (trimmedLine.startsWith('---')) {
        flushSection();
        elements.push(
          <div key={key++} style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #1e293b 20%, #1e293b 80%, transparent)',
            margin: '20px 0',
          }} />
        );
      }
      else {
        if (currentSection) {
          sectionContent.push(trimmedLine);
        } else {
          elements.push(
            <div key={key++} style={{
              color: '#cbd5e1',
              lineHeight: '1.7',
              marginBottom: '8px',
              fontSize: '15px',
              padding: '8px 12px',
              background: '#1e293b20',
              borderRadius: '8px',
              borderLeft: '3px solid #06b6d4',
            }}>
              {trimmedLine}
            </div>
          );
        }
      }
    });

    flushSection();

    return elements;
  };

  return (
    <div style={{
      animation: 'fadeIn 0.5s ease-in',
    }}>
      {formatContent(content)}
    </div>
  );
}

function FeedbackButtons({ messageIndex }) {
  const [feedback, setFeedback] = useState(null);
  const [showThanks, setShowThanks] = useState(false);

  const handleFeedback = async (isPositive) => {
    setFeedback(isPositive);
    setShowThanks(true);

    setTimeout(() => setShowThanks(false), 2000);

    try {
      await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_index: messageIndex,
          is_positive: isPositive,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("Error al enviar feedback:", e);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginTop: "12px",
      paddingLeft: "0",
    }}>
      <button
        onClick={() => handleFeedback(true)}
        disabled={feedback !== null}
        style={{
          background: feedback === true ? "#10b98115" : "transparent",
          padding: "8px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          transition: "all 0.2s",
          opacity: feedback === false ? 0.3 : 1,
          cursor: feedback !== null ? "default" : "pointer",
          border: feedback === true ? "1px solid #10b98140" : "1px solid transparent",
        }}
        onMouseEnter={(e) => feedback === null && (e.currentTarget.style.background = "#1e293b")}
        onMouseLeave={(e) => feedback === null && (e.currentTarget.style.background = "transparent")}
      >
        <ThumbsUp
          size={16}
          color={feedback === true ? "#10b981" : "#64748b"}
          fill={feedback === true ? "#10b981" : "none"}
        />
      </button>

      <button
        onClick={() => handleFeedback(false)}
        disabled={feedback !== null}
        style={{
          background: feedback === false ? "#ef444415" : "transparent",
          padding: "8px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          transition: "all 0.2s",
          opacity: feedback === true ? 0.3 : 1,
          cursor: feedback !== null ? "default" : "pointer",
          border: feedback === false ? "1px solid #ef444440" : "1px solid transparent",
        }}
        onMouseEnter={(e) => feedback === null && (e.currentTarget.style.background = "#1e293b")}
        onMouseLeave={(e) => feedback === null && (e.currentTarget.style.background = "transparent")}
      >
        <ThumbsDown
          size={16}
          color={feedback === false ? "#ef4444" : "#64748b"}
          fill={feedback === false ? "#ef4444" : "none"}
        />
      </button>

      {showThanks && (
        <span style={{
          fontSize: "13px",
          color: "#10b981",
          marginLeft: "8px",
          animation: "fadeIn 0.3s ease-in",
          fontWeight: "500",
        }}>
          ¡Gracias por tu retroalimentación!
        </span>
      )}
    </div>
  );
}

function ChatApp({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const listRef = useRef(null);
  const settingsRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsOpen && settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      const res = await fetch(`${API_BASE_URL}/conversaciones?user_id=${encodeURIComponent(user.user_id)}`);
      const rawData = await res.json();
      const arr = pickArray(rawData).map(normalizeConv);
      setConversations(arr);
    } catch (e) {
      console.error(e);
    } finally {
      setConversationsLoading(false);
    }
  };

  const handleNew = async () => {
    try {
      if (!user || !user.user_id) {
        alert("Error: No se pudo identificar al usuario. Por favor, vuelve a iniciar sesión.");
        return null;
      }

      const res = await fetch(`${API_BASE_URL}/nueva-conversacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al crear conversación");
      }

      const conv = normalizeConv(await res.json());
      if (!getConvId(conv)) throw new Error("Nueva conversación sin ID");

      await loadConversations();

      setSelected(conv);
      setMessages([]);
      return conv;
    } catch (e) {
      console.error("Error creando conversación:", e);
      alert("Error al crear conversación: " + e.message);
      return null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let conv = selected;
    if (!conv) {
      conv = await handleNew();
      if (!conv) return;
    }

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/mensaje`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          conversacion_id: getConvId(conv),
          contenido: input,
        }),
      });
      const data = await res.json();
      const botMsg = { role: "assistant", content: data.respuesta || "Sin respuesta" };
      setMessages((prev) => [...prev, botMsg]);

      loadConversations();
    } catch (e) {
      const errMsg = { role: "assistant", content: `Error: ${e.message}` };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConv = async (convId) => {
    try {
      await fetch(`${API_BASE_URL}/conversacion/${convId}`, {
        method: "DELETE",
      });

      if (selected && getConvId(selected) === convId) {
        setSelected(null);
        setMessages([]);
      }

      await loadConversations();
      setDeleteConfirm(null);
    } catch (e) {
      console.error("Error al eliminar conversación:", e);
      alert("Error al eliminar la conversación");
    }
  };

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Error al iniciar reconocimiento de voz:", e);
      }
    }
  };

  const handleSelectConv = async (conv) => {
    setMessages([]);
    setSelected(conv);

    try {
      const res = await fetch(`${API_BASE_URL}/conversacion/${getConvId(conv)}`);
      const rawData = await res.json();
      const arr = Array.isArray(rawData) ? rawData : pickArray(rawData);
      setMessages(arr.map((m) => ({
        role: m.role || m.remitente || "user",
        content: m.content || m.contenido || m.texto || "",
      })));
    } catch (e) {
      console.error(e);
      setMessages([]);
    }
  };

  const isEmptyState = messages.length === 0;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0e1a", color: "#e8eaed" }}>
      {sidebarOpen && (
        <div style={{
          width: "300px",
          background: "#0f172a",
          borderRight: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, #0ea5e9, #10b981)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "18px",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#f1f5f9" }}>MediAssist</h2>
              </div>
              <button
                onClick={handleNew}
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #10b981)",
                  padding: "8px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(14, 165, 233, 0.3)";
                }}
              >
                <Plus size={18} color="#fff" />
              </button>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              background: "#1e293b",
              borderRadius: "10px",
              border: "1px solid #334155",
            }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Buscar conversaciones"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#e8eaed",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            <div style={{ fontSize: "12px", color: "#64748b", padding: "8px 12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Historial Médico
            </div>
            {conversationsLoading ? (
              <div style={{ padding: "12px" }}>
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    style={{
                      height: "60px",
                      background: "linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s ease-in-out infinite",
                      borderRadius: "10px",
                      marginBottom: "8px",
                    }}
                  />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
                No hay conversaciones aún
              </div>
            ) : (
              conversations.map((conv) => {
              const isActive = getConvId(conv) === getConvId(selected);
              return (
                <div
                  key={getConvId(conv)}
                  style={{
                    position: "relative",
                    marginBottom: "6px",
                  }}
                  onMouseEnter={(e) => {
                    const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                    if (deleteBtn) deleteBtn.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                    if (deleteBtn && deleteConfirm !== getConvId(conv)) deleteBtn.style.opacity = '0';
                  }}
                >
                  {deleteConfirm === getConvId(conv) ? (
                    <div style={{
                      padding: "14px",
                      background: "#7f1d1d20",
                      borderRadius: "10px",
                      border: "1px solid #dc262640",
                    }}>
                      <div style={{ fontSize: "13px", color: "#f1f5f9", marginBottom: "10px" }}>
                        ¿Eliminar esta conversación?
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleDeleteConv(getConvId(conv))}
                          style={{
                            flex: 1,
                            padding: "8px",
                            background: "#dc2626",
                            color: "#fff",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            flex: 1,
                            padding: "8px",
                            background: "#334155",
                            color: "#f1f5f9",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectConv(conv)}
                      style={{
                        width: "100%",
                        padding: "14px",
                        paddingRight: "40px",
                        background: isActive ? "#1e293b" : "transparent",
                        borderRadius: "10px",
                        textAlign: "left",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        border: isActive ? "1px solid #334155" : "1px solid transparent",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "#1e293b";
                          e.currentTarget.style.borderColor = "#334155";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}
                    >
                      <MessageSquare size={16} color={isActive ? "#0ea5e9" : "#64748b"} />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{
                          fontSize: "14px",
                          color: isActive ? "#f1f5f9" : "#cbd5e1",
                          fontWeight: isActive ? "600" : "400",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}>
                          {getConvTitle(conv)}
                        </div>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(getConvId(conv));
                        }}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "#7f1d1d",
                          padding: "6px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          opacity: 0,
                          transition: "opacity 0.2s",
                        }}
                      >
                        <Trash2 size={14} color="#fca5a5" />
                      </button>
                    </button>
                  )}
                </div>
              );
            })
            )}
          </div>

          <div style={{ padding: "16px", borderTop: "1px solid #1e293b" }}>
            <button
              onClick={onLogout}
              style={{
                width: "100%",
                padding: "12px",
                background: "transparent",
                borderRadius: "10px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.2s",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1e293b";
                e.currentTarget.style.borderColor = "#334155";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <User size={18} color="#e8eaed" />
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>{user.nombre}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{user.correo}</div>
              </div>
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{
          height: "70px",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: "16px",
          background: "#0f172a",
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "transparent",
              padding: "8px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              transition: "background 0.2s",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1e293b";
              e.currentTarget.style.borderColor = "#334155";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            <Menu size={20} color="#e8eaed" />
          </button>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", position: "relative", marginLeft: "auto" }}>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              style={{
                background: "transparent",
                padding: "8px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                transition: "background 0.2s",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1e293b";
                e.currentTarget.style.borderColor = "#334155";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <Settings size={20} color="#e8eaed" />
            </button>

            {settingsOpen && (
              <div ref={settingsRef} style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: "50px",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "12px",
                minWidth: "280px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                zIndex: 1000,
                animation: "fadeIn 0.2s ease-in",
              }}>
                <div style={{ padding: "16px", borderBottom: "1px solid #334155" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#f1f5f9", marginBottom: "4px" }}>
                    Configuración
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    MediAssist v1.0
                  </div>
                </div>

                <div style={{ padding: "8px" }}>
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      alert("Proximamente: Ajustar preferencias de respuesta");
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "transparent",
                      borderRadius: "8px",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "background 0.2s",
                      border: "none",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#0f172a"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6m5.2-13.2-4.2 4.2m0 6-4.2 4.2m13.2-5.2h-6m-6 0H1m18.8-5.2-4.2 4.2m-6 6-4.2 4.2"/>
                    </svg>
                    <div>
                      <div style={{ fontSize: "14px", color: "#f1f5f9", fontWeight: "500" }}>Preferencias</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Ajustar tipo de respuestas</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      alert("Proximamente: Historial de síntomas");
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "transparent",
                      borderRadius: "8px",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "background 0.2s",
                      border: "none",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#0f172a"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M3 3h18v18H3z"/>
                      <path d="M3 9h18M9 21V9"/>
                    </svg>
                    <div>
                      <div style={{ fontSize: "14px", color: "#f1f5f9", fontWeight: "500" }}>Historial</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Ver síntomas anteriores</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      alert("Proximamente: Exportar conversaciones");
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "transparent",
                      borderRadius: "8px",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "background 0.2s",
                      border: "none",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#0f172a"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <div>
                      <div style={{ fontSize: "14px", color: "#f1f5f9", fontWeight: "500" }}>Exportar</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Descargar conversaciones</div>
                    </div>
                  </button>
                </div>

                <div style={{ padding: "8px", borderTop: "1px solid #334155" }}>
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "transparent",
                      borderRadius: "8px",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "background 0.2s",
                      border: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#7f1d1d20";
                    }}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <div>
                      <div style={{ fontSize: "14px", color: "#ef4444", fontWeight: "500" }}>Cerrar sesión</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Salir de tu cuenta</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: "700",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(14, 165, 233, 0.3)",
            }}>
              {user.nombre[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>

        <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
          {isEmptyState ? (
            <div style={{
              maxWidth: "800px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "calc(100vh - 250px)",
            }}>
              <div style={{
                width: "100px",
                height: "100px",
                background: "linear-gradient(135deg, #0ea5e9, #10b981)",
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "32px",
                boxShadow: "0 15px 50px rgba(14, 165, 233, 0.4)",
                color: "#fff",
              }}>
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h1 style={{
                fontSize: "56px",
                fontWeight: "300",
                background: "linear-gradient(90deg, #0ea5e9 0%, #10b981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "16px",
                letterSpacing: "-1px",
              }}>
                Hola, {user.nombre}
              </h1>
              <p style={{
                fontSize: "18px",
                color: "#64748b",
                textAlign: "center",
                maxWidth: "550px",
                lineHeight: "1.6",
              }}>
                ¿Cómo puedo ayudarte con tu salud hoy? Describe tus síntomas o hazme cualquier pregunta médica.
              </p>
            </div>
          ) : (
            <div style={{ maxWidth: "850px", margin: "0 auto" }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "18px",
                    marginBottom: "32px",
                    alignItems: "flex-start",
                    animation: 'slideIn 0.4s ease-out',
                  }}
                >
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)"
                      : "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: msg.role === "user" ? "0 2px 8px rgba(14, 165, 233, 0.3)" : "none",
                    border: msg.role === "assistant" ? "1px solid #334155" : "none",
                  }}>
                    {msg.role === "user" ? (
                      <span style={{ color: "#fff", fontSize: "14px", fontWeight: "700" }}>
                        {user.nombre[0]?.toUpperCase() || "U"}
                      </span>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      padding: "14px 0",
                      fontSize: "15px",
                      lineHeight: "1.7",
                      color: msg.role === "user" ? "#f1f5f9" : "#cbd5e1",
                    }}>
                      {msg.role === "assistant" ? (
                        <FormattedMessage content={msg.content} />
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === "assistant" && (
                      <FeedbackButtons messageIndex={i} />
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: "18px", marginBottom: "32px", alignItems: "flex-start", animation: 'slideIn 0.4s ease-out' }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #334155",
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div style={{ padding: "14px 0", color: "#64748b", fontSize: "15px" }}>
                    <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>Analizando síntomas...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: "24px", background: "#0f172a", borderTop: "1px solid #1e293b" }}>
          <form onSubmit={handleSend}>
            <div style={{
              maxWidth: "850px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "16px 22px",
              background: "#1e293b",
              borderRadius: "28px",
              border: "1px solid #334155",
              transition: "all 0.2s",
            }}>
              <Plus size={22} color="#64748b" style={{ cursor: "pointer", flexShrink: 0 }} />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe tus síntomas..."
                rows={1}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  fontSize: "15px",
                  color: "#e8eaed",
                  resize: "none",
                  fontFamily: "inherit",
                  lineHeight: "1.5",
                  maxHeight: "120px",
                  overflowY: "auto",
                }}
              />
              <button
                type="button"
                onClick={toggleVoiceRecognition}
                style={{
                  background: isRecording ? "#ef444420" : "transparent",
                  padding: "8px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  transition: "all 0.2s",
                  border: isRecording ? "1px solid #ef4444" : "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isRecording) e.currentTarget.style.background = "#1e293b";
                }}
                onMouseLeave={(e) => {
                  if (!isRecording) e.currentTarget.style.background = "transparent";
                }}
              >
                <Mic
                  size={22}
                  color={isRecording ? "#ef4444" : "#64748b"}
                  style={{
                    animation: isRecording ? "pulse 1.5s ease-in-out infinite" : "none"
                  }}
                />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{
                  background: input.trim() && !loading ? "linear-gradient(135deg, #0ea5e9, #10b981)" : "#334155",
                  padding: "11px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: input.trim() && !loading ? "0 2px 10px rgba(14, 165, 233, 0.4)" : "none",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (input.trim() && !loading) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(14, 165, 233, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (input.trim() && !loading) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(14, 165, 233, 0.4)";
                  }
                }}
              >
                <Send size={18} color={input.trim() && !loading ? "#fff" : "#64748b"} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
