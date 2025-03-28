'use client'

import type React from 'react'

import { useState, useRef, useEffect } from 'react'
import { X, Minus, Send, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'

type Message = {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const slots = {
    'RegistrarUsuario': null,
    'Confirmacionpromt': null,
    'PreguntaActual': null,
    'RespuestaUsuario': null
  }

  const apiGateway = async (slots: any) => {
    const response = await fetch('https://65we2pi9nd.execute-api.us-east-1.amazonaws.com/NewAPI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'qOBf0phZRE6wnWq64wRye1tqbT27uPw1176XFgKX'
      },
      body: JSON.stringify({
        'sessionState': {
          'intent': {
            'name': 'TestAntifraude',
            'slots': slots,
            'state': 'InProgress'
          }
        }
      })
    })
    return response.json()
  }
  const { mutate, data } = useMutation({
    mutationFn: apiGateway,
    onSuccess: (data) => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.messages[0].content,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages((prevMessages) => [...prevMessages, botResponse])
    }
  })

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages([...messages, newMessage])
    setInputValue('')
    if (data) {
      let slotActual = {}

      if (data.sessionState.dialogAction.slotToElicit === 'PreguntaActual') {
        const numeroPregunta = data.messages[0].content.match(/Pregunta (\d+)/)?.[1] // Captura el número de la pregunta (1 o más dígitos)

        slotActual = {
          ...data.sessionState.intent.slots,
          'PreguntaActual': {
            value: {
              interpretedValue: numeroPregunta
            }
          },
          'RespuestaUsuario': {
            value: {
              interpretedValue: inputValue
            }
          }
        }
      } else {
        slotActual = {
          ...slots,
          ...data.sessionState.intent.slots,
          [data.sessionState.dialogAction.slotToElicit]: {
            value: {
              interpretedValue: inputValue
            }
          }
        }
      }

      mutate(slotActual)
    } else {
      mutate(slots)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-4 right-4 flex h-12 w-64 cursor-pointer items-center rounded-t-lg bg-[#0A3B8E] px-4 text-white shadow-lg"
        onClick={() => setIsMinimized(false)}>
        <div className="flex space-x-2">
          <Avatar className="justify-center items-center h-8 w-8 bg-blue-700">
            <User className="h-5 w-5 text-white" />
          </Avatar>
          <span className="font-medium  flex items-center justify-center">BCP Chat</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[500px] w-full flex-col overflow-hidden rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0A3B8E] px-4 py-3 text-white">
        <div className="flex items-center space-x-2">
          <Avatar className="justify-center items-center h-8 w-8 bg-blue-700">
            <User className="h-5 w-5 text-white" />
          </Avatar>
          <span className="font-medium">BCP Chat</span>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-blue-800" onClick={() => setIsMinimized(true)}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-blue-800" onClick={() => setIsMinimized(true)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex', {
                'justify-end': message.sender === 'user',
                'justify-start': message.sender === 'bot'
              })}>
              {message.sender === 'bot' && (
                <Avatar className="justify-center items-center mr-2 h-8 w-8 self-end bg-blue-700">
                  <User className="h-5 w-5 text-white" />
                </Avatar>
              )}
              <div
                className={cn('max-w-[80%] rounded-lg px-4 py-2', {
                  'bg-[#0A3B8E] text-white': message.sender === 'user',
                  'bg-gray-100 text-gray-800': message.sender === 'bot'
                })}>
                {message.content}
              </div>
              {message.sender === 'user' && (
                <Avatar className="justify-center items-center ml-2 h-8 w-8 self-end bg-orange-500">
                  <User className="h-5 w-5 text-white" />
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} className="bg-[#0A3B8E] hover:bg-blue-800">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
