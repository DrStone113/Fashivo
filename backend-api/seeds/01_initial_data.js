// backend-api/seeds/01_initial_data.js
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries in reverse order of dependency
  await knex('cart_items').del();
  await knex('carts').del();
  await knex('products').del();
  await knex('categories').del();
  await knex('users').del();

  console.log('Cleared existing data from users, categories, products, carts, cart_items tables.');

  // --- Seed Users ---
  const users = [];
  const hashedPassword = await bcrypt.hash('password123', 12); // Hash a common password for all users

  for (let i = 0; i < 50; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email({ provider: 'fashivo.com', allowSpecialCharacters: false, firstName: faker.person.firstName(), lastName: faker.person.lastName() }).toLowerCase(),
      password: hashedPassword,
      address: faker.location.streetAddress(true) + ', ' + faker.location.city() + ', ' + faker.location.country(),
      // FIX: Use faker.string.numeric to ensure phone number is purely numeric and within length limit
      phone: faker.string.numeric({ length: { min: 10, max: 15 } }), // Generate 10-15 digit numeric phone
      role: i === 0 ? 'admin' : 'user', // First user is admin, others are regular users
      avatar_url: `/public/avatars/${faker.string.uuid()}.png`, // Placeholder for avatar
      created_at: faker.date.past({ years: 2 }),
      updated_at: faker.date.recent(),
    });
  }

  // Ensure unique emails
  const uniqueUsers = Array.from(new Map(users.map(user => [user.email, user])).values());
  await knex('users').insert(uniqueUsers);
  console.log(`Seeded ${uniqueUsers.length} users.`);

  // --- Seed Categories (Clothing specific) ---
  const predefinedCategories = [
    'Áo Thun', 'Áo Sơ Mi', 'Quần Jeans', 'Quần Tây', 'Váy Đầm',
    'Chân Váy', 'Áo Khoác', 'Đồ Ngủ', 'Đồ Thể Thao', 'Phụ Kiện',
    'Giày Dép', 'Túi Xách', 'Mũ Nón', 'Thắt Lưng', 'Đồ Lót',
    'Đồ Bơi', 'Đồ Trẻ Em', 'Đồ Nam', 'Đồ Nữ', 'Đồ Unisex'
  ];
  const categories = [];
  const categoryNamesSet = new Set();

  // Add predefined categories first
  for (const name of predefinedCategories) {
    if (!categoryNamesSet.has(name)) {
      categoryNamesSet.add(name);
      const url_path = name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      categories.push({
        name: name,
        url_path: url_path,
        description: `Các sản phẩm thuộc danh mục ${name}. ${faker.lorem.sentence({ min: 5, max: 15 })}`,
        created_at: faker.date.past({ years: 1.5 }),
        updated_at: faker.date.recent(),
      });
    }
  }

  // Fill remaining categories with faker if less than 50
  while (categories.length < 50) {
    let name = faker.commerce.department();
    while (categoryNamesSet.has(name) || name.length < 5) {
      name = faker.commerce.department() + ' ' + faker.string.alpha({ length: 3, casing: 'upper' }); // Add random suffix to ensure uniqueness
    }
    categoryNamesSet.add(name);
    const url_path = name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    categories.push({
      name: name,
      url_path: url_path,
      description: faker.lorem.sentence({ min: 10, max: 30 }),
      created_at: faker.date.past({ years: 1 }),
      updated_at: faker.date.recent(),
    });
  }

  await knex('categories').insert(categories);
  console.log(`Seeded ${categories.length} categories.`);
};