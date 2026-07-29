/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Cần dòng này để Next.js xuất ra thư mục 'out'
  images: {
    unoptimized: true, // Khuyên dùng cho static export
  },
};

export default nextConfig;