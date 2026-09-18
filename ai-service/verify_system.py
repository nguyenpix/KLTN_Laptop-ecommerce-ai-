import sys
import os
from pathlib import Path

# Set UTF-8
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from app.services.rec_service import rec_engine

def run_tests():
    print("=" * 65)
    print("🧪 BẮT ĐẦU KIỂM TRA TOÀN BỘ HỆ THỐNG RECOMMENDATION ENGINE")
    print("=" * 65)

    # 1. Khởi tạo
    rec_engine.initialize()
    assert rec_engine.is_ready, "❌ Lỗi: Engine không khởi tạo được!"
    assert len(rec_engine.item_id_list) == 196, f"❌ Lỗi số lượng item: {len(rec_engine.item_id_list)}"
    assert len(rec_engine.user_id_list) == 58, f"❌ Lỗi số lượng user: {len(rec_engine.user_id_list)}"
    print(f"✅ [1. KHỞI TẠO MODEL]: Thành công (196 items, 58 users, model device: {rec_engine.device})")

    # 2. Test User đã học (Personalized)
    test_user_id = "68e37500fb43e827078c759c"
    recs, is_cold, algo = rec_engine.recommend_for_user(test_user_id, limit=5)
    assert len(recs) == 5, f"Số lượng gợi ý không đúng: {len(recs)}"
    assert not is_cold, "User đã học nhưng lại bị đánh dấu là cold-start!"
    assert algo == "two_tower_personalized", f"Thuật toán sai: {algo}"
    assert "score" in recs[0] and "final_score" in recs[0], "Thiếu điểm số trong kết quả!"
    assert "name" in recs[0] and "price" in recs[0], "Thiếu thông tin sản phẩm!"
    print(f"✅ [2. USER CÁ NHÂN HÓA]: Thành công ({recs[0]['name']} | Score: {recs[0]['score']:.4f})")

    # 3. Test Khách vãng lai (Cold-start)
    recs_c, is_cold_c, algo_c = rec_engine.recommend_for_user(None, limit=5)
    assert len(recs_c) == 5, f"Số lượng gợi ý cold-start sai: {len(recs_c)}"
    assert is_cold_c, "Khách vãng lai nhưng không đánh dấu cold-start!"
    assert algo_c == "two_tower_cold_start", f"Thuật toán sai: {algo_c}"
    print(f"✅ [3. KHÁCH MỚI / VÃNG LAI]: Thành công ({recs_c[0]['name']} | Score: {recs_c[0]['score']:.4f})")

    # 4. Test Laptop tương tự (Item-to-Item Similarity)
    sample_id = rec_engine.item_id_list[0]
    sims = rec_engine.recommend_similar_items(sample_id, limit=3)
    assert len(sims) == 3, f"Số lượng máy tương tự sai: {len(sims)}"
    assert "similarity_score" in sims[0], "Thiếu similarity_score!"
    print(f"✅ [4. LAPTOP TƯƠNG TỰ]: Thành công (Gốc: {sample_id} -> Khớp: {sims[0]['name']} | Sim: {sims[0]['similarity_score']:.4f})")

    # 5. Kiểm tra tính toàn vẹn của Product Catalog
    sample_prod = recs[0]
    assert "productId" in sample_prod and "product_id" in sample_prod, "Thiếu định dạng ID tương thích!"
    assert "images" in sample_prod and "mainImg" in sample_prod["images"], "Thiếu cấu trúc images.mainImg!"
    print(f"✅ [5. CẤU TRÚC DỮ LIỆU FRONTEND]: Tương thích hoàn hảo cả productId & product_id!")

    print("\n" + "=" * 65)
    print("🎉 TẤT CẢ CÁC BƯỚC KIỂM TRA ĐỀU VƯỢT QUA 100%!")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()
