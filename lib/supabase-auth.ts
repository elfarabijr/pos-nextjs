import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
}

export class SupabaseAuth {
  static async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) throw error

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        role: "cashier",
        permissions: ["pos:read"],
      })

      if (profileError) throw profileError
    }

    return data
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Update last login
    if (data.user) {
      await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", data.user.id)
    }

    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  }

  static async getUserProfile(userId: string): Promise<AuthUser | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}
