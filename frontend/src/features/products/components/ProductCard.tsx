import { Star, ShoppingCart } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/features/products/types"; // Import Product từ nguồn chính xác
interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list";
}

const ProductCard = ({ product, layout = "grid" }: ProductCardProps) => {
  // Giữ lại hàm renderStars, sử dụng giá trị giả định nếu không có
  // const renderStars = (rating: number = 0) => {
  //     const stars = [];
  //     for (let i = 1; i <= 5; i++) {
  //         stars.push(
  //             <Star
  //                 key={i}
  //                 className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
  //             />
  //         );
  //     }
  //     return stars;
  // };

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
    <Card className="w-full max-w-xs flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-0 border-b">
        <div className="relative w-full h-48">
          <Image
            src={product.images.mainImg.url}
            alt={product.images.mainImg.alt_text}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        
        <Link
          href={`/products/${product._id}`}
          className="font-semibold text-sm leading-tight h-10 overflow-hidden hover:text-blue-600 cursor-pointer"
        >
          {product.title}
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start">
        <div className="mb-3">
         
          <p
            className={`text-xs text-gray-500 text-base"
            }`}
          >
            {product.price.toLocaleString("vi-VN")}đ
          </p>
        </div>
        <Button
          className="w-full"
          size="sm"
          onClick={() => useCartStore.getState().addToCart(product, 1)}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Thêm vào giỏ hàng
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
