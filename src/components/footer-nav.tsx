import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Boxes, Users, Truck, FileText, ShoppingCart, ClipboardList, BarChart2, Settings, CreditCard } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Boxes },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/dashboard/purchase-orders', label: 'Purchase Orders', icon: FileText },
  { href: '/dashboard/billing', label: 'Billing', icon: ShoppingCart },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/deliveries', label: 'Deliveries', icon: ClipboardList },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart2 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function FooterNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg flex items-center h-20 md:h-16 px-2 md:px-8 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="flex flex-1 min-w-0 justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 px-2 md:px-3 py-2 min-w-[80px] md:min-w-[72px] text-xs font-medium transition-all duration-200 rounded-lg mx-1 ${
                active 
                  ? 'text-orange-600 bg-orange-50 shadow-sm' 
                  : 'text-gray-500 hover:text-orange-600 hover:bg-gray-50'
              }`}
              tabIndex={0}
            >
              <Icon className={`h-6 w-6 md:h-5 md:w-5 mb-1 ${active ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className="text-xs md:text-xs leading-tight">{label}</span>
            </Link>
          )
        })}
      </div>
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent z-10" />
    </nav>
  )
} 