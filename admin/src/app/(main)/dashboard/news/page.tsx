'use client';

import React, { useState } from 'react';
import {
  useNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
} from '@/features/news/hooks/useNews';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { News, NewsFormData } from '@/shared/types';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useAuthStore } from '@/store/authStore'; 
import { Badge } from '@/shared/components/ui/badge';

export default function NewsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<NewsFormData>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    thumbnail_img: '',
    author_id: '',
    status: 'draft',
  });

  const { user } = useAuthStore(); 
  const { data: news, isLoading, isError } = useNews();
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();

  const handleOpenDialog = (newsItem?: News) => {
    if (newsItem) {
      setEditingNews(newsItem);
      setFormData({
        title: newsItem.title,
        slug: newsItem.slug,
        content: newsItem.content,
        excerpt: newsItem.excerpt || '',
        thumbnail_img: newsItem.thumbnail_img || '',
        author_id: typeof newsItem.author_id === 'object' ? newsItem.author_id._id : newsItem.author_id,
        status: newsItem.status,
      });
    } else {
      setEditingNews(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        thumbnail_img: '',
        author_id: '',
        status: 'draft',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    
    if (!editingNews && user?._id) {
      dataToSubmit.author_id = user._id;
    }
    
    if (!dataToSubmit.author_id) {
        console.error("Author ID is missing");
        return;
    }

    if (editingNews) {
      updateNews.mutate(
        { id: editingNews._id, data: dataToSubmit as NewsFormData },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingNews(null);
          },
        }
      );
    } else {
      createNews.mutate(dataToSubmit as NewsFormData, {
        onSuccess: () => {
          setIsDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteNews.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quản lý tin tức</CardTitle>
          <CardDescription>
            Quản lý và chỉnh sửa các bài viết tin tức.
          </CardDescription>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Thêm bài viết
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-center text-muted-foreground">Đang tải...</p>}
        {isError && <p className="text-center text-red-500">Lỗi khi tải dữ liệu tin tức.</p>}
        {news && (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {news.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      Không có bài viết nào
                    </TableCell>
                  </TableRow>
                ) : (
                  news.map((newsItem) => (
                    <TableRow key={newsItem._id}>
                      <TableCell className="font-medium">{newsItem.title}</TableCell>
                      <TableCell>{newsItem.author_id.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{newsItem.status === 'draft' ? 'Bản nháp' : 'Đã xuất bản'}</Badge>
                      </TableCell>
                      <TableCell>{new Date(newsItem.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(newsItem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setDeleteId(newsItem._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingNews ? 'Cập nhật bài viết' : 'Thêm bài viết mới'}
            </DialogTitle>
            <DialogDescription>
              {editingNews
                ? 'Cập nhật thông tin bài viết'
                : 'Nhập thông tin bài viết mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="thumbnail_img">URL hình ảnh nổi bật</Label>
              <Input
                id="thumbnail_img"
                value={formData.thumbnail_img}
                onChange={(e) => setFormData({ ...formData, thumbnail_img: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="excerpt">Tóm tắt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Nội dung</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={8}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'published') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Đã xuất bản</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createNews.isPending || updateNews.isPending}>
                {createNews.isPending || updateNews.isPending ? 'Đang lưu...' : (editingNews ? 'Cập nhật' : 'Tạo mới')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa bài viết"
        description="Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
      />
    </Card>
  );
}
