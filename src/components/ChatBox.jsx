
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'


const preguntasFrecuentes = [
  "¿Qué debo hacer si tengo fiebre?",
  "¿Cuáles son los síntomas de la gripe?",
  "¿Cómo puedo agendar una cita médica?",
  "¿Necesito hacer ayuno para un análisis de sangre?"
]

export default function ChatBox() {
  const [mensajes, setMensajes] = useState([
    { emisor: 'bot', texto: 'Hola, soy MediAssist, tu asistente médico virtual. ¿Cómo puedo ayudarte hoy?' }
  ])
  const [entrada, setEntrada] = useState('')
  const [puntos, setPuntos] = useState('')
  const [pensando, setPensando] = useState(false)
  const [vozActiva, setVozActiva] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (!pensando) return
    const interval = setInterval(() => {
      setPuntos(prev => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [pensando])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensajes])

  const hablar = (texto) => {
    const textoSinEmojis = texto.replace(/[\u{1F600}-\u{1F6FF}|\u{2700}-\u{27BF}|\u{1F300}-\u{1F5FF}|\u{1F900}-\u{1F9FF}|\u{1FA70}-\u{1FAFF}]/gu, '')
    const utterance = new SpeechSynthesisUtterance(textoSinEmojis)
    utterance.lang = "es-ES"
    window.speechSynthesis.speak(utterance)
  }

  const enviarMensaje = async (texto) => {
    if (!texto.trim()) return
    const nuevo = [...mensajes, { emisor: 'usuario', texto }]
    setMensajes(nuevo)
    setEntrada('')
    setPensando(true)

    const usuario = localStorage.getItem("usuario_id") || (() => {
      const id = crypto.randomUUID()
      localStorage.setItem("usuario_id", id)
      return id
    })()

    try {
      const res = await axios.post('http://localhost:3000/mensaje', {
        mensaje: texto,
        usuario: usuario
      })
      const respuesta = res.data.respuesta
      setMensajes([...nuevo, { emisor: 'bot', texto: respuesta }])
      if (vozActiva) {
        hablar(respuesta)
      }
    } catch (e) {
      const errorText = "Error al conectar con el servidor."
      setMensajes([...nuevo, { emisor: 'bot', texto: errorText }])
      if (vozActiva) {
        hablar(errorText)
      }
    } finally {
      setPensando(false)
    }
  }

  const nuevaConversacion = async () => {
    const usuario = localStorage.getItem("usuario_id")
    try {
      await axios.post('http://localhost:3000/mensaje', { usuario }) //http://localhost:3000/mensaje 
                                                                                          // https://chatbot-backend-4qkl.onrender.com/reiniciar
    } catch (e) {
      console.warn("No se pudo reiniciar en backend:", e)
    }
    setMensajes([
      { emisor: 'bot', texto: 'Hola, soy MediAssist, tu asistente médico virtual. ¿Cómo puedo ayudarte hoy?' }
    ])
  }

  const toggleVoz = () => {
    setVozActiva(!vozActiva)
  }

  

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button className="boton-voz" onClick={toggleVoz}>
          {vozActiva ? (
            <>
              🔈 <span>Voz activada</span>
            </>
          ) : (
            <>
              🔇 <span>Voz desactivada</span>
            </>
          )}
      </button>
      </div>

      <div className="chat-box">
        {mensajes.map((msg, i) => (
        <div
          key={i}
          className={`chat-message ${msg.emisor}`}
          style={{ animationDelay: `${i * 10}ms` }}
        >
          <div className={`chat-bubble ${msg.emisor}`}>
            <ReactMarkdown>{msg.texto}</ReactMarkdown>
          </div>
        </div>
      ))}
        {pensando && (
          <div className="pensando">
            <span>MediAssist está pensando{puntos}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="nueva-conversacion">
        <button onClick={nuevaConversacion}>🗑 Nueva conversación</button>
      </div>

      <div className="faq-buttons">
        {preguntasFrecuentes.map((p, i) => (
          <button key={i} onClick={() => enviarMensaje(p)}>{p}</button>
        ))}
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Escribe tu consulta médica aquí..."
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviarMensaje(entrada)}
        />
        <button onClick={() => enviarMensaje(entrada)}>➤</button>
      </div>
    </>
  )
}

