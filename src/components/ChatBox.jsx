import React, { useState } from 'react'
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

  const enviarMensaje = async (texto) => {
  if (!texto.trim()) return
  const nuevo = [...mensajes, { emisor: 'usuario', texto }]
  setMensajes(nuevo)
  setEntrada('')

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
  }
}

    const nuevaConversacion = () => {
      localStorage.removeItem("usuario_id")
      const nuevoId = crypto.randomUUID()
      localStorage.setItem("usuario_id", nuevoId)

      setMensajes([
        { emisor: 'bot', texto: 'Hola, soy MediAssist, tu asistente médico virtual. ¿Cómo puedo ayudarte hoy?' }
      ])
    }


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
