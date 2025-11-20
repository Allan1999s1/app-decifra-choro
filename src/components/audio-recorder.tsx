"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Square, Play, Pause, Check } from "lucide-react"

interface AudioRecorderProps {
  onBack: () => void
  onComplete: (audioBlob: Blob) => void
  urgent?: boolean
}

export function AudioRecorder({ onBack, onComplete, urgent = false }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Erro ao acessar microfone:", error)
      alert("Não foi possível acessar o microfone. Verifique as permissões.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) clearInterval(timerRef.current)
      }
      setIsPaused(!isPaused)
    }
  }

  const playAudio = () => {
    if (audioBlob) {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        const url = URL.createObjectURL(audioBlob)
        audioRef.current = new Audio(url)
        audioRef.current.play()
        setIsPlaying(true)
        audioRef.current.onended = () => setIsPlaying(false)
      }
    }
  }

  const handleComplete = () => {
    if (audioBlob) {
      onComplete(audioBlob)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <Card className="p-8 max-w-md w-full bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {urgent ? "Grave o choro agora" : "Grave o choro do bebê"}
          </h3>
          <p className="text-gray-600">
            {isRecording 
              ? "Gravando... Mantenha o celular próximo ao bebê"
              : audioBlob
              ? "Gravação concluída! Ouça ou envie para análise"
              : "Toque no botão abaixo para começar a gravar"
            }
          </p>

          {/* Recording Visualization */}
          <div className="relative">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? "bg-gradient-to-br from-red-400 to-red-500 animate-pulse" 
                : audioBlob
                ? "bg-gradient-to-br from-green-400 to-green-500"
                : "bg-gradient-to-br from-[#5ec9d1] to-[#4ab8c0]"
            }`}>
              {isRecording ? (
                <Mic className="w-16 h-16 text-white" />
              ) : audioBlob ? (
                <Check className="w-16 h-16 text-white" />
              ) : (
                <Mic className="w-16 h-16 text-white" />
              )}
            </div>
            
            {isRecording && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border-4 border-red-300 animate-ping" />
              </div>
            )}
          </div>

          {/* Timer */}
          {(isRecording || audioBlob) && (
            <div className="text-3xl font-bold text-gray-800">
              {formatTime(recordingTime)}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                className="bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] hover:from-[#4ab8c0] hover:to-[#3aa7af] text-white font-semibold px-8 py-6 rounded-2xl text-lg shadow-lg"
              >
                <Mic className="w-5 h-5 mr-2" />
                Iniciar Gravação
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  className="px-6 py-6 rounded-2xl"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </Button>
                <Button
                  onClick={stopRecording}
                  className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-8 py-6 rounded-2xl"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Parar
                </Button>
              </>
            )}

            {audioBlob && (
              <>
                <Button
                  onClick={playAudio}
                  variant="outline"
                  className="px-6 py-6 rounded-2xl"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button
                  onClick={handleComplete}
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-8 py-6 rounded-2xl"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Analisar
                </Button>
              </>
            )}
          </div>

          {audioBlob && (
            <Button
              onClick={() => {
                setAudioBlob(null)
                setRecordingTime(0)
              }}
              variant="ghost"
              className="text-gray-600"
            >
              Gravar novamente
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
