import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { asyncHandler, ApiError } from '../middleware/error.js';
import { getCache, setCache, clearCachePattern } from '../utils/cache.js';

/**
 * GET /api/products
 * Supports: search, category (slug), material, color, minPrice, maxPrice,
 * inStock, sort, page, limit.
 */
export const getProducts = asyncHandler(async (req, res) => {
  const cacheKey = `products:${req.originalUrl}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const {
    search,
    category,
    material,
    color,
    minPrice,
    maxPrice,
    inStock,
    sort = 'newest',
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  const filter = {};

  if (search) filter.$text = { $search: search };
  if (material) filter.material = new RegExp(`^${material}$`, 'i');
  if (color) filter.color = new RegExp(`^${color}$`, 'i');
  if (featured) filter.featured = featured === 'true';
  if (inStock === 'true') filter.stock = { $gt: 0 };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter.category = cat._id;
    else return res.json({ success: true, products: [], total: 0, page: 1, pages: 0 });
  }

  const sortMap = {
    newest: { createdAt: -1 },
    popular: { reviewCount: -1, rating: -1 },
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    rating: { rating: -1 },
  };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(48, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  const responseData = {
    success: true,
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  };

  await setCache(cacheKey, responseData, 3600);
  res.json(responseData);
});

export const getFeatured = asyncHandler(async (req, res) => {
  const cacheKey = 'products:featured';
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const products = await Product.find({ featured: true })
    .populate('category', 'name slug')
    .limit(8);
    
  const responseData = { success: true, products };
  await setCache(cacheKey, responseData, 3600);
  res.json(responseData);
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const cacheKey = `products:slug:${req.params.slug}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json(cached);

  const product = await Product.findOne({ slug: req.params.slug }).populate(
    'category',
    'name slug'
  );
  if (!product) throw new ApiError(404, 'Product not found');

  const related = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
  })
    .limit(4)
    .populate('category', 'name slug');

  const responseData = { success: true, product, related };
  await setCache(cacheKey, responseData, 3600);
  res.json(responseData);
});

// ---- Admin ----
const slugify = (str) =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (!data.slug && data.name) data.slug = slugify(data.name);
  if (data.slug && (await Product.exists({ slug: data.slug }))) {
    data.slug = `${data.slug}-${Date.now().toString(36).slice(-4)}`;
  }
  const product = await Product.create(data);
  await clearCachePattern('products');
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  await clearCachePattern('products');
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  await clearCachePattern('products');
  res.json({ success: true, message: 'Product deleted' });
});
