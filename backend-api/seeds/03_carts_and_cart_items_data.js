// backend-api/seeds/03_carts_and_cart_items_data.js
const { faker } = require('@faker-js/faker');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries in reverse order of dependency
  await knex('cart_items').del();
  await knex('carts').del();

  console.log('Cleared existing data from carts and cart_items tables.');

  // Fetch existing users and products, including product price
  const users = await knex('users').select('id');
  const products = await knex('products').select('id', 'stock', 'price'); // Select 'price' column

  if (users.length === 0) {
    console.warn('No users found. Please run 01_initial_data.js first.');
    return;
  }
  if (products.length === 0) {
    console.warn('No products found. Please run 02_products_data.js first.');
    return;
  }

  const userIds = users.map(user => user.id);
  const productDataMap = new Map(products.map(p => [p.id, p])); // Map product ID to its data

  // --- Seed Carts (one cart per user) ---
  const carts = [];
  for (const userId of userIds) {
    carts.push({
      user_id: userId,
      created_at: faker.date.past({ years: 0.5 }),
      updated_at: faker.date.recent(),
    });
  }
  await knex('carts').insert(carts);
  console.log(`Seeded ${carts.length} carts.`);

  // Fetch the newly created carts to get their IDs
  const createdCarts = await knex('carts').select('id', 'user_id');

  // --- Seed Cart Items ---
  const cartItems = [];
  for (const cart of createdCarts) {
    // Each cart will have a random number of items (1 to 5)
    const numberOfItems = faker.number.int({ min: 1, max: 5 });
    // Filter out products that might not exist or have no stock, then select unique product IDs
    const availableProductIds = products.filter(p => p.stock > 0).map(p => p.id);

    if (availableProductIds.length === 0) {
        console.warn(`No available products to add to cart ${cart.id}. Skipping cart items for this cart.`);
        continue;
    }

    const selectedProductIds = faker.helpers.arrayElements(availableProductIds, Math.min(numberOfItems, availableProductIds.length)); // Select unique product IDs, max available

    for (const productId of selectedProductIds) {
      const product = productDataMap.get(productId);
      if (product) { // Ensure product exists
        const quantity = faker.number.int({ min: 1, max: Math.min(5, product.stock) }); // Quantity up to 5 or available stock
        cartItems.push({
          cart_id: cart.id,
          product_id: productId,
          quantity: quantity,
          price: product.price, // Use the product's price at the time of seeding
          created_at: faker.date.recent(),
        });
      }
    }
  }

  // Use a transaction for inserting cart items to handle potential unique constraint violations
  await knex.transaction(async trx => {
    for (const item of cartItems) {
      try {
        await trx('cart_items').insert(item);
      } catch (error) {
        // Log error but continue if it's a unique constraint violation (e.g., if faker somehow picked same product twice for same cart)
        if (error.code === '23505') { // PostgreSQL unique violation error code
          console.warn(`Skipping duplicate cart item: cart_id=${item.cart_id}, product_id=${item.product_id}`);
        } else {
          throw error; // Re-throw other errors
        }
      }
    }
  });

  console.log(`Seeded ${cartItems.length} cart items.`);
};
