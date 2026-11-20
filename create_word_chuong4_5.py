# -*- coding: utf-8 -*-
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import os

def set_cell_background(cell, fill_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="none"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_callout_box(doc, text, title="GHI CHÚ KỸ THUẬT:"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "F0F4F8")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'  <w:left w:val="single" w:sz="24" w:space="0" w:color="1A365D"/>'
        f'  <w:top w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:bottom w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.line_spacing = 1.2
    p.paragraph_format.space_after = Pt(2)
    run_title = p.add_run(f"{title} ")
    run_title.font.name = "Times New Roman"
    run_title.font.size = Pt(11)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(26, 54, 93)
    
    run_text = p.add_run(text)
    run_text.font.name = "Times New Roman"
    run_text.font.size = Pt(11)
    run_text.font.italic = True
    run_text.font.color.rgb = RGBColor(45, 55, 72)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(4)

def generate_doc(output_path):
    doc = Document()

    # Căn lề chuẩn Khóa luận: Top 2cm, Bottom 2cm, Left 3cm, Right 2cm
    for section in doc.sections:
        section.top_margin = Inches(0.79)     # 2.0 cm
        section.bottom_margin = Inches(0.79)  # 2.0 cm
        section.left_margin = Inches(1.18)    # 3.0 cm
        section.right_margin = Inches(0.79)   # 2.0 cm
        section.page_width = Inches(8.27)     # A4
        section.page_height = Inches(11.69)

    # Styles
    COLOR_PRIMARY = RGBColor(26, 54, 93)     # Navy Blue
    COLOR_SECONDARY = RGBColor(43, 108, 176) # Lighter Blue
    COLOR_BODY = RGBColor(45, 55, 72)        # Charcoal Dark Gray
    
    def add_title(text):
        p = doc.add_paragraph()
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(18)
        r.font.bold = True
        r.font.color.rgb = COLOR_PRIMARY
        return p

    def add_subtitle(text):
        p = doc.add_paragraph()
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(18)
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(13)
        r.font.italic = True
        r.font.color.rgb = RGBColor(113, 128, 150)
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(14)
        r.font.bold = True
        r.font.color.rgb = COLOR_PRIMARY
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = COLOR_SECONDARY
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
        r.font.bold = True
        r.font.italic = True
        r.font.color.rgb = COLOR_PRIMARY
        return p

    def add_p(text, bold_prefix=None, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_after = Pt(space_after)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = "Times New Roman"
            r_pre.font.size = Pt(12)
            r_pre.font.bold = True
            r_pre.font.color.rgb = COLOR_PRIMARY
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
        r.font.color.rgb = COLOR_BODY
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.25
        p.paragraph_format.space_after = Pt(3)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = "Times New Roman"
            r_pre.font.size = Pt(12)
            r_pre.font.bold = True
            r_pre.font.color.rgb = COLOR_PRIMARY
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
        r.font.color.rgb = COLOR_BODY
        return p

    def add_formula(latex_text, explanation=None):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        cell.width = Inches(6.5)
        set_cell_background(cell, "F7FAFC")
        set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
        p = cell.paragraphs[0]
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(latex_text)
        r.font.name = "Cambria Math"
        r.font.size = Pt(12)
        r.font.bold = True
        r.font.color.rgb = COLOR_PRIMARY
        
        if explanation:
            p2 = doc.add_paragraph()
            p2.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p2.paragraph_format.space_before = Pt(3)
            p2.paragraph_format.space_after = Pt(6)
            r_exp = p2.add_run(f"Trong đó: {explanation}")
            r_exp.font.name = "Times New Roman"
            r_exp.font.size = Pt(11)
            r_exp.font.italic = True
            r_exp.font.color.rgb = RGBColor(113, 128, 150)

    # =========================================================================
    # PHẦN MỞ ĐẦU / TIÊU ĐỀ TÀI LIỆU
    # =========================================================================
    add_title("CHUYÊN ĐỀ HỆ THỐNG GỢI Ý SẢN PHẨM LAPTOP (RECOMMENDER SYSTEM)\nỨNG DỤNG MÔ HÌNH HYBRID THÁP ĐÔI VÀ MONGODB ATLAS VECTOR SEARCH")
    add_subtitle("Tài liệu kỹ thuật Khóa luận Tốt nghiệp — Chi tiết nội dung Chương 4 và Chương 5")

    # =========================================================================
    # CHƯƠNG 4
    # =========================================================================
    add_h1("CHƯƠNG 4: XÂY DỰNG VECTOR HỒ SƠ NGƯỜI DÙNG (USER PROFILE VECTORS)")

    add_p(
        "Trong các hệ thống thương mại điện tử hiện đại, việc xây dựng hồ sơ người dùng (User Profile) chính xác "
        "là tiền đề quyết định chất lượng gợi ý. Đối với ngành hàng máy tính xách tay (Laptop), người dùng thường "
        "rất hiếm khi chủ động cung cấp phản hồi tường minh (Explicit Feedback như đánh giá sao hay bình luận). "
        "Do đó, chương này trình bày phương pháp chuyển hóa toàn bộ chuỗi vi tương tác ngầm định (Implicit Feedback) "
        "kết hợp hàm suy giảm thời gian (Exponential Time-Decay) nhằm trích xuất song song hai vector đặc trưng: "
        "vector thị hiếu cộng tác (user_cf_vector) và vector nhu cầu cấu hình phần cứng (user_content_vector)."
    )

    add_h2("4.1. Quy chuẩn tập phản hồi ngầm định (Implicit Feedback) và Dữ liệu mô phỏng thực nghiệm")
    
    add_p(
        "Nhằm xây dựng tập dữ liệu huấn luyện và kiểm thử ban đầu phản ánh trung thực hành vi mua sắm, đề tài đã tiến hành "
        "mô phỏng 2.918 lượt tương tác từ 56 người dùng trên toàn bộ danh mục 398 sản phẩm laptop của hệ thống. "
        "Quá trình mô phỏng được phân tầng dựa trên 8 nhóm khách hàng thực tế (Personas) bao gồm: Sinh viên văn phòng, "
        "Casual Gamer, Hardcore Gamer, Designer/Creator, Lập trình viên CNTT, Doanh nhân mỏng nhẹ, Apple Fan và Người dùng phổ thông tiết kiệm."
    )

    add_p(
        "Trong quá trình tương tác, hệ thống ghi nhận đúng 5 hành vi tương tác cốt lõi với bảng trọng số chuẩn hóa định lượng như sau:"
    )

    # Bảng 1: Bảng trọng số hành vi
    tbl1 = doc.add_table(rows=6, cols=5)
    tbl1.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl1)
    
    headers1 = ["STT", "Hành vi tương tác (type)", "Trọng số gốc (w_base)", "Số lượt thực tế", "Tỷ lệ (%)"]
    for col_idx, h in enumerate(headers1):
        cell = tbl1.cell(0, col_idx)
        set_cell_background(cell, "1A365D")
        set_cell_margins(cell, top=140, bottom=140, left=150, right=150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    data1 = [
        ["1", "view (Xem chi tiết laptop)", "1.0", "1.593", "54.6%"],
        ["2", "like (Yêu thích / Wishlist)", "3.0", "652", "22.3%"],
        ["3", "search_click (Click từ tìm kiếm / lọc)", "2.0", "364", "12.5%"],
        ["4", "add_to_cart (Thêm vào giỏ hàng)", "5.0", "255", "8.7%"],
        ["5", "purchase (Mua hàng thành công)", "10.0", "54", "1.9%"],
    ]

    for row_idx, row_data in enumerate(data1, start=1):
        bg = "FFFFFF" if row_idx % 2 != 0 else "F7FAFC"
        for col_idx, val in enumerate(row_data):
            cell = tbl1.cell(row_idx, col_idx)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [0, 2, 3, 4] else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.name = "Times New Roman"
            r.font.size = Pt(11)
            r.font.bold = (col_idx == 1 or col_idx == 2)
            r.font.color.rgb = COLOR_BODY

    add_p("", space_after=4)

    add_callout_box(
        doc,
        "Tổng tương tác đạt 2.918 lượt trên 398 sản phẩm (độ phủ danh mục 100%). "
        "Độ thưa ma trận tương tác (Sparsity) đạt 86.91%, đây là tỷ lệ mật độ lý tưởng giúp thuật toán "
        "Ma trận thừa số hóa (Matrix Factorization - ALS) học hội tụ hiệu quả mà không bị loãng thông tin.",
        "THỐNG KÊ TẬP DỮ LIỆU THỰC NGHIỆM:"
    )

    add_h2("4.2. Cơ chế suy giảm phi tuyến theo thời gian (Exponential Time-Decay)")
    add_p(
        "Nhu cầu công nghệ và sở thích của khách hàng luôn biến chuyển liên tục theo thời gian. Một lượt xem laptop "
        "cách đây 3 tháng không thể phản ánh chính xác ý định mua hàng hiện tại bằng một lượt nhấp chuột vào ngày hôm qua. "
        "Do đó, hệ thống áp dụng hàm phân rã thời gian hàm mũ (Exponential Time-Decay) vào từng tương tác:"
    )

    add_formula(
        "w_i = w_base * exp(-λ * Δt)",
        "w_base là trọng số danh định của hành vi; Δt là số ngày trôi qua kể từ thời điểm phát sinh tương tác; "
        "λ = ln(2) / T_half là hệ số suy giảm với chu kỳ bán rã T_half = 30 ngày."
    )

    add_p(
        "Quy luật này đảm bảo: sau đúng 30 ngày, giá trị đóng góp của hành vi giảm còn 50%; sau 60 ngày chỉ còn 25%. "
        "Điều này giữ cho vector hồ sơ người dùng luôn phản ánh chân thực thị hiếu đương thời."
    )

    add_h2("4.3. Giải thuật tổng hợp cặp Vector Hồ sơ người dùng")
    add_p(
        "Đối với mỗi người dùng u có danh sách lịch sử tương tác H_u = {(laptop_k, w_k)}, hệ thống chiếu hồ sơ "
        "vào hai không gian đặc trưng độc lập bằng phép tính trọng tâm có trọng số (Weighted Centroid) "
        "và chuẩn hóa L2:"
    )

    add_h3("a) Vector Cộng tác người dùng (user_cf_vector - 8 chiều)")
    add_p(
        "Tổng hợp từ các vector tiềm ẩn item_cf_vector (8 chiều) đã được huấn luyện bằng mô hình Implicit ALS:"
    )
    add_formula(
        "u_cf_raw = ( Σ_{k ∈ H_u} w_k * v_{cf}^{(k)} ) / ( Σ_{k ∈ H_u} w_k )",
        "v_{cf}^{(k)} là vector biểu diễn 8 chiều của sản phẩm thứ k trong không gian ALS."
    )
    add_bullet("Ý nghĩa nghiệp vụ: ", "Đại diện cho Gu thị hiếu và Xu hướng lựa chọn cộng đồng. ")
    add_p(
        "Mã hóa các đặc tính hành vi xã hội ngầm định: những người có ngân sách và thị hiếu tương đồng thường "
        "chọn các sản phẩm có khoảng cách gần nhau trong không gian ALS, ngay cả khi thông số kỹ thuật bên ngoài khác nhau."
    )

    add_h3("b) Vector Nội dung người dùng (user_content_vector - 384 chiều)")
    add_p(
        "Tổng hợp từ các vector ngữ nghĩa item_content_vector (384 chiều) trích xuất bằng Sentence-BERT "
        "(mô hình all-MiniLM-L6-v2) từ chuỗi đặc tả cấu hình (CPU, GPU, RAM, Ổ cứng, Màn hình, Phân khúc giá):"
    )
    add_formula(
        "u_content_raw = ( Σ_{k ∈ H_u} w_k * v_{content}^{(k)} ) / ( Σ_{k ∈ H_u} w_k )",
        "v_{content}^{(k)} là vector đặc trưng nội dung 384 chiều của laptop thứ k."
    )
    add_bullet("Ý nghĩa nghiệp vụ: ", "Đại diện cho Nhu cầu cấu hình phần cứng thực tế. ")
    add_p(
        "Nắm bắt chính xác các thuộc tính vật lý mà người dùng quan tâm (ví dụ: máy chuyên đồ họa cần GPU rời, "
        "máy lập trình cần RAM tối thiểu 16GB, máy doanh nhân cần màn hình đẹp mỏng nhẹ)."
    )

    add_h3("c) Chuẩn hóa không gian Euclid (L2-Normalization)")
    add_p(
        "Nhằm triệt tiêu sai lệch về biên độ độ dài do tần suất tương tác nhiều hay ít giữa các người dùng, "
        "cả hai vector bắt buộc phải được chuẩn hóa về vector đơn vị:"
    )
    add_formula(
        "u = u_raw / ||u_raw||_2 = u_raw / √( Σ_{d=1}^D u_d^2 )",
        "Đảm bảo ||u_cf||_2 = 1 và ||u_content||_2 = 1."
    )
    add_p(
        "Sau khi chuẩn hóa L2, độ tương đồng Cosine giữa vector người dùng và vector sản phẩm chính là tích vô hướng (Dot Product), "
        "tạo điều kiện tối ưu để MongoDB Atlas tính toán tức thời bằng phần cứng chỉ mục HNSW."
    )

    add_h2("4.4. Cơ chế thích ứng Khách vãng lai (Session Profile) và Cold-Start")
    add_bullet("Khách vãng lai (Guest Session): ", "Đối với người dùng chưa đăng nhập, hệ thống thu thập các sản phẩm vừa click/view trong phiên duyệt hiện tại, tính nhanh Session Vector tức thì trên RAM mà không cần ghi vào Database vĩnh viễn, giải quyết cá nhân hóa ngay từ cú nhấp chuột đầu tiên.")
    add_bullet("Cold-Start người dùng mới: ", "Khi người dùng hoàn toàn chưa có bất kỳ tương tác nào, hệ thống tự động kích hoạt bộ gợi ý dự phòng (Fallback Strategy) dựa trên danh sách Top Trending và Bán chạy nhất theo từng thương hiệu.")

    # =========================================================================
    # CHƯƠNG 5
    # =========================================================================
    add_h1("CHƯƠNG 5: TÌM KIẾM TƯƠNG ĐỒNG BẰNG MONGODB ATLAS VECTOR SEARCH VÀ HỢP NHẤT HYBRID")

    add_p(
        "Sau khi đã trích xuất được cặp vector hồ sơ người dùng, thách thức lớn nhất ở tầng Online Serving "
        "là làm thế nào để tìm ra các sản phẩm phù hợp nhất trong thời gian thực (độ trễ dưới 50ms) "
        "và kết hợp tối ưu giữa xu hướng hành vi cộng đồng với thông số phần cứng. "
        "Chương này trình bày kiến trúc truy vấn đồ thị xấp xỉ HNSW trên MongoDB Atlas và giải thuật "
        "hòa trộn điểm số Hybrid với tỷ lệ tối ưu 70% CF và 30% Content."
    )

    add_h2("5.1. Kiến trúc tìm kiếm xấp xỉ đồ thị HNSW trên MongoDB Atlas ($vectorSearch)")
    
    add_p(
        "Trước đây, nhiều hệ thống gợi ý thực hiện việc quét toàn bộ cơ sở dữ liệu về RAM Node.js rồi tính Cosine Similarity "
        "thủ công từng sản phẩm. Phương pháp này có độ phức tạp O(N), dẫn đến quá tải bộ nhớ và nghẽn CPU khi số lượng sản phẩm tăng cao. "
        "Đề tài đã giải quyết triệt để nút thắt cổ chai này bằng cách chuyển đổi sang sử dụng MongoDB Atlas Vector Search, "
        "dựa trên cấu trúc đồ thị phân tầng HNSW (Hierarchical Navigable Small World) với độ phức tạp truy vấn chỉ xấp xỉ O(log N)."
    )

    add_p(
        "Hệ thống thiết lập 2 chỉ mục tìm kiếm vector chuyên biệt trên MongoDB Atlas:"
    )

    # Bảng 2: Vector Search Indexes
    tbl2 = doc.add_table(rows=3, cols=5)
    tbl2.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl2)
    
    headers2 = ["Tên Index", "Trường dữ liệu", "Số chiều (Dim)", "Độ đo tương đồng", "Mục đích sử dụng"]
    for col_idx, h in enumerate(headers2):
        cell = tbl2.cell(0, col_idx)
        set_cell_background(cell, "1A365D")
        set_cell_margins(cell, top=140, bottom=140, left=150, right=150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    data2 = [
        ["item_cf_vector_index", "item_cf_vector", "8", "cosine", "Tìm kiếm độ tương đồng hành vi cộng tác (CF)"],
        ["item_content_vector_index", "item_content_vector", "384", "cosine", "Tìm kiếm độ tương đồng cấu hình phần cứng (SBERT)"],
    ]

    for row_idx, row_data in enumerate(data2, start=1):
        for col_idx, val in enumerate(row_data):
            cell = tbl2.cell(row_idx, col_idx)
            set_cell_background(cell, "FFFFFF")
            set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [1, 2, 3] else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.name = "Times New Roman"
            r.font.size = Pt(11)
            r.font.bold = (col_idx == 0)
            r.font.color.rgb = COLOR_BODY

    add_p("", space_after=4)

    add_p(
        "Quy trình thực thi truy vấn Aggregate song song hai tháp tại Backend:"
    )
    add_bullet("Nhánh CF: ", "Truy vấn user_cf_vector đối chiếu với index item_cf_vector_index -> Lấy Top 150 ứng viên kèm điểm Score_CF = vectorSearchScore.")
    add_bullet("Nhánh Content: ", "Truy vấn user_content_vector đối chiếu với index item_content_vector_index -> Lấy Top 150 ứng viên kèm điểm Score_Content = vectorSearchScore.")
    add_bullet("Gộp ứng viên (ScoreMap Merging): ", "Toàn bộ ứng viên từ hai nhánh được hợp nhất theo mã sản phẩm (Product _id) để chuẩn bị cho bước hòa trộn Hybrid.")

    add_h2("5.2. Thuật toán hòa trộn điểm số Hybrid (70% CF + 30% Content) và Cơ sở thực nghiệm")
    
    add_p(
        "Điểm số xếp hạng cuối cùng (Score_Final) của mỗi ứng viên laptop được tính toán theo công thức kết hợp tuyến tính có trọng số:"
    )

    add_formula(
        "Score_Final = α * Score_CF + (1 - α) * Score_Content \t với α = 0.7",
        "Score_CF là điểm tương đồng hành vi; Score_Content là điểm tương đồng cấu hình; α = 0.7 là trọng số tối ưu."
    )

    add_p(
        "Tỷ lệ 70% CF và 30% Content không phải là một giả định chủ quan, mà là kết luận được chứng minh khoa học "
        "qua thực nghiệm đánh giá xếp hạng xếp theo chỉ số NDCG@10 (Normalized Discounted Cumulative Gain tại Top 10):"
    )

    # Bảng 3: So sánh mô hình
    tbl3 = doc.add_table(rows=4, cols=4)
    tbl3.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl3)
    
    headers3 = ["Mô hình thử nghiệm", "Trọng số Alpha (α)", "NDCG@10", "Mức độ cải thiện"]
    for col_idx, h in enumerate(headers3):
        cell = tbl3.cell(0, col_idx)
        set_cell_background(cell, "1A365D")
        set_cell_margins(cell, top=140, bottom=140, left=150, right=150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    data3 = [
        ["Content-Only (SBERT thuần)", "α = 0.0", "0.01127", "Mốc cơ sở (Baseline)"],
        ["CF-Only (ALS thuần)", "α = 1.0", "0.02228", "+97.7% so với Content-Only"],
        ["Hybrid (70% CF + 30% Content)", "α = 0.7", "0.02477", "+119.8% (Tối ưu nhất - Đỉnh thực nghiệm)"],
    ]

    for row_idx, row_data in enumerate(data3, start=1):
        bg = "EBF8FF" if row_idx == 3 else "FFFFFF"
        for col_idx, val in enumerate(row_data):
            cell = tbl3.cell(row_idx, col_idx)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx in [1, 2, 3] else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.name = "Times New Roman"
            r.font.size = Pt(11)
            r.font.bold = (row_idx == 3 or col_idx == 0)
            r.font.color.rgb = COLOR_PRIMARY if row_idx == 3 else COLOR_BODY

    add_p("", space_after=4)

    add_p("Phân tích cơ sở khoa học của kết quả thực nghiệm:")
    add_bullet("Tại sao CF vượt trội hơn Content (+97.7%)? ", "CF học được từ chuỗi hành vi mua hàng thực tế của cộng đồng, phản ánh đúng sức hút thị trường, thương hiệu và uy tín sản phẩm — những yếu tố mà thông số kỹ thuật đơn thuần không thể lột tả được.")
    add_bullet("Tại sao Hybrid (α = 0.7) lại đạt điểm cao nhất (+11.2% so với CF thuần)? ", "Việc bổ sung đúng 30% trọng số nội dung đóng vai trò như một bộ kiểm định phần cứng. Nó đảm bảo các máy gợi ý vừa hợp xu hướng đám đông, vừa khớp đúng nhu cầu cấu hình của khách hàng, đồng thời làm giảm hiện tượng Popularity Bias (chỉ chăm chăm gợi ý các máy bán chạy đại trà).")

    add_h2("5.3. Cơ chế tự thích ứng trọng số (Dynamic Alpha) xử lý Cold-Start sản phẩm mới")
    add_p(
        "Một trong những ưu điểm nổi trội nhất của mô hình Hybrid so với CF truyền thống là khả năng loại bỏ bài toán "
        "Cold-Start cho sản phẩm mới nhập kho. Trong mã nguồn hybridRecService.js, hệ thống triển khai cơ chế Dynamic Alpha:"
    )
    add_bullet("Sản phẩm mới chưa có tương tác: ", "Laptop mới nhập kho chưa từng có ai click hay mua nên chưa có item_cf_vector. Lúc này hệ thống tự động gán effectiveAlpha = 0.0. Điểm số hoàn toàn do nhánh Content đảm nhiệm (Score_Final = Score_Content), giúp sản phẩm mới lập tức được tiếp cận đúng khách hàng tiềm năng ngay trong ngày đầu mở bán.")
    add_bullet("Sản phẩm thiếu vector nội dung: ", "Hệ thống tự động gán effectiveAlpha = 1.0, dùng 100% điểm CF.")

    add_h2("5.4. Các kỹ thuật hậu xử lý (Post-Processing & Diversity Filtering)")
    add_p(
        "Để đảm bảo trải nghiệm người dùng đạt chuẩn thương mại điện tử chuyên nghiệp, danh sách ứng viên sau khi tính điểm "
        "phải trải qua hai bộ lọc nghiệp vụ khắt khe:"
    )
    add_bullet("Bộ lọc đa dạng hóa thương hiệu (Brand Diversity Filter): ", "Quy định số lượng máy tối đa của một thương hiệu trong danh sách Top-K (mặc định maxPerBrand = 3). Ngăn chặn tình trạng danh sách gợi ý bị áp đảo đơn điệu bởi một hãng duy nhất (ví dụ toàn bộ 10 gợi ý đều là Asus), mở rộng cơ hội khám phá các thương hiệu tương đương cho người dùng.")
    add_bullet("Loại trừ sản phẩm đã mua (Purchase Exclusion): ", "Hệ thống tự động truy vấn bảng Order và OrderItem của người dùng, loại bỏ các mã laptop đã mua thành công, tránh lãng phí vị trí hiển thị vào sản phẩm khách hàng đã sở hữu.")

    add_h2("5.5. Tổng kết quy trình triển khai tại Backend")
    add_p(
        "Toàn bộ kiến trúc trên đã được lập trình hoàn chỉnh trong tệp hybridRecService.js tại backend của dự án. "
        "Quy trình xử lý một yêu cầu gợi ý diễn ra tuần tự qua các bước: "
        "(1) Nhận diện định danh người dùng hoặc phiên duyệt; "
        "(2) Tính toán hoặc truy xuất cặp vector hồ sơ (user_cf_vector và user_content_vector); "
        "(3) Thực thi song song 2 truy vấn Atlas $vectorSearch trên 2 chỉ mục HNSW; "
        "(4) Hòa trộn điểm số theo tỷ lệ 70% CF và 30% Content; "
        "(5) Áp dụng bộ lọc đa dạng thương hiệu và trả về danh sách Top-K kèm tỷ lệ phù hợp (Match Percentage) "
        "và lý do giải thích gợi ý minh bạch cho giao diện người dùng."
    )

    doc.save(output_path)
    print(f"✅ Đã tạo thành công file Word tại: {output_path}")

if __name__ == "__main__":
    out_file = r"d:\Project\KLTN_Laptop-ecommerce-ai-\CHUONG_4_VA_CHUONG_5_HE_THONG_RECOMMENDATION.docx"
    generate_doc(out_file)
