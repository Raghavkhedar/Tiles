'use server'

import { createClient } from '../../../supabase/server'
import { revalidatePath } from 'next/cache'
import { DeliveryInsert, DeliveryUpdate, DeliveryItemInsert } from '@/types/database'

// Delivery Actions
export async function createDelivery(data: DeliveryInsert, items: DeliveryItemInsert[]) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    // Always set user_id to the authenticated user's ID
    data.user_id = user.id;
    
    // Start transaction
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert(data)
      .select()
      .single()

    if (deliveryError) {
      console.error('Error creating delivery:', deliveryError)
      return { success: false, error: deliveryError.message }
    }

    // Add items to the delivery
    const itemsWithDeliveryId = items.map(item => ({
      ...item,
      delivery_id: delivery.id
    }))

    const { error: itemsError } = await supabase
      .from('delivery_items')
      .insert(itemsWithDeliveryId)

    if (itemsError) {
      console.error('Error creating delivery items:', itemsError)
      return { success: false, error: itemsError.message }
    }

    revalidatePath('/dashboard/deliveries')
    return { success: true, data: delivery }
  } catch (error) {
    console.error('Error creating delivery:', error)
    return { success: false, error: 'Failed to create delivery' }
  }
}

export async function updateDelivery(id: string, data: DeliveryUpdate) {
  try {
    const supabase = await createClient()
    
    const { data: delivery, error } = await supabase
      .from('deliveries')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating delivery:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/deliveries')
    return { success: true, data: delivery }
  } catch (error) {
    console.error('Error updating delivery:', error)
    return { success: false, error: 'Failed to update delivery' }
  }
}

export async function deleteDelivery(id: string) {
  try {
    const supabase = await createClient()
    
    // First delete delivery items
    const { error: itemsError } = await supabase
      .from('delivery_items')
      .delete()
      .eq('delivery_id', id)

    if (itemsError) {
      console.error('Error deleting delivery items:', itemsError)
      return { success: false, error: itemsError.message }
    }

    // Then delete the delivery
    const { error } = await supabase
      .from('deliveries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting delivery:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/deliveries')
    return { success: true }
  } catch (error) {
    console.error('Error deleting delivery:', error)
    return { success: false, error: 'Failed to delete delivery' }
  }
}



