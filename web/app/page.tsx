"use client";
import { ArrowRight, Star, Sparkles, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function ScentPalaceLanding() {
  return (
    <div className="min-h-screen  text-gray-800 font-sans antialiased bg-gradient-to-br from-purple-50 via-white to-purple-50/40">
      <header>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-bold text-purple-700 tracking-tight">
              SCENT PALACE
            </span>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 ml-2 hidden sm:inline-flex">
              Luxury
            </Badge>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-purple-700 transition-colors">
              New Arrivals
            </a>
            <a href="#" className="hover:text-purple-700 transition-colors">
              Best Sellers
            </a>
            <a href="#" className="hover:text-purple-700 transition-colors">
              Collections
            </a>
            <a href="#" className="hover:text-purple-700 transition-colors">
              About
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden  md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-1.5 rounded-full text-sm font-medium">
                  <Sparkles className="h-4 w-4" /> 2026 Winter Collection
                </div>
                <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
                  Discover Your <br />
                  <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                    Signature Scent
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-lg">
                  Every fragrance tells a story. Explore our curated palette of
                  luxury perfumes crafted for those who dare to be
                  unforgettable.
                </p>
                <div className="flex flex-col md:flex-row flex-wrap gap-4">
                  <Button className=" bg-purple-700 hover:bg-purple-800 text-white shadow-xl shadow-purple-200 rounded-full px-8 py-6 text-base">
                    Explore Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 rounded-full px-8 py-6 text-base"
                  >
                    View Collection
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-purple-500" /> COD
                    Payment
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-purple-500" /> 100%
                    Guarantee
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-purple-500" /> Premium Quality
                  </span>
                </div>
              </div>
              <div className="relative flex-">
                <Image
                  src={"/scent-palace.png"}
                  alt="scent palace hero"
                  height={600}
                  width={600}
                />
              </div>
            </div>
          </div>
        </section>

        {/* New Winter Collection */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
              <div>
                <Badge className="bg-purple-100 text-purple-800 border-none mb-2">
                  Seasonal
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Winter Reserve Collection
                </h2>
                <p className="text-gray-500 max-w-xl mt-1">
                  Warm, woody and mysterious — our winter edit for the
                  discerning.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50 rounded-full"
              >
                See More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {["Oud Noir", "Velvet Amber", "Iris Glow", "Santal Royal"].map(
                (name) => (
                  <Card
                    key={name}
                    className="border-0 shadow-md hover:shadow-xl transition-shadow rounded-2xl overflow-hidden bg-purple-50/40"
                  >
                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center p-6">
                      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-full shadow-inner">
                        <span className="text-4xl">🪷</span>
                      </div>
                    </div>
                    <CardContent className="p-4 text-center">
                      <h4 className="font-semibold text-gray-800">{name}</h4>
                      <p className="text-sm text-purple-600 font-medium">
                        $45.00
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 text-xs"
                      >
                        Add to Bag
                      </Button>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
            <div className="mt-8 text-center">
              <p className="text-sm text-purple-600 font-medium bg-purple-50 inline-block px-6 py-2 rounded-full">
                Use <span className="font-bold">SCENT20</span> to get 20% off
                your first order
              </p>
            </div>
          </div>
        </section>

        {/* Trending Items */}
        <section className="py-16 bg-gray-50/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-gray-900">
                Trending Scents
              </h2>
              <span className="text-sm text-purple-600 font-medium">
                Most loved this season
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { name: "Minimalist Musk", price: "$25.70", badge: "Fresh" },
                { name: "Luxury Oud", price: "$30.60", badge: "Rich" },
                { name: "Colour Bloom", price: "$25.70", badge: "Floral" },
                { name: "Pinky Winky", price: "$109.00", badge: "Bold" },
                { name: "Holiday Vibes", price: "$51.20", badge: "Cozy" },
                { name: "Swaggie Shaggy", price: "$81.30", badge: "Warm" },
                { name: "Red Formal", price: "$66.80", badge: "Elegant" },
              ].map((item) => (
                <Card
                  key={item.name}
                  className="border-0 shadow-sm hover:shadow-lg transition-all rounded-2xl overflow-hidden bg-white"
                >
                  <div className="h-32 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center relative">
                    <Badge className="absolute top-2 left-2 bg-purple-600 text-white border-none text-xs">
                      {item.badge}
                    </Badge>
                    <span className="text-5xl">🧴</span>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-purple-600 font-bold">{item.price}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-700 hover:text-purple-900 hover:bg-purple-50 p-0 mt-1"
                    >
                      Quick View
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <div className="bg-purple-50/60 p-8 md:p-12 rounded-3xl shadow-inner">
              <div className="flex justify-center mb-4">
                <div className="flex text-purple-500">★★★★★</div>
              </div>
              <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed">
                “I absolutely love the designs and styles that Scent Palace
                creates. Each perfume is so different and innovative. I have
                bought several times from the collections and what I love is
                that they really are timeless scents and the quality of the
                ingredients is divine.... I look forward to seeing the new
                collections from season to season.”
              </p>
              <p className="mt-6 font-semibold text-gray-900">Alicia Puma</p>
              <p className="text-sm text-gray-500">Scent Enthusiast</p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-gradient-to-r from-purple-50 to-purple-100/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-purple-200 text-purple-800 border-none">
                  Our Story
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                  The Scent Palace Story
                </h2>
                <p className="text-gray-600 mt-4 leading-relaxed">
                  Born from a passion for olfactory art, Scent Palace is where
                  memory meets modernity. Our master perfumers blend rare
                  ingredients with contemporary flair — because your fragrance
                  should be as unique as you are.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-full"
                >
                  Read the story <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="relative flex justify-center">
                <div className="w-64 h-64 rounded-full bg-purple-200/50 flex items-center justify-center shadow-xl">
                  <span className="text-8xl">🏛️</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-purple-700 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Join Our Scent Community</h2>
            <p className="text-purple-100 mt-2">
              Subscribe for exclusive drops, fragrance stories and 10% off your
              next order.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/20 border-white/30 text-white placeholder:text-purple-200 rounded-full px-6 py-6 flex-1"
              />
              <Button className="bg-white text-purple-700 hover:bg-purple-50 rounded-full px-8 py-6">
                Subscribe <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
              <div className="col-span-2 md:col-span-1">
                <h4 className="text-white font-bold text-xl mb-4">
                  SCENT PALACE
                </h4>
                <p className="text-sm text-gray-400 max-w-xs">
                  Build a modern and creative fragrance experience with Scent
                  Palace.
                </p>
                <div className="flex gap-3 mt-4">
                  <span className="bg-gray-800 p-2 rounded-full">📷</span>
                  <span className="bg-gray-800 p-2 rounded-full">🐦</span>
                  <span className="bg-gray-800 p-2 rounded-full">📌</span>
                </div>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Products</h5>
                <ul className="space-y-2 text-sm">
                  <li>Landingpage</li>
                  <li>Features</li>
                  <li>Documentation</li>
                  <li>Referral Program</li>
                  <li>Pricing</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Services</h5>
                <ul className="space-y-2 text-sm">
                  <li>Documentation</li>
                  <li>Design</li>
                  <li>Themes</li>
                  <li>Illustrations</li>
                  <li>UI Kit</li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-3">Company</h5>
                <ul className="space-y-2 text-sm">
                  <li>About</li>
                  <li>Terms</li>
                  <li>Privacy Policy</li>
                  <li>Careers</li>
                </ul>
              </div>
            </div>
            <div className="pt-8 text-center text-sm text-gray-500">
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                {Array.from({ length: 30 }, (_, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-800 px-2 py-0.5 rounded"
                  >
                    STORE {i + 1}
                  </span>
                ))}
              </div>
              <p>&copy; 2026 Scent Palace. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
