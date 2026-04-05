import { io, type Socket } from 'socket.io-client'
import { runtimeConfig } from '@/config/runtimeConfig'
import type { ChatMessage } from '@/types'

type ClientToServerEvents = {
  joinRoom: (roomId: string) => void
  sendMessage: (payload: {
    conversationId: string
    senderId: string
    content: string
  }) => void
}

type ServerToClientEvents = {
  message: (payload: ChatMessage) => void
  new_message: (payload: ChatMessage) => void
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export function getChatSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io(runtimeConfig.socketUrl, {
      transports: ['websocket'],
    })
  }

  return socket
}
