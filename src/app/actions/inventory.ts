'use server'

import { createClient } from '../../../supabase/server'
import { revalidatePath } from 'next/cache'
import { ProductInsert, ProductUpdate, CategoryInsert, CategoryUpdate, SupplierInsert, SupplierUpdate } from '@/types/database'

// Product Actions
export async function createProduct(data: Omit<ProductInsert, 'user_id'>) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const productData: ProductInsert = {
      ...data,
      user_id: user.id
    }
    
    const { data: product, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventory')
    return { success: true, data: product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProduct(id: string, data: ProductUpdate) {
  try {
    const supabase = await createClient()
    
    const { data: product, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventory')
    return { success: true, data: product }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}

export async function getProducts() {
  try {
    const supabase = await createClient()
    
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        supplier:suppliers(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: products }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { success: false, error: 'Failed to fetch products' }
  }
}

export async function getProduct(id: string) {
  try {
    const supabase = await createClient()
    
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        supplier:suppliers(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: product }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false, error: 'Failed to fetch product' }
  }
}

// Category Actions
export async function createCategory(data: Omit<CategoryInsert, 'user_id'>) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const categoryData: CategoryInsert = {
      ...data,
      user_id: user.id
    }
    
    const { data: category, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventory')
    return { success: true, data: category }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false, error: 'Failed to create category' }
  }
}

export async function updateCategory(id: string, data: CategoryUpdate) {
  try {
    const supabase = await createClient()
    
    const { data: category, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventory')
    return { success: true, data: category }
  } catch (error) {
    console.error('Error updating category:', error)
    return { success: false, error: 'Failed to update category' }
  }
}

export async function deleteCategory(id: string) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: 'Failed to delete category' }
  }
}

export async function getCategories() {
  try {
    const supabase = await createClient()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: categories }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false, error: 'Failed to fetch categories' }
  }
}

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
    
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update(data)
      .eq('id', id)
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
    
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)

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
    
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
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

// Stock Management
export async function updateStock(productId: string, quantity: number, operation: 'add' | 'subtract') {
  try {
    const supabase = await createClient()
    
    // Get current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('current_stock')
      .eq('id', productId)
      .single()

    if (fetchError) {
      console.error('Error fetching product stock:', fetchError)
      return { success: false, error: fetchError.message }
    }

    const newStock = operation === 'add' 
      ? (product.current_stock || 0) + quantity
      : Math.max(0, (product.current_stock || 0) - quantity)

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', productId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating stock:', updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath('/dashboard/inventory')
    return { success: true, data: updatedProduct }
  } catch (error) {
    console.error('Error updating stock:', error)
    return { success: false, error: 'Failed to update stock' }
  }
}

// Search and Filter
export async function searchProducts(query: string) {
  try {
    const supabase = await createClient()
    
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        supplier:suppliers(name)
      `)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error searching products:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: products }
  } catch (error) {
    console.error('Error searching products:', error)
    return { success: false, error: 'Failed to search products' }
  }
}

export async function getLowStockProducts() {
  try {
    const supabase = await createClient()
    
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        supplier:suppliers(name)
      `)
      .lte('current_stock', 'min_stock')
      .order('current_stock', { ascending: true })

    if (error) {
      console.error('Error fetching low stock products:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: products }
  } catch (error) {
    console.error('Error fetching low stock products:', error)
    return { success: false, error: 'Failed to fetch low stock products' }
  }
} 