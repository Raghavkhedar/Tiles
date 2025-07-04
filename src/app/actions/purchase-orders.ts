'use server'

import { createClient } from '../../../supabase/server'
import { revalidatePath } from 'next/cache'
import { PurchaseOrderInsert, PurchaseOrderUpdate, PurchaseOrderItemInsert } from '@/types/database'

// Purchase Order Actions
export async function createPurchaseOrder(data: Omit<PurchaseOrderInsert, 'user_id'>) {
  try {
    console.log('Received PO data:', data)
    console.log('Expected delivery date:', data.expected_delivery_date, 'Type:', typeof data.expected_delivery_date)
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Ensure order_date is valid
    if (!data.order_date || data.order_date === '') {
      return { success: false, error: 'Order date is required' }
    }

    // Convert empty dates to null
    const poData: PurchaseOrderInsert = {
      ...data,
      expected_delivery_date: data.expected_delivery_date === '' ? null : data.expected_delivery_date,
      user_id: user.id
    }
    
    console.log('Final PO data to insert:', poData)
    console.log('Expected delivery date after conversion:', poData.expected_delivery_date)
    
    const { data: purchaseOrder, error } = await supabase
      .from('purchase_orders')
      .insert(poData)
      .select()
      .single()

    if (error) {
      console.error('Error creating purchase order:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath('/dashboard/suppliers')
    return { success: true, data: purchaseOrder }
  } catch (error) {
    console.error('Error creating purchase order:', error)
    return { success: false, error: 'Failed to create purchase order' }
  }
}

export async function updatePurchaseOrder(id: string, data: PurchaseOrderUpdate) {
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
    
    const { data: purchaseOrder, error } = await supabase
      .from('purchase_orders')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own POs
      .select()
      .single()

    if (error) {
      console.error('Error updating purchase order:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath('/dashboard/suppliers')
    return { success: true, data: purchaseOrder }
  } catch (error) {
    console.error('Error updating purchase order:', error)
    return { success: false, error: 'Failed to update purchase order' }
  }
}

export async function deletePurchaseOrder(id: string) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only delete their own POs

    if (error) {
      console.error('Error deleting purchase order:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath('/dashboard/suppliers')
    return { success: true }
  } catch (error) {
    console.error('Error deleting purchase order:', error)
    return { success: false, error: 'Failed to delete purchase order' }
  }
}

export async function getPurchaseOrders() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const { data: purchaseOrders, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(name, contact_person, phone)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching purchase orders:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: purchaseOrders }
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    return { success: false, error: 'Failed to fetch purchase orders' }
  }
}

export async function getPurchaseOrder(id: string) {
  try {
    const supabase = await createClient()
    
    const { data: purchaseOrder, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching purchase order:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: purchaseOrder }
  } catch (error) {
    console.error('Error fetching purchase order:', error)
    return { success: false, error: 'Failed to fetch purchase order' }
  }
}

export async function getPurchaseOrderItems(poId: string) {
  try {
    const supabase = await createClient()
    
    const { data: items, error } = await supabase
      .from('purchase_order_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('purchase_order_id', poId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching purchase order items:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: items }
  } catch (error) {
    console.error('Error fetching purchase order items:', error)
    return { success: false, error: 'Failed to fetch purchase order items' }
  }
}

// Purchase Order Items Actions
export async function addPurchaseOrderItem(data: PurchaseOrderItemInsert) {
  try {
    const supabase = await createClient()
    
    const { data: item, error } = await supabase
      .from('purchase_order_items')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Error adding purchase order item:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/purchase-orders')
    return { success: true, data: item }
  } catch (error) {
    console.error('Error adding purchase order item:', error)
    return { success: false, error: 'Failed to add purchase order item' }
  }
}

export async function updatePurchaseOrderItem(id: string, data: any) {
  try {
    const supabase = await createClient()
    
    const { data: item, error } = await supabase
      .from('purchase_order_items')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating purchase order item:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/purchase-orders')
    return { success: true, data: item }
  } catch (error) {
    console.error('Error updating purchase order item:', error)
    return { success: false, error: 'Failed to update purchase order item' }
  }
}

export async function deletePurchaseOrderItem(id: string) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('purchase_order_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting purchase order item:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/purchase-orders')
    return { success: true }
  } catch (error) {
    console.error('Error deleting purchase order item:', error)
    return { success: false, error: 'Failed to delete purchase order item' }
  }
}

