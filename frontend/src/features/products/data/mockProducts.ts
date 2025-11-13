import { Product } from "@/features/products/types";

export const MOCK_PRODUCTS: Product[] = [
  {
    _id: "1",
    id: 1,
    title: "Laptop Acer Nitro V 15 ProPanel ANV15-51-56D5",
    name: "Nitro V 15 ProPanel ANV15-51-56D5",
    description:
      "<p>Laptop ACER Nitro V ANV15-51-56D5 là mẫu laptop gaming mạnh mẽ.</p>",
    price: 21990000,
    images: {
      mainImg: {
        url: "https://lh3.googleusercontent.com/_N44NEbYbkrFbqQqvClfU1m6TmChx07mv_YvC0IGyUsRpqH6QAZS4Fi430H9rm92rTyXim36czraFixF7FED0mEQv_weaFg=rw",
        alt_text: "Laptop Acer Nitro",
      },
      sliderImg: [],
    },
    sku: "SKU123",
    specifications: {},
    color: "Black",
    brand: "Acer",
    faqs: [],
    part_number: "PN123",
    series: "Nitro",
    category_id: ["cat1"],
  },
  {
    _id: "2",
    id: 2,
    title: "MSI Modern 14 C12M-210VN",
    name: "MSI Modern 14 C12M-210VN",
    description:
      "<p>Dòng laptop mỏng nhẹ, phù hợp cho công việc văn phòng và học tập.</p>",
    price: 13500000,
    images: {
      mainImg: {
        url: "https://lh3.googleusercontent.com/_N44NEbYbkrFbqQqvClfU1m6TmChx07mv_YvC0IGyUsRpqH6QAZS4Fi430H9rm92rTyXim36czraFixF7FED0mEQv_weaFg=rw",
        alt_text: "MSI Modern Laptop",
      },
      sliderImg: [],
    },
    sku: "SKU124",
    specifications: {},
    color: "Silver",
    brand: "MSI",
    faqs: [],
    part_number: "PN124",
    series: "Modern",
    category_id: ["cat2"],
  },
  {
    _id: "3",
    id: 3,
    title: "Asus ROG Strix G15",
    name: "Asus ROG Strix G15",
    description: "<p>Mẫu laptop gaming cao cấp, hiệu năng vượt trội.</p>",
    price: 32000000,
    images: {
      mainImg: {
        url: "https://lh3.googleusercontent.com/_N44NEbYbkrFbqQqvClfU1m6TmChx07mv_YvC0IGyUsRpqH6QAZS4Fi430H9rm92rTyXim36czraFixF7FED0mEQv_weaFg=rw",
        alt_text: "Asus ROG Laptop",
      },
      sliderImg: [],
    },
    sku: "SKU125",
    specifications: {},
    color: "Black",
    brand: "Asus",
    faqs: [],
    part_number: "PN125",
    series: "ROG",
    category_id: ["cat1"],
  },
  {
    _id: "4",
    id: 4,
    title: "Dell XPS 13 9315",
    name: "Dell XPS 13 9315",
    description:
      "<p>Thiết kế sang trọng, màn hình sắc nét, trải nghiệm đỉnh cao.</p>",
    price: 28000000,
    images: {
      mainImg: {
        url: "https://lh3.googleusercontent.com/_N44NEbYbkrFbqQqvClfU1m6TmChx07mv_YvC0IGyUsRpqH6QAZS4Fi430H9rm92rTyXim36czraFixF7FED0mEQv_weaFg=rw",
        alt_text: "Dell XPS Laptop",
      },
      sliderImg: [],
    },
    sku: "SKU126",
    specifications: {},
    color: "White",
    brand: "Dell",
    faqs: [],
    part_number: "PN126",
    series: "XPS",
    category_id: ["cat3"],
  },
];
