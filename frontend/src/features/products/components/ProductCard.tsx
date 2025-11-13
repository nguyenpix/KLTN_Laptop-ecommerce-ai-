import { Star, ShoppingCart, Heart } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Product } from "@/features/products/types";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
  badge?: string;
}

const ProductCard = ({ product, layout = "grid", badge }: ProductCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product._id);

  const renderStars = (rating: number = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
        />
      );
    }
    return stars;
  };

  const getBadgeColor = (badgeText?: string) => {
    if (!badgeText) return "bg-blue-500";
    const colors: Record<string, string> = {
      "CHARLIE_YT": "bg-orange-500",
      "BRAVO_YT": "bg-red-500",
      "ALPHA_YT": "bg-purple-500",
      "ZETA_YT": "bg-indigo-500",
      "DELTA_YT": "bg-blue-500",
      "Custom": "bg-orange-500",
    };
    return colors[badgeText] || "bg-blue-500";
  };

  if (layout === "list") {
    return (
      <Card className="w-full flex flex-row overflow-hidden transition-shadow hover:shadow-lg">
        <div className="w-1/4 flex-shrink-0 relative">
          <Image
            src={product.images.mainImg.url}
            alt={product.images.mainImg.alt_text}
            fill
            className="object-cover"
          />
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product._id);
            }}
            className={`absolute top-2 left-2 z-10 p-2 rounded-full shadow-md transition-all ${
              isWishlisted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white hover:bg-gray-100'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart 
              className={`w-4 h-4 ${
                isWishlisted 
                  ? 'fill-white text-white' 
                  : 'text-gray-600'
              }`}
            />
          </button>
        </div>
        <div className="w-3/4 p-4 flex flex-col">
          <CardHeader className="p-0 mb-2">
            <h3 className="font-semibold text-lg leading-tight hover:text-blue-600 cursor-pointer">
              {product.name}
            </h3>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            {/* <div className="flex items-center mb-2">{renderStars(product.reviews)}</div> */}
            {/* SỬ DỤNG TRƯỜNG DESCRIPTION MỚI VÀ DANGEROUSETINNERHTML */}
            {product.description && (
              <p
                className="text-sm text-gray-500 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
          </CardContent>
          <CardFooter className="p-0 flex items-end justify-between">
            <div>
              <p className={`text-sm text-gray-500 `}>
                {product.price.toLocaleString("vi-VN")}đ
              </p>
            </div>
            <Button size="sm">
              <ShoppingCart
                className="w-4 h-4 mr-2"
                onClick={() => useCartStore.getState().addToCart(product, 1)}
              />
              Thêm vào giỏ hàng
            </Button>
          </CardFooter>
        </div>
      </Card>
    );
  }

  // Chế độ Grid (mặc định)
  return (
    <Card className="group w-full flex flex-col overflow-hidden transition-all hover:shadow-xl border border-gray-200 hover:border-blue-300 bg-white">
      <CardHeader className="p-0 relative overflow-hidden">
        <div className="relative w-full aspect-square bg-gray-100">
          {badge && (
            <Badge className={`absolute top-2 right-2 z-10 ${getBadgeColor(badge)} text-white text-xs px-2 py-1`}>
              {badge}
            </Badge>
          )}
          
          {/* Image with zoom effect */}
          <Image
            src={product.images.mainImg.url}
            alt={product.images.mainImg.alt_text}
            fill
            className="object-contain transition-all duration-300 group-hover:scale-110"
          />
          
          {/* Overlay that appears on hover */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-[1]"></div>
          
          {/* Action buttons - top right corner, stacked vertically */}
          <div className="absolute top-3 right-3 z-[3] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product._id);
              }}
              className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${
                isWishlisted 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white hover:bg-gray-100'
              }`}
              aria-label="Add to wishlist"
            >
              <Heart 
                className={`w-5 h-5 ${
                  isWishlisted 
                    ? 'fill-white text-white' 
                    : 'text-gray-600'
                }`}
              />
            </button>
            
            {/* Add to Cart Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                useCartStore.getState().addToCart(product, 1);
              }}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all transform hover:scale-110"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-6 h-6" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow flex flex-col">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {renderStars(4)}
          <span className="text-xs text-gray-500 ml-1">(0)</span>
        </div>
        
        {/* Product Name */}
        <Link
          href={`/products/${product._id}`}
          className="font-medium text-sm leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer mb-2 flex-grow"
        >
          {product.title || product.name}
        </Link>
        
        {/* Specs */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">
            {product.specifications.cpu || product.specifications.processor || Object.values(product.specifications)[0]}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0 flex flex-col items-start gap-2">
        {/* Price */}
        <div className="w-full">
          <p className="text-base font-bold text-gray-900">
            ${product.price.toLocaleString("en-US")}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
