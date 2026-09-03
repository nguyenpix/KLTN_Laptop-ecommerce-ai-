import os
import time
import logging
from typing import List, Dict, Any, Optional
import requests

from app.core.config import settings

logger = logging.getLogger("ai-service.llm_service")

class LLMService:
    def __init__(self):
        self.opencode_api_key = settings.OPENCODE_API_KEY
        self.opencode_base_url = settings.OPENCODE_BASE_URL.rstrip("/")
        self.opencode_model = settings.OPENCODE_MODEL or "deepseek-v4-flash-free"
        self.openai_api_key = settings.OPENAI_API_KEY
        self.hf_api_key = settings.HUGGINGFACE_API_KEY
        self.hf_model = "Qwen/Qwen2.5-7B-Instruct"

        self.system_prompt = """Bạn là một chuyên gia tư vấn laptop công nghệ nhiệt tình, thông minh và gần gũi (như một người bạn am hiểu phần cứng đang tư vấn tận tâm cho người mua).

PHONG CÁCH VÀ NGUYÊN TẮC TƯ VẤN:
1. Giao tiếp tự nhiên, thân thiện, xưng hô "mình" và "bạn". Tuyệt đối KHÔNG trả lời dập khuôn như robot hay biểu mẫu cứng nhắc.
2. NẮM BẮT TRỌNG TÂM & KẾ THỪA LỊCH SỬ HỘI THOẠI:
   - Bạn PHẢI ghi nhớ các điều kiện người dùng đã đề cập ở các câu trước (ví dụ: ngân sách 20-30 triệu, thương hiệu, hoặc mục đích sử dụng).
   - Khi người dùng hỏi thêm hoặc tập trung vào một chi tiết cụ thể (ví dụ: màn hình độ phân giải cao, chip CPU khỏe, card đồ họa rời, thời lượng pin, trọng lượng máy): Bạn hãy TRỰC DIỆN trả lời và phân tích sâu đúng chi tiết đó trước!
   - Ví dụ: Khách hỏi "có độ phân giải cao không" -> Hãy trả lời ngay: "Trong tầm giá bạn đang chọn, mình thấy các mẫu này sở hữu màn hình rất ấn tượng: máy A trang bị màn 2K/OLED sắc nét, máy B có tần số quét 144Hz mượt mà..."
   - Nếu khách hỏi "cpu cao" -> Phân tích điểm mạnh CPU (i7/Ryzen 7 đa nhân xử lý mượt mà tác vụ nặng).
3. PHẠM VI SẢN PHẨM & THƯƠNG HIỆU CỬA HÀNG:
   - Cửa hàng hiện phân phối chính hãng 4 thương hiệu laptop: Dell, Lenovo, Acer, MSI.
   - Cửa hàng KHÔNG KINH DOANH Apple (MacBook), Asus, HP, Samsung, v.v.
   - Khi khách hỏi dòng máy không bán (như Apple/MacBook): Hãy lịch sự thông báo cửa hàng chưa kinh doanh dòng này, và khéo léo giới thiệu các lựa chọn tương đương có sẵn trong kho (ví dụ: Lenovo ThinkPad/Yoga, Dell Inspiron/XPS, Acer Swift cho phân khúc mỏng nhẹ cao cấp). Tuyệt đối không tự bịa thông số máy Apple.
4. CÂU HỎI NGOÀI PHẠM VI (OUT OF SCOPE):
   - Nếu khách hỏi thời tiết, nấu ăn, làm thơ, chính trị...: Lịch sự từ chối ngắn gọn và kéo câu chuyện quay lại nhu cầu tư vấn laptop.
5. CHÍNH SÁCH CỬA HÀNG (BẢO HÀNH, ĐỔI TRẢ, GIAO HÀNG, TRẢ GÓP):
   - Trả lời đầy đủ, chuẩn xác theo thông tin hệ thống cung cấp trong context.
6. ĐÁNH GIÁ SẢN PHẨM THỰC TẾ:
   - Không liệt kê thông số kỹ thuật khô khan như bảng mã. Hãy giải thích lợi ích thực tế của linh kiện đối với trải nghiệm của khách.
   - Nhắc đến tên máy và khoảng giá một cách tự nhiên.
7. Emoji sinh động, vừa phải (✨, 💻, 🚀, 🎯, 🔥).
8. Nếu có sản phẩm gợi ý, cuối câu trả lời nhắc nhẹ bạn ấy xem nhanh các thẻ sản phẩm kèm ảnh và link chi tiết ở ngay bên dưới."""

    def generate_response(
        self,
        user_message: str,
        context: str,
        conversation_history: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        conversation_history = conversation_history or []

        # 1. Try OpenCode Zen / DeepSeek API (OpenAI-compatible) with low timeout (2.5s)
        if self.opencode_api_key:
            candidate_models = ["ling-3.0-flash-fin-free"]

            messages = [{"role": "system", "content": self.system_prompt}]
            for msg in conversation_history[-4:]:
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            messages.append({"role": "user", "content": f"Danh sách sản phẩm trong kho:\n{context}\n\n---\nCâu hỏi của khách hàng: {user_message}"})

            for model_name in candidate_models:
                try:
                    res = requests.post(
                        f"{self.opencode_base_url}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.opencode_api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": model_name,
                            "messages": messages,
                            "temperature": 0.7,
                            "max_tokens": 400
                        },
                        timeout=2.5
                    )
                    if res.status_code == 200:
                        data = res.json()
                        choices = data.get("choices") or []
                        if choices:
                            msg_obj = choices[0].get("message", {})
                            content = msg_obj.get("content") or ""
                            if content and content.strip():
                                elapsed = (time.time() - start_time) * 1000
                                logger.info(f"Generated response using OpenCode model: {model_name}")
                                return {
                                    "content": content.strip(),
                                    "model": f"opencode/{model_name}",
                                    "generation_time_ms": elapsed,
                                    "tokens_used": data.get("usage", {}).get("total_tokens", 0)
                                }
                except Exception as e:
                    logger.warning(f"OpenCode Zen ({model_name}) request failed or timed out: {e}")

        # 2. Try OpenAI if API key configured
        if self.openai_api_key:
            try:
                import openai
                client = openai.OpenAI(api_key=self.openai_api_key)
                messages = [{"role": "system", "content": self.system_prompt}]
                for msg in conversation_history[-4:]:
                    messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
                messages.append({"role": "user", "content": f"Danh sách sản phẩm trong kho:\n{context}\n\n---\nCâu hỏi của khách hàng: {user_message}"})

                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500,
                    timeout=2.5
                )
                content = response.choices[0].message.content
                elapsed = (time.time() - start_time) * 1000
                return {
                    "content": content,
                    "model": "gpt-3.5-turbo",
                    "generation_time_ms": elapsed,
                    "tokens_used": response.usage.total_tokens if response.usage else 0
                }
            except Exception as e:
                logger.warning(f"OpenAI completion failed: {e}")

        # 3. Fast Intelligent Dynamic Fallback Generator (Zero latency < 5ms)
        elapsed = (time.time() - start_time) * 1000
        fallback_text = self._build_dynamic_response(user_message, context)
        return {
            "content": fallback_text,
            "model": "smart_rule_engine",
            "generation_time_ms": elapsed,
            "tokens_used": 0
        }

    def _build_dynamic_response(self, query: str, context: str) -> str:
        # 1. Direct System Notifications from Context
        if "THÔNG BÁO HỆ THỐNG (OUT OF SCOPE)" in context:
            return (
                "Chào bạn! 👋 Hiện tại mình là trợ lý ảo chuyên hỗ trợ tư vấn chọn mua laptop và thiết bị phần cứng công nghệ. "
                "Chủ đề này hơi nằm ngoài chuyên môn của mình rồi 😄. Bạn có đang cần tư vấn hoặc tìm mẫu laptop phục vụ học tập, làm việc hay chơi game không, để mình hỗ trợ nhé! ✨"
            )

        if "THÔNG BÁO HỆ THỐNG (STORE POLICY)" in context:
            return (
                "Dạ chào bạn! Cửa hàng xin gửi tới bạn thông tin chính sách bảo hành và dịch vụ mới nhất ạ:\n\n"
                "🛡️ **Chính sách bảo hành:** 100% sản phẩm là hàng chính hãng, bảo hành từ 12 - 24 tháng theo đúng chuẩn NSX.\n"
                "🔄 **Chính sách đổi trả:** 1 đổi 1 trong 30 ngày đầu tiên nếu máy có lỗi phần cứng do nhà sản xuất.\n"
                "🚚 **Giao hàng:** Miễn phí vận chuyển toàn quốc, hỗ trợ kiểm tra máy trước khi thanh toán (COD).\n"
                "💳 **Hỗ trợ trả góp:** Áp dụng trả góp 0% lãi suất qua thẻ tín dụng và các đối tác tài chính uy tín.\n\n"
                "Nếu bạn cần thêm thông tin chi tiết về dòng máy nào, cứ nhắn mình hỗ trợ nhé! 💡"
            )

        if "THÔNG BÁO HỆ THỐNG (THƯƠNG HIỆU KHÔNG KINH DOANH)" in context:
            return (
                "Chào bạn! 👋 Hiện tại cửa hàng chúng mình **không kinh doanh dòng Apple (MacBook)** mà tập trung phân phối chính hãng 4 thương hiệu hàng đầu: **Dell, Lenovo, Acer, MSI**.\n\n"
                "Nếu bạn yêu thích phong cách thiết kế sang trọng, mỏng nhẹ, pin tốt và màn hình đẹp như MacBook, cửa hàng có các dòng tương đương cực kỳ xuất sắc như:\n"
                "- **Lenovo ThinkPad / Yoga:** Bàn phím đỉnh cao, bền bỉ, màn hình OLED 2.8K siêu đẹp.\n"
                "- **Dell XPS / Inspiron cao cấp:** Vỏ nhôm nguyên khối tinh tế, hiệu năng mạnh mẽ.\n"
                "- **Acer Swift AI:** Siêu nhẹ ~1.2kg, chuẩn Intel Evo/Core Ultra mượt mà.\n\n"
                "Bạn có muốn tham khảo các mẫu máy này trong tầm giá mong muốn không ạ? ✨"
            )

        if not context or "Không tìm thấy" in context:
            return (
                "Xin chào! Hiện tại mình chưa tìm thấy mẫu laptop nào khớp hoàn toàn với tất cả tiêu chí của bạn trong kho hàng. "
                "Bạn có thể điều chỉnh lại một chút khoảng giá hoặc cho mình biết thêm nhu cầu cụ thể (ví dụ: làm việc văn phòng, lập trình hay chơi game) để mình hỗ trợ nhé! 💡"
            )

        q_low = query.lower()
        intent_greeting = "Dựa trên nhu cầu của bạn, mình xin đề xuất các mẫu laptop phù hợp nhất đang có sẵn tại cửa hàng:"
        if any(w in q_low for w in ["độ phân giải", "màn hình", "2k", "4k", "oled", "120hz", "144hz"]):
            intent_greeting = "Về tiêu chí **màn hình và độ phân giải cao**, mình đã lọc ngay các dòng máy có màn hình sắc nét vượt trội (OLED, 2K+, tần số quét cao) trong tầm giá cho bạn:"
        elif any(w in q_low for w in ["cpu", "chip", "i7", "i9", "ryzen 7", "ryzen 9", "cpu cao", "chip mạnh"]):
            intent_greeting = "Về yêu cầu **CPU hiệu năng cao**, mình đã chọn các mẫu sở hữu vi xử lý đa nhân mạnh mẽ hàng đầu (Core i7/i9 hoặc Ryzen 7/9) tối ưu cho các tác vụ nặng:"
        elif any(w in q_low for w in ["lập trình", "code", "dev", "it", "phần mềm"]):
            intent_greeting = "Dành cho nhu cầu **Lập trình & Phát triển phần mềm**, mình đã chọn lọc các mẫu laptop có CPU khỏe, dung lượng RAM và ổ cứng tối ưu trong tầm giá:"
        elif any(w in q_low for w in ["game", "gaming", "đồ họa", "render", "3d", "card rời", "gpu"]):
            intent_greeting = "Dành cho nhu cầu **Gaming & Đồ họa**, dưới đây là những mẫu laptop trang bị Card đồ họa rời (GPU) và tản nhiệt tối ưu nhất:"
        elif any(w in q_low for w in ["văn phòng", "học tập", "sinh viên", "mỏng nhẹ"]):
            intent_greeting = "Dành cho nhu cầu **Học tập & Làm việc văn phòng**, đây là những lựa chọn mỏng nhẹ, pin tốt và giá cả cực kỳ hợp lý:"

        # Format products naturally
        intro = f"Chào bạn! 👋 {intent_greeting}\n\n"
        body = f"{context}\n\n" if context else ""
        footer = "💡 Bạn có thể bấm trực tiếp vào thẻ sản phẩm bên dưới để xem hình ảnh chi tiết và đặt hàng nhé! ✨"
        return f"{intro}{body}{footer}"

llm_service = LLMService()
