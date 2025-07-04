'use client'

import { useState } from 'react'
import { getProducts } from '../actions/inventory'
import { getCustomers } from '../actions/customers'
import { getOrCreateSettings } from '../actions/settings'

export default function TestDBPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    setLoading(true)
    const testResults: any = {}

    try {
      // Test products
      const productsResult = await getProducts()
      testResults.products = productsResult

      // Test customers
      const customersResult = await getCustomers()
      testResults.customers = customersResult

      // Test settings
      const settingsResult = await getOrCreateSettings()
      testResults.settings = settingsResult

      setResults(testResults)
    } catch (error) {
      console.error('Database test failed:', error)
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      <button
        onClick={testDatabase}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Database Connection'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 