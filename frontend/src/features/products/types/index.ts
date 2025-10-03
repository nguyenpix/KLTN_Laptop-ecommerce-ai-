export interface ProductImage {
  url: string;
  alt_text: string;
  _id?: string;
}

export interface Product {
  _id: string;
  id: number;
  title: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  images: {
    mainImg: ProductImage;
    sliderImg: ProductImage[];
  };
  specifications: {
    [key: string]: string;
  };
  color: string;
  brand: string;
  faqs: {
    _id: string;
    question: string;
    answer: string;
  }[];
  part_number: string;
  series: string;
  category_id: string[];
}
