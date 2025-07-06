import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  Calculator,
  Package,
  Users,
  Truck,
  FileText,
  Shield,
  Globe,
  WifiOff,
} from "lucide-react";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Built for Tile Business Success
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your tile retail or wholesale
              business efficiently, with specialized features designed for the
              tile industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Calculator className="w-6 h-6" />,
                title: "Area-to-Box Conversion",
                description:
                  "Automatically calculate boxes needed from area measurements with precise tile-specific conversions",
              },
              {
                icon: <Package className="w-6 h-6" />,
                title: "Smart Inventory Management",
                description:
                  "Track tile stock with low-stock alerts and automated purchase order generation",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "GST Compliant Billing",
                description:
                  "Generate professional invoices with automatic GST calculations and compliance",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Customer & Supplier Ledgers",
                description:
                  "Manage relationships with payment tracking and credit management",
              },
              {
                icon: <Truck className="w-6 h-6" />,
                title: "Delivery Management",
                description:
                  "Track deliveries for tile projects with scheduling and status updates",
              },
              {
                icon: <WifiOff className="w-6 h-6" />,
                title: "Complete Offline Mode",
                description:
                  "Full functionality without internet - sync when connectivity returns",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-orange-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Reliability Section */}
      <section className="py-20 bg-card text-card-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Secure & Reliable</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your business data is protected with enterprise-grade security and
              works reliably in any environment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "End-to-End Encryption",
                description:
                  "All your business data is encrypted and secure with optional cloud sync",
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Multi-Language Support",
                description:
                  "Available in English, Hindi, and regional languages for diverse teams",
              },
              {
                icon: <WifiOff className="w-8 h-8" />,
                title: "Offline-First Design",
                description:
                  "Never lose productivity - works completely without internet connection",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-orange-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-orange-100">Tile Businesses Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">₹50L+</div>
              <div className="text-orange-100">Monthly Transactions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-orange-100">Offline Reliability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Transform Your Tile Business Today
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of tile retailers and wholesalers who have streamlined
            their operations with our specialized business management solution.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 text-primary-foreground bg-primary rounded-lg hover:bg-primary/80 transition-colors text-lg font-medium"
          >
            Start Your Free Trial
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
