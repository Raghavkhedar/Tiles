'use client'

import { useState } from 'react'
import { createCategory, createSupplier } from '../actions/inventory'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export default function SetupSampleDataPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const sampleCategories = [
    { name: 'Floor Tiles', description: 'Tiles for flooring applications' },
    { name: 'Wall Tiles', description: 'Tiles for wall applications' },
    { name: 'Vitrified Tiles', description: 'High-quality vitrified tiles' },
    { name: 'Ceramic Tiles', description: 'Traditional ceramic tiles' },
    { name: 'Granite Tiles', description: 'Natural granite tiles' },
    { name: 'Marble Tiles', description: 'Natural marble tiles' },
  ]

  const sampleSuppliers = [
    {
      name: 'ABC Ceramics Ltd',
      contact_person: 'Rajesh Kumar',
      phone: '+91-9876543210',
      email: 'rajesh@abcceramics.com',
      address: '123 Industrial Area, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      gst_number: '07AABC1234567890',
      pan_number: 'AABC123456',
      credit_limit: 500000,
      payment_terms: '30 days',
      rating: 4.5,
      status: 'Active'
    },
    {
      name: 'Premium Tiles Co',
      contact_person: 'Priya Sharma',
      phone: '+91-9876543211',
      email: 'priya@premiumtiles.com',
      address: '456 Business Park, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      gst_number: '27PPTC1234567890',
      pan_number: 'PPTC123456',
      credit_limit: 750000,
      payment_terms: '45 days',
      rating: 4.8,
      status: 'Active'
    },
    {
      name: 'Stone Masters',
      contact_person: 'Amit Patel',
      phone: '+91-9876543212',
      email: 'amit@stonemasters.com',
      address: '789 Stone Street, Jaipur',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      gst_number: '08SMS1234567890',
      pan_number: 'SMS123456',
      credit_limit: 300000,
      payment_terms: '15 days',
      rating: 4.2,
      status: 'Active'
    }
  ]

  const setupSampleData = async () => {
    setLoading(true)

    try {
      // Create categories
      for (const category of sampleCategories) {
        await createCategory(category)
      }

      // Create suppliers
      for (const supplier of sampleSuppliers) {
        await createSupplier(supplier)
      }

      toast({
        title: "Success!",
        description: "Sample categories and suppliers created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sample data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Setup Sample Data</h1>
      <p className="text-gray-600 mb-6">
        This will create sample categories and suppliers for testing the forms.
      </p>
      
      <Button
        onClick={setupSampleData}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Sample Data...
          </>
        ) : (
          'Create Sample Categories & Suppliers'
        )}
      </Button>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Sample Categories:</h2>
        <ul className="list-disc list-inside space-y-1">
          {sampleCategories.map((category, index) => (
            <li key={index} className="text-gray-700">
              {category.name} - {category.description}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Sample Suppliers:</h2>
        <ul className="list-disc list-inside space-y-1">
          {sampleSuppliers.map((supplier, index) => (
            <li key={index} className="text-gray-700">
              {supplier.name} - {supplier.contact_person}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 