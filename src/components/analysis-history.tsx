"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Clock, TrendingUp } from "lucide-react"

interface AnalysisHistoryProps {
  analyses: any[]
  onBack: () => void
}

export function AnalysisHistory({ analyses, onBack }: AnalysisHistoryProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2] flex flex-col p-4 sm:p-6">
      {/* Header */}
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Histórico de Análises</h2>
          <p className="text-sm text-gray-700">
            {analyses.length} {analyses.length === 1 ? "análise" : "análises"} realizadas
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {analyses.length === 0 ? (
          <Card className="p-8 max-w-md mx-auto bg-[#e8f4f5]/40 backdrop-blur-xl border-0 rounded-[2.5rem] shadow-[8px_8px_20px_rgba(163,177,198,0.3),-8px_-8px_20px_rgba(255,255,255,0.8)] text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Nenhuma análise ainda
            </h3>
            <p className="text-gray-600">
              Suas análises aparecerão aqui para você acompanhar padrões
            </p>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {analyses.map((analysis, index) => (
              <Card
                key={analysis.id}
                className="p-6 bg-[#e8f4f5]/40 backdrop-blur-xl border-0 rounded-[2.5rem] shadow-[8px_8px_20px_rgba(163,177,198,0.3),-8px_-8px_20px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.35),-12px_-12px_24px_rgba(255,255,255,0.85)] transition-all duration-500 opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {analysis.diagnosis}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(analysis.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-green-100/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-[inset_2px_2px_6px_rgba(163,177,198,0.2)]">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">
                      {analysis.confidence}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`px-3 py-1 rounded-full backdrop-blur-sm shadow-[inset_2px_2px_6px_rgba(163,177,198,0.2)] ${
                    analysis.type === "urgent" 
                      ? "bg-red-100/80 text-red-700"
                      : "bg-blue-100/80 text-blue-700"
                  }`}>
                    {analysis.type === "urgent" ? "Urgência" : "Detalhada"}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-300/50">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {analysis.insights}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
