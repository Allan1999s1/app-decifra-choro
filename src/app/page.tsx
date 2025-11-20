"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Baby, Clock, Zap, History, Mic, ChevronRight, ChevronLeft, Mail, Lock, LogOut, Shield, Heart, Star, Bell, X, Sun, Moon, Sunrise, Sunset, Timer, Utensils, Wind, Home, Users, Plane, AlertCircle, BedDouble, UserPlus, CheckCircle } from "lucide-react"
import { QuizFlow } from "@/components/quiz-flow"
import { UrgentMode } from "@/components/urgent-mode"
import { AnalysisHistory } from "@/components/analysis-history"
import Image from "next/image"
import { supabase, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, getCurrentUser } from "@/lib/supabase"
import { toast } from "sonner"

interface BabyInfo {
  sexo: string
  idade: string
  sintomas: string
}

interface QuizAnswers {
  horario: string
  duracao: string
  alimentacao: string
  fralda: string
  ambiente: string
  mudanca: string
  desconforto: string
  sono: string
  estranhos: string
}

interface User {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

export default function Home() {
  const [mode, setMode] = useState<"welcome" | "questionnaire" | "home" | "quiz" | "urgent" | "history" | "login" | "post-analysis-quiz" | "quiz-results">("welcome")
  const [analyses, setAnalyses] = useState<any[]>([])
  const [babyInfo, setBabyInfo] = useState<BabyInfo>({
    sexo: "",
    idade: "",
    sintomas: ""
  })
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({
    horario: "",
    duracao: "",
    alimentacao: "",
    fralda: "",
    ambiente: "",
    mudanca: "",
    desconforto: "",
    sono: "",
    estranhos: ""
  })
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(1)
  const [showPhone, setShowPhone] = useState(false)
  const [animateQuestion, setAnimateQuestion] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Verificar usuário logado
  useEffect(() => {
    const checkUser = async () => {
      const { user } = await getCurrentUser()
      setUser(user)
    }
    checkUser()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Animação de entrada do celular apenas em mobile
  useEffect(() => {
    if (mode === "welcome") {
      const timer = setTimeout(() => {
        setShowPhone(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [mode])

  // Trigger animação quando mudar de pergunta
  useEffect(() => {
    if (mode === "questionnaire" || mode === "post-analysis-quiz") {
      setAnimateQuestion(false)
      const timer = setTimeout(() => {
        setAnimateQuestion(true)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [currentQuestion, currentQuizQuestion, mode])

  const addAnalysis = (analysis: any) => {
    setAnalyses([analysis, ...analyses])
  }

  const handleQuestionnaireAnswer = (field: keyof BabyInfo, value: string) => {
    setBabyInfo({ ...babyInfo, [field]: value })
    
    if (currentQuestion < 3) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Questionário completo, vai para tela de seleção
      setMode("home")
      setCurrentQuestion(1)
    }
  }

  const handleQuizAnswer = (field: keyof QuizAnswers, value: string) => {
    setQuizAnswers({ ...quizAnswers, [field]: value })
    
    if (currentQuizQuestion < 9) {
      setCurrentQuizQuestion(currentQuizQuestion + 1)
    } else {
      // Quiz completo, vai para resultados
      setMode("quiz-results")
      setCurrentQuizQuestion(1)
    }
  }

  const generateSuggestions = () => {
    const suggestions = {
      metodos: [] as string[],
      ambiente: [] as string[],
      saude: [] as string[]
    }

    // Sugestões baseadas no horário
    if (quizAnswers.horario === "Noite" || quizAnswers.horario === "Madrugada") {
      suggestions.metodos.push("Balançar suavemente em ambiente com pouca luz")
      suggestions.ambiente.push("Reduzir iluminação e criar ambiente tranquilo")
    }

    // Sugestões baseadas na duração
    if (quizAnswers.duracao === "Mais de 30 minutos") {
      suggestions.saude.push("Choro prolongado pode indicar desconforto. Considere consultar pediatra.")
    }

    // Sugestões baseadas na alimentação
    if (quizAnswers.alimentacao === "Não") {
      suggestions.metodos.push("Oferecer mamadeira ou amamentação")
    }

    // Sugestões baseadas na fralda
    if (quizAnswers.fralda === "Não") {
      suggestions.metodos.push("Verificar e trocar a fralda")
    }

    // Sugestões baseadas no ambiente
    if (quizAnswers.ambiente === "Não") {
      suggestions.ambiente.push("Ajustar temperatura do ambiente")
      suggestions.ambiente.push("Reduzir ruídos e iluminação excessiva")
    }

    // Sugestões baseadas em mudanças
    if (quizAnswers.mudanca !== "Nenhuma mudança") {
      suggestions.metodos.push("Oferecer mais contato físico e carinho para adaptação")
      suggestions.ambiente.push("Manter rotina consistente durante período de adaptação")
    }

    // Sugestões baseadas em desconforto físico
    if (quizAnswers.desconforto === "Sim (ex.: erupção na pele, febre, cólicas)") {
      suggestions.saude.push("Sinais de desconforto físico detectados. Consulte um pediatra.")
      suggestions.metodos.push("Massagem suave na barriga para aliviar cólicas")
    }

    // Sugestões baseadas no sono
    if (quizAnswers.sono === "Não") {
      suggestions.ambiente.push("Estabelecer rotina de sono regular")
      suggestions.metodos.push("Criar ritual de sono (banho, música suave, ambiente escuro)")
    }

    // Sugestões baseadas em estranhos
    if (quizAnswers.estranhos === "Sim") {
      suggestions.metodos.push("Oferecer colo e segurança após exposição a novidades")
    }

    // Sugestões gerais sempre presentes
    if (suggestions.metodos.length === 0) {
      suggestions.metodos.push("Cantar ou fazer sons suaves")
      suggestions.metodos.push("Balançar gentilmente")
    }

    if (suggestions.ambiente.length === 0) {
      suggestions.ambiente.push("Manter ambiente calmo e acolhedor")
    }

    if (suggestions.saude.length === 0) {
      suggestions.saude.push("Continue monitorando. Se o choro persistir, consulte um pediatra.")
    }

    return suggestions
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      toast.error("Erro ao fazer login com Google")
      console.error(error)
    }
    setLoading(false)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password)
      if (error) {
        toast.error("Erro ao criar conta")
        console.error(error)
      } else {
        toast.success("Conta criada! Verifique seu email.")
        setIsSignUp(false)
      }
    } else {
      const { error } = await signInWithEmail(email, password)
      if (error) {
        toast.error("Email ou senha incorretos")
        console.error(error)
      } else {
        toast.success("Login realizado com sucesso!")
        setMode("home")
      }
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setMode("welcome")
    toast.success("Logout realizado com sucesso!")
  }

  // Renderizar Quiz Pós-Análise
  if (mode === "post-analysis-quiz") {
    const quizQuestions = [
      {
        id: 1,
        icon: <Sun className="w-10 h-10 text-[#5ec9d1]" />,
        title: "Em que horário o choro ocorreu?",
        field: "horario" as keyof QuizAnswers,
        options: [
          { label: "Manhã", icon: <Sunrise className="w-5 h-5" /> },
          { label: "Tarde", icon: <Sun className="w-5 h-5" /> },
          { label: "Noite", icon: <Sunset className="w-5 h-5" /> },
          { label: "Madrugada", icon: <Moon className="w-5 h-5" /> }
        ]
      },
      {
        id: 2,
        icon: <Timer className="w-10 h-10 text-[#5ec9d1]" />,
        title: "Quanto tempo durou o choro?",
        field: "duracao" as keyof QuizAnswers,
        options: [
          { label: "Menos de 5 minutos" },
          { label: "5-15 minutos" },
          { label: "15-30 minutos" },
          { label: "Mais de 30 minutos" }
        ]
      },
      {
        id: 3,
        icon: <Utensils className="w-10 h-10 text-[#5ec9d1]" />,
        title: "O bebê se alimentou recentemente?",
        field: "alimentacao" as keyof QuizAnswers,
        options: [
          { label: "Sim" },
          { label: "Não" }
        ]
      },
      {
        id: 4,
        icon: <Baby className="w-10 h-10 text-[#5ec9d1]" />,
        title: "O bebê passou por alguma troca de fralda nos últimos 30 minutos?",
        field: "fralda" as keyof QuizAnswers,
        options: [
          { label: "Sim" },
          { label: "Não" }
        ]
      },
      {
        id: 5,
        icon: <Wind className="w-10 h-10 text-[#5ec9d1]" />,
        title: "O ambiente está confortável (temperatura, barulho, iluminação)?",
        field: "ambiente" as keyof QuizAnswers,
        options: [
          { label: "Sim" },
          { label: "Não" }
        ]
      },
      {
        id: 6,
        icon: <Home className="w-10 h-10 text-[#5ec9d1]" />,
        title: "Há alguma mudança recente no ambiente do bebê?",
        field: "mudanca" as keyof QuizAnswers,
        options: [
          { label: "Mudança de casa", icon: <Home className="w-5 h-5" /> },
          { label: "Novo membro da família", icon: <Users className="w-5 h-5" /> },
          { label: "Viagem", icon: <Plane className="w-5 h-5" /> },
          { label: "Nenhuma mudança" }
        ]
      },
      {
        id: 7,
        icon: <AlertCircle className="w-10 h-10 text-[#5ec9d1]" />,
        title: "O bebê está com algum sinal de desconforto físico?",
        field: "desconforto" as keyof QuizAnswers,
        options: [
          { label: "Sim (ex.: erupção na pele, febre, cólicas)" },
          { label: "Não" }
        ]
      },
      {
        id: 8,
        icon: <BedDouble className="w-10 h-10 text-[#5ec9d1]" />,
        title: "Seu bebê tem hábitos de sono regulares?",
        field: "sono" as keyof QuizAnswers,
        options: [
          { label: "Sim" },
          { label: "Não" }
        ]
      },
      {
        id: 9,
        icon: <UserPlus className="w-10 h-10 text-[#5ec9d1]" />,
        title: "O bebê teve contato com estranhos ou situações novas recentemente?",
        field: "estranhos" as keyof QuizAnswers,
        options: [
          { label: "Sim" },
          { label: "Não" }
        ]
      }
    ]

    const currentQ = quizQuestions[currentQuizQuestion - 1]

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2] flex flex-col items-center justify-center p-4">
        <Card className="p-6 sm:p-8 max-w-2xl w-full bg-[#e8f4f5]/40 backdrop-blur-xl border-0 rounded-[2.5rem] relative shadow-[8px_8px_20px_rgba(163,177,198,0.3),-8px_-8px_20px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.35),-12px_-12px_24px_rgba(255,255,255,0.85)] transition-all duration-500">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (currentQuizQuestion > 1) {
                setCurrentQuizQuestion(currentQuizQuestion - 1)
              } else {
                setMode("home")
                setCurrentQuizQuestion(1)
                setQuizAnswers({
                  horario: "",
                  duracao: "",
                  alimentacao: "",
                  fralda: "",
                  ambiente: "",
                  mudanca: "",
                  desconforto: "",
                  sono: "",
                  estranhos: ""
                })
              }
            }}
            className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 bg-[#e8f4f5]/60 backdrop-blur-md rounded-full shadow-[4px_4px_10px_rgba(163,177,198,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-8 mt-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-500 ${
                  step === currentQuizQuestion
                    ? "w-10 bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
                    : step < currentQuizQuestion
                    ? "w-8 bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
                    : "w-8 bg-[#e8f4f5] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3)]"
                }`}
              />
            ))}
          </div>

          {/* Question Content */}
          <div className="space-y-6">
            <div className={`text-center space-y-2 transition-all duration-500 ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex justify-center mb-4">
                <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-5 rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)]">
                  {currentQ.icon}
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {currentQ.title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Pergunta {currentQuizQuestion} de 9
              </p>
            </div>

            <div className={`grid ${currentQ.options.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3 mt-8`}>
              {currentQ.options.map((option, index) => (
                <Button
                  key={option.label}
                  onClick={() => handleQuizAnswer(currentQ.field, option.label)}
                  className={`h-16 bg-[#e8f4f5]/60 backdrop-blur-md hover:bg-[#e8f4f5]/80 text-gray-800 border-0 font-semibold text-base rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_10px_rgba(163,177,198,0.2),inset_-4px_-4px_10px_rgba(255,255,255,0.7)] transition-all duration-500 flex items-center justify-between px-6 ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <span className="flex items-center gap-2">
                    {option.icon && option.icon}
                    {option.label}
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Renderizar Resultados do Quiz
  if (mode === "quiz-results") {
    const suggestions = generateSuggestions()

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2] flex flex-col items-center justify-center p-4">
        <Card className="p-6 sm:p-8 max-w-3xl w-full bg-[#e8f4f5]/40 backdrop-blur-xl border-0 rounded-[2.5rem] shadow-[8px_8px_20px_rgba(163,177,198,0.3),-8px_-8px_20px_rgba(255,255,255,0.8)]">
          {/* Header com Ícone de Sucesso */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-green-400 to-green-500 p-6 rounded-full shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)]">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              Análise Completa!
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Baseado em suas respostas, aqui estão nossas sugestões personalizadas
            </p>
          </div>

          {/* Sugestões de Método */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-3 rounded-xl shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)]">
                <Baby className="w-6 h-6 text-[#5ec9d1]" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Sugestões de Método</h3>
            </div>
            <div className="space-y-3">
              {suggestions.metodos.map((sugestao, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-md p-4 rounded-[1.2rem] shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)] flex items-start gap-3">
                  <div className="bg-[#5ec9d1]/20 p-2 rounded-lg flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-[#5ec9d1]" />
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">{sugestao}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dicas sobre o Ambiente */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-3 rounded-xl shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)]">
                <Wind className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Dicas sobre o Ambiente</h3>
            </div>
            <div className="space-y-3">
              {suggestions.ambiente.map((dica, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-md p-4 rounded-[1.2rem] shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)] flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">{dica}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Orientações sobre Saúde */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-3 rounded-xl shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)]">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Orientações sobre Saúde</h3>
            </div>
            <div className="space-y-3">
              {suggestions.saude.map((orientacao, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-md p-4 rounded-[1.2rem] shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)] flex items-start gap-3">
                  <div className="bg-red-500/20 p-2 rounded-lg flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">{orientacao}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mensagem Final */}
          <div className="bg-gradient-to-r from-[#5ec9d1]/20 to-[#4ab8c0]/20 backdrop-blur-md p-6 rounded-[1.5rem] shadow-[inset_4px_4px_12px_rgba(163,177,198,0.2)] mb-6">
            <p className="text-center text-gray-800 font-medium text-base sm:text-lg">
              Obrigado por responder ao questionário! Esperamos que as sugestões ajudem a acalmar seu bebê e a tornar a experiência mais tranquila para vocês dois. 💙
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Button
              onClick={() => {
                setMode("home")
                setQuizAnswers({
                  horario: "",
                  duracao: "",
                  alimentacao: "",
                  fralda: "",
                  ambiente: "",
                  mudanca: "",
                  desconforto: "",
                  sono: "",
                  estranhos: ""
                })
              }}
              className="bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] hover:from-[#4ab8c0] hover:to-[#3aa7af] text-white font-bold py-4 rounded-[1.2rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)] hover:shadow-[8px_8px_20px_rgba(163,177,198,0.35),-8px_-8px_20px_rgba(255,255,255,0.85)] transition-all duration-300 border-0"
            >
              Nova Análise
            </Button>
            <Button
              onClick={() => setMode("history")}
              variant="outline"
              className="bg-white/60 backdrop-blur-md hover:bg-white/80 text-gray-800 font-bold py-4 rounded-[1.2rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)] hover:shadow-[8px_8px_20px_rgba(163,177,198,0.35),-8px_-8px_20px_rgba(255,255,255,0.85)] transition-all duration-300 border-0"
            >
              Ver Histórico
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (mode === "questionnaire") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2] flex flex-col items-center justify-center p-4">
        {/* Neomorphic Card */}
        <Card className="p-6 sm:p-8 max-w-2xl w-full bg-[#e8f4f5]/40 backdrop-blur-xl border-0 rounded-[2.5rem] relative shadow-[8px_8px_20px_rgba(163,177,198,0.3),-8px_-8px_20px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.35),-12px_-12px_24px_rgba(255,255,255,0.85)] transition-all duration-500">
          {/* Back Button - Neomorphic */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (currentQuestion > 1) {
                setCurrentQuestion(currentQuestion - 1)
              } else {
                setMode("welcome")
                setCurrentQuestion(1)
                setBabyInfo({ sexo: "", idade: "", sintomas: "" })
              }
            }}
            className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 bg-[#e8f4f5]/60 backdrop-blur-md rounded-full shadow-[4px_4px_10px_rgba(163,177,198,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Progress Indicator - Neomorphic */}
          <div className="flex justify-center gap-3 mb-8 mt-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  step === currentQuestion
                    ? "w-14 bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
                    : step < currentQuestion
                    ? "w-10 bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
                    : "w-10 bg-[#e8f4f5] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.3)]"
                }`}
              />
            ))}
          </div>

          {/* Question 1: Sexo */}
          {currentQuestion === 1 && (
            <div className="space-y-6">
              <div className={`text-center space-y-2 transition-all duration-500 ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex justify-center mb-4">
                  <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-5 rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)]">
                    <Baby className="w-10 h-10 text-[#5ec9d1]" />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Qual o sexo do bebê?
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Pergunta 1 de 3
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <Button
                  onClick={() => handleQuestionnaireAnswer("sexo", "Masculino")}
                  className={`h-24 bg-[#e8f4f5]/60 backdrop-blur-md hover:bg-gradient-to-br hover:from-blue-400/20 hover:to-blue-500/20 text-gray-800 border-0 font-semibold text-lg rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_10px_rgba(163,177,198,0.2),inset_-4px_-4px_10px_rgba(255,255,255,0.7)] transition-all duration-500 ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: '200ms' }}
                >
                  Masculino
                </Button>
                <Button
                  onClick={() => handleQuestionnaireAnswer("sexo", "Feminino")}
                  className={`h-24 bg-[#e8f4f5]/60 backdrop-blur-md hover:bg-gradient-to-br hover:from-pink-400/20 hover:to-pink-500/20 text-gray-800 border-0 font-semibold text-lg rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_10px_rgba(163,177,198,0.2),inset_-4px_-4px_10px_rgba(255,255,255,0.7)] transition-all duration-500 ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: '350ms' }}
                >
                  Feminino
                </Button>
              </div>
            </div>
          )}

          {/* Question 2: Idade */}
          {currentQuestion === 2 && (
            <div className="space-y-6">
              <div className={`text-center space-y-2 transition-all duration-500 ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex justify-center mb-4">
                  <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-5 rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)]">
                    <Clock className="w-10 h-10 text-[#5ec9d1]" />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Qual a idade do bebê?
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Pergunta 2 de 3
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-8">
                {[
                  "Menos de 1 mês",
                  "1-3 meses",
                  "4-6 meses",
                  "7-12 meses",
                  "Mais de 1 ano"
                ].map((idade, index) => (
                  <Button
                    key={idade}
                    onClick={() => handleQuestionnaireAnswer("idade", idade)}
                    className={`h-16 bg-[#e8f4f5]/60 backdrop-blur-md hover:bg-[#e8f4f5]/80 text-gray-800 border-0 font-semibold text-base rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_10px_rgba(163,177,198,0.2),inset_-4px_-4px_10px_rgba(255,255,255,0.7)] transition-all duration-500 flex items-center justify-between px-6 ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${200 + index * 100}ms` }}
                  >
                    <span>{idade}</span>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Question 3: Sintomas */}
          {currentQuestion === 3 && (
            <div className="space-y-6">
              <div className={`text-center space-y-2 transition-all duration-500 ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex justify-center mb-4">
                  <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-5 rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)]">
                    <Zap className="w-10 h-10 text-[#5ec9d1]" />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Sintomas recentes?
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Pergunta 3 de 3
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-8">
                {[
                  "Febre",
                  "Choro excessivo",
                  "Falta de apetite",
                  "Dificuldade para dormir",
                  "Outros"
                ].map((sintoma, index) => (
                  <Button
                    key={sintoma}
                    onClick={() => handleQuestionnaireAnswer("sintomas", sintoma)}
                    className={`h-16 bg-[#e8f4f5]/60 backdrop-blur-md hover:bg-[#e8f4f5]/80 text-gray-800 border-0 font-semibold text-base rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_10px_rgba(163,177,198,0.2),inset_-4px_-4px_10px_rgba(255,255,255,0.7)] transition-all duration-500 flex items-center justify-between px-6 ${animateQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${200 + index * 100}ms` }}
                  >
                    <span>{sintoma}</span>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    )
  }

  if (mode === "quiz") {
    return <QuizFlow onBack={() => setMode("home")} onComplete={addAnalysis} />
  }

  if (mode === "urgent") {
    return <UrgentMode onBack={() => setMode("home")} onComplete={addAnalysis} />
  }

  if (mode === "history") {
    return <AnalysisHistory analyses={analyses} onBack={() => setMode("home")} />
  }

  if (mode === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2] flex flex-col items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full bg-[#e8f4f5]/40 backdrop-blur-xl border-0 rounded-[2.5rem] shadow-[8px_8px_20px_rgba(163,177,198,0.3),-8px_-8px_20px_rgba(255,255,255,0.8)]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-4 rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)]">
                <Image 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/0d8b04b1-0641-429b-a4e2-4444efff7709.png" 
                  alt="EcoBaby Logo" 
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isSignUp ? "Criar Conta" : "Fazer Login"}
            </h2>
            <p className="text-sm text-gray-600">
              {isSignUp ? "Crie sua conta EcoBaby" : "Entre na sua conta EcoBaby"}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-[1.2rem] border-0 bg-[#e8f4f5]/60 backdrop-blur-md shadow-[inset_4px_4px_10px_rgba(163,177,198,0.3),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] focus:outline-none focus:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.35),inset_-6px_-6px_12px_rgba(255,255,255,0.85)] transition-all duration-300 text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-[1.2rem] border-0 bg-[#e8f4f5]/60 backdrop-blur-md shadow-[inset_4px_4px_10px_rgba(163,177,198,0.3),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] focus:outline-none focus:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.35),inset_-6px_-6px_12px_rgba(255,255,255,0.85)] transition-all duration-300 text-gray-800"
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] hover:from-[#4ab8c0] hover:to-[#3aa7af] text-white font-semibold py-6 rounded-[1.2rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)] hover:shadow-[8px_8px_20px_rgba(163,177,198,0.35),-8px_-8px_20px_rgba(255,255,255,0.85)] transition-all duration-300 border-0 disabled:opacity-50"
            >
              {loading ? "Carregando..." : isSignUp ? "Criar Conta" : "Entrar"}
            </Button>

            {!isSignUp && (
              <div className="text-center">
                <button 
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#e8f4f5]/60 backdrop-blur-md text-gray-500">ou</span>
              </div>
            </div>

            <Button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border-0 bg-white hover:bg-gray-50 shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)] hover:shadow-[8px_8px_20px_rgba(163,177,198,0.35),-8px_-8px_20px_rgba(255,255,255,0.85)] py-6 rounded-[1.2rem] font-semibold transition-all duration-300 text-gray-800 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </Button>

            <Button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-800 mt-4 hover:bg-transparent"
            >
              {isSignUp ? "Já tem uma conta? Entrar" : "Não tem conta? Criar agora"}
            </Button>

            <Button 
              type="button"
              variant="ghost"
              onClick={() => setMode("welcome")}
              className="w-full text-gray-600 hover:text-gray-800 hover:bg-transparent"
            >
              Voltar
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  if (mode === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2] flex flex-col">
        {/* Header - Neomorphic */}
        <header className="p-4 sm:p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div 
              onClick={() => setMode("welcome")}
              className="bg-[#e8f4f5]/60 backdrop-blur-md p-2.5 rounded-[1.2rem] shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)] cursor-pointer hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] transition-all duration-300"
            >
              <Image 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/0d8b04b1-0641-429b-a4e2-4444efff7709.png" 
                alt="EcoBaby Logo" 
                width={32}
                height={32}
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">EcoBaby</h1>
              <p className="text-xs sm:text-sm text-gray-600">Decifre o choro do seu bebê</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMode("history")}
              className="bg-[#e8f4f5]/60 backdrop-blur-md hover:bg-[#e8f4f5]/80 rounded-full shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] transition-all duration-300 border-0"
            >
              <History className="w-5 h-5 text-gray-700" />
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="bg-[#e8f4f5]/60 backdrop-blur-md hover:bg-[#e8f4f5]/80 rounded-full shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)] hover:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] transition-all duration-300 border-0"
              >
                <LogOut className="w-5 h-5 text-gray-700" />
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 pb-12">
          <div className="max-w-4xl w-full space-y-8">
            {/* Welcome Message */}
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {user ? `Olá, ${user.user_metadata?.name || user.email?.split('@')[0]}!` : "Como você gostaria de começar?"}
              </h2>
              <p className="text-sm sm:text-base text-gray-700">
                Escolha a melhor opção para sua situação
              </p>
            </div>

            {/* Mode Selection Cards - Neomorphic */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Urgent Mode Card */}
              <Card 
                onClick={() => setMode("urgent")}
                className="p-6 sm:p-8 bg-[#e8f4f5]/40 backdrop-blur-xl border-0 rounded-[2.5rem] shadow-[8px_8px_20px_rgba(163,177,198,0.3),-8px_-8px_20px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.35),-12px_-12px_24px_rgba(255,255,255,0.85)] transition-all duration-500 cursor-pointer hover:scale-[1.02]"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-5 rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)]">
                    <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                      Estou na urgência
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Análise rápida do choro do seu bebê agora mesmo
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-[#e8f4f5]/60 backdrop-blur-md px-4 py-2 rounded-full shadow-[inset_2px_2px_6px_rgba(163,177,198,0.2)]">
                    <Clock className="w-4 h-4" />
                    <span>~2 minutos</span>
                  </div>
                </div>
              </Card>

              {/* Quiz Mode Card */}
              <Card 
                onClick={() => setMode("post-analysis-quiz")}
                className="p-6 sm:p-8 bg-[#e8f4f5]/40 backdrop-blur-xl border-0 rounded-[2.5rem] shadow-[8px_8px_20px_rgba(163,177,198,0.3),-8px_-8px_20px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.35),-12px_-12px_24px_rgba(255,255,255,0.85)] transition-all duration-500 cursor-pointer hover:scale-[1.02]"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-5 rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)]">
                    <Baby className="w-8 h-8 sm:w-10 sm:h-10 text-[#5ec9d1]" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                      Tenho tempo
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Responda um questionário detalhado para análise completa
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-[#e8f4f5]/60 backdrop-blur-md px-4 py-2 rounded-full shadow-[inset_2px_2px_6px_rgba(163,177,198,0.2)]">
                    <Clock className="w-4 h-4" />
                    <span>~5 minutos</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Info Section - Neomorphic */}
            <div className="mt-8 text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#e8f4f5]/60 backdrop-blur-md px-6 py-3 rounded-full shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)]">
                <Mic className="w-5 h-5 text-[#5ec9d1]" />
                <p className="text-sm text-gray-700 font-medium">
                  Análise sonora com IA
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Welcome Screen (Initial) - Layout 50/50 Desktop OTIMIZADO PARA 100% ZOOM
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2]">
      {/* VERSÃO DESKTOP - Layout 50/50 Otimizado para Zoom 100% */}
      {!isMobile && (
        <div className="h-screen flex overflow-hidden">
          {/* COLUNA ESQUERDA - 50% - Apresentação do App */}
          <div className="w-1/2 flex flex-col items-center justify-center p-6 relative bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2]">
            {/* Logo Elegante no Topo - Reduzido */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/70 backdrop-blur-lg px-3 py-2 rounded-[1.2rem] shadow-[6px_6px_16px_rgba(163,177,198,0.35),-6px_-6px_16px_rgba(255,255,255,0.95)]">
              <Image 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/0d8b04b1-0641-429b-a4e2-4444efff7709.png" 
                alt="EcoBaby Logo" 
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
              <h1 className="text-lg font-bold text-gray-800">EcoBaby</h1>
            </div>

            <div className="flex flex-col items-center justify-center space-y-6 max-w-md w-full">
              {/* Título Principal - Reduzido */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                  Entenda o que<br />seu bebê precisa
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tecnologia de IA avançada para decifrar<br />o choro e as necessidades do seu bebê
                </p>
              </div>

              {/* Mockup do Celular - Tamanho Reduzido */}
              <div 
                className={`relative w-44 h-[360px] bg-gradient-to-br from-white to-[#f5f9fa] rounded-[2.5rem] border-[8px] border-gray-900 overflow-hidden transform hover:scale-105 transition-all duration-700 shadow-[12px_12px_24px_rgba(163,177,198,0.45),-12px_-12px_24px_rgba(255,255,255,1)] ${ 
                  showPhone 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-12 scale-95'
                }`}
                style={{
                  transition: 'opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1), transform 1.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Notch Realista */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-[1.5rem] z-10 flex items-center justify-center">
                  <div className="w-10 h-1 bg-gray-800 rounded-full"></div>
                </div>
                
                {/* Conteúdo da Tela */}
                <div className="w-full h-full bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2] p-4 flex flex-col items-center justify-center space-y-4">
                  {/* Feature Cards Animados */}
                  <div className="bg-white/80 backdrop-blur-lg p-3 rounded-[1.2rem] w-full animate-fade-in shadow-[4px_4px_12px_rgba(163,177,198,0.35),-4px_-4px_12px_rgba(255,255,255,0.95)]">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-[#5ec9d1] to-[#4ab8c0] p-2 rounded-lg shadow-lg">
                        <Mic className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-800">Análise Inteligente</p>
                        <p className="text-[8px] text-gray-600">IA detecta padrões de choro</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-lg p-3 rounded-[1.2rem] w-full animate-fade-in animation-delay-200 shadow-[4px_4px_12px_rgba(163,177,198,0.35),-4px_-4px_12px_rgba(255,255,255,0.95)]">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg shadow-lg">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-800">Resposta Rápida</p>
                        <p className="text-[8px] text-gray-600">Resultados em 2 minutos</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-lg p-3 rounded-[1.2rem] w-full animate-fade-in animation-delay-400 shadow-[4px_4px_12px_rgba(163,177,198,0.35),-4px_-4px_12px_rgba(255,255,255,0.95)]">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg shadow-lg">
                        <History className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-800">Histórico Completo</p>
                        <p className="text-[8px] text-gray-600">Acompanhe evolução</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão CTA Principal - Reduzido */}
              <Button 
                onClick={() => setMode("questionnaire")}
                className="w-full max-w-xs bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] hover:from-[#4ab8c0] hover:to-[#3aa7af] text-white font-bold py-3.5 rounded-full shadow-[8px_8px_20px_rgba(163,177,198,0.4),-8px_-8px_20px_rgba(255,255,255,0.95)] hover:shadow-[10px_10px_24px_rgba(163,177,198,0.45),-10px_-10px_24px_rgba(255,255,255,1)] transition-all duration-500 text-base border-0 hover:scale-105"
              >
                Começar Agora
              </Button>
            </div>
          </div>

          {/* COLUNA DIREITA - 50% - Login Otimizado */}
          <div className="w-1/2 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white via-[#f5f9fa] to-[#e8f4f5]">
            <div className="w-full max-w-sm space-y-5">
              {/* Header de Login - Reduzido */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                  Bem-vindo
                </h2>
                <p className="text-sm text-gray-600">
                  Acesse sua conta para continuar
                </p>
              </div>

              {/* Card de Login - Reduzido */}
              <Card className="p-6 bg-white/70 backdrop-blur-xl border-0 rounded-[2rem] shadow-[10px_10px_24px_rgba(163,177,198,0.4),-10px_-10px_24px_rgba(255,255,255,1)]">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {/* Campo Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="email" 
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-2.5 rounded-[1.2rem] border-0 bg-[#e8f4f5]/80 backdrop-blur-md shadow-[inset_5px_5px_10px_rgba(163,177,198,0.35),inset_-5px_-5px_10px_rgba(255,255,255,0.95)] focus:outline-none focus:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.4),inset_-6px_-6px_12px_rgba(255,255,255,1)] transition-all duration-300 text-gray-800 text-sm"
                      />
                    </div>
                  </div>

                  {/* Campo Senha */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700">
                        Senha
                      </label>
                      <button 
                        type="button"
                        className="text-[10px] text-[#5ec9d1] hover:text-[#4ab8c0] font-bold transition-colors"
                      >
                        Esqueceu?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-2.5 rounded-[1.2rem] border-0 bg-[#e8f4f5]/80 backdrop-blur-md shadow-[inset_5px_5px_10px_rgba(163,177,198,0.35),inset_-5px_-5px_10px_rgba(255,255,255,0.95)] focus:outline-none focus:shadow-[inset_6px_6px_12px_rgba(163,177,198,0.4),inset_-6px_-6px_12px_rgba(255,255,255,1)] transition-all duration-300 text-gray-800 text-sm"
                      />
                    </div>
                  </div>

                  {/* Botão Entrar */}
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] hover:from-[#4ab8c0] hover:to-[#3aa7af] text-white font-bold py-3 rounded-[1.2rem] shadow-[6px_6px_16px_rgba(163,177,198,0.4),-6px_-6px_16px_rgba(255,255,255,0.95)] hover:shadow-[8px_8px_20px_rgba(163,177,198,0.45),-8px_-8px_20px_rgba(255,255,255,1)] transition-all duration-300 border-0 disabled:opacity-50 text-sm hover:scale-[1.02]"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>

                  {/* Divisor */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-300/60"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white/70 backdrop-blur-md text-gray-600 font-bold">ou continue com</span>
                    </div>
                  </div>

                  {/* Botão Google */}
                  <Button 
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full border-0 bg-white hover:bg-gray-50 shadow-[6px_6px_16px_rgba(163,177,198,0.4),-6px_-6px_16px_rgba(255,255,255,0.95)] hover:shadow-[8px_8px_20px_rgba(163,177,198,0.45),-8px_-8px_20px_rgba(255,255,255,1)] py-3 rounded-[1.2rem] font-bold transition-all duration-300 text-gray-800 flex items-center justify-center gap-2 text-sm hover:scale-[1.02]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar com Google
                  </Button>

                  {/* Link Criar Conta */}
                  <div className="text-center pt-3">
                    <p className="text-gray-600 text-xs">
                      Não tem uma conta?{" "}
                      <button 
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-[#5ec9d1] hover:text-[#4ab8c0] font-bold transition-colors"
                      >
                        Criar agora
                      </button>
                    </p>
                  </div>
                </form>
              </Card>

              {/* Badges de Confiança - Reduzidos */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="text-center">
                  <div className="bg-white/80 backdrop-blur-lg p-2 rounded-[1.2rem] shadow-[4px_4px_12px_rgba(163,177,198,0.35),-4px_-4px_12px_rgba(255,255,255,0.95)] mb-1.5 inline-block">
                    <Shield className="w-5 h-5 text-[#5ec9d1]" />
                  </div>
                  <p className="text-[10px] text-gray-700 font-bold">100% Seguro</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/80 backdrop-blur-lg p-2 rounded-[1.2rem] shadow-[4px_4px_12px_rgba(163,177,198,0.35),-4px_-4px_12px_rgba(255,255,255,0.95)] mb-1.5 inline-block">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-[10px] text-gray-700 font-bold">Confiável</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/80 backdrop-blur-lg p-2 rounded-[1.2rem] shadow-[4px_4px_12px_rgba(163,177,198,0.35),-4px_-4px_12px_rgba(255,255,255,0.95)] mb-1.5 inline-block">
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-[10px] text-gray-700 font-bold">Avaliado 5★</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VERSÃO MOBILE - Com Ícone de Notificação Interativo */}
      {isMobile && (
        <div className="min-h-screen flex flex-col">
          {/* Header com Logo e Notificação */}
          <header className="p-4 sm:p-6 flex justify-center items-center relative">
            <div className="flex items-center gap-2 bg-[#e8f4f5]/60 backdrop-blur-md px-5 py-3 rounded-[1.5rem] shadow-[6px_6px_16px_rgba(163,177,198,0.3),-6px_-6px_16px_rgba(255,255,255,0.8)]">
              <Image 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/0d8b04b1-0641-429b-a4e2-4444efff7709.png" 
                alt="EcoBaby Logo" 
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">EcoBaby</h1>
            </div>

            {/* Ícone de Notificação Interativo - Canto Superior Direito */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowNotification(!showNotification)}
                className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-full shadow-[6px_6px_16px_rgba(163,177,198,0.4),-6px_-6px_16px_rgba(255,255,255,0.9)] hover:shadow-[8px_8px_20px_rgba(163,177,198,0.45),-8px_-8px_20px_rgba(255,255,255,0.95)] transition-all duration-300 hover:scale-110 animate-pulse"
              >
                <Bell className="w-5 h-5 text-white" />
                {/* Badge de Notificação */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Caixa de Texto Interativa */}
              {showNotification && (
                <div className="absolute top-14 right-0 w-64 bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-[8px_8px_24px_rgba(163,177,198,0.4),-8px_-8px_24px_rgba(255,255,255,1)] p-4 animate-fade-in z-50">
                  <button
                    onClick={() => setShowNotification(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-start gap-3 mt-2">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg flex-shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-1">
                        Dica de ouro
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Clique para melhorar sua experiência no celular
                      </p>
                      <button
                        onClick={() => {
                          setShowNotification(false)
                          toast.success("Dica aplicada! Aproveite a melhor experiência.")
                        }}
                        className="mt-3 w-full bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] text-white text-xs font-bold py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        Aplicar Dica
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="max-w-md w-full">
              {/* Texto Descritivo */}
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                  Decifre o choro do seu bebê
                </h2>
                <p className="text-base sm:text-lg text-gray-600">
                  Análise inteligente com IA para entender as necessidades do seu bebê
                </p>
              </div>

              {/* Celular Frame */}
              <div className="relative flex justify-center items-center mb-8">
                <div 
                  className={`relative w-64 h-[500px] bg-[#e8f4f5] rounded-[3rem] border-8 border-black overflow-hidden transform hover:scale-105 transition-all duration-700 shadow-[12px_12px_28px_rgba(163,177,198,0.4),-12px_-12px_28px_rgba(255,255,255,0.9)] ${
                    showPhone 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-12 scale-95'
                  }`}
                  style={{
                    transition: 'opacity 1.2s ease-out, transform 1.2s ease-out'
                  }}
                >
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-10"></div>
                  
                  {/* Screen Content */}
                  <div className="w-full h-full bg-gradient-to-br from-[#e8f4f5] via-[#f0f8f9] to-[#e0f0f2] p-6 flex flex-col items-center justify-center space-y-6">
                    {/* Feature 1 */}
                    <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-4 rounded-[1.2rem] w-full animate-fade-in shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)]">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#e8f4f5]/80 backdrop-blur-sm p-2 rounded-xl shadow-[inset_2px_2px_6px_rgba(163,177,198,0.2)]">
                          <Mic className="w-6 h-6 text-[#5ec9d1]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">Análise de Choro</p>
                          <p className="text-[10px] text-gray-600">IA detecta necessidades</p>
                        </div>
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-4 rounded-[1.2rem] w-full animate-fade-in animation-delay-200 shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)]">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#e8f4f5]/80 backdrop-blur-sm p-2 rounded-xl shadow-[inset_2px_2px_6px_rgba(163,177,198,0.2)]">
                          <Zap className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">Modo Urgência</p>
                          <p className="text-[10px] text-gray-600">Resposta em 2 minutos</p>
                        </div>
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-[#e8f4f5]/60 backdrop-blur-md p-4 rounded-[1.2rem] w-full animate-fade-in animation-delay-400 shadow-[4px_4px_12px_rgba(163,177,198,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)]">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#e8f4f5]/80 backdrop-blur-sm p-2 rounded-xl shadow-[inset_2px_2px_6px_rgba(163,177,198,0.2)]">
                          <History className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">Histórico Completo</p>
                          <p className="text-[10px] text-gray-600">Acompanhe padrões</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Botões na Parte Inferior - Mobile */}
          <footer className="p-6 sm:p-8 space-y-4 max-w-md w-full mx-auto">
            <Button 
              onClick={() => setMode("questionnaire")}
              className="w-full bg-gradient-to-r from-[#5ec9d1] to-[#4ab8c0] hover:from-[#4ab8c0] hover:to-[#3aa7af] text-white font-bold py-6 rounded-full shadow-[8px_8px_20px_rgba(163,177,198,0.3),-8px_-8px_20px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_24px_rgba(163,177,198,0.35),-12px_-12px_24px_rgba(255,255,255,0.85)] transition-all duration-500 text-base border-0"
            >
              Começar
            </Button>

            <div className="text-center">
              <button 
                onClick={() => setMode("login")}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Já tem uma conta? <span className="underline">Entrar</span>
              </button>
            </div>
          </footer>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
