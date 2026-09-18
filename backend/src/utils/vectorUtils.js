/**
 * Vector Mathematics Utility for Hybrid Recommendation System
 * Cung cấp các phép tính đại số tuyến tính tối ưu hiệu năng trên Node.js
 */

/**
 * Tính tích vô hướng giữa 2 vector (Dot Product)
 * @param {number[]} a 
 * @param {number[]} b 
 * @returns {number}
 */
export function dotProduct(a, b) {
  if (!a || !b || a.length !== b.length || a.length === 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Tính chuẩn L2 (độ dài / Euclidean norm / magnitude) của vector
 * @param {number[]} v 
 * @returns {number}
 */
export function l2Norm(v) {
  if (!v || v.length === 0) return 0;
  let sumSq = 0;
  for (let i = 0; i < v.length; i++) {
    sumSq += v[i] * v[i];
  }
  return Math.sqrt(sumSq);
}

/**
 * Chuẩn hóa vector thành vector đơn vị (L2 Normalization: v / ||v||)
 * @param {number[]} v 
 * @returns {number[]}
 */
export function l2Normalize(v) {
  if (!v || v.length === 0) return [];
  const norm = l2Norm(v);
  if (norm === 0 || isNaN(norm)) return new Array(v.length).fill(0);
  return v.map(val => val / norm);
}

/**
 * Tính độ tương đồng Cosine giữa 2 vector: (a . b) / (||a|| * ||b||)
 * Kết quả trả về trong khoảng [-1, 1], chuẩn hóa an toàn về [0, 1] nếu cần
 * @param {number[]} a 
 * @param {number[]} b 
 * @param {boolean} normalize01 - Nếu true, scale từ [-1, 1] về [0, 1]
 * @returns {number}
 */
export function cosineSimilarity(a, b, normalize01 = true) {
  if (!a || !b || a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0 || isNaN(denominator)) {
    return 0;
  }

  const sim = dot / denominator;
  // Bọc giá trị trong khoảng [-1, 1] tránh lỗi số thực
  const clampedSim = Math.max(-1, Math.min(1, sim));

  if (normalize01) {
    // Map từ [-1, 1] sang [0, 1]
    return (clampedSim + 1) / 2;
  }

  return clampedSim;
}

/**
 * Tính trung bình cộng có trọng số của một danh sách vector (Weighted Vector Average)
 * Công thức: u = Σ(w_i * v_i) / Σ(w_i)
 * Sau đó chuẩn hóa L2 để đảm bảo độ dài vector ổn định
 * @param {number[][]} vectors - Mảng các vector (cùng số chiều)
 * @param {number[]} weights - Mảng các trọng số tương ứng
 * @param {boolean} normalize - Có chuẩn hóa L2 sau khi tính hay không (mặc định: true)
 * @returns {number[]}
 */
export function weightedVectorAverage(vectors, weights, normalize = true) {
  if (!vectors || vectors.length === 0) return [];

  // Lọc các vector và weight hợp lệ
  const validPairs = [];
  for (let i = 0; i < vectors.length; i++) {
    if (vectors[i] && Array.isArray(vectors[i]) && vectors[i].length > 0) {
      const w = (weights && typeof weights[i] === 'number' && weights[i] > 0) ? weights[i] : 1;
      validPairs.push({ vector: vectors[i], weight: w });
    }
  }

  if (validPairs.length === 0) return [];

  const dim = validPairs[0].vector.length;
  const result = new Array(dim).fill(0);
  let totalWeight = 0;

  for (const pair of validPairs) {
    if (pair.vector.length !== dim) continue; // Bỏ qua vector sai kích thước
    for (let d = 0; d < dim; d++) {
      result[d] += pair.vector[d] * pair.weight;
    }
    totalWeight += pair.weight;
  }

  if (totalWeight === 0) return new Array(dim).fill(0);

  // Chia cho tổng trọng số
  for (let d = 0; d < dim; d++) {
    result[d] /= totalWeight;
  }

  if (normalize) {
    return l2Normalize(result);
  }

  return result;
}

/**
 * Min-Max Scaling: Chuẩn hóa một mảng điểm số về khoảng [minRange, maxRange]
 * @param {number[]} scores 
 * @param {number} minRange - Mặc định 0
 * @param {number} maxRange - Mặc định 1
 * @returns {number[]}
 */
export function minMaxScale(scores, minRange = 0, maxRange = 1) {
  if (!scores || scores.length === 0) return [];
  if (scores.length === 1) return [maxRange];

  let min = Infinity;
  let max = -Infinity;

  for (const s of scores) {
    if (s < min) min = s;
    if (s > max) max = s;
  }

  if (max === min) {
    return scores.map(() => (minRange + maxRange) / 2);
  }

  const range = max - min;
  const targetRange = maxRange - minRange;

  return scores.map(s => minRange + ((s - min) / range) * targetRange);
}

/**
 * Hàm Sigmoid chuẩn hóa: 1 / (1 + e^(-x))
 * @param {number} x 
 * @returns {number}
 */
export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Tính hệ số suy giảm theo thời gian (Exponential Time-Decay)
 * Công thức: decay = e^(-λ * Δt) với λ = ln(2) / halfLifeDays
 * @param {number|Date} timestamp - Thời gian tương tác
 * @param {number} halfLifeDays - Chu kỳ bán rã (mặc định 30 ngày)
 * @returns {number} Hệ số từ 0 đến 1
 */
export function calculateTimeDecay(timestamp, halfLifeDays = 30) {
  if (!timestamp) return 1.0;
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const now = Date.now();
  const diffDays = Math.max(0, (now - time) / (1000 * 60 * 60 * 24));
  
  const lambda = Math.LN2 / halfLifeDays;
  return Math.exp(-lambda * diffDays);
}
