'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [chat, setChat] = useState<string[]>([])

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WSS!)
    socket.onmessage = (e) => setChat((c) => [...c, e.data])
    setWs(socket)
    return () => socket.close()
  }, [])
  
  return (
    <>
      <div>
        {chat.map((m, i) => <p key={i}>{m}</p>)}
        <input onKeyDown={(e) => {
          if (e.key === 'Enter') ws?.send(e.currentTarget.value)
        }} />
      </div> 
    </>
  )
}