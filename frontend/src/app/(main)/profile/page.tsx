'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  Settings, 
  LogOut,
  Package,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 🏠 PROFILE PAGE
 * Trang hồ sơ người dùng với các menu điều hướng
 */
export default function ProfilePage() {
  const router = useRouter();
  
  // Mock user data - replace with actual auth data
  const user = {
    name: 'Người dùng',
    email: 'user@example.com',
    avatar: null,
    memberSince: '2024'
  };

  const menuItems = [
    {
      title: 'Gợi ý cho bạn',
      description: 'Sản phẩm được đề xuất dựa trên sở thích của bạn',
      icon: Sparkles,
      href: '/profile/recommendations',
      color: 'bg-gradient-to-r from-blue-500 to-purple-500',
      textColor: 'text-white'
    },
    {
      title: 'Đơn hàng của tôi',
      description: 'Xem và quản lý các đơn hàng đã đặt',
      icon: ShoppingBag,
      href: '/profile/orders',
      color: 'bg-gradient-to-r from-green-500 to-teal-500',
      textColor: 'text-white'
    },
    {
      title: 'Sản phẩm yêu thích',
      description: 'Danh sách sản phẩm bạn đã lưu',
      icon: Heart,
      href: '/profile/wishlist',
      color: 'bg-gradient-to-r from-pink-500 to-rose-500',
      textColor: 'text-white'
    },
    {
      title: 'Đánh giá của tôi',
      description: 'Các đánh giá và nhận xét đã viết',
      icon: Star,
      href: '/profile/reviews',
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      textColor: 'text-white'
    },
    {
      title: 'Thông tin cá nhân',
      description: 'Cập nhật thông tin tài khoản',
      icon: User,
      href: '/profile/account',
      color: 'bg-gradient-to-r from-indigo-500 to-blue-500',
      textColor: 'text-white'
    },
    {
      title: 'Cài đặt',
      description: 'Tùy chỉnh trải nghiệm của bạn',
      icon: Settings,
      href: '/profile/settings',
      color: 'bg-gradient-to-r from-gray-600 to-gray-700',
      textColor: 'text-white'
    }
  ];

  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Thành viên từ {user.memberSince}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                    <item.icon className={`w-6 h-6 ${item.textColor}`} />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Đơn hàng</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Yêu thích</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Đánh giá</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Tương tác</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