// Search and Filter
export async function searchPurchaseOrders(query: string) {
  try {
    const supabase = await createClient()
    
    const { data: purchaseOrders, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(name, contact_person, phone)
      `)
      .or(`po_number.ilike.%${query}%,supplier.name.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching purchase orders:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: purchaseOrders }
  } catch (error) {
    console.error('Error searching purchase orders:', error)
    return { success: false, error: 'Failed to search purchase orders' }
  }
}

export async function getPurchaseOrdersByStatus(status: string) {
  try {
    const supabase = await createClient()
    
    const { data: purchaseOrders, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(name, contact_person, phone)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching purchase orders by status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: purchaseOrders }
  } catch (error) {
    console.error('Error fetching purchase orders by status:', error)
    return { success: false, error: 'Failed to fetch purchase orders by status' }
  }
}

export async function getPurchaseOrdersBySupplier(supplierId: string) {
  try {
    const supabase = await createClient()
    
    const { data: purchaseOrders, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(name, contact_person, phone)
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching purchase orders by supplier:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: purchaseOrders }
  } catch (error) {
    console.error('Error fetching purchase orders by supplier:', error)
    return { success: false, error: 'Failed to fetch purchase orders by supplier' }
  }
}

// Business Logic
export async function updatePurchaseOrderStatus(id: string, status: string) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data: purchaseOrder, error } = await supabase
      .from('purchase_orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating purchase order status:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath('/dashboard/suppliers')
    return { success: true, data: purchaseOrder }
  } catch (error) {
    console.error('Error updating purchase order status:', error)
    return { success: false, error: 'Failed to update purchase order status' }
  }
}

export async function recordPurchaseOrderPayment(id: string, amount: number) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get current PO
    const { data: currentPO } = await supabase
      .from('purchase_orders')
      .select('paid_amount, total_amount')
      .eq('id', id)
      .single()

    if (!currentPO) {
      return { success: false, error: 'Purchase order not found' }
    }

    const newPaidAmount = (currentPO.paid_amount || 0) + amount

    const { data: purchaseOrder, error } = await supabase
      .from('purchase_orders')
      .update({ 
        paid_amount: newPaidAmount,
        balance_amount: (currentPO.total_amount || 0) - newPaidAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error recording purchase order payment:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath('/dashboard/suppliers')
    return { success: true, data: purchaseOrder }
  } catch (error) {
    console.error('Error recording purchase order payment:', error)
    return { success: false, error: 'Failed to record purchase order payment' }
  }
}

export async function getPurchaseOrderStats() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const { data: purchaseOrders, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching purchase orders for stats:', error)
      return { success: false, error: error.message }
    }

    const totalPOs = purchaseOrders.length
    const draftPOs = purchaseOrders.filter(po => po.status === 'Draft').length
    const sentPOs = purchaseOrders.filter(po => po.status === 'Sent').length
    const confirmedPOs = purchaseOrders.filter(po => po.status === 'Confirmed').length
    const receivedPOs = purchaseOrders.filter(po => po.status === 'Received').length
    const totalAmount = purchaseOrders.reduce((sum, po) => sum + (po.total_amount || 0), 0)
    const totalPaid = purchaseOrders.reduce((sum, po) => sum + (po.paid_amount || 0), 0)
    const totalOutstanding = totalAmount - totalPaid

    return { 
      success: true, 
      data: {
        totalPOs,
        draftPOs,
        sentPOs,
        confirmedPOs,
        receivedPOs,
        totalAmount,
        totalPaid,
        totalOutstanding
      }
    }
  } catch (error) {
    console.error('Error fetching purchase order stats:', error)
    return { success: false, error: 'Failed to fetch purchase order stats' }
  }
} 