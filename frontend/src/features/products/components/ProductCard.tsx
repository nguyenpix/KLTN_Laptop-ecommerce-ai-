import { Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// CẬP NHẬT GIAO DIỆN KIỂU DỮ LIỆU ĐỂ PHÙ HỢP VỚI CẤU TRÚC JSON MỚI
export interface Product {
    id: number;
    title: string;
    name: string;
    description?: string;
    price: number;
    priceDiscount?: number; // Giữ lại cho khả năng có sau này
    images: {
        mainImg: {
            url: string;
            alt_text: string;
        };
        sliderImg: Array<{
            url: string;
            alt_text: string;
        }>;
    };
    // Giả định: Có thể thêm trường reviews sau này
    reviews?: number; 
}

interface ProductCardProps {
    product: Product;
    layout?: 'grid' | 'list';
}

const ProductCard = ({ product, layout = 'grid' }: ProductCardProps) => {

    // Giữ lại hàm renderStars, sử dụng giá trị giả định nếu không có
    const renderStars = (rating: number = 0) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
                />
            );
        }
        return stars;
    };

    if (layout === 'list') {
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
                        <div className="flex items-center mb-2">{renderStars(product.reviews)}</div>
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
                            {product.priceDiscount && (
                                <p className="text-xl font-bold text-red-600">{product.priceDiscount.toLocaleString('vi-VN')}đ</p>
                            )}
                            <p className={`text-sm text-gray-500 ${product.priceDiscount ? 'line-through' : 'font-bold text-lg'}`}>
                                {product.price.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <Button size="sm">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Thêm vào giỏ
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
                <div className="flex items-center mb-2">{renderStars(product.reviews)}</div>
                <h3 className="font-semibold text-sm leading-tight h-10 overflow-hidden hover:text-blue-600 cursor-pointer">
                    {product.name}
                </h3>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-col items-start">
                <div className="mb-3">
                    {product.priceDiscount && (
                        <p className="text-lg font-bold text-red-600">{product.priceDiscount.toLocaleString('vi-VN')}đ</p>
                    )}
                    <p className={`text-xs text-gray-500 ${product.priceDiscount ? 'line-through' : 'font-semibold text-base'}`}>
                        {product.price.toLocaleString('vi-VN')}đ
                    </p>
                </div>
                <Button className="w-full" size="sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Thêm vào giỏ hàng
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProductCard;