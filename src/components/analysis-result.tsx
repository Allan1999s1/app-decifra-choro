"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react"

interface AnalysisResultProps {
  result: {
    diagnosis: string
    confidence: number
    recommendations: string[]
    insights: string
    type: "urgent" | "detailed"
  }
  onBack: () => void
}

export function AnalysisResult({ result, onBack }: AnalysisResultProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-orange-600"
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100"
    if (confidence >= 60) return "bg-yellow-100"
    return "bg-orange-100"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#92e6eb] via-[#a8eef2] to-[#bef5f9] flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Resultado da Análise</h2>
          <p className="text-sm text-gray-700">
            {result.type === "urgent" ? "Modo Urgência" : "Análise Detalhada"}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-6">
          {/* Diagnosis Card */}
          <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#5ec9d1] to-[#4ab8c0] p-3 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {result.diagnosis}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Confiança:</span>
                  <span className={`text-lg font-bold ${getConfidenceColor(result.confidence)}`}>
                    {result.confidence}%
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div
                className={`h-3 rounded-full transition-all ${
                  result.confidence >= 80 
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : result.confidence >= 60
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                    : "bg-gradient-to-r from-orange-400 to-orange-500"
                }`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>

            {/* Insights */}
            <div className={`p-4 rounded-2xl ${getConfidenceBg(result.confidence)}`}>
              <div className="flex gap-3">
                <Lightbulb className="w-5 h-5 text-gray-700 flex-shrink-0 mt-1" />
                <p className="text-gray-700 leading-relaxed">
                  {result.insights}
                </p>
              </div>
            </div>
          </Card>

          {/* Recommendations Card */}
          <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-[#5ec9d1]" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                O que fazer agora
              </h3>
            </div>

            <ul className="space-y-4">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#5ec9d1] to-[#4ab8c0] flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed pt-1">
                    {rec}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          {/* Action Button */}
          <Button
            onClick={onBack}
            className="w-full bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] hover:from-[#4ab8c0] hover:to-[#3aa7af] text-white font-semibold py-6 rounded-2xl text-lg shadow-lg"
          >
            Nova Análise
          </Button>
        </div>
      </div>
    </div>
  )
}
