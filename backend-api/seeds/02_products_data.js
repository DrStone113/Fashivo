// backend-api/seeds/02_products_data.js
const { faker } = require('@faker-js/faker');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Fetch existing categories to link products to them
  const categories = await knex('categories').select('id', 'name');
  if (categories.length === 0) {
    console.warn('No categories found. Please run 01_initial_data.js first.');
    return;
  }
  const categoryIds = categories.map(cat => cat.id);
  const categoryNamesMap = new Map(categories.map(cat => [cat.id, cat.name]));

  const products = [];
  const clothingTypes = [
    'Áo Thun', 'Áo Sơ Mi', 'Quần Jeans', 'Quần Kaki', 'Váy', 'Đầm',
    'Áo Khoác', 'Hoodie', 'Sweater', 'Chân Váy', 'Đồ Bơi', 'Đồ Ngủ',
    'Giày Sneaker', 'Giày Cao Gót', 'Dép', 'Túi Xách', 'Ba Lô',
    'Nón', 'Khăn Choàng', 'Thắt Lưng', 'Vớ', 'Kính Mát', 'Trang Sức'
  ];

  for (let i = 0; i < 50; i++) {
    const stock = faker.number.int({ min: 0, max: 500 }); // More realistic stock for clothing
    const categoryId = faker.helpers.arrayElement(categoryIds);
    const categoryName = categoryNamesMap.get(categoryId);
    const productNamePrefix = faker.helpers.arrayElement(clothingTypes);

    // Generate a more descriptive product name
    const productName = `${faker.commerce.productAdjective()} ${productNamePrefix} ${faker.commerce.productMaterial()}`;

    // --- THAY ĐỔI QUAN TRỌNG Ở ĐÂY: SỬ DỤNG FAKER CHO URL HÌNH ẢNH THỰC TẾ ---
    // Sử dụng faker.image.urlLoremFlickr() để tạo URL ảnh ngẫu nhiên từ LoremFlickr
    // Các từ khóa 'clothing', 'fashion', 'abstract' giúp tạo ra ảnh liên quan
    const imageUrl = faker.image.urlLoremFlickr({
      width: 640,
      height: 480,
      category: ['clothing', 'fashion', 'abstract'], // Thêm các từ khóa liên quan đến quần áo
      // Có thể thêm options để tránh ảnh người nếu muốn
      // https://loremflickr.com/g/640/480/clothing,fashion,abstract
    });

    // Hoặc bạn có thể dùng Picsum Photos nếu thích ảnh phong cảnh/trừu tượng hơn:
    // const imageUrl = faker.image.urlPicsumPhotos({ width: 640, height: 480 });


    products.push({
      type: productNamePrefix, // Use the specific clothing type as 'type'
      name: productName,
      description: `${faker.lorem.sentence({ min: 10, max: 30 })}. Chất liệu: ${faker.commerce.productMaterial()}, Màu sắc: ${faker.color.human()}.`,
      price: faker.commerce.price({ min: 99000, max: 2999000, dec: 0 }), // Prices in VND, common clothing range
      stock: stock,
      available: stock > 0 ? faker.datatype.boolean({ probability: 0.95 }) : false, // High probability of being available if in stock
      image_url: imageUrl, // <-- Đã thay đổi để sử dụng URL ảnh thực tế
      category_id: categoryId,
      created_at: faker.date.past({ years: 1.5 }),
      updated_at: faker.date.recent(),
    });
  }

  await knex('products').insert(products);
  console.log(`Seeded ${products.length} products.`);
};
