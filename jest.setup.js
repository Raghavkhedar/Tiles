import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Supabase client
jest.mock('@/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ne: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      then: jest.fn(),
    })),
  })),
}))

// Mock server actions
jest.mock('@/app/actions/products', () => ({
  getProducts: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}))

jest.mock('@/app/actions/customers', () => ({
  getCustomers: jest.fn(),
  createCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
}))

jest.mock('@/app/actions/suppliers', () => ({
  getSuppliers: jest.fn(),
  createSupplier: jest.fn(),
  updateSupplier: jest.fn(),
  deleteSupplier: jest.fn(),
}))

jest.mock('@/app/actions/invoices', () => ({
  getInvoices: jest.fn(),
  createInvoice: jest.fn(),
  updateInvoice: jest.fn(),
  deleteInvoice: jest.fn(),
}))

jest.mock('@/app/actions/settings', () => ({
  getBusinessProfile: jest.fn(),
  updateBusinessProfile: jest.fn(),
  getSystemPreferences: jest.fn(),
  updateSystemPreferences: jest.fn(),
  getNotificationSettings: jest.fn(),
  updateNotificationSettings: jest.fn(),
}))

jest.mock('@/app/actions/security', () => ({
  getAuditLogs: jest.fn(),
  getSecurityDashboard: jest.fn(),
  exportSecurityLogs: jest.fn(),
  getSecuritySettings: jest.fn(),
  updateSecuritySettings: jest.fn(),
  validatePasswordStrength: jest.fn(),
}))

jest.mock('@/app/actions/data-management', () => ({
  createAutomatedBackup: jest.fn(),
  getBackupSchedule: jest.fn(),
  updateBackupSchedule: jest.fn(),
  importData: jest.fn(),
  bulkDeleteRecords: jest.fn(),
  bulkUpdateRecords: jest.fn(),
  getDataRetentionStats: jest.fn(),
  cleanupOldData: jest.fn(),
}))

// Mock user context
jest.mock('@/contexts/user-context', () => ({
  useUser: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'admin',
    },
    hasPermission: jest.fn(() => true),
    loading: false,
  })),
}))

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}))

// Global test utilities
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.fetch
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalConsoleError.call(console, ...args)
  }
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('Deprecation:'))
    ) {
      return
    }
    originalConsoleWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Custom matchers for testing
expect.extend({
  toHaveBeenCalledWithMatch(received, ...expected) {
    const pass = received.mock.calls.some(call =>
      expected.every((arg, index) => {
        if (typeof arg === 'object' && arg !== null) {
          return expect(call[index]).toMatchObject(arg)
        }
        return call[index] === arg
      })
    )
    return {
      pass,
      message: () =>
        `expected ${received.getMockName()} to have been called with arguments matching ${expected}`,
    }
  },
})

// Test data factories
export const createMockProduct = (overrides = {}) => ({
  id: 'test-product-id',
  name: 'Test Product',
  description: 'Test Description',
  price: 100.00,
  stock_quantity: 50,
  category: 'Tiles',
  supplier_id: 'test-supplier-id',
  user_id: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockCustomer = (overrides = {}) => ({
  id: 'test-customer-id',
  name: 'Test Customer',
  email: 'customer@example.com',
  phone: '+1234567890',
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  pincode: '12345',
  user_id: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockInvoice = (overrides = {}) => ({
  id: 'test-invoice-id',
  invoice_number: 'INV-001',
  customer_id: 'test-customer-id',
  total_amount: 1000.00,
  tax_amount: 180.00,
  status: 'pending',
  due_date: '2024-02-01T00:00:00Z',
  user_id: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'admin',
  permissions: ['read', 'write', 'delete'],
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
}) 