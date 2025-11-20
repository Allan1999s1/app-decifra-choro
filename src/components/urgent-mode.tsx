"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Loader2 } from "lucide-react"
import { AudioRecorder } from "@/components/audio-recorder"
import { AnalysisResult } from "@/components/analysis-result"

interface UrgentModeProps {
  onBack: () => void
  onComplete: (analysis: any) => void
}

export function UrgentMode({ onBack, onComplete }: UrgentModeProps) {
  const [showRecorder, setShowRecorder] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setAnalyzing(true)
    
    // Simular análise rápida (em produção, enviaria para API)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const analysis = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: "urgent",
      diagnosis: "Desconforto/Dor",
      confidence: 78,
      recommendations: [
        "Verifique a fralda do bebê",
        "Observe se há sinais de cólica",
        "Tente acalmar com movimentos suaves",
        "Se persistir, consulte um pediatra"
      ],
      insights: "O padrão de choro sugere desconforto. Verifique necessidades básicas primeiro. Se o choro for intenso e persistente, procure orientação médica."
    }
    
    setResult(analysis)
    setAnalyzing(false)
    onComplete(analysis)
  }

  if (result) {
    return <AnalysisResult result={result} onBack={onBack} />
  }

  if (analyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2] flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full bg-[#e8f4f5]/40 backdrop-blur-xl border-0 rounded-[2.5rem] shadow-[8px_8px_20px_rgba(163,177,198,0.3),-8px_-8px_20px_rgba(255,255,255,0.8)] text-center">
          <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Análise rápida em andamento...
          </h3>
          <p className="text-gray-600">
            Processando o áudio do choro
          </p>
        </Card>
      </div>
    )
  }

  if (showRecorder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2] flex flex-col p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="bg-[#e8f4f5]/60 backdrop-blur-md hover:bg-[#e8f4f5]/80 rounded-full shadow-[4px_4px_10px_rgba(163,177,198,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Modo Urgência</h2>
            <p className="text-sm text-gray-700">Análise rápida do choro</p>
          </div>
        </div>

        <AudioRecorder 
          onBack={onBack} 
          onComplete={handleRecordingComplete}
          urgent={true}
        />
      </div>
    )
  }

  return null
}
