import Link from "next/link";
import { ArrowUpRight, Check, Wifi, WifiOff } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-8 tracking-tight">
              Manage Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                Tile Business
              </span>{" "}
              Anywhere, Anytime
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Complete offline-first business management for tile retailers and
              wholesalers. Handle inventory, billing, and deliveries even
              without internet connectivity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-primary-foreground bg-primary rounded-lg hover:bg-primary/80 transition-colors text-lg font-medium"
              >
                Start Managing Today
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                href="#features"
                className="inline-flex items-center px-8 py-4 text-muted-foreground bg-muted rounded-lg hover:bg-accent transition-colors text-lg font-medium"
              >
                See Features
              </Link>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <WifiOff className="w-5 h-5 text-green-500" />
                <span>Works completely offline</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>GST compliant billing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Multi-language support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
