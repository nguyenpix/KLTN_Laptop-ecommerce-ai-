'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, ProductFormData } from '@/shared/types';
import { getProductById, updateProduct } from '@/features/products/api';
import { getCategories } from '@/features/categories/api/index';
import { getColors } from '@/features/colors/api/index';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { 
  Edit, ArrowLeft, Package, DollarSign, Hash, Tag, MapPin, User, 
  Save, X, Plus, Trash2, Check 
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: colorsData } = useQuery({
    queryKey: ['colors'],
    queryFn: getColors,
  });

  const categories = categoriesData || [];
  const colors = colorsData || [];

  
  useEffect(() => {
    if (product && !isEditing) {
      setFormData(product);
      setHasChanges(false);
    }
  }, [product, isEditing]);

  
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Product>) => {
      
      const formattedData: Partial<ProductFormData> = {
        ...data,
        category_id: Array.isArray(data.category_id) 
          ? data.category_id.map(cat => typeof cat === 'string' ? cat : cat._id)
          : undefined,
        color_id: typeof data.color_id === 'object' && data.color_id && '_id' in data.color_id
          ? data.color_id._id
          : data.color_id,
        brand_id: typeof data.brand_id === 'object' && data.brand_id && '_id' in data.brand_id
          ? data.brand_id._id
          : data.brand_id,
      };
      return updateProduct(id, formattedData);
    },
    onSuccess: () => {
      toast.success('Cập nhật sản phẩm thành công');
      
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditing(false);
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể cập nhật sản phẩm');
    },
  });

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNestedFieldChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof Product] as any),
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...(formData.tags || [])];
    newTags[index] = value;
    setFormData(prev => ({ ...prev, tags: newTags }));
    setHasChanges(true);
  };

  const handleAddTag = () => {
    const newTags = [...(formData.tags || []), ''];
    setFormData(prev => ({ ...prev, tags: newTags }));
    setHasChanges(true);
  };

  const handleRemoveTag = (index: number) => {
    const newTags = (formData.tags || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, tags: newTags }));
    setHasChanges(true);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = Array.isArray(formData.category_id) 
      ? formData.category_id.map(cat => typeof cat === 'string' ? cat : cat._id)
      : [];
    
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];
    
    setFormData(prev => ({ ...prev, category_id: newCategories as any }));
    setHasChanges(true);
  };

  const handleColorToggle = (colorId: string) => {
    const currentColors = Array.isArray(formData.color_id) 
      ? formData.color_id.map(col => typeof col === 'string' ? col : col._id)
      : [];
    
    const newColors = currentColors.includes(colorId)
      ? currentColors.filter((id) => id !== colorId)
      : [...currentColors, colorId];
    
    setFormData(prev => ({ ...prev, color_id: newColors as any }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(product || {});
    setIsEditing(false);
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h2>
              <p className="text-muted-foreground mb-4">
                Sản phẩm không tồn tại hoặc đã bị xóa.
              </p>
              <Button onClick={() => router.push('/dashboard/products')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  
  const getCategoryNames = () => {
    if (!product.category_id) return 'Chưa phân loại';
    
    // category_id có thể là array hoặc single value
    if (Array.isArray(product.category_id)) {
      if (product.category_id.length === 0) return 'Chưa phân loại';
      return product.category_id
        .map(cat => typeof cat === 'string' ? cat : cat.name)
        .join(', ');
    }
    
    // Nếu là single value
    if (typeof product.category_id === 'object' && product.category_id && 'name' in product.category_id) {
      return (product.category_id as any).name;
    }
    
    return typeof product.category_id === 'string' ? product.category_id : 'Chưa phân loại';
  };

  
  const getColorNames = () => {
    if (!product.color_id) return 'Chưa xác định';
    
    // color_id là object hoặc string, không phải array
    if (typeof product.color_id === 'object' && 'name' in product.color_id) {
      return product.color_id.name;
    }
    
    return typeof product.color_id === 'string' ? product.color_id : 'Chưa xác định';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              
              await queryClient.invalidateQueries({ queryKey: ['products'] });
              await queryClient.refetchQueries({ queryKey: ['products'] });
              
              router.push('/dashboard/products');
              router.refresh();
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            {isEditing ? (
              <Input
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="text-3xl font-bold h-12"
                placeholder="Tên sản phẩm"
              />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
            )}
            <p className="text-muted-foreground mt-1">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Hủy
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {}
        <Card>
          <CardHeader>
            <CardTitle>Hình ảnh sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {}
            <div className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
              <Image
                src={product.images.mainImg.url}
                alt={product.images.mainImg.alt_text || product.title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {}
            {product.images.sliderImg && product.images.sliderImg.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.sliderImg.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded border overflow-hidden bg-muted">
                    <Image
                      src={img.url}
                      alt={img.alt_text || `${product.title} - ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {}
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold min-w-[100px]">Giá:</span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) => handleFieldChange('price', Number(e.target.value))}
                    className="max-w-[200px]"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {product.price.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold min-w-[100px]">Tồn kho:</span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) => handleFieldChange('stock', Number(e.target.value))}
                    className="max-w-[200px]"
                  />
                ) : (
                  <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                    {product.stock} sản phẩm
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold min-w-[100px]">ID:</span>
                <span>{product._id}</span>
              </div>

              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold min-w-[100px]">Thương hiệu:</span>
                <span>{typeof product.brand_id === 'object' && 'name' in product.brand_id ? product.brand_id.name : product.brand_id}</span>
              </div>

              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <span className="font-semibold">Danh mục:</span>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2 mt-2 border rounded-md p-3">
                      {categories.map((category: any) => {
                        const currentCategoryIds = Array.isArray(formData.category_id) 
                          ? formData.category_id.map(cat => typeof cat === 'string' ? cat : cat._id)
                          : [];
                        const isSelected = currentCategoryIds.includes(category._id);
                        
                        return (
                          <button
                            key={category._id}
                            type="button"
                            onClick={() => handleCategoryToggle(category._id)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                          >
                            {category.category}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getCategoryNames()}
                    </div>
                  )}
                </div>
              </div>

              {}
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 rounded-full border bg-muted mt-1" />
                <div className="flex-1">
                  <span className="font-semibold">Màu sắc:</span>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2 mt-2 border rounded-md p-3">
                      {colors.map((color: any) => {
                        const currentColorIds = Array.isArray(formData.color_id) 
                          ? formData.color_id.map(col => typeof col === 'string' ? col : col._id)
                          : [];
                        const isSelected = currentColorIds.includes(color._id);
                        
                        return (
                          <button
                            key={color._id}
                            type="button"
                            onClick={() => handleColorToggle(color._id)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                          >
                            {color.color}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getColorNames()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          {((product.tags && product.tags.length > 0) || isEditing) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tags</CardTitle>
                {isEditing && (
                  <Button size="sm" variant="outline" onClick={handleAddTag}>
                    <Plus className="h-4 w-4 mr-1" /> Thêm tag
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {isEditing ? (
                    (formData.tags || []).map((tag, index) => (
                      <div key={index} className="flex items-center gap-1 bg-secondary rounded-md px-2 py-1">
                        <Input
                          value={tag}
                          onChange={(e) => handleTagChange(index, e.target.value)}
                          className="h-7 w-32"
                          placeholder="Tag"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => handleRemoveTag(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    product.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {}
      {(product.description || isEditing) && (
        <Card>
          <CardHeader>
            <CardTitle>Mô tả sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <Textarea
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Nhập mô tả sản phẩm"
                rows={10}
              />
            ) : (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description || 'Không có mô tả'}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Thông số kỹ thuật</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              {}
              {(product.specifications.weight || isEditing) && (
                <>
                  <dt className="font-semibold">Trọng lượng:</dt>
                  <dd>
                    {isEditing ? (
                      <Input
                        value={formData.specifications?.weight || ''}
                        onChange={(e) => handleNestedFieldChange('specifications', 'weight', e.target.value)}
                        placeholder="VD: 50g"
                      />
                    ) : (
                      product.specifications.weight
                    )}
                  </dd>
                </>
              )}

              {(product.specifications.size || isEditing) && (
                <>
                  <dt className="font-semibold">Kích thước:</dt>
                  <dd>
                    {isEditing ? (
                      <Input
                        value={formData.specifications?.size || ''}
                        onChange={(e) => handleNestedFieldChange('specifications', 'size', e.target.value)}
                        placeholder="VD: 40mm"
                      />
                    ) : (
                      product.specifications.size
                    )}
                  </dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {}
      {isEditing && hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Bạn có thay đổi chưa lưu
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={updateMutation.isPending}>
                <X className="mr-2 h-4 w-4" /> Hủy thay đổi
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang lưu...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}