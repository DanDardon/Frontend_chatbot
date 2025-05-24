import React from 'react'
import ChatBox from './components/ChatBox'

export default function App() {
  return (
    <div className="chat-container">
      <h2 style={{ color: '#1d4ed8', marginBottom: '1rem' }}>Consulta Médica</h2>
      <ChatBox />
    </div>
  )
}
