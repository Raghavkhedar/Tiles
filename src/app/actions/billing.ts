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
export async function createPayment(data: Omit<PaymentInsert, 'user_id'>) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return { success: false, error: 'User not authenticated' }
    }
    
    const paymentData = {
      ...data,
      user_id: user.id
    }
    
    const { data: payment, error } = await supabase
      .from('payments')
      .insert(paymentData)
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
    const status = balanceAmount === 0 ? 'Paid' : newPaidAmount > 0 ? 'Partially Paid' : 'Pending'

    await supabase
      .from('invoices')
      .update({
        paid_amount: newPaidAmount,
        balance_amount: balanceAmount,
        status: status
      })
      .eq('id', data.invoice_id)

    revalidatePath('/dashboard/billing')
    revalidatePath('/dashboard/payments')
    
    // Also update the invoice status based on payment
    await updateInvoiceStatus(data.invoice_id)
    
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
          status,
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

export async function updatePayment(id: string, data: { payment_date: string; amount: number; payment_method: string; reference_number?: string | null; notes?: string | null }) {
  try {
    const supabase = await createClient()
    
    // Get current payment details
    const { data: currentPayment, error: fetchError } = await supabase
      .from('payments')
      .select('invoice_id, amount')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching payment:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Update the payment
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating payment:', updateError)
      return { success: false, error: updateError.message }
    }

    // Update invoice paid amount if amount changed
    if (currentPayment && data.amount !== currentPayment.amount) {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('paid_amount, total_amount')
        .eq('id', currentPayment.invoice_id)
        .single()

      if (invoiceError) {
        console.error('Error fetching invoice for payment update:', invoiceError)
        return { success: false, error: invoiceError.message }
      }

      const amountDifference = data.amount - currentPayment.amount
      const newPaidAmount = Math.max(0, (invoice.paid_amount || 0) + amountDifference)
      const balanceAmount = Math.max(0, invoice.total_amount - newPaidAmount)
      const status = balanceAmount === 0 ? 'Paid' : newPaidAmount > 0 ? 'Partially Paid' : 'Pending'

      await supabase
        .from('invoices')
        .update({
          paid_amount: newPaidAmount,
          balance_amount: balanceAmount,
          status: status
        })
        .eq('id', currentPayment.invoice_id)
    }

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard/billing')
    
    // Update invoice status if amount changed
    if (currentPayment && data.amount !== currentPayment.amount) {
      await updateInvoiceStatus(currentPayment.invoice_id)
    }
    
    return { success: true, data: updatedPayment }
  } catch (error) {
    console.error('Error updating payment:', error)
    return { success: false, error: 'Failed to update payment' }
  }
}

export async function deletePayment(id: string) {
  try {
    const supabase = await createClient()
    
    // Get payment details before deletion
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('invoice_id, amount')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching payment:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Delete the payment
    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting payment:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Update invoice paid amount
    if (payment) {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('paid_amount, total_amount')
        .eq('id', payment.invoice_id)
        .single()

      if (invoiceError) {
        console.error('Error fetching invoice for payment update:', invoiceError)
        return { success: false, error: invoiceError.message }
      }

      const newPaidAmount = Math.max(0, (invoice.paid_amount || 0) - payment.amount)
      const balanceAmount = Math.max(0, invoice.total_amount - newPaidAmount)
      const status = balanceAmount === 0 ? 'Paid' : newPaidAmount > 0 ? 'Partially Paid' : 'Pending'

      await supabase
        .from('invoices')
        .update({
          paid_amount: newPaidAmount,
          balance_amount: balanceAmount,
          status: status
        })
        .eq('id', payment.invoice_id)
    }

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard/billing')
    
    // Update invoice status after payment deletion
    if (payment) {
      await updateInvoiceStatus(payment.invoice_id)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting payment:', error)
    return { success: false, error: 'Failed to delete payment' }
  }
}

// Utility function to update invoice status based on payments
async function updateInvoiceStatus(invoiceId: string) {
  try {
    const supabase = await createClient()
    
    // Get invoice with total payments
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('total_amount, paid_amount')
      .eq('id', invoiceId)
      .single()

    if (invoiceError) {
      console.error('Error fetching invoice for status update:', invoiceError)
      return
    }

    // Get total payments for this invoice
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoiceId)

    if (paymentsError) {
      console.error('Error fetching payments for status update:', paymentsError)
      return
    }

    const totalPaid = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    const balanceAmount = Math.max(0, invoice.total_amount - totalPaid)
    const status = balanceAmount === 0 ? 'Paid' : totalPaid > 0 ? 'Partially Paid' : 'Pending'

    // Update invoice with new paid amount and status
    await supabase
      .from('invoices')
      .update({
        paid_amount: totalPaid,
        balance_amount: balanceAmount,
        status: status
      })
      .eq('id', invoiceId)

  } catch (error) {
    console.error('Error updating invoice status:', error)
  }
}

