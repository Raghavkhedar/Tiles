'use server'

import { createClient } from '../../../supabase/server'
import { revalidatePath } from 'next/cache'
import { ExpenseInsert, ExpenseUpdate, ExpenseCategoryInsert } from '@/types/database'

// Expense Actions
export async function createExpense(data: Omit<ExpenseInsert, 'user_id'>) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return { success: false, error: 'User not authenticated' }
    }
    
    const expenseData = {
      ...data,
      user_id: user.id
    }
    
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single()

    if (error) {
      console.error('Error creating expense:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/reports')
    return { success: true, data: expense }
  } catch (error) {
    console.error('Error creating expense:', error)
    return { success: false, error: 'Failed to create expense' }
  }
}

export async function updateExpense(id: string, data: ExpenseUpdate) {
  try {
    const supabase = await createClient()
    
    const { data: expense, error } = await supabase
      .from('expenses')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating expense:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/reports')
    return { success: true, data: expense }
  } catch (error) {
    console.error('Error updating expense:', error)
    return { success: false, error: 'Failed to update expense' }
  }
}

export async function deleteExpense(id: string) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting expense:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/reports')
    return { success: true }
  } catch (error) {
    console.error('Error deleting expense:', error)
    return { success: false, error: 'Failed to delete expense' }
  }
}

export async function getExpenses() {
  try {
    const supabase = await createClient()
    
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })

    if (error) {
      console.error('Error fetching expenses:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: expenses }
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return { success: false, error: 'Failed to fetch expenses' }
  }
}

export async function getExpense(id: string) {
  try {
    const supabase = await createClient()
    
    const { data: expense, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching expense:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: expense }
  } catch (error) {
    console.error('Error fetching expense:', error)
    return { success: false, error: 'Failed to fetch expense' }
  }
}

export async function getExpenseCategories() {
  try {
    const supabase = await createClient()
    
    const { data: categories, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching expense categories:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: categories }
  } catch (error) {
    console.error('Error fetching expense categories:', error)
    return { success: false, error: 'Failed to fetch expense categories' }
  }
}

export async function createExpenseCategory(data: Omit<ExpenseCategoryInsert, 'user_id'>) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return { success: false, error: 'User not authenticated' }
    }
    
    const categoryData = {
      ...data,
      user_id: user.id
    }
    
    const { data: category, error } = await supabase
      .from('expense_categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) {
      console.error('Error creating expense category:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/reports')
    return { success: true, data: category }
  } catch (error) {
    console.error('Error creating expense category:', error)
    return { success: false, error: 'Failed to create expense category' }
  }
}

// Financial calculations for reports
export async function calculateMonthlyExpenses(year: number, month: number) {
  try {
    const supabase = await createClient()
    
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]
    
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: true })

    if (error) {
      console.error('Error calculating monthly expenses:', error)
      return { success: false, error: error.message }
    }

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += expense.amount
      return acc
    }, {} as Record<string, number>)

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    return { 
      success: true, 
      data: {
        expenses,
        expensesByCategory,
        totalExpenses
      }
    }
  } catch (error) {
    console.error('Error calculating monthly expenses:', error)
    return { success: false, error: 'Failed to calculate monthly expenses' }
  }
} 