'use server'

import { createClient } from '../../../supabase/server'
import { revalidatePath } from 'next/cache'
import { SettingInsert, SettingUpdate } from '@/types/database'

// Settings Actions
export async function createSettings(data: SettingInsert) {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('settings')
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('Error creating settings:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true, data: settings }
  } catch (error) {
    console.error('Error creating settings:', error)
    return { success: false, error: 'Failed to create settings' }
  }
}

export async function updateSettings(id: string, data: SettingUpdate) {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('settings')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true, data: settings }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { success: false, error: 'Failed to update settings' }
  }
}

export async function getSettings() {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: settings }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return { success: false, error: 'Failed to fetch settings' }
  }
}

// GST Rate Management
export async function updateGSTRate(newRate: number) {
  try {
    const supabase = await createClient()
    
    // Get current settings
    const { data: settings, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (fetchError) {
      console.error('Error fetching settings for GST update:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Update GST rate
    const { data: updatedSettings, error: updateError } = await supabase
      .from('settings')
      .update({ gst_rate: newRate })
      .eq('id', settings.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating GST rate:', updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath('/dashboard')
    return { success: true, data: updatedSettings }
  } catch (error) {
    console.error('Error updating GST rate:', error)
    return { success: false, error: 'Failed to update GST rate' }
  }
}

// Business Information Management
export async function updateBusinessInfo(data: {
  business_name?: string
  business_address?: string
  business_phone?: string
  business_email?: string
  gst_number?: string
  pan_number?: string
}) {
  try {
    const supabase = await createClient()
    
    // Get current settings
    const { data: settings, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (fetchError) {
      console.error('Error fetching settings for business info update:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Update business information
    const { data: updatedSettings, error: updateError } = await supabase
      .from('settings')
      .update(data)
      .eq('id', settings.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating business info:', updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath('/dashboard')
    return { success: true, data: updatedSettings }
  } catch (error) {
    console.error('Error updating business info:', error)
    return { success: false, error: 'Failed to update business info' }
  }
}

// Invoice Prefix Management
export async function updateInvoicePrefix(prefix: string) {
  try {
    const supabase = await createClient()
    
    // Get current settings
    const { data: settings, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (fetchError) {
      console.error('Error fetching settings for invoice prefix update:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Update invoice prefix
    const { data: updatedSettings, error: updateError } = await supabase
      .from('settings')
      .update({ invoice_prefix: prefix })
      .eq('id', settings.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating invoice prefix:', updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath('/dashboard')
    return { success: true, data: updatedSettings }
  } catch (error) {
    console.error('Error updating invoice prefix:', error)
    return { success: false, error: 'Failed to update invoice prefix' }
  }
}

// Initialize Default Settings
export async function initializeDefaultSettings(userId: string) {
  try {
    const supabase = await createClient()
    
    const defaultSettings: SettingInsert = {
      user_id: userId,
      business_name: 'TileManager Pro',
      business_address: '',
      business_phone: '',
      business_email: '',
      gst_number: '',
      pan_number: '',
      gst_rate: 18.00,
      invoice_prefix: 'INV'
    }

    const { data: settings, error } = await supabase
      .from('settings')
      .insert(defaultSettings)
      .select()
      .single()

    if (error) {
      console.error('Error initializing default settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: settings }
  } catch (error) {
    console.error('Error initializing default settings:', error)
    return { success: false, error: 'Failed to initialize default settings' }
  }
}

// Validate GST Number
export async function validateGSTNumber(gstNumber: string) {
  try {
    // Basic GST number validation (15 characters, alphanumeric)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    
    if (!gstRegex.test(gstNumber)) {
      return { success: false, error: 'Invalid GST number format' }
    }

    return { success: true, data: { isValid: true } }
  } catch (error) {
    console.error('Error validating GST number:', error)
    return { success: false, error: 'Failed to validate GST number' }
  }
}

// Validate PAN Number
export async function validatePANNumber(panNumber: string) {
  try {
    // Basic PAN number validation (10 characters, alphanumeric)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    
    if (!panRegex.test(panNumber)) {
      return { success: false, error: 'Invalid PAN number format' }
    }

    return { success: true, data: { isValid: true } }
  } catch (error) {
    console.error('Error validating PAN number:', error)
    return { success: false, error: 'Failed to validate PAN number' }
  }
} 

// Get or Create Settings
export async function getOrCreateSettings() {
  try {
    const supabase = await createClient()
    
    // Try to get existing settings
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (error) {
      // If no settings exist, create default settings
      if (error.code === 'PGRST116') { // No rows returned
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) {
          return { success: false, error: 'User not authenticated' }
        }

        const defaultSettings: SettingInsert = {
          user_id: user.user.id,
          business_name: 'TileManager Pro',
          business_address: '',
          business_phone: '',
          business_email: '',
          gst_number: '',
          pan_number: '',
          gst_rate: 18.00,
          invoice_prefix: 'INV'
        }

        const { data: newSettings, error: createError } = await supabase
          .from('settings')
          .insert(defaultSettings)
          .select()
          .single()

        if (createError) {
          console.error('Error creating default settings:', createError)
          return { success: false, error: createError.message }
        }

        return { success: true, data: newSettings }
      }
      
      console.error('Error fetching settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: settings }
  } catch (error) {
    console.error('Error getting or creating settings:', error)
    return { success: false, error: 'Failed to get or create settings' }
  }
} 