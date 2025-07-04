'use server'

import { createClient } from '../../../supabase/server'
import { revalidatePath } from 'next/cache'
import { CustomerInsert, CustomerUpdate } from '@/types/database'

// Customer Actions
export async function createCustomer(data: Omit<CustomerInsert, 'user_id'>) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const customerData: CustomerInsert = {
      ...data,
      user_id: user.id
    }
    
    const { data: customer, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single()

    if (error) {
      console.error('Error creating customer:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/customers')
    return { success: true, data: customer }
  } catch (error) {
    console.error('Error creating customer:', error)
    return { success: false, error: 'Failed to create customer' }
  }
}

export async function updateCustomer(id: string, data: CustomerUpdate) {
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
    
    const { data: customer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own customers
      .select()
      .single()

    if (error) {
      console.error('Error updating customer:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/customers')
    return { success: true, data: customer }
  } catch (error) {
    console.error('Error updating customer:', error)
    return { success: false, error: 'Failed to update customer' }
  }
}

export async function deleteCustomer(id: string) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only delete their own customers

    if (error) {
      console.error('Error deleting customer:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/customers')
    return { success: true }
  } catch (error) {
    console.error('Error deleting customer:', error)
    return { success: false, error: 'Failed to delete customer' }
  }
}

export async function getCustomers() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id) // Only get customers for current user
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching customers:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: customers }
  } catch (error) {
    console.error('Error fetching customers:', error)
    return { success: false, error: 'Failed to fetch customers' }
  }
}

export async function getCustomer(id: string) {
  try {
    const supabase = await createClient()
    
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching customer:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: customer }
  } catch (error) {
    console.error('Error fetching customer:', error)
    return { success: false, error: 'Failed to fetch customer' }
  }
}

// Search and Filter
export async function searchCustomers(query: string) {
  try {
    const supabase = await createClient()
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,contact_person.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error searching customers:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: customers }
  } catch (error) {
    console.error('Error searching customers:', error)
    return { success: false, error: 'Failed to search customers' }
  }
}

export async function getCustomersByStatus(status: string) {
  try {
    const supabase = await createClient()
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('status', status)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching customers by status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: customers }
  } catch (error) {
    console.error('Error fetching customers by status:', error)
    return { success: false, error: 'Failed to fetch customers by status' }
  }
}

// Credit Management
export async function updateCustomerCredit(id: string, newCreditLimit: number) {
  try {
    const supabase = await createClient()
    
    const { data: customer, error } = await supabase
      .from('customers')
      .update({ credit_limit: newCreditLimit })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating customer credit:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/customers')
    return { success: true, data: customer }
  } catch (error) {
    console.error('Error updating customer credit:', error)
    return { success: false, error: 'Failed to update customer credit' }
  }
}

export async function getCustomersWithCreditLimit() {
  try {
    const supabase = await createClient()
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .gt('credit_limit', 0)
      .order('credit_limit', { ascending: false })

    if (error) {
      console.error('Error fetching customers with credit limit:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: customers }
  } catch (error) {
    console.error('Error fetching customers with credit limit:', error)
    return { success: false, error: 'Failed to fetch customers with credit limit' }
  }
}

// Customer Statistics
export async function getCustomerStats() {
  try {
    const supabase = await createClient()
    
    // Get total customers
    const { count: totalCustomers, error: totalError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error getting total customers:', totalError)
      return { success: false, error: totalError.message }
    }

    // Get active customers
    const { count: activeCustomers, error: activeError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active')

    if (activeError) {
      console.error('Error getting active customers:', activeError)
      return { success: false, error: activeError.message }
    }

    // Get customers with credit limit
    const { count: creditCustomers, error: creditError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gt('credit_limit', 0)

    if (creditError) {
      console.error('Error getting customers with credit:', creditError)
      return { success: false, error: creditError.message }
    }

    return {
      success: true,
      data: {
        total: totalCustomers || 0,
        active: activeCustomers || 0,
        withCredit: creditCustomers || 0
      }
    }
  } catch (error) {
    console.error('Error getting customer stats:', error)
    return { success: false, error: 'Failed to get customer stats' }
  }
} 