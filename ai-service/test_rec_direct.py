import sys
import os
from pathlib import Path

# Add ai-service to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# UTF-8 for console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from app.core.config import settings
from app.core.database import get_database, close_database
from app.services.rec_service import rec_engine

def test_recommendations():
    try:
        print("1. Kết nối MongoDB & Khởi tạo Recommendation Engine...")
        db = get_database()
        rec_engine.initialize()
        
        print(f"-> Engine sẵn sàng (is_ready): {rec_engine.is_ready}")
        print(f"-> Số lượng sản phẩm tải vào model: {len(rec_engine.item_id_list)}")
        print(f"-> Số lượng người dùng đã có tương tác: {len(rec_engine.user_id_list)}")

        print("\n" + "="*50)
        print("TEST 1: GỢI Ý CHO KHÁCH VÃNG LAI / USER MỚI (COLD-START)")
        print("="*50)
        recs, is_cold, algo = rec_engine.recommend_for_user(user_id=None, limit=5)
        print(f"Thuật toán: {algo} | Cold-start: {is_cold} | Số lượng: {len(recs)}")
        for i, r in enumerate(recs, 1):
            print(f"  {i}. [{r['brand']}] {r['title']} - Giá: {r['price']:,.0f}đ (Score: {r['score']:.3f})")

        print("\n" + "="*50)
        print("TEST 2: GỢI Ý CÁ NHÂN HÓA CHO USER ĐÃ CÓ LỊCH SỬ TƯƠNG TÁC")
        print("="*50)
        if rec_engine.user_id_list:
            test_uid = rec_engine.user_id_list[0]
            recs_u, is_cold_u, algo_u = rec_engine.recommend_for_user(user_id=test_uid, limit=5)
            print(f"User ID: {test_uid}")
            print(f"Thuật toán: {algo_u} | Cold-start: {is_cold_u} | Số lượng: {len(recs_u)}")
            for i, r in enumerate(recs_u, 1):
                print(f"  {i}. [{r['brand']}] {r['title']} - Giá: {r['price']:,.0f}đ (Score: {r['score']:.3f})")
        else:
            print("Chưa có user nào có dữ liệu tương tác trong database.")

        print("\n" + "="*50)
        print("TEST 3: GỢI Ý SẢN PHẨM TƯƠNG ĐỒNG (ITEM-TO-ITEM SIMILARITY)")
        print("="*50)
        if rec_engine.item_id_list:
            sample_pid = rec_engine.item_id_list[0]
            sim_items = rec_engine.recommend_similar_items(product_id=sample_pid, limit=4)
            sample_doc = next((p for p in rec_engine.products if str(p.get('_id')) == sample_pid), {})
            print(f"Sản phẩm gốc: [{sample_doc.get('brand')}] {sample_doc.get('title') or sample_doc.get('name')}")
            for i, s in enumerate(sim_items, 1):
                print(f"  {i}. [{s['brand']}] {s['title']} - Sim Score: {s['similarity_score']:.3f}")

    except Exception as e:
        print(f"Lỗi khi kiểm tra: {e}")
        import traceback
        traceback.print_exc()
    finally:
        close_database()

if __name__ == "__main__":
    test_recommendations()
