import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

const img = (seed, n, label = '') =>
  `/api/placeholder?w=900&h=900&seed=${encodeURIComponent(`${seed}-${n}`)}&label=${encodeURIComponent(label)}`;
const gallery = (seed, label) => [1, 2, 3, 4].map((n) => img(seed, n, label));

const categories = [
  { name: 'Home Decor', slug: 'home-decor', icon: 'Home', featured: true, description: 'Warm, handcrafted pieces that make a house a home.' },
  { name: 'Resin Art', slug: 'resin-art', icon: 'Waves', featured: true, description: 'Glossy epoxy creations frozen in time.' },
  { name: 'Clay Crafts', slug: 'clay-crafts', icon: 'Flower2', featured: true, description: 'Earthy, hand-moulded terracotta & clay.' },
  { name: 'Wall Decor', slug: 'wall-decor', icon: 'Frame', featured: true, description: 'Statement pieces for every wall.' },
  { name: 'Gift Items', slug: 'gift-items', icon: 'Gift', featured: true, description: 'Thoughtful handmade gifts for every occasion.' },
  { name: 'Festival Collection', slug: 'festival-collection', icon: 'Sparkles', featured: true, description: 'Celebrate every festival in handmade style.' },
  { name: 'Custom Orders', slug: 'custom-orders', icon: 'PenTool', featured: true, description: 'Personalised creations made just for you.' },
];

// name → category slug
// `image` (optional): path to a real product photo in client/public/products.
const productSeed = [
  // ── Real handmade creations (photographed) ──
  { name: 'Terracotta Pot Waterfall Fountain', slug: 'terracotta-pot-waterfall-fountain', cat: 'home-decor', price: 3499, discount: 15, material: 'Terracotta Pots, Resin, Artificial Plants', dimensions: '25 x 20 x 22cm', color: 'Terracotta', stock: 6, tags: ['fountain', 'waterfall', 'garden', 'decor'], badges: ['Handmade', 'Limited'], featured: true, image: '/products/fountain.jpg' },
  { name: '"Home" Mini Wall Planter', slug: 'home-mini-wall-planter', cat: 'wall-decor', price: 1199, discount: 10, material: 'Wood, Clay Pots, Artificial Flowers', dimensions: '12 x 10cm', color: 'Black', stock: 15, tags: ['home', 'planter', 'wall', 'gift'], badges: ['Handmade', 'New'], featured: true, image: '/products/home-planter.jpg' },
  { name: 'Maroon Velvet Pearl Flower', slug: 'maroon-velvet-pearl-flower', cat: 'wall-decor', price: 849, discount: 0, material: 'Velvet Wire, Pearls', dimensions: '18cm diameter', color: 'Maroon', stock: 20, tags: ['flower', 'velvet', 'pearl', 'decor'], badges: ['Handmade'], featured: true, image: '/products/velvet-flower.jpg' },
  { name: 'Floral Hoop Wall Hanging', slug: 'floral-hoop-wall-hanging', cat: 'wall-decor', price: 1099, discount: 5, material: 'Embroidery Hoop, Mirror Work, Beads', dimensions: '25cm diameter', color: 'Red', stock: 12, tags: ['hoop', 'wall hanging', 'mirror', 'festive'], badges: ['Handmade', 'New'], featured: true, image: '/products/hoop-hanging.jpg' },
];

const description = (name, material) =>
  `The ${name} is lovingly handcrafted in small batches at Manju's Atelier. Made from premium ${material}, ` +
  `each piece carries subtle variations that make it truly one of a kind. Designed to add warmth and character ` +
  `to your space, it makes a meaningful gift or a treasured keepsake. Because every item is made by hand, no two ` +
  `are exactly alike — that's the beauty of handmade.`;

const care = 'Wipe gently with a soft, dry cloth. Avoid direct sunlight and harsh chemicals. Handle with care.';

async function run() {
  await connectDB(process.env.MONGODB_URI);
  console.log('Clearing existing catalog…');
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const createdCats = await Category.insertMany(
    categories.map((c) => ({ ...c, image: img(c.slug, 1, c.name) }))
  );
  const catMap = Object.fromEntries(createdCats.map((c) => [c.slug, c._id]));

  const products = productSeed.map((p) => ({
    name: p.name,
    slug: p.slug,
    description: description(p.name, p.material),
    price: p.price,
    discount: p.discount,
    images: p.image ? [p.image] : gallery(p.slug, p.name),
    category: catMap[p.cat],
    material: p.material,
    dimensions: p.dimensions,
    careInstructions: care,
    color: p.color,
    stock: p.stock,
    rating: 0,
    reviewCount: 0,
    tags: p.tags,
    badges: p.badges,
    featured: p.featured,
  }));
  await Product.insertMany(products);
  console.log(`✓ Seeded ${createdCats.length} categories, ${products.length} products`);

  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 999, maxDiscount: 500 },
    { code: 'HANDMADE15', type: 'percent', value: 15, minSubtotal: 1999, maxDiscount: 800 },
    { code: 'FLAT200', type: 'flat', value: 200, minSubtotal: 1499 },
  ]);
  console.log('✓ Seeded 3 coupons (WELCOME10, HANDMADE15, FLAT200)');

  // Demo admin + user (only if absent)
  const adminEmail = 'admin@manjusatelier.com';
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({ name: 'Manju Admin', email: adminEmail, password: 'Admin@12345', role: 'admin' });
    console.log(`✓ Admin user created: ${adminEmail} / Admin@12345`);
  }
  const demoEmail = 'demo@manjusatelier.com';
  if (!(await User.findOne({ email: demoEmail }))) {
    await User.create({ name: 'Demo Customer', email: demoEmail, password: 'Demo@12345' });
    console.log(`✓ Demo user created: ${demoEmail} / Demo@12345`);
  }

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
