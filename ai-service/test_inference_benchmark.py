import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from app.core.database import get_database, close_database
from app.services.rec_service import rec_engine

def run_demo():
    print("=" * 70)
    print("🚀 BẮT ĐẦU CHẠY THỬ MÔ HÌNH PRE-TRAINED (CHỈ SUY LUẬN / INFERENCE)")
    print("=" * 70)

    # 1. Khởi động & Nạp trọng số mô hình đã train sẵn
    t0 = time.perf_counter()
    print("\n📦 [BƯỚC 1] Nạp trọng số mô hình đã train sẵn từ thư mục weights/...")
    get_database()
    rec_engine.initialize()
    load_time = (time.perf_counter() - t0) * 1000.0

    print(f"   -> Thời gian load dữ liệu & model: {load_time:.2f} ms")
    print(f"   -> Model Two-Tower sẵn sàng: {rec_engine.is_ready}")
    print(f"   -> Tổng số sản phẩm trong bộ nhớ: {len(rec_engine.item_id_list)}")

    # 2. Test Input -> Output cho 1 User cụ thể
    test_user_id = "68e37500fb43e827078c759c"
    print(f"\n🎯 [BƯỚC 2] TEST ĐẦU VÀO LÀ USER ID:")
    print(f"   👉 INPUT  : user_id = '{test_user_id}', limit = 3")

    t1 = time.perf_counter()
    recs, is_cold, algo = rec_engine.recommend_for_user(user_id=test_user_id, limit=3)
    infer_time = (time.perf_counter() - t1) * 1000.0

    print(f"   ⏱️ Tốc độ tính toán của model (Inference time): {infer_time:.2f} ms")
    print(f"   🤖 Thuật toán được kích hoạt: {algo}")
    print("   👉 OUTPUT (Kết quả gợi ý được model xếp hạng cao nhất):")
    for i, p in enumerate(recs, 1):
        print(f"      {i}. [{p['brand']}] {p['title']}")
        print(f"         • Giá: {p['price']:,.0f} đ | Điểm mô hình (Score): {p['score']:.4f}")

    # 3. Test Input -> Output cho 1 Laptop (Tìm laptop tương tự)
    sample_pid = rec_engine.item_id_list[0]
    print(f"\n💻 [BƯỚC 3] TEST ĐẦU VÀO LÀ PRODUCT ID (TÌM MÁY TƯƠNG TỰ):")
    print(f"   👉 INPUT  : product_id = '{sample_pid}', limit = 3")

    t2 = time.perf_counter()
    sim_items = rec_engine.recommend_similar_items(product_id=sample_pid, limit=3)
    sim_time = (time.perf_counter() - t2) * 1000.0

    print(f"   ⏱️ Tốc độ so khớp đặc trưng phần cứng: {sim_time:.2f} ms")
    print("   👉 OUTPUT (Các laptop có cấu hình tương đồng nhất):")
    for i, s in enumerate(sim_items, 1):
        print(f"      {i}. [{s['brand']}] {s['title']}")
        print(f"         • Giá: {s['price']:,.0f} đ | Độ tương đồng: {s['similarity_score']:.4f}")

    # 4. Test Input là Khách mới (Cold-Start)
    print(f"\n👤 [BƯỚC 4] TEST ĐẦU VÀO LÀ KHÁCH MỚI CHƯA ĐĂNG NHẬP:")
    print(f"   👉 INPUT  : user_id = None (Khách vãng lai), limit = 3")

    t3 = time.perf_counter()
    cold_recs, _, cold_algo = rec_engine.recommend_for_user(user_id=None, limit=3)
    cold_time = (time.perf_counter() - t3) * 1000.0

    print(f"   ⏱️ Tốc độ xử lý: {cold_time:.2f} ms")
    print(f"   🤖 Thuật toán: {cold_algo}")
    print("   👉 OUTPUT (Sản phẩm tiêu biểu phân bổ đều thương hiệu):")
    for i, c in enumerate(cold_recs, 1):
        print(f"      {i}. [{c['brand']}] {c['title']}")
        print(f"         • Giá: {c['price']:,.0f} đ | Điểm: {c['score']:.4f}")

    print("\n" + "=" * 70)
    print("✅ HOÀN TẤT CHẠY THỬ: MODEL CHỈ NHẬN INPUT -> TRẢ OUTPUT TRONG VÀI MILI-GIÂY!")
    print("=" * 70)
    close_database()

if __name__ == "__main__":
    run_demo()
