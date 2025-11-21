export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      babies: {
        Row: {
          id: string
          user_id: string | null
          name: string | null
          sex: string | null
          birth_date: string | null
          age_range: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name?: string | null
          sex?: string | null
          birth_date?: string | null
          age_range?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string | null
          sex?: string | null
          birth_date?: string | null
          age_range?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cry_analyses: {
        Row: {
          id: string
          user_id: string | null
          baby_id: string | null
          analysis_type: string | null
          cry_type: string | null
          confidence_score: number | null
          symptoms: string | null
          recommendations: string | null
          audio_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          baby_id?: string | null
          analysis_type?: string | null
          cry_type?: string | null
          confidence_score?: number | null
          symptoms?: string | null
          recommendations?: string | null
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          baby_id?: string | null
          analysis_type?: string | null
          cry_type?: string | null
          confidence_score?: number | null
          symptoms?: string | null
          recommendations?: string | null
          audio_url?: string | null
          created_at?: string
        }
      }
      quiz_answers: {
        Row: {
          id: string
          analysis_id: string | null
          question: string | null
          answer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          analysis_id?: string | null
          question?: string | null
          answer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string | null
          question?: string | null
          answer?: string | null
          created_at?: string
        }
      }
    }
  }
}
