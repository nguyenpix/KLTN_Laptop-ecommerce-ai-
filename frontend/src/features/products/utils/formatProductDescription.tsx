import React from 'react';

/**
 * Helper to parse raw unformatted crawler text into a beautifully structured,
 * SEO-friendly product description with sections, highlighted keywords, and bullet points.
 */
export function renderFormattedDescription(rawDescription: string, productTitle?: string): React.ReactNode {
  if (!rawDescription) {
    return <p className="text-gray-500 italic">Chưa có thông tin mô tả chi tiết cho sản phẩm này.</p>;
  }

  // Pre-process: Insert clean breaks before Roman numerals and numbered points if missing
  let text = rawDescription
    .replace(/(I{1,3}|IV|V|VI|VII|VIII)\.\s*/g, '\n\n###SECTION###$1. ')
    .replace(/(?<!\d)([1-6])\.\s+([A-ZÀ-Ỹ][^.:\n]{3,40}:)/g, '\n\n###BULLET###$1. $2')
    .replace(/([.!?])\s*([A-ZÀ-Ỹ][a-zà-ỹA-Z0-9\s]{3,30}:)/g, '$1\n\n###POINT###$2');

  const blocks = text.split(/\n\n+/).filter(b => b.trim().length > 0);

  // Keywords to highlight in blue
  const highlightRegex = /(laptop văn phòng|laptop gaming|Copilot\+\s*PC|AI TOPS|Intel® Core™|Intel Core|AMD Ryzen™|Ryzen|OLED|Full HD|WUXGA|IPS|SSD M\.2 NVMe|SSD|DDR4|DDR5|LPDDR5x|Wi-Fi 6E|SonicMaster|Bảo mật vân tay|MIL-STD-810H|RTX™?\s*\d{4})/gi;

  const renderWithHighlights = (content: string) => {
    const parts = content.split(highlightRegex);
    return parts.map((part, i) => {
      if (part.match(highlightRegex)) {
        return (
          <span key={i} className="font-semibold text-blue-600">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        // 1. Major Section Heading (e.g. I. Đặc điểm nổi bật, II. Đánh giá chi tiết)
        if (trimmed.startsWith('###SECTION###')) {
          const sectionTitle = trimmed.replace('###SECTION###', '');
          return (
            <div key={idx} className="pt-4 border-t border-gray-100 first:border-t-0 first:pt-0">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="h-5 w-1 bg-blue-600 rounded-full inline-block"></span>
                {sectionTitle}
              </h3>
            </div>
          );
        }

        // 2. Numbered / Bullet Point with Feature Title (e.g. 1. Hiệu năng ổn định: ...)
        if (trimmed.startsWith('###BULLET###') || trimmed.startsWith('###POINT###')) {
          const cleanItem = trimmed.replace(/###(BULLET|POINT)###/, '');
          const colonIdx = cleanItem.indexOf(':');

          if (colonIdx !== -1) {
            const label = cleanItem.substring(0, colonIdx).trim();
            const desc = cleanItem.substring(colonIdx + 1).trim();

            return (
              <div key={idx} className="flex items-start gap-3 pl-2 py-1">
                <span className="text-blue-600 text-lg leading-none mt-1">•</span>
                <p className="text-base text-gray-700">
                  <strong className="font-semibold text-gray-900">{label}: </strong>
                  {renderWithHighlights(desc)}
                </p>
              </div>
            );
          }
        }

        // 3. Regular Paragraph
        return (
          <p key={idx} className="text-base text-gray-700 leading-relaxed">
            {renderWithHighlights(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
