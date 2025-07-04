'use server'

import { createClient } from '../../../supabase/server'
import { revalidatePath } from 'next/cache'
import { SupplierInsert, SupplierUpdate } from '@/types/database'

// Supplier Actions
export async function createSupplier(data: Omit<SupplierInsert, 'user_id'>) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const supplierData: SupplierInsert = {
      ...data,
      user_id: user.id
    }
    
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single()

    if (error) {
      console.error('Error creating supplier:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/suppliers')
    return { success: true, data: supplier }
  } catch (error) {
    console.error('Error creating supplier:', error)
    return { success: false, error: 'Failed to create supplier' }
  }
}

export async function updateSupplier(id: string, data: SupplierUpdate) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Add user_id to the update data
    const updateData = {
      ...data,
      user_id: user.id,
      updated_at: new Date().toISOString()
    }
    
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own suppliers
      .select()
      .single()

    if (error) {
      console.error('Error updating supplier:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/suppliers')
    return { success: true, data: supplier }
  } catch (error) {
    console.error('Error updating supplier:', error)
    return { success: false, error: 'Failed to update supplier' }
  }
}

export async function deleteSupplier(id: string) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only delete their own suppliers

    if (error) {
      console.error('Error deleting supplier:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/suppliers')
    return { success: true }
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return { success: false, error: 'Failed to delete supplier' }
  }
}

export async function getSuppliers() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', user.id) // Only get suppliers for current user
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching suppliers:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: suppliers }
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return { success: false, error: 'Failed to fetch suppliers' }
  }
}

export async function getSupplier(id: string) {
  try {
    const supabase = await createClient()
    
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching supplier:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: supplier }
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return { success: false, error: 'Failed to fetch supplier' }
  }
}

// Search and Filter
export async function searchSuppliers(query: string) {
  try {
    const supabase = await createClient()
    
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .or(`name.ilike.%${query}%,contact_person.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%,gst_number.ilike.%${query}%`)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error searching suppliers:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: suppliers }
  } catch (error) {
    console.error('Error searching suppliers:', error)
    return { success: false, error: 'Failed to search suppliers' }
  }
}

export async function getSuppliersByStatus(status: string) {
  try {
    const supabase = await createClient()
    
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('status', status)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching suppliers by status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: suppliers }
  } catch (error) {
    console.error('Error fetching suppliers by status:', error)
    return { success: false, error: 'Failed to fetch suppliers by status' }
  }
}

export async function getSuppliersByRating(minRating: number) {
  try {
    const supabase = await createClient()
    
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .gte('rating', minRating)
      .order('rating', { ascending: false })

    if (error) {
      console.error('Error fetching suppliers by rating:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: suppliers }
  } catch (error) {
    console.error('Error fetching suppliers by rating:', error)
    return { success: false, error: 'Failed to fetch suppliers by rating' }
  }
}

// Business Logic
export async function updateSupplierRating(id: string, newRating: number) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update({ 
        rating: newRating,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating supplier rating:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/suppliers')
    return { success: true, data: supplier }
  } catch (error) {
    console.error('Error updating supplier rating:', error)
    return { success: false, error: 'Failed to update supplier rating' }
  }
}

export async function updateSupplierCreditLimit(id: string, newCreditLimit: number) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update({ 
        credit_limit: newCreditLimit,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating supplier credit limit:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/suppliers')
    return { success: true, data: supplier }
  } catch (error) {
    console.error('Error updating supplier credit limit:', error)
    return { success: false, error: 'Failed to update supplier credit limit' }
  }
}

export async function getSuppliersWithCreditLimit() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', user.id)
      .gt('credit_limit', 0)
      .order('credit_limit', { ascending: false })

    if (error) {
      console.error('Error fetching suppliers with credit limit:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: suppliers }
  } catch (error) {
    console.error('Error fetching suppliers with credit limit:', error)
    return { success: false, error: 'Failed to fetch suppliers with credit limit' }
  }
}

export async function getSupplierStats() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching suppliers for stats:', error)
      return { success: false, error: error.message }
    }

    const totalSuppliers = suppliers.length
    const activeSuppliers = suppliers.filter(s => s.status === 'Active').length
    const averageRating = suppliers.length > 0 
      ? suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length 
      : 0
    const totalCreditLimit = suppliers.reduce((sum, s) => sum + (s.credit_limit || 0), 0)

    return { 
      success: true, 
      data: {
        totalSuppliers,
        activeSuppliers,
        averageRating: Math.round(averageRating * 10) / 10,
        totalCreditLimit
      }
    }
  } catch (error) {
    console.error('Error fetching supplier stats:', error)
    return { success: false, error: 'Failed to fetch supplier stats' }
  }
} 