import { supabase } from "./supabase"
import type { Database } from "@/types/supabase"

type Tables = Database["public"]["Tables"]
type Category = Tables["categories"]["Row"]
type Product = Tables["products"]["Row"]
type Order = Tables["orders"]["Row"]
type User = Tables["users"]["Row"]

export class SupabaseAPI {
  // Categories CRUD
  static async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getCategoryById(id: number): Promise<Category | null> {
    const { data, error } = await supabase.from("categories").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  static async createCategory(category: Tables["categories"]["Insert"]): Promise<Category> {
    const { data, error } = await supabase.from("categories").insert(category).select().single()

    if (error) throw error
    return data
  }

  static async updateCategory(id: number, updates: Tables["categories"]["Update"]): Promise<Category> {
    const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async deleteCategory(id: number): Promise<void> {
    // Check if category has products
    const { data: products } = await supabase
      .from("products")
      .select("id")
      .eq("category", (await this.getCategoryById(id))?.name)

    if (products && products.length > 0) {
      throw new Error("Cannot delete category with products")
    }

    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) throw error
  }

  // Products CRUD
  static async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  static async getProductByBarcode(barcode: string): Promise<Product | null> {
    const { data, error } = await supabase.from("products").select("*").eq("barcode", barcode).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  }

  static async createProduct(product: Tables["products"]["Insert"]): Promise<Product> {
    const { data, error } = await supabase.from("products").insert(product).select().single()

    if (error) throw error
    return data
  }

  static async updateProduct(id: number, updates: Tables["products"]["Update"]): Promise<Product> {
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) throw error
  }

  static async updateProductStock(id: number, quantity: number): Promise<Product> {
    const { data, error } = await supabase.from("products").update({ stock: quantity }).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  // Orders CRUD
  static async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getOrderById(id: number): Promise<Order | null> {
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  static async createOrder(order: Tables["orders"]["Insert"]): Promise<Order> {
    const { data, error } = await supabase.from("orders").insert(order).select().single()

    if (error) throw error
    return data
  }

  static async updateOrder(id: number, updates: Tables["orders"]["Update"]): Promise<Order> {
    const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async deleteOrder(id: number): Promise<void> {
    const { error } = await supabase.from("orders").delete().eq("id", id)

    if (error) throw error
  }

  // Users CRUD
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  static async updateUser(id: string, updates: Tables["users"]["Update"]): Promise<User> {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) throw error
  }

  // Real-time subscriptions
  static subscribeToCategories(callback: (payload: any) => void) {
    return supabase
      .channel("categories-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, callback)
      .subscribe()
  }

  static subscribeToProducts(callback: (payload: any) => void) {
    return supabase
      .channel("products-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, callback)
      .subscribe()
  }

  static subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, callback)
      .subscribe()
  }

  static subscribeToUsers(callback: (payload: any) => void) {
    return supabase
      .channel("users-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, callback)
      .subscribe()
  }
}
