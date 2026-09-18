'use client';
import React from 'react';
import { Product } from '@/features/products/types';

interface ProductSpecsTableProps {
  product: Product;
}

export function ProductSpecsTable({ product }: ProductSpecsTableProps) {
  const { title, name, specifications, brand, series, part_number, color, color_id, brand_id, sku } = product as any;

  const brandName = typeof brand_id === 'object' && brand_id?.name ? brand_id.name : (brand || 'Asus');
  const colorName = typeof color_id === 'object' && color_id?.name ? color_id.name : (color || 'Xám / Bạc');
  const partNumberVal = part_number || sku || 'Đang cập nhật';
  const seriesVal = series || (title ? title.split(' ').slice(0, 3).join(' ') : 'Laptop');

  // General information rows
  const generalInfo = [
    { label: 'Thương hiệu', value: brandName },
    { label: 'Bảo hành', value: '24 tháng chính hãng' },
    { label: 'Series model', value: seriesVal },
    { label: 'Tên sản phẩm', value: name || title },
    { label: 'Part-number', value: partNumberVal },
    { label: 'Màu sắc', value: colorName },
    { label: 'Nhu cầu', value: 'Văn phòng / Học sinh - Sinh viên / Mỏng nhẹ' },
  ];

  // Detailed hardware configuration rows
  const detailedSpecs = [
    { label: 'CPU', value: specifications?.cpu || 'Intel Core / AMD Ryzen' },
    { label: 'NPU', value: specifications?.npu || 'Intel® AI Boost / N/A' },
    { label: 'Chip đồ họa (GPU)', value: specifications?.gpu || 'Onboard Graphics' },
    { label: 'RAM', value: specifications?.ram || '8GB / 16GB' },
    { label: 'Ổ cứng', value: specifications?.storage || specifications?.storage_capacity || '512GB SSD M.2 NVMe' },
    { label: 'Màn hình', value: specifications?.display || '14" Full HD (1920 x 1080) IPS / TFT' },
    { label: 'Bàn phím', value: specifications?.keyboard || 'Bàn phím tiêu chuẩn' },
    { label: 'Cổng kết nối', value: specifications?.ports || '1x USB-C, 2x USB 3.2, 1x HDMI, 1x 3.5mm' },
    { label: 'Kết nối không dây', value: specifications?.connectivity || 'Wi-Fi 6E, Bluetooth 5.3' },
    { label: 'Âm thanh', value: specifications?.audio || 'SonicMaster / High Definition Audio' },
    { label: 'Webcam', value: specifications?.webcam || 'HD 720p có nắp che bảo mật vật lý' },
    { label: 'Hệ điều hành', value: specifications?.os || 'Windows 11 Home' },
    { label: 'Pin', value: specifications?.battery || '3-cell, 42Wh' },
    { label: 'Kích thước', value: specifications?.size || '32.49 x 21.39 x 1.79 cm' },
    { label: 'Khối lượng', value: specifications?.weight || '1.4 kg' },
    { label: 'Bảo mật', value: specifications?.security || 'Cảm biến vân tay' },
    { label: 'Phụ kiện đi kèm', value: specifications?.accessories || 'Sạc, Sách hướng dẫn sử dụng' },
  ].filter(item => item.value && item.value.trim().length > 0);

  return (
    <div className="w-full space-y-8">
      {/* 1. THÔNG TIN CHUNG */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
          Thông tin chung
        </h3>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <tbody>
              {generalInfo.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'}
                >
                  <td className="w-1/3 py-3 px-5 font-semibold text-gray-700 border-r border-gray-100">
                    {row.label}
                  </td>
                  <td className="w-2/3 py-3 px-5 text-gray-900">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. CẤU HÌNH CHI TIẾT */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
          Cấu hình chi tiết
        </h3>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <tbody>
              {detailedSpecs.map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'}
                >
                  <td className="w-1/3 py-3 px-5 font-semibold text-gray-700 border-r border-gray-100">
                    {row.label}
                  </td>
                  <td className="w-2/3 py-3 px-5 text-gray-900 font-medium">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
