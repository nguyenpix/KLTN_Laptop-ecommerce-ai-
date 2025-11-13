// src/app/(main)/page.tsx
"use client";
import HomeBanner from "@/features/products/components/HomeBanner";
import ProductCard from "@/features/products/components/ProductCard";
import { useProducts } from "@/features/products/hook/useProducts";
import { useBrands } from "@/features/products/hook/useBrands";
import { Product } from "@/features/products/types";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const { data: brandsData } = useBrands();
  const brands = brandsData?.data || [];

  // Tìm brand_id từ tên brand
  const getBrandId = (brandName: string) => {
    const brand = brands.find((b: any) => b.name.toLowerCase() === brandName.toLowerCase());
    return brand?._id || "";
  };

  const { data: newProducts, isLoading: loadingNew } = useProducts({ tags: "New", limit: 6 });
  const { data: msiProducts, isLoading: loadingMSI } = useProducts({ brand: getBrandId("Msi"), limit: 4 });
  const { data: acerProducts, isLoading: loadingAcer } = useProducts({ brand: getBrandId("Acer"), limit: 4 });
  const { data: dellProducts, isLoading: loadingDell } = useProducts({ brand: getBrandId("Dell"), limit: 4 });
  const { data: lenovoProducts, isLoading: loadingLenovo } = useProducts({ brand: getBrandId("Lenovo"), limit: 4 });

  const isLoading = loadingNew || loadingMSI || loadingAcer || loadingDell || loadingLenovo || !brands.length;

  if (isLoading) {
    return <div className="text-center py-10"> Đang tải sản phẩm...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Banner quảng cáo */}
      <HomeBanner />

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* New Products */}
        <ProductSection
          title="New Products"
          products={newProducts?.data || []}
          viewAllLink="/products?tags=New"
        />

        {/* MSI */}
        <ProductSection
          title="MSI"
          products={msiProducts?.data || []}
          viewAllLink={`/products?brand=${getBrandId("Msi")}`}
          bannerImage="/assets/image/msi.png"
        />

        {/* Acer */}
        <ProductSection
          title="Acer"
          products={acerProducts?.data || []}
          viewAllLink={`/products?brand=${getBrandId("Acer")}`}
          bannerImage="/assets/image/acer.jpg"
        />

        {/* Dell */}
        <ProductSection
          title="Dell"
          products={dellProducts?.data || []}
          viewAllLink={`/products?brand=${getBrandId("Dell")}`}
          bannerImage="/assets/image/dell.jpg"
        />

        {/* Lenovo */}
        <ProductSection
          title="Lenovo"
          products={lenovoProducts?.data || []}
          viewAllLink={`/products?brand=${getBrandId("Lenovo")}`}
          bannerImage="/assets/image/lenovo.jpg"
        />

        {/* Brand Logos */}
        <section className="py-12 ">
          <div className="flex flex-wrap items-center justify-center gap-12">
            {[
              { name: "LENOVO", logo: "/assets/image/logo_lenovo.png" },
              { name: "MSI", logo: "/assets/image/logo msi.png" },
              { name: "DELL", logo: "/assets/image/logo dell.png" },
              { name: "ACER", logo: "/assets/image/logo_acer.png" },
            ].map((brand) => (
              <div key={brand.name} className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 cursor-pointer">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={200}
                  height={100}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Instagram Section */}
        <section className="py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Follow us on Instagram for News, Offers & More</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
              <div key={item} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <Image
                  src={`/assets/image/banner${item % 4 + 1}.jpg`}
                  alt={`Instagram post ${item}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <p className="text-white text-sm text-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    If you've recently made a desktop PC or laptop purchase, adding peripherals to enhance your home office setup...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-12 bg-white rounded-lg">
          <div className="max-w-4xl mx-auto text-center px-8">
            <div className="mb-6">
              <span className="text-6xl text-blue-600">"</span>
            </div>
            <blockquote className="text-lg text-gray-700 leading-relaxed mb-6">
              My first order arrived today in perfect condition. From the time I sent a question about the item to making the purchase, to the shipping and now the delivery, your company, Tecs, has stayed in touch. Such great customer service. I look forward to shopping on your site in the future and would highly recommend it.
            </blockquote>
            <div className="text-sm text-gray-500 mb-4">- Tama Brown</div>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4].map((dot) => (
                <button
                  key={dot}
                  className={`w-2 h-2 rounded-full ${dot === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-label={`Go to testimonial ${dot}`}
                />
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/reviews"
                className="inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
              >
                Leave Us A Review
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Component ProductSection
interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllLink: string;
  badge?: string;
  bannerImage?: string;
}

function ProductSection({ title, products, viewAllLink, badge, bannerImage }: ProductSectionProps) {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Link
          href={viewAllLink}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
        >
          See All {products.length} Items →
        </Link>
      </div>
      
      <div className="flex gap-6">
        {/* Brand Banner Image - Left Side */}
        {bannerImage && (
          <div className="w-[220px] flex-shrink-0">
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <Image
                src={bannerImage}
                alt={`${title} Banner`}
                width={220}
                height={500}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>
        )}
        
        {/* Products Grid - Right Side - Fixed width cards */}
        <div className={`flex-1 ${bannerImage ? 'grid grid-cols-4 gap-4' : 'grid grid-cols-6 gap-4'}`}>
          {products.map((product: Product) => (
            <div key={product._id} className="w-full">
              <ProductCard product={product} badge={badge} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
