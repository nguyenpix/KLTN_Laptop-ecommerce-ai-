import sys
import argparse
import json
from pathlib import Path

# Thêm ai-service vào sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# UTF-8 cho Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from app.core.database import get_database, close_database
from app.services.rec_service import rec_engine

def main():
    parser = argparse.ArgumentParser(description="CLI gọi mô hình gợi ý Laptop")
    parser.add_argument("--user", type=str, default=None, help="User ID (MongoDB _id) cần gợi ý cá nhân hóa")
    parser.add_argument("--similar", type=str, default=None, help="Product ID (MongoDB _id) để tìm laptop tương đồng")
    parser.add_argument("--limit", type=int, default=5, help="Số lượng sản phẩm gợi ý (mặc định: 5)")
    parser.add_argument("--json", action="store_true", help="Xuất kết quả dạng JSON nguyên bản")

    args = parser.parse_args()

    try:
        # Khởi tạo mô hình & nạp dữ liệu từ MongoDB
        get_database()
        rec_engine.initialize()

        if not rec_engine.is_ready:
            print("❌ Lỗi: Mô hình chưa sẵn sàng.")
            return

        # Trường hợp 1: Tìm laptop tương đồng theo cấu hình (Item-to-Item)
        if args.similar:
            results = rec_engine.recommend_similar_items(args.similar, limit=args.limit)
            if args.json:
                print(json.dumps(results, indent=2, ensure_ascii=False))
                return

            print(f"\n💻 KẾT QUẢ GỢI Ý SẢN PHẨM TƯƠNG ĐỒNG CHO SẢN PHẨM ID [{args.similar}]:")
            print("-" * 75)
            if not results:
                print("Không tìm thấy sản phẩm hoặc không có sản phẩm tương tự.")
            for i, p in enumerate(results, 1):
                print(f"{i}. [{p['brand']}] {p['title']}")
                print(f"   💰 Giá: {p['price']:,.0f} đ | Độ tương đồng (Similarity): {p['similarity_score']:.4f}")
            print("-" * 75)

        # Trường hợp 2: Gợi ý theo User (Cá nhân hóa hoặc Cold-start)
        else:
            recs, is_cold, algo = rec_engine.recommend_for_user(
                user_id=args.user,
                limit=args.limit
            )
            if args.json:
                out = {
                    "user_id": args.user,
                    "is_cold_start": is_cold,
                    "algorithm": algo,
                    "total": len(recs),
                    "recommendations": recs
                }
                print(json.dumps(out, indent=2, ensure_ascii=False))
                return

            print(f"\n🎯 KẾT QUẢ GỢI Ý CHO USER: {'[Khách vãng lai / Mới]' if not args.user or is_cold else args.user}")
            print(f"⚙️ Thuật toán sử dụng: {algo} (Cold-start: {is_cold})")
            print("-" * 75)
            for i, p in enumerate(recs, 1):
                print(f"{i}. [{p['brand']}] {p['title']}")
                print(f"   💰 Giá: {p['price']:,.0f} đ | Điểm gợi ý (Score): {p['score']:.4f}")
            print("-" * 75)

    except Exception as e:
        print(f"❌ Xảy ra lỗi: {e}")
    finally:
        close_database()

if __name__ == "__main__":
    main()