export async function getDeliveries() {
  try {
    const supabase = await createClient()
    
    const { data: deliveries, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        customer:customers(name, contact_person, phone),
        items:delivery_items(
          *,
          product:products(name, sku)
        )
      `)
      .order('delivery_date', { ascending: true })

    if (error) {
      console.error('Error fetching deliveries:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: deliveries }
  } catch (error) {
    console.error('Error fetching deliveries:', error)
    return { success: false, error: 'Failed to fetch deliveries' }
  }
}

export async function getDelivery(id: string) {
  try {
    const supabase = await createClient()
    
    const { data: delivery, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        customer:customers(*),
        items:delivery_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching delivery:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: delivery }
  } catch (error) {
    console.error('Error fetching delivery:', error)
    return { success: false, error: 'Failed to fetch delivery' }
  }
}

// Delivery Scheduling
export async function scheduleDelivery(data: DeliveryInsert, items: DeliveryItemInsert[]) {
  try {
    // Validate delivery date is not in the past
    const deliveryDate = new Date(data.delivery_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (deliveryDate < today) {
      return { success: false, error: 'Delivery date cannot be in the past' }
    }

    // Create delivery
    const result = await createDelivery(data, items)
    return result
  } catch (error) {
    console.error('Error scheduling delivery:', error)
    return { success: false, error: 'Failed to schedule delivery' }
  }
}

export async function updateDeliveryStatus(id: string, status: string) {
  try {
    const supabase = await createClient()
    
    const { data: delivery, error } = await supabase
      .from('deliveries')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating delivery status:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/deliveries')
    return { success: true, data: delivery }
  } catch (error) {
    console.error('Error updating delivery status:', error)
    return { success: false, error: 'Failed to update delivery status' }
  }
}

// Delivery Generation
export async function generateDeliveryNumber(prefix: string = 'DEL') {
  try {
    const supabase = await createClient()
    
    const { data: lastDelivery, error } = await supabase
      .from('deliveries')
      .select('delivery_number')
      .like('delivery_number', `${prefix}%`)
      .order('delivery_number', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching last delivery number:', error)
      return { success: false, error: error.message }
    }

    let nextNumber = 1
    if (lastDelivery) {
      const lastNumber = parseInt(lastDelivery.delivery_number.replace(prefix, ''))
      nextNumber = lastNumber + 1
    }

    const deliveryNumber = `${prefix}${nextNumber.toString().padStart(6, '0')}`
    return { success: true, data: deliveryNumber }
  } catch (error) {
    console.error('Error generating delivery number:', error)
    return { success: false, error: 'Failed to generate delivery number' }
  }
}

// Search and Filter
export async function searchDeliveries(query: string) {
  try {
    const supabase = await createClient()
    
    const { data: deliveries, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        customer:customers(name, contact_person, phone)
      `)
      .or(`delivery_number.ilike.%${query}%,customer.name.ilike.%${query}%`)
      .order('delivery_date', { ascending: true })

    if (error) {
      console.error('Error searching deliveries:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: deliveries }
  } catch (error) {
    console.error('Error searching deliveries:', error)
    return { success: false, error: 'Failed to search deliveries' }
  }
}

export async function getDeliveriesByStatus(status: string) {
  try {
    const supabase = await createClient()
    
    const { data: deliveries, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        customer:customers(name, contact_person, phone)
      `)
      .eq('status', status)
      .order('delivery_date', { ascending: true })

    if (error) {
      console.error('Error fetching deliveries by status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: deliveries }
  } catch (error) {
    console.error('Error fetching deliveries by status:', error)
    return { success: false, error: 'Failed to fetch deliveries by status' }
  }
}

export async function getDeliveriesByDate(date: string) {
  try {
    const supabase = await createClient()
    
    const { data: deliveries, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        customer:customers(name, contact_person, phone)
      `)
      .eq('delivery_date', date)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching deliveries by date:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: deliveries }
  } catch (error) {
    console.error('Error fetching deliveries by date:', error)
    return { success: false, error: 'Failed to fetch deliveries by date' }
  }
}

// Delivery Statistics
export async function getDeliveryStats() {
  try {
    const supabase = await createClient()
    
    // Get total deliveries
    const { count: totalDeliveries, error: totalError } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error getting total deliveries:', totalError)
      return { success: false, error: totalError.message }
    }

    // Get scheduled deliveries
    const { count: scheduledDeliveries, error: scheduledError } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Scheduled')

    if (scheduledError) {
      console.error('Error getting scheduled deliveries:', scheduledError)
      return { success: false, error: scheduledError.message }
    }

    // Get completed deliveries
    const { count: completedDeliveries, error: completedError } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Completed')

    if (completedError) {
      console.error('Error getting completed deliveries:', completedError)
      return { success: false, error: completedError.message }
    }

    // Get today's deliveries
    const today = new Date().toISOString().split('T')[0]
    const { count: todayDeliveries, error: todayError } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('delivery_date', today)

    if (todayError) {
      console.error('Error getting today\'s deliveries:', todayError)
      return { success: false, error: todayError.message }
    }

    return {
      success: true,
      data: {
        total: totalDeliveries || 0,
        scheduled: scheduledDeliveries || 0,
        completed: completedDeliveries || 0,
        today: todayDeliveries || 0
      }
    }
  } catch (error) {
    console.error('Error getting delivery stats:', error)
    return { success: false, error: 'Failed to get delivery stats' }
  }
}

// Area Calculation
export async function calculateDeliveryArea(items: DeliveryItemInsert[]) {
  try {
    const totalArea = items.reduce((sum, item) => sum + (item.area_covered || 0), 0)
    
    return {
      success: true,
      data: {
        totalArea
      }
    }
  } catch (error) {
    console.error('Error calculating delivery area:', error)
    return { success: false, error: 'Failed to calculate delivery area' }
  }
} 