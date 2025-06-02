'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [chat, setChat] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    const wsUrl = process.env.NEXT_PUBLIC_WSS
    if (!wsUrl) {
      console.warn('NEXT_PUBLIC_WSS environment variable is not set')
      return
    }

    try {
      const socket = new WebSocket(wsUrl)
      socket.onmessage = (e) => setChat((c) => [...c, e.data])
      socket.onerror = (error) => console.error('WebSocket error:', error)
      setWs(socket)
      return () => socket.close()
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
    }
  }, [isClient])
  
  if (!isClient) {
    return <div>Loading...</div>
  }
  
  return (
    <>
      <div>
        {chat.map((m, i) => <p key={i}>{m}</p>)}
        <input 
          onKeyDown={(e) => {
            if (e.key === 'Enter' && ws && ws.readyState === WebSocket.OPEN) {
              ws.send(e.currentTarget.value)
              e.currentTarget.value = ''
            }
          }} 
          placeholder="メッセージを入力してEnterを押してください"
        />
      </div> 
    </>
  )
}