import Link from "next/link";
import { Twitter, Linkedin, Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-white mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-gray-300 hover:text-orange-400"
                >
                  Inventory Management
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-gray-300 hover:text-orange-400"
                >
                  GST Billing
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-gray-300 hover:text-orange-400"
                >
                  Delivery Tracking
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-gray-300 hover:text-orange-400"
                >
                  Offline Mode
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div>
            <h3 className="font-semibold text-white mb-4">Solutions</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-orange-400">
                  Tile Retailers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-orange-400">
                  Wholesalers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-orange-400">
                  Distributors
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-orange-400">
                  Contractors
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-orange-400">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-orange-400">
                  Training Videos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-orange-400">
                  User Guide
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-orange-400">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>support@tilemanager.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-orange-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-orange-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700">
          <div className="text-gray-400 mb-4 md:mb-0">
            © {currentYear} TileManager Pro. All rights reserved.
          </div>

          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-orange-400">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-orange-400">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href="mailto:support@tilemanager.com"
              className="text-gray-400 hover:text-orange-400"
            >
              <span className="sr-only">Email</span>
              <Mail className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
