"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import { 
  InvoiceInsert, 
  InvoiceUpdate, 
  InvoiceItemInsert, 
  InvoiceItemUpdate, 
  PaymentInsert 
} from "@/types/database";

// Helper function to get current user
async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || '';
  const supabase = await createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        email: email,
      }
    },
  });

  console.log("After signUp", error);


  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      const { error: updateError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          name: fullName,
          full_name: fullName,
          email: email,
          user_id: user.id,
          token_identifier: user.id,
          created_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Error updating user profile:', updateError);
      }
    } catch (err) {
      console.error('Error in user profile creation:', err);
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

// ===== BILLING SYSTEM ACTIONS =====

// Tax Rates
export async function getTaxRates() {
  try {
    const supabase = await createClient();
    const { data: taxRates, error } = await supabase
      .from('tax_rates')
      .select('*')
      .eq('is_active', true)
      .order('rate', { ascending: true });

    if (error) throw error;
    return { data: taxRates, error: null };
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    return { data: null, error: 'Failed to fetch tax rates' };
  }
}

// Invoices
export async function createInvoice(invoiceData: InvoiceInsert) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Generate invoice number
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');
    
    const invoice = {
      ...invoiceData,
      user_id: user.id,
      invoice_number: invoiceNumber,
      status: 'draft'
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { data: null, error: 'Failed to create invoice' };
  }
}

export async function getInvoices(filters?: {
  status?: string;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(name, contact_person, phone, email, gst_number)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    if (filters?.date_from) {
      query = query.gte('invoice_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('invoice_date', filters.date_to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { data: null, error: 'Failed to fetch invoices' };
  }
}

export async function getInvoiceById(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        items:invoice_items(*),
        payments:payments(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return { data: null, error: 'Failed to fetch invoice' };
  }
}

export async function updateInvoice(id: string, updates: Partial<InvoiceUpdate>) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { data: null, error: 'Failed to update invoice' };
  }
}

export async function deleteInvoice(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return { data: null, error: 'Failed to delete invoice' };
  }
}

// Invoice Items
export async function addInvoiceItem(itemData: InvoiceItemInsert) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Verify invoice belongs to user
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', itemData.invoice_id)
      .eq('user_id', user.id)
      .single();

    if (!invoice) throw new Error('Invoice not found');

    const { data, error } = await supabase
      .from('invoice_items')
      .insert(itemData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding invoice item:', error);
    return { data: null, error: 'Failed to add invoice item' };
  }
}

export async function updateInvoiceItem(id: string, updates: Partial<InvoiceItemUpdate>) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Verify item belongs to user's invoice
    const { data: item } = await supabase
      .from('invoice_items')
      .select('invoice_id')
      .eq('id', id)
      .single();

    if (!item) throw new Error('Invoice item not found');

    const { data: invoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', item.invoice_id)
      .eq('user_id', user.id)
      .single();

    if (!invoice) throw new Error('Invoice not found');

    const { data, error } = await supabase
      .from('invoice_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating invoice item:', error);
    return { data: null, error: 'Failed to update invoice item' };
  }
}

export async function deleteInvoiceItem(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Verify item belongs to user's invoice
    const { data: item } = await supabase
      .from('invoice_items')
      .select('invoice_id')
      .eq('id', id)
      .single();

    if (!item) throw new Error('Invoice item not found');

    const { data: invoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', item.invoice_id)
      .eq('user_id', user.id)
      .single();

    if (!invoice) throw new Error('Invoice not found');

    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting invoice item:', error);
    return { data: null, error: 'Failed to delete invoice item' };
  }
}

// Payments
export async function addPayment(paymentData: PaymentInsert) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Verify invoice belongs to user
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, total_amount')
      .eq('id', paymentData.invoice_id)
      .eq('user_id', user.id)
      .single();

    if (!invoice) throw new Error('Invoice not found');

    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...paymentData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Update invoice status if fully paid
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', paymentData.invoice_id);

    const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    
    if (totalPaid >= invoice.total_amount) {
      await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', paymentData.invoice_id);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error adding payment:', error);
    return { data: null, error: 'Failed to add payment' };
  }
}

export async function getPayments(invoiceId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(invoice_number, customer:customers(name))
      `)
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false });

    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching payments:', error);
    return { data: null, error: 'Failed to fetch payments' };
  }
}

export async function deletePayment(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting payment:', error);
    return { data: null, error: 'Failed to delete payment' };
  }
}

// Billing Analytics
export async function getBillingAnalytics() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get invoice statistics
    const { data: invoices } = await supabase
      .from('invoices')
      .select('status, total_amount, invoice_date')
      .eq('user_id', user.id)
      .gte('invoice_date', startOfMonth.toISOString().split('T')[0])
      .lte('invoice_date', endOfMonth.toISOString().split('T')[0]);

    // Get payment statistics
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('user_id', user.id)
      .gte('payment_date', startOfMonth.toISOString().split('T')[0])
      .lte('payment_date', endOfMonth.toISOString().split('T')[0]);

    const totalInvoiced = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
    const totalPaid = payments?.reduce((sum, pay) => sum + pay.amount, 0) || 0;
    const pendingAmount = totalInvoiced - totalPaid;

    const stats = {
      totalInvoiced,
      totalPaid,
      pendingAmount,
      invoiceCount: invoices?.length || 0,
      paidInvoices: invoices?.filter(inv => inv.status === 'paid').length || 0,
      overdueInvoices: invoices?.filter(inv => inv.status === 'overdue').length || 0,
      draftInvoices: invoices?.filter(inv => inv.status === 'draft').length || 0
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching billing analytics:', error);
    return { data: null, error: 'Failed to fetch billing analytics' };
  }
}