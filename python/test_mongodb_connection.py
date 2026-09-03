"""
Script kiểm tra kết nối MongoDB Atlas và lấy mẫu dữ liệu từ các collection.
Dành cho dự án Laptop E-commerce AI / Recommendation System.
"""

import os
import sys
import json
from pprint import pprint

# Đảm bảo in tiếng Việt và unicode không bị lỗi trên Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from pymongo import MongoClient
from bson import json_util

# --------------------------------------------------------------------------
# CẤU HÌNH KẾT NỐI
# --------------------------------------------------------------------------
# Mặc định lấy từ backend/.env hoặc sử dụng trực tiếp URI bên dưới
DEFAULT_MONGO_URI = "mongodb+srv://nguyendangnguyen1606_db_user:xzFPnnkUqKigG3wN@projectlaptopcluster0.i8ibppc.mongodb.net/root_laptops?retryWrites=true&w=majority&appName=ProjectLaptopCluster0"
DB_NAME = "root_laptops"

MONGO_URI = os.getenv("MONGODB_URI", DEFAULT_MONGO_URI)

def test_connection():
    print("=" * 70)
    print("[*] DANG KET NOI TOI MONGODB ATLAS...")
    print("=" * 70)
    
    try:
        # Khởi tạo MongoClient
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
        
        # Ping thử server
        client.admin.command('ping')
        print("[SUCCESS] KET NOI THANH CONG TOI MONGODB ATLAS!\n")
        
        # Danh sách các databases
        db_list = client.list_database_names()
        print(f"[+] Danh sach Database tren Cluster: {db_list}")
        
        db = client[DB_NAME]
        print(f"[+] Dang lam viec voi Database: '{DB_NAME}'\n")
        
        # Danh sách các collections và số lượng documents
        collections = db.list_collection_names()
        print("[-] THONG KE SO LUONG DOCUMENTS TRONG TUNG COLLECTION:")
        print("-" * 50)
        for col_name in sorted(collections):
            count = db[col_name].count_documents({})
            print(f"  - Collection '{col_name}': {count} documents")
        print("-" * 50 + "\n")
        
        # --------------------------------------------------------------------------
        # LẤY MẪU DỮ LIỆU TỪ CÁC COLLECTION CHÍNH
        # --------------------------------------------------------------------------
        
        # 1. Collection: brands
        if "brands" in collections:
            print("[MAU] 2 ban ghi tu collection 'brands':")
            sample_brands = list(db.brands.find().limit(2))
            for idx, b in enumerate(sample_brands, 1):
                print(f"  [{idx}] ID: {b.get('_id')} | Ten: {b.get('name')} | Slug: {b.get('slug')}")
            print()

        # 2. Collection: categories
        if "categories" in collections:
            print("[MAU] 2 ban ghi tu collection 'categories':")
            sample_cats = list(db.categories.find().limit(2))
            for idx, c in enumerate(sample_cats, 1):
                print(f"  [{idx}] ID: {c.get('_id')} | Ten: {c.get('name')} | Slug: {c.get('slug')}")
            print()

        # 3. Collection: colors
        if "colors" in collections:
            print("[MAU] 2 ban ghi tu collection 'colors':")
            sample_colors = list(db.colors.find().limit(2))
            for idx, col in enumerate(sample_colors, 1):
                print(f"  [{idx}] ID: {col.get('_id')} | Ten: {col.get('name')} | Hex: {col.get('hex')}")
            print()

        # 4. Collection: products
        if "products" in collections:
            print("[MAU CHI TIET] 1 san pham tu collection 'products':")
            sample_product = db.products.find_one()
            if sample_product:
                # Xử lý hiển thị gọn gàng embedding (vì embedding 384 chiều rất dài)
                display_prod = dict(sample_product)
                if "embedding" in display_prod and isinstance(display_prod["embedding"], list):
                    dim = len(display_prod["embedding"])
                    display_prod["embedding"] = f"<Mang vector float {dim} chieu - {display_prod['embedding'][:3]}...>"
                if "rag_embedding" in display_prod and isinstance(display_prod["rag_embedding"], list):
                    dim = len(display_prod["rag_embedding"])
                    display_prod["rag_embedding"] = f"<Mang vector float {dim} chieu - {display_prod['rag_embedding'][:3]}...>"
                
                print(json.dumps(json.loads(json_util.dumps(display_prod)), indent=2, ensure_ascii=False))
            print()

        # 5. Pipeline kiểm tra $lookup (Join Product với Brand & Category cho RecSys)
        if "products" in collections:
            print("=" * 70)
            print("[TEST] THU NGHIEM JOIN SAN PHAM + BRAND + CATEGORY CHO RECOMMENDATION SYSTEM:")
            print("=" * 70)
            pipeline = [
                {"$limit": 3},
                {
                    "$lookup": {
                        "from": "brands",
                        "localField": "brand_id",
                        "foreignField": "_id",
                        "as": "brand_info"
                    }
                },
                {
                    "$lookup": {
                        "from": "categories",
                        "localField": "category_id",
                        "foreignField": "_id",
                        "as": "category_info"
                    }
                },
                {
                    "$project": {
                        "id": 1,
                        "title": 1,
                        "price": 1,
                        "brand_name": {"$arrayElemAt": ["$brand_info.name", 0]},
                        "categories": "$category_info.name",
                        "cpu": "$specifications.cpu",
                        "gpu": "$specifications.gpu",
                        "ram": "$specifications.ram",
                        "has_embedding": {"$cond": [{"$isArray": "$embedding"}, True, False]}
                    }
                }
            ]
            joined_samples = list(db.products.aggregate(pipeline))
            for idx, p in enumerate(joined_samples, 1):
                price_str = f"{p.get('price'):,} VND" if isinstance(p.get('price'), (int, float)) else str(p.get('price'))
                emb_status = "Da co Vector Embedding (384-dim)" if p.get('has_embedding') else "Chua co Embedding"
                print(f"\nSan pham #{idx}:")
                print(f"  * ID: {p.get('id')} | Tieu de: {p.get('title')}")
                print(f"  * Gia: {price_str}")
                print(f"  * Brand: {p.get('brand_name')} | Danh muc: {p.get('categories')}")
                print(f"  * CPU: {p.get('cpu')}")
                print(f"  * GPU: {p.get('gpu')}")
                print(f"  * RAM: {p.get('ram')}")
                print(f"  * Vector Embedding: [{emb_status}]")

        # 6. Collection: interactions (nếu có)
        if "interactions" in collections:
            count = db.interactions.count_documents({})
            print(f"\n[-] Collection 'interactions' co {count} ban ghi.")
            if count > 0:
                print("Mau 2 tuong tac nguoi dung:")
                for it in db.interactions.find().limit(2):
                    pprint(it)
        
        print("\n" + "=" * 70)
        print("[SUCCESS] TAT CA KIEM TRA DA HOAN TAT!")
        print("=" * 70)

    except Exception as e:
        print(f"\n[ERROR] LOI TRONG QUA TRINH KET NOI / TRUY VAN: {e}")

if __name__ == "__main__":
    test_connection()
