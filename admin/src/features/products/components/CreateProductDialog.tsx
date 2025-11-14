'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductFormData } from '@/shared/types';
import { createProduct } from '@/features/products/api';
import { getCategories } from '@/features/categories/api';
import { getColors } from '@/features/colors/api';
import { getBrands } from '@/features/brands/api';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, X } from 'lucide-react';

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductDialog({ open, onOpenChange }: CreateProductDialogProps) {
  const queryClient = useQueryClient();

  // Fetch categories, colors, brands
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: colors = [] } = useQuery({
    queryKey: ['colors'],
    queryFn: getColors,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    title: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    brand_id: '',
    color_id: '',
    category_id: [],
    sku: '',
    tags: [],
    images: {
      mainImg: { url: '', alt_text: '' },
      sliderImg: [],
    },
    specifications: {
      cpu: '',
      gpu: '',
      display: '',
      webcam: '',
      ram: '',
      storage_type: '',
      storage_capacity: '',
      ports: '',
      audio: '',
      connectivity: '',
      keyboard: '',
      os: '',
      size: '',
      battery: '',
      weight: '',
      material: '',
      security: '',
      accessories: '',
    },
  });



  
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success('Tạo sản phẩm thành công', {
        description: 'Sản phẩm mới đã được thêm vào danh sách',
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Lỗi tạo sản phẩm', {
        description: error.message || 'Không thể tạo sản phẩm',
      });
    },
  });

  const handleFieldChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedFieldChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof ProductFormData] as any),
        [field]: value,
      },
    }));
  };



  const handleTagChange = (index: number, value: string) => {
    const newTags = [...(formData.tags || [])];
    newTags[index] = value;
    setFormData((prev) => ({ ...prev, tags: newTags }));
  };

  const handleAddTag = () => {
    setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), ''] }));
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index),
    }));
  };



  const resetForm = () => {
    setFormData({
      title: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
      brand_id: '',
      color_id: '',
      category_id: [],
      sku: '',
      tags: [],
      images: {
        mainImg: { url: '', alt_text: '' },
        sliderImg: [],
      },
      specifications: {
        cpu: '',
        gpu: '',
        display: '',
        webcam: '',
        ram: '',
        storage_type: '',
        storage_capacity: '',
        ports: '',
        audio: '',
        connectivity: '',
        keyboard: '',
        os: '',
        size: '',
        battery: '',
        weight: '',
        material: '',
        security: '',
        accessories: '',
      },
    });
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title || !formData.name || !formData.sku || !formData.brand_id || !formData.color_id || !formData.category_id?.length) {
      toast.error('Vui lòng điền đầy đủ thông tin', {
        description: 'Tiêu đề, Tên sản phẩm, SKU, Brand ID, Color ID, và Category ID là bắt buộc',
      });
      return;
    }

    if (!formData.images?.mainImg?.url) {
      toast.error('Vui lòng thêm hình ảnh chính', {
        description: 'Sản phẩm cần có ít nhất 1 hình ảnh',
      });
      return;
    }

    createMutation.mutate(formData as ProductFormData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo sản phẩm mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo sản phẩm mới. Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu đề <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="VD: Laptop Dell XPS 15 9530"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên sản phẩm <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="VD: Dell XPS 15"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">
                  SKU <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleFieldChange('sku', e.target.value)}
                  placeholder="VD: DELL-XPS-9530-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand_id">
                  Thương hiệu <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.brand_id}
                  onValueChange={(value) => handleFieldChange('brand_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color_id">
                  Màu sắc <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.color_id}
                  onValueChange={(value) => handleFieldChange('color_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn màu sắc" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color._id} value={color._id}>
                        <div className="flex items-center gap-2">
                          {color.hex && (
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.hex }}
                            />
                          )}
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Danh mục <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category._id}`}
                      checked={formData.category_id?.includes(category._id)}
                      onCheckedChange={(checked) => {
                        const currentCategories = formData.category_id || [];
                        if (checked) {
                          handleFieldChange('category_id', [...currentCategories, category._id]);
                        } else {
                          handleFieldChange(
                            'category_id',
                            currentCategories.filter((id) => id !== category._id)
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={`cat-${category._id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
            </div>
          </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Giá <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleFieldChange('price', Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">
                  Tồn kho <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleFieldChange('stock', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Hình ảnh</h3>
            
            <div className="space-y-2">
              <Label htmlFor="mainImg">
                Hình ảnh chính <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mainImg"
                value={formData.images?.mainImg?.url || ''}
                onChange={(e) =>
                  handleNestedFieldChange('images', 'mainImg', {
                    url: e.target.value,
                    alt_text: formData.images?.mainImg?.alt_text || '',
                  })
                }
                placeholder="URL hình ảnh chính"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainImgAlt">Alt text hình ảnh chính</Label>
              <Input
                id="mainImgAlt"
                value={formData.images?.mainImg?.alt_text || ''}
                onChange={(e) =>
                  handleNestedFieldChange('images', 'mainImg', {
                    url: formData.images?.mainImg?.url || '',
                    alt_text: e.target.value,
                  })
                }
                placeholder="Mô tả hình ảnh"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tags</Label>
              <Button type="button" size="sm" variant="outline" onClick={handleAddTag}>
                <Plus className="h-4 w-4 mr-1" /> Thêm tag
              </Button>
            </div>
            <div className="space-y-2">
              {(formData.tags || []).map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    placeholder="Tag"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveTag(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả sản phẩm</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Nội dung mô tả chi tiết về sản phẩm"
              rows={5}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Thông số kỹ thuật</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu">CPU</Label>
                <Input id="cpu" value={formData.specifications?.cpu || ''} onChange={(e) => handleNestedFieldChange('specifications', 'cpu', e.target.value)} placeholder="VD: Intel Core i7-13700H"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpu">GPU</Label>
                <Input id="gpu" value={formData.specifications?.gpu || ''} onChange={(e) => handleNestedFieldChange('specifications', 'gpu', e.target.value)} placeholder="VD: NVIDIA GeForce RTX 4060"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ram">RAM</Label>
                <Input id="ram" value={formData.specifications?.ram || ''} onChange={(e) => handleNestedFieldChange('specifications', 'ram', e.target.value)} placeholder="VD: 16GB DDR5"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage_type">Loại ổ cứng</Label>
                <Input id="storage_type" value={formData.specifications?.storage_type || ''} onChange={(e) => handleNestedFieldChange('specifications', 'storage_type', e.target.value)} placeholder="VD: SSD"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage_capacity">Dung lượng ổ cứng</Label>
                <Input id="storage_capacity" value={formData.specifications?.storage_capacity || ''} onChange={(e) => handleNestedFieldChange('specifications', 'storage_capacity', e.target.value)} placeholder="VD: 1TB"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display">Màn hình</Label>
                <Input id="display" value={formData.specifications?.display || ''} onChange={(e) => handleNestedFieldChange('specifications', 'display', e.target.value)} placeholder="VD: 15.6 inch OLED 3.5K"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webcam">Webcam</Label>
                <Input id="webcam" value={formData.specifications?.webcam || ''} onChange={(e) => handleNestedFieldChange('specifications', 'webcam', e.target.value)} placeholder="VD: 720p"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ports">Cổng kết nối</Label>
                <Input id="ports" value={formData.specifications?.ports || ''} onChange={(e) => handleNestedFieldChange('specifications', 'ports', e.target.value)} placeholder="VD: 2 x Thunderbolt 4, USB-C, ..."/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audio">Âm thanh</Label>
                <Input id="audio" value={formData.specifications?.audio || ''} onChange={(e) => handleNestedFieldChange('specifications', 'audio', e.target.value)} placeholder="VD: 2 loa, Waves MaxxAudio Pro"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="connectivity">Kết nối không dây</Label>
                <Input id="connectivity" value={formData.specifications?.connectivity || ''} onChange={(e) => handleNestedFieldChange('specifications', 'connectivity', e.target.value)} placeholder="VD: Wi-Fi 6, Bluetooth 5.2"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyboard">Bàn phím</Label>
                <Input id="keyboard" value={formData.specifications?.keyboard || ''} onChange={(e) => handleNestedFieldChange('specifications', 'keyboard', e.target.value)} placeholder="VD: Chiclet, có đèn nền"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="os">Hệ điều hành</Label>
                <Input id="os" value={formData.specifications?.os || ''} onChange={(e) => handleNestedFieldChange('specifications', 'os', e.target.value)} placeholder="VD: Windows 11 Pro"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Kích thước</Label>
                <Input id="size" value={formData.specifications?.size || ''} onChange={(e) => handleNestedFieldChange('specifications', 'size', e.target.value)} placeholder="VD: 344.72 x 235.33 x 18.0 mm"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="battery">Pin</Label>
                <Input id="battery" value={formData.specifications?.battery || ''} onChange={(e) => handleNestedFieldChange('specifications', 'battery', e.target.value)} placeholder="VD: 6-cell, 86Wh"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Trọng lượng</Label>
                <Input id="weight" value={formData.specifications?.weight || ''} onChange={(e) => handleNestedFieldChange('specifications', 'weight', e.target.value)} placeholder="VD: 1.86 kg"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Chất liệu</Label>
                <Input id="material" value={formData.specifications?.material || ''} onChange={(e) => handleNestedFieldChange('specifications', 'material', e.target.value)} placeholder="VD: Nhôm"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="security">Bảo mật</Label>
                <Input id="security" value={formData.specifications?.security || ''} onChange={(e) => handleNestedFieldChange('specifications', 'security', e.target.value)} placeholder="VD: Vân tay, Camera IR"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessories">Phụ kiện</Label>
                <Input id="accessories" value={formData.specifications?.accessories || ''} onChange={(e) => handleNestedFieldChange('specifications', 'accessories', e.target.value)} placeholder="VD: Sạc, sách hướng dẫn"/>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={createMutation.isPending}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Tạo sản phẩm
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
