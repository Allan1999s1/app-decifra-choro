"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Loader2, ChevronLeft } from "lucide-react"
import { AudioRecorder } from "@/components/audio-recorder"
import { AnalysisResult } from "@/components/analysis-result"

interface QuizFlowProps {
  onBack: () => void
  onComplete: (analysis: any) => void
}

const questions = [
  {
    id: "sleep",
    question: "Quantas horas seu bebê dormiu nas últimas 24 horas?",
    options: [
      { value: "0-4", label: "0 a 4 horas (muito pouco)" },
      { value: "4-8", label: "4 a 8 horas (pouco)" },
      { value: "8-12", label: "8 a 12 horas (normal)" },
      { value: "12+", label: "Mais de 12 horas (muito)" },
    ]
  },
  {
    id: "feeding",
    question: "Seu bebê está alimentado recentemente?",
    options: [
      { value: "less-1h", label: "Sim, há menos de 1 hora" },
      { value: "1-2h", label: "Sim, há 1-2 horas" },
      { value: "2-3h", label: "Há 2-3 horas" },
      { value: "more-3h", label: "Há mais de 3 horas" },
    ]
  },
  {
    id: "behavior",
    question: "Notou alguma mudança no comportamento ou ambiente?",
    options: [
      { value: "temperature", label: "Mudança de temperatura" },
      { value: "diaper", label: "Fralda suja/molhada" },
      { value: "noise", label: "Ambiente barulhento" },
      { value: "none", label: "Nada específico" },
    ]
  }
]

export function QuizFlow({ onBack, onComplete }: QuizFlowProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [showRecorder, setShowRecorder] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [animateQuestion, setAnimateQuestion] = useState(false)

  const currentQuestion = questions[step]
  const isLastQuestion = step === questions.length - 1

  // Trigger animação quando mudar de pergunta
  useEffect(() => {
    setAnimateQuestion(false)
    const timer = setTimeout(() => {
      setAnimateQuestion(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [step])

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const handleNext = () => {
    if (isLastQuestion) {
      setShowRecorder(true)
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    } else {
      onBack()
    }
  }

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setAnalyzing(true)
    
    // Simular análise (em produção, enviaria para API)
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const analysis = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: "detailed",
      answers,
      additionalInfo,
      diagnosis: "Fome",
      confidence: 85,
      recommendations: [
        "Ofereça alimentação ao bebê",
        "Verifique se a última mamada foi completa",
        "Observe sinais de saciedade após alimentar"
      ],
      insights: "Baseado no padrão de choro e nas informações fornecidas, seu bebê provavelmente está com fome. O tempo desde a última alimentação e o padrão sonoro indicam necessidade de nutrição."
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
          <Loader2 className="w-16 h-16 text-[#5ec9d1] animate-spin mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Analisando o choro...
          </h3>
          <p className="text-gray-600">
            Nossa inteligência artificial está processando os dados
          </p>
        </Card>
      </div>
    )
  }

  if (showRecorder) {
    return (
      <AudioRecorder 
        onBack={() => setShowRecorder(false)} 
        onComplete={handleRecordingComplete}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2] flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="bg-[#e8f4f5]/60 backdrop-blur-md hover:bg-[#e8f4f5]/80 rounded-full shadow-[4px_4px_10px_rgba(163,177,198,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </Button>
        <div className="flex-1">
          <div className="flex gap-2">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${
                  idx <= step 
                    ? "bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]" 
                    : "bg-[#e8f4f5] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3)]"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-700 mt-2">
            Pergunta {step + 1} de {questions.length}
          </p>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-6 sm:p-8 max-w-2xl w-full bg-[#e8f4f5]/40 backdrop-blur-xl border-0 rounded-[2.5rem] shadow-[8px_8px_20px_rgba(163,177,198,0.3),-8px_-8px_20px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.35),-12px_-12px_24px_rgba(255,255,255,0.85)] transition-all duration-500">
          <h2 className={`text-2xl sm:text-3xl font-bold text-gray-800 mb-6 transition-all duration-500 ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {currentQuestion.question}
          </h2>

          <RadioGroup
            value={answers[currentQuestion.id]}
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-[1.5rem] border-2 transition-all duration-500 cursor-pointer ${
                  answers[currentQuestion.id] === option.value
                    ? "border-[#5ec9d1] bg-[#5ec9d1]/10 shadow-[inset_4px_4px_10px_rgba(163,177,198,0.2),inset_-4px_-4px_10px_rgba(255,255,255,0.7)]"
                    : "border-transparent bg-[#e8f4f5]/60 backdrop-blur-md shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_10px_rgba(163,177,198,0.2),inset_-4px_-4px_10px_rgba(255,255,255,0.7)]"
                } ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label
                  htmlFor={option.value}
                  className="flex-1 cursor-pointer text-base sm:text-lg text-gray-800"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {isLastQuestion && (
            <div className={`mt-6 transition-all duration-500 ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${200 + currentQuestion.options.length * 100}ms` }}>
              <Label htmlFor="additional" className="text-base font-semibold text-gray-700 mb-2 block">
                Informações adicionais (opcional)
              </Label>
              <Textarea
                id="additional"
                placeholder="Descreva qualquer outro detalhe que possa ser relevante..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="min-h-24 rounded-[1.5rem] border-0 bg-[#e8f4f5]/60 backdrop-blur-md shadow-[inset_4px_4px_10px_rgba(163,177,198,0.3),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] focus:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.35),inset_-6px_-6px_12px_rgba(255,255,255,0.85)] transition-all duration-300 text-gray-800"
              />
            </div>
          )}

          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className={`w-full mt-6 bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] hover:from-[#4ab8c0] hover:to-[#3aa7af] text-white font-semibold py-6 rounded-[1.5rem] text-lg shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)] hover:shadow-[8px_8px_20px_rgba(163,177,198,0.35),-8px_-8px_20px_rgba(255,255,255,0.85)] transition-all duration-500 border-0 disabled:opacity-50 disabled:cursor-not-allowed ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${200 + (currentQuestion.options.length + (isLastQuestion ? 1 : 0)) * 100}ms` }}
          >
            {isLastQuestion ? "Gravar choro do bebê" : "Próxima"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Card>
      </div>
    </div>
  )
}