// Function to fix empty invoice statuses
export async function fixEmptyInvoiceStatuses() {
  try {
    const supabase = await createClient()
    
    // Get all invoices with empty status
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('id, total_amount, paid_amount, status')
      .or('status.is.null,status.eq.')

    if (invoicesError) {
      console.error('Error fetching invoices with empty status:', invoicesError)
      return { success: false, error: invoicesError.message }
    }

    // Update each invoice with empty status
    for (const invoice of invoices || []) {
      const paidAmount = invoice.paid_amount || 0
      const totalAmount = invoice.total_amount || 0
      const balanceAmount = Math.max(0, totalAmount - paidAmount)
      const status = balanceAmount === 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Pending'

      await supabase
        .from('invoices')
        .update({ status: status })
        .eq('id', invoice.id)
    }

    revalidatePath('/dashboard/billing')
    revalidatePath('/dashboard/payments')
    return { success: true }
  } catch (error) {
    console.error('Error fixing empty invoice statuses:', error)
    return { success: false, error: 'Failed to fix empty invoice statuses' }
  }
}

// Function to sync all invoice statuses with their payments
export async function syncInvoiceStatuses() {
  try {
    const supabase = await createClient()
    
    // Get all invoices with their payment data
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('id, total_amount, paid_amount, status')

    if (invoicesError) {
      console.error('Error fetching invoices for sync:', invoicesError)
      return { success: false, error: invoicesError.message }
    }

    console.log('Syncing invoice statuses for:', invoices?.length || 0, 'invoices');

    // Update each invoice status based on actual payment data
    for (const invoice of invoices || []) {
      const paidAmount = invoice.paid_amount || 0;
      const totalAmount = invoice.total_amount || 0;
      const balanceAmount = Math.max(0, totalAmount - paidAmount);
      const newStatus = balanceAmount === 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Pending';
      
      console.log(`Invoice ${invoice.id}: Total=${totalAmount}, Paid=${paidAmount}, Old Status=${invoice.status}, New Status=${newStatus}`);
      
      // Only update if status needs to change
      if (invoice.status !== newStatus) {
        await supabase
          .from('invoices')
          .update({
            paid_amount: paidAmount,
            balance_amount: balanceAmount,
            status: newStatus
          })
          .eq('id', invoice.id)
      }
    }

    revalidatePath('/dashboard/billing')
    revalidatePath('/dashboard/payments')
    return { success: true }
  } catch (error) {
    console.error('Error syncing invoice statuses:', error)
    return { success: false, error: 'Failed to sync invoice statuses' }
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

// Payment Statistics
export async function getPaymentStats() {
  try {
    const supabase = await createClient()
    
    // Get total payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, payment_date, payment_method')

    if (paymentsError) {
      console.error('Error fetching payments for stats:', paymentsError)
      return { success: false, error: paymentsError.message }
    }

    const totalPayments = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    
    const thisMonthPayments = payments?.filter(payment => {
      const paymentDate = new Date(payment.payment_date)
      return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear
    }) || []
    
    const thisMonthTotal = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    // Payment method breakdown
    const methodBreakdown = payments?.reduce((acc, payment) => {
      acc[payment.payment_method] = (acc[payment.payment_method] || 0) + payment.amount
      return acc
    }, {} as Record<string, number>) || {}

    return {
      success: true,
      data: {
        totalPayments,
        thisMonthTotal,
        thisMonthCount: thisMonthPayments.length,
        methodBreakdown,
        totalCount: payments?.length || 0
      }
    }
  } catch (error) {
    console.error('Error getting payment stats:', error)
    return { success: false, error: 'Failed to get payment stats' }
  }
}

export async function searchPayments(query: string) {
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
      .or(`reference_number.ilike.%${query}%,invoice.invoice_number.ilike.%${query}%,invoice.customer.name.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching payments:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: payments }
  } catch (error) {
    console.error('Error searching payments:', error)
    return { success: false, error: 'Failed to search payments' }
  }
}

export async function getPaymentsByMethod(method: string) {
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
      .eq('payment_method', method)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments by method:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: payments }
  } catch (error) {
    console.error('Error fetching payments by method:', error)
    return { success: false, error: 'Failed to fetch payments by method' }
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