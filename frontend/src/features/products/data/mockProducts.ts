import { Product } from "@/features/products/components/ProductCard";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Laptop Acer Nitro V 15 ProPanel ANV15-51-56D5",
    name: "Nitro V 15 ProPanel ANV15-51-56D5",
    description:
      "<p>Laptop ACER Nitro V ANV15-51-56D5 là mẫu laptop gaming mạnh mẽ.</p>",
    price: 21990000,
    priceDiscount: 19990000,
    images: {
      mainImg: {
        url: "https://lh3.googleusercontent.com/_N44NEbYbkrFbqQqvClfU1m6TmChx07mv_YvC0IGyUsRpqH6QAZS4Fi430H9rm92rTyXim36czraFixF7FED0mEQv_weaFg=rw",
        alt_text: "Laptop Acer Nitro",
      },
      sliderImg: [],
    },
    reviews: 4,
  },
  {
    id: 2,
    title: "MSI Modern 14 C12M-210VN",
    name: "MSI Modern 14 C12M-210VN",
    description:
      "<p>Dòng laptop mỏng nhẹ, phù hợp cho công việc văn phòng và học tập.</p>",
    price: 13500000,
    priceDiscount: undefined,
    images: {
      mainImg: {
        url: "https://lh3.googleusercontent.com/_N44NEbYbkrFbqQqvClfU1m6TmChx07mv_YvC0IGyUsRpqH6QAZS4Fi430H9rm92rTyXim36czraFixF7FED0mEQv_weaFg=rw",
        alt_text: "MSI Modern Laptop",
      },
      sliderImg: [],
    },
    reviews: 5,
  },
  {
    id: 3,
    title: "Asus ROG Strix G15",
    name: "Asus ROG Strix G15",
    description: "<p>Mẫu laptop gaming cao cấp, hiệu năng vượt trội.</p>",
    price: 32000000,
    priceDiscount: 29500000,
    images: {
      mainImg: {
        url: "https://lh3.googleusercontent.com/_N44NEbYbkrFbqQqvClfU1m6TmChx07mv_YvC0IGyUsRpqH6QAZS4Fi430H9rm92rTyXim36czraFixF7FED0mEQv_weaFg=rw",
        alt_text: "Asus ROG Laptop",
      },
      sliderImg: [],
    },
    reviews: 4,
  },
  {
    id: 4,
    title: "Dell XPS 13 9315",
    name: "Dell XPS 13 9315",
    description:
      "<p>Thiết kế sang trọng, màn hình sắc nét, trải nghiệm đỉnh cao.</p>",
    price: 28000000,
    priceDiscount: undefined,
    images: {
      mainImg: {
        url: "https://lh3.googleusercontent.com/_N44NEbYbkrFbqQqvClfU1m6TmChx07mv_YvC0IGyUsRpqH6QAZS4Fi430H9rm92rTyXim36czraFixF7FED0mEQv_weaFg=rw",
        alt_text: "Dell XPS Laptop",
      },
      sliderImg: [],
    },
    reviews: 5,
  },
];
