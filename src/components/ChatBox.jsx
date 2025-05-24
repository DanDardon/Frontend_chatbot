import React, { useState, useEffect } from 'react'
import axios from 'axios'

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

  const enviarMensaje = async (texto) => {
  if (!texto.trim()) return
  const nuevo = [...mensajes, { emisor: 'usuario', texto }]
  setMensajes(nuevo)
  setEntrada('')
  setPensando(true) // 👈 Activar "pensando..."

  const usuario = localStorage.getItem("usuario_id") || (() => {
    const id = crypto.randomUUID()
    localStorage.setItem("usuario_id", id)
    return id
  })()

  try {
    const res = await axios.post('https://chatbot-backend-4qkl.onrender.com/mensaje', {
      mensaje: texto,
      usuario: usuario
    })
    setMensajes([...nuevo, { emisor: 'bot', texto: res.data.respuesta }])
  } catch (e) {
    setMensajes([...nuevo, { emisor: 'bot', texto: 'Error al conectar con el servidor.' }])
  } finally {
    setPensando(false)
  }
}
    const nuevaConversacion = async () => {
      const usuario = localStorage.getItem("usuario_id")

      try {
        await axios.post('https://chatbot-backend-4qkl.onrender.com/reiniciar', {
          usuario: usuario
        })
      } catch (e) {
        console.warn("No se pudo reiniciar en backend:", e)
      }

      setMensajes([
        { emisor: 'bot', texto: 'Hola, soy MediAssist, tu asistente médico virtual. ¿Cómo puedo ayudarte hoy?' }
      ])
    }

  useEffect(() => {
    if (!pensando) return

    const interval = setInterval(() => {
      setPuntos(prev => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [pensando])

  return (
    <>
      <div className="chat-box">
        {mensajes.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.emisor}`}>
            <div className={`chat-bubble ${msg.emisor}`}>{msg.texto}</div>
          </div>
        ))}
      </div>

      <div className="nueva-conversacion">
        <button onClick={nuevaConversacion}>🗑 Nueva conversación</button>
      </div>

      {pensando && (
        <div className="pensando">
          <span>MediAssist está pensando</span>
          <span className="puntos">...</span>
        </div>
      )}

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
