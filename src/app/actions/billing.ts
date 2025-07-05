'use server'

import { createClient } from '../../../supabase/server'
import { revalidatePath } from 'next/cache'
import { InvoiceInsert, InvoiceUpdate, InvoiceItemInsert, PaymentInsert } from '@/types/database'

// Invoice Actions
export async function createInvoice(data: InvoiceInsert, items: InvoiceItemInsert[]) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Add user_id to the invoice data
    const invoiceData = {
      ...data,
      user_id: user.id
    }
    
    // Start transaction
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single()

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError)
      return { success: false, error: invoiceError.message }
    }

    // Add items to the invoice
    const itemsWithInvoiceId = items.map(item => ({
      ...item,
      invoice_id: invoice.id
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId)

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError)
      return { success: false, error: itemsError.message }
    }

    revalidatePath('/dashboard/billing')
    return { success: true, data: invoice }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { success: false, error: 'Failed to create invoice' }
  }
}

export async function updateInvoice(id: string, data: InvoiceUpdate) {
  try {
    const supabase = await createClient()
    
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating invoice:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/billing')
    return { success: true, data: invoice }
  } catch (error) {
    console.error('Error updating invoice:', error)
    return { success: false, error: 'Failed to update invoice' }
  }
}

export async function deleteInvoice(id: string) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting invoice:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/billing')
    return { success: true }
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return { success: false, error: 'Failed to delete invoice' }
  }
}

export async function getInvoices() {
  try {
    const supabase = await createClient()
    
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(name, contact_person, phone),
        items:invoice_items(
          *,
          product:products(name, sku)
        ),
        payments:payments(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invoices:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: invoices }
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return { success: false, error: 'Failed to fetch invoices' }
  }
}

export async function getInvoice(id: string) {
  try {
    const supabase = await createClient()
    
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        items:invoice_items(
          *,
          product:products(*)
        ),
        payments:payments(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching invoice:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: invoice }
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return { success: false, error: 'Failed to fetch invoice' }
  }
}

// Payment Actions
export async function createPayment(data: PaymentInsert) {
  try {
    const supabase = await createClient()
    
    const { data: payment, error } = await supabase
      .from('payments')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Error creating payment:', error)
      return { success: false, error: error.message }
    }

    // Update invoice paid amount
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('paid_amount, total_amount')
      .eq('id', data.invoice_id)
      .single()

    if (invoiceError) {
      console.error('Error fetching invoice for payment update:', invoiceError)
      return { success: false, error: invoiceError.message }
    }

    const newPaidAmount = (invoice.paid_amount || 0) + data.amount
    const balanceAmount = Math.max(0, invoice.total_amount - newPaidAmount)
    const status = balanceAmount === 0 ? 'Paid' : 'Partial'

    await supabase
      .from('invoices')
      .update({
        paid_amount: newPaidAmount,
        balance_amount: balanceAmount,
        status: status
      })
      .eq('id', data.invoice_id)

    revalidatePath('/dashboard/billing')
    return { success: true, data: payment }
  } catch (error) {
    console.error('Error creating payment:', error)
    return { success: false, error: 'Failed to create payment' }
  }
}

export async function getPayments() {
  try {
    const supabase = await createClient()
    
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(
          invoice_number,
          customer:customers(name)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: payments }
  } catch (error) {
    console.error('Error fetching payments:', error)
    return { success: false, error: 'Failed to fetch payments' }
  }
}

// GST and Calculations
export async function calculateInvoiceTotals(items: InvoiceItemInsert[], gstRate: number = 18) {
  try {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    const gstAmount = (subtotal * gstRate) / 100
    const totalAmount = subtotal + gstAmount

    return {
      success: true,
      data: {
        subtotal,
        gstAmount,
        totalAmount
      }
    }
  } catch (error) {
    console.error('Error calculating invoice totals:', error)
    return { success: false, error: 'Failed to calculate invoice totals' }
  }
}

// Invoice Generation
export async function generateInvoiceNumber(prefix: string = 'INV') {
  try {
    const supabase = await createClient()
    
    const { data: lastInvoice, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .like('invoice_number', `${prefix}%`)
      .order('invoice_number', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching last invoice number:', error)
      return { success: false, error: error.message }
    }

    let nextNumber = 1
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoice_number.replace(prefix, ''))
      nextNumber = lastNumber + 1
    }

    const invoiceNumber = `${prefix}${nextNumber.toString().padStart(6, '0')}`
    return { success: true, data: invoiceNumber }
  } catch (error) {
    console.error('Error generating invoice number:', error)
    return { success: false, error: 'Failed to generate invoice number' }
  }
}

// Search and Filter
export async function searchInvoices(query: string) {
  try {
    const supabase = await createClient()
    
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(name, contact_person, phone)
      `)
      .or(`invoice_number.ilike.%${query}%,customer.name.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching invoices:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: invoices }
  } catch (error) {
    console.error('Error searching invoices:', error)
    return { success: false, error: 'Failed to search invoices' }
  }
}

export async function getInvoicesByStatus(status: string) {
  try {
    const supabase = await createClient()
    
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(name, contact_person, phone)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invoices by status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: invoices }
  } catch (error) {
    console.error('Error fetching invoices by status:', error)
    return { success: false, error: 'Failed to fetch invoices by status' }
  }
}

// Billing Statistics
export async function getBillingStats() {
  try {
    const supabase = await createClient()
    
    // Get total invoices
    const { count: totalInvoices, error: totalError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error getting total invoices:', totalError)
      return { success: false, error: totalError.message }
    }

    // Get pending invoices
    const { count: pendingInvoices, error: pendingError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending')

    if (pendingError) {
      console.error('Error getting pending invoices:', pendingError)
      return { success: false, error: pendingError.message }
    }

    // Get total amount
    const { data: totalAmount, error: amountError } = await supabase
      .from('invoices')
      .select('total_amount')

    if (amountError) {
      console.error('Error getting total amount:', amountError)
      return { success: false, error: amountError.message }
    }

    const totalAmountSum = totalAmount?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0

    return {
      success: true,
      data: {
        total: totalInvoices || 0,
        pending: pendingInvoices || 0,
        totalAmount: totalAmountSum
      }
    }
  } catch (error) {
    console.error('Error getting billing stats:', error)
    return { success: false, error: 'Failed to get billing stats' }
  }
} 