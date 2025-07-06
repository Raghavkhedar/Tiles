import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createMockProduct } from '../../../jest.setup'
import ProductsPage from '../inventory/page'

// Mock the server actions
jest.mock('../../../app/actions/products', () => ({
  getProducts: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}))

const mockGetProducts = require('../../../app/actions/products').getProducts
const mockCreateProduct = require('../../../app/actions/products').createProduct
const mockUpdateProduct = require('../../../app/actions/products').updateProduct
const mockDeleteProduct = require('../../../app/actions/products').deleteProduct

describe('Products Page Integration', () => {
  const mockProducts = [
    createMockProduct({ id: '1', name: 'Product 1', price: 100 }),
    createMockProduct({ id: '2', name: 'Product 2', price: 200 }),
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetProducts.mockResolvedValue({
      success: true,
      data: mockProducts,
    })
  })

  it('renders products page with data', async () => {
    render(<ProductsPage />)

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
      expect(screen.getByText('Product 2')).toBeInTheDocument()
    })

    expect(mockGetProducts).toHaveBeenCalledTimes(1)
  })

  it('shows loading state while fetching data', () => {
    mockGetProducts.mockImplementation(() => new Promise(() => {}))
    
    render(<ProductsPage />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows error state when data fetch fails', async () => {
    mockGetProducts.mockResolvedValue({
      success: false,
      error: 'Failed to fetch products',
    })

    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch products/i)).toBeInTheDocument()
    })
  })

  it('opens add product modal when add button is clicked', async () => {
    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /add product/i })
    fireEvent.click(addButton)

    expect(screen.getByText(/add new product/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument()
  })

  it('creates a new product successfully', async () => {
    mockCreateProduct.mockResolvedValue({
      success: true,
      data: createMockProduct({ id: '3', name: 'New Product', price: 150 }),
    })

    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
    })

    // Open add modal
    const addButton = screen.getByRole('button', { name: /add product/i })
    fireEvent.click(addButton)

    // Fill form
    const nameInput = screen.getByLabelText(/product name/i)
    const priceInput = screen.getByLabelText(/price/i)
    const quantityInput = screen.getByLabelText(/stock quantity/i)

    fireEvent.change(nameInput, { target: { value: 'New Product' } })
    fireEvent.change(priceInput, { target: { value: '150' } })
    fireEvent.change(quantityInput, { target: { value: '25' } })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledWith({
        name: 'New Product',
        price: 150,
        stock_quantity: 25,
      })
    })
  })

  it('edits an existing product', async () => {
    mockUpdateProduct.mockResolvedValue({
      success: true,
      data: createMockProduct({ id: '1', name: 'Updated Product', price: 250 }),
    })

    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
    })

    // Open edit modal for first product
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])

    // Update form
    const nameInput = screen.getByLabelText(/product name/i)
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateProduct).toHaveBeenCalledWith('1', {
        name: 'Updated Product',
      })
    })
  })

  it('deletes a product with confirmation', async () => {
    mockDeleteProduct.mockResolvedValue({
      success: true,
    })

    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
    })

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteProduct).toHaveBeenCalledWith('1')
    })
  })

  it('filters products by search term', async () => {
    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
      expect(screen.getByText('Product 2')).toBeInTheDocument()
    })

    // Search for "Product 1"
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'Product 1' } })

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
      expect(screen.queryByText('Product 2')).not.toBeInTheDocument()
    })
  })

  it('sorts products by different columns', async () => {
    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
    })

    // Click on price column header to sort
    const priceHeader = screen.getByText(/price/i)
    fireEvent.click(priceHeader)

    // Verify sorting (this would depend on your sorting implementation)
    expect(priceHeader).toHaveClass('sorted')
  })

  it('handles bulk operations', async () => {
    mockDeleteProduct.mockResolvedValue({
      success: true,
    })

    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
    })

    // Select products for bulk delete
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // Select first product
    fireEvent.click(checkboxes[2]) // Select second product

    // Click bulk delete button
    const bulkDeleteButton = screen.getByRole('button', { name: /bulk delete/i })
    fireEvent.click(bulkDeleteButton)

    // Confirm bulk deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteProduct).toHaveBeenCalledTimes(2)
    })
  })

  it('exports products data', async () => {
    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument()
    })

    // Click export button
    const exportButton = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportButton)

    // Select export format
    const csvOption = screen.getByText(/csv/i)
    fireEvent.click(csvOption)

    // Verify export functionality (this would depend on your export implementation)
    expect(screen.getByText(/exporting/i)).toBeInTheDocument()
  })

  it('handles pagination', async () => {
    const manyProducts = Array.from({ length: 25 }, (_, i) =>
      createMockProduct({ id: `${i}`, name: `Product ${i}`, price: 100 + i })
    )

    mockGetProducts.mockResolvedValue({
      success: true,
      data: manyProducts.slice(0, 10), // First page
      totalPages: 3,
      currentPage: 1,
    })

    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('Product 0')).toBeInTheDocument()
    })

    // Go to next page
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    // Verify pagination (this would depend on your pagination implementation)
    expect(mockGetProducts).toHaveBeenCalledWith(2, 10)
  })
}) 