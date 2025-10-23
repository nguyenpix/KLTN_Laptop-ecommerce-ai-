/**
 * TEXT CHUNKER UTILITY
 * Chia text dài thành các chunks nhỏ hợp lý cho embedding
 */

class TextChunker {
  constructor() {
    this.maxChunkTokens = 512; // tokens
    this.overlapTokens = 50; // overlap giữa các chunks
    // Ước tính: 1 token ≈ 4 characters (tiếng Việt)
    this.maxChunkChars = this.maxChunkTokens * 4; // ~2000 chars
    this.overlapChars = this.overlapTokens * 4; // ~200 chars
  }

  /**
   * Chia text thành chunks có overlap
   * @param {string} text - Text cần chia
   * @param {number} maxChars - Số ký tự tối đa mỗi chunk
   * @param {number} overlapChars - Số ký tự overlap
   * @returns {string[]} - Array of chunks
   */
  chunkText(text, maxChars = null, overlapChars = null) {
    if (!text || text.trim().length === 0) return [];
    
    maxChars = maxChars || this.maxChunkChars;
    overlapChars = overlapChars || this.overlapChars;

    // Chia theo câu (tốt hơn chia theo ký tự)
    const sentences = text.match(/[^.!?。]+[.!?。]+/g) || [text];
    
    const chunks = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      // Nếu thêm câu này vượt quá maxChars
      if ((currentChunk + sentence).length > maxChars) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          
          // Lấy overlap từ cuối chunk hiện tại
          const words = currentChunk.trim().split(/\s+/);
          const overlapWords = Math.ceil(overlapChars / 5); // Ước tính 5 chars/word
          currentChunk = words.slice(-overlapWords).join(' ') + ' ';
        }
        currentChunk += sentence;
      } else {
        currentChunk += sentence;
      }
    }
    
    // Thêm chunk cuối cùng
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(chunk => chunk.length > 20); // Bỏ chunks quá ngắn
  }

  /**
   * Chunking thông minh theo ngữ nghĩa (HTML aware)
   * @param {string} text - Text có thể chứa HTML tags
   * @returns {string[]} - Array of semantic chunks
   */
  semanticChunking(text) {
    if (!text || text.trim().length === 0) return [];
    
    const sections = [];
    
    // 1. Tách theo heading (nếu có HTML tags)
    if (text.includes('<h') || text.includes('<H')) {
      const htmlChunks = text.split(/<h[1-6][^>]*>|<\/h[1-6]>/gi);
      const validChunks = htmlChunks
        .map(c => this.stripHtml(c))
        .filter(c => c.trim().length > 50);
      
      if (validChunks.length > 0) return validChunks;
    }
    
    // 2. Tách theo paragraph
    const paragraphs = text.split(/\n\n+/);
    let currentSection = '';
    
    for (const para of paragraphs) {
      const cleanPara = this.stripHtml(para);
      
      if ((currentSection + cleanPara).length > this.maxChunkChars) {
        if (currentSection.trim()) {
          sections.push(currentSection.trim());
        }
        currentSection = cleanPara;
      } else {
        currentSection += (currentSection ? '\n\n' : '') + cleanPara;
      }
    }
    
    if (currentSection.trim()) {
      sections.push(currentSection.trim());
    }
    
    return sections.length > 0 ? sections : [this.stripHtml(text)];
  }

  /**
   * Lấy N đoạn văn đầu tiên
   * @param {string} text - Text đầy đủ
   * @param {number} n - Số đoạn văn
   * @returns {string} - N đoạn văn đầu tiên
   */
  extractFirstParagraphs(text, n = 3) {
    if (!text) return '';
    
    const cleanText = this.stripHtml(text);
    const paragraphs = cleanText.split(/\n\n+/);
    return paragraphs.slice(0, n).join('\n\n');
  }

  /**
   * Strip HTML tags
   * @param {string} html - HTML text
   * @returns {string} - Plain text
   */
  stripHtml(html) {
    if (!html) return '';
    
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Format specifications thành text dễ đọc
   * @param {Object} specs - Specifications object
   * @returns {string} - Formatted text
   */
  formatSpecs(specs) {
    if (!specs || typeof specs !== 'object') return '';
    
    const labels = {
      cpu: '🔧 CPU',
      gpu: '🎮 GPU',
      ram: '💾 RAM',
      display: '🖥️ Màn hình',
      storage_type: '💿 Loại ổ cứng',
      storage_capacity: '📦 Dung lượng',
      battery: '🔋 Pin',
      weight: '⚖️ Trọng lượng',
      os: '💻 Hệ điều hành',
      webcam: '📷 Webcam',
      keyboard: '⌨️ Bàn phím',
      ports: '🔌 Cổng kết nối',
      connectivity: '📡 Kết nối',
      audio: '🔊 Audio',
      size: '📏 Kích thước',
      material: '🏗️ Chất liệu',
      security: '🔒 Bảo mật',
      accessories: '📦 Phụ kiện'
    };

    return Object.entries(specs)
      .filter(([_, value]) => value)
      .map(([key, value]) => {
        const label = labels[key] || key;
        return `${label}: ${value}`;
      })
      .join('\n');
  }

  /**
   * Tạo summary text cho sản phẩm
   * @param {Object} product - Product object (populated)
   * @returns {string} - Summary text
   */
  createSummaryText(product) {
    const parts = [
      `Sản phẩm: ${product.name}`,
      product.title !== product.name && `Tên đầy đủ: ${product.title}`,
      `Giá: ${product.price.toLocaleString('vi-VN')} VND`,
      product.brand_id?.name && `Thương hiệu: ${product.brand_id.name}`,
      product.category_id?.length > 0 && `Danh mục: ${product.category_id.map(c => c.name).join(', ')}`,
      product.color_id?.name && `Màu sắc: ${product.color_id.name}`,
      '',
      'Thông số nổi bật:',
      product.specifications?.cpu && `- CPU: ${product.specifications.cpu}`,
      product.specifications?.gpu && `- GPU: ${product.specifications.gpu}`,
      product.specifications?.ram && `- RAM: ${product.specifications.ram}`,
      product.specifications?.display && `- Màn hình: ${product.specifications.display}`,
      product.specifications?.storage_capacity && product.specifications?.storage_type && 
        `- Lưu trữ: ${product.specifications.storage_capacity} ${product.specifications.storage_type}`,
      product.specifications?.battery && `- Pin: ${product.specifications.battery}`,
      product.specifications?.weight && `- Trọng lượng: ${product.specifications.weight}`,
      '',
      this.extractFirstParagraphs(product.description_clean || product.description, 2)
    ];
    
    return parts.filter(Boolean).join('\n').trim();
  }

  /**
   * Tạo text cho recommendation embedding
   * @param {Object} product - Product object (populated)
   * @returns {string} - Text for recommendation
   */
  createRecommendationText(product) {
    const specs = product.specifications || {};
    
    const parts = [
      product.name,
      product.brand_id?.name,
      product.category_id?.map(c => c.name).join(' '),
      `Giá ${Math.floor(product.price / 1000000)} triệu`,
      specs.cpu,
      specs.gpu,
      specs.ram,
      specs.storage_capacity,
      specs.display,
      product.tags?.join(' ')
    ];
    
    return parts.filter(Boolean).join('. ').trim();
  }

  /**
   * Ước tính số tokens
   * @param {string} text - Text to estimate
   * @returns {number} - Estimated token count
   */
  estimateTokens(text) {
    if (!text) return 0;
    // Ước tính: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
}

export default new TextChunker();
