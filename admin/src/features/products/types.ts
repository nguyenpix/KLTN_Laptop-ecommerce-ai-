export interface Product {
  _id: string;
  id: number;
  title: string;
  description: { name: string; title: string; }[];
  images: {
    mainImg: { url: string; alt_text: string; };
    sliderImg: { url: string; alt_text: string; }[];
  };
  price: number;
  stock: number;
  brand: string;
  sku: string;
  category_id: string[]; 
  tags: string[];
  gender: 'Nam' | 'Nữ';
  origin: string;
  color_id: string[]; 
  specifications: {
    weight: string;
    movement: string;
    size: string;
    thickness: string;
    band_variation: string;
    glass_material: string;
    water_resistance_level: string;
    dial_shape: string;
  };
  createdAt: string;
  updatedAt: string;
}
