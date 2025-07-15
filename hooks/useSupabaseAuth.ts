"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { SupabaseAuth, type AuthUser } from "@/lib/supabase-auth"

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Get initial user
    SupabaseAuth.getCurrentUser().then((user) => {
      setUser(user)
      setIsAuthenticated(!!user)
      if (user) {
        SupabaseAuth.getUserProfile(user.id).then(setUserProfile)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = SupabaseAuth.onAuthStateChange(async (user) => {
      setUser(user)
      setIsAuthenticated(!!user)

      if (user) {
        const profile = await SupabaseAuth.getUserProfile(user.id)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await SupabaseAuth.signIn(email, password)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      await SupabaseAuth.signUp(email, password, name)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await SupabaseAuth.signOut()
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    userProfile,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  }
}
