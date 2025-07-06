import { getProducts, createProduct, updateProduct, deleteProduct } from '../products'
import { createClient } from '../../../../supabase/server'

// Mock the Supabase client
jest.mock('../../../../supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
}

describe('Products Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('getProducts', () => {
    it('should return products successfully', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 100,
          stock_quantity: 50,
          user_id: 'user-1',
        },
      ]

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })

      mockSupabase.from().single.mockResolvedValue({
        data: mockProducts,
        error: null,
      })

      const result = await getProducts()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockProducts)
      expect(mockSupabase.from).toHaveBeenCalledWith('products')
    })

    it('should handle authentication error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await getProducts()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
    })

    it('should handle database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })

      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const result = await getProducts()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const productData = {
        name: 'New Product',
        price: 150,
        stock_quantity: 25,
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })

      mockSupabase.from().single.mockResolvedValue({
        data: { id: 'new-product-id', ...productData, user_id: 'user-1' },
        error: null,
      })

      const result = await createProduct(productData)

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        id: 'new-product-id',
        ...productData,
        user_id: 'user-1',
      })
      expect(mockSupabase.from).toHaveBeenCalledWith('products')
    })

    it('should validate required fields', async () => {
      const invalidProductData = {
        price: 150,
        // Missing name
      }

      const result = await createProduct(invalidProductData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('name')
    })

    it('should validate price is positive', async () => {
      const invalidProductData = {
        name: 'Test Product',
        price: -100,
        stock_quantity: 25,
      }

      const result = await createProduct(invalidProductData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('price')
    })
  })

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const productId = 'product-1'
      const updateData = {
        name: 'Updated Product',
        price: 200,
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })

      mockSupabase.from().single.mockResolvedValue({
        data: { id: productId, ...updateData, user_id: 'user-1' },
        error: null,
      })

      const result = await updateProduct(productId, updateData)

      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        id: productId,
        ...updateData,
        user_id: 'user-1',
      })
    })

    it('should handle product not found', async () => {
      const productId = 'non-existent'
      const updateData = { name: 'Updated Product' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })

      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' },
      })

      const result = await updateProduct(productId, updateData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Product not found')
    })
  })

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const productId = 'product-1'

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })

      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await deleteProduct(productId)

      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('products')
    })

    it('should handle deletion error', async () => {
      const productId = 'product-1'

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
      })

      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Deletion failed' },
      })

      const result = await deleteProduct(productId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Deletion failed')
    })
  })
}) 