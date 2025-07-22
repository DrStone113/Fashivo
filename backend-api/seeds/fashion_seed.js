const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // 1. Dọn dẹp dữ liệu cũ theo thứ tự ngược lại để tránh lỗi khóa ngoại
  await knex("cart_items").del();
  await knex("products").del();
  await knex("carts").del();
  await knex("categories").del();
  await knex("users").del();

  // 2. Tạo dữ liệu người dùng (Users)
  const users = [];
  const numberOfUsers = 15;
  const saltRounds = 10;
  const plainPassword = "password123";
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

  for (let i = 0; i < numberOfUsers; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      phone: faker.phone.number("09########"), // Tạo SĐT 10 số của Việt Nam
      role: i === 0 ? "admin" : "user", // Người dùng đầu tiên là admin
      avatar_url: faker.image.avatar(),
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
  const createdUsers = await knex("users").insert(users).returning("*");

  // 3. Tạo dữ liệu danh mục (Categories)
  const categories = [
    {
      name: "T-Shirts",
      url_path: "/t-shirts",
      description: "Áo thun thoải mái, phong cách cho mọi ngày.",
    },
    {
      name: "Shirts",
      url_path: "/shirts",
      description: "Áo sơ mi lịch sự và năng động.",
    },
    {
      name: "Jeans",
      url_path: "/jeans",
      description: "Đa dạng các loại quần jean cho mọi phong cách.",
    },
    {
      name: "Shorts",
      url_path: "/shorts",
      description: "Quần short mát mẻ cho mùa hè năng động.",
    },
    {
      name: "Dresses",
      url_path: "/dresses",
      description: "Váy đầm thanh lịch, nữ tính cho mọi dịp.",
    },
    {
      name: "Jackets",
      url_path: "/jackets",
      description: "Giữ ấm và thể hiện cá tính với bộ sưu tập áo khoác.",
    },
    {
      name: "Footwear",
      url_path: "/footwear",
      description: "Giày, bốt và sneakers để hoàn thiện bộ trang phục.",
    },
    {
      name: "Accessories",
      url_path: "/accessories",
      description: "Những phụ kiện nhỏ giúp nâng tầm phong cách.",
    },
  ];
  const createdCategories = await knex("categories")
    .insert(categories)
    .returning("*");

  // --- Dữ liệu để tạo tên sản phẩm thời trang thực tế hơn ---
  const adjectives = [
    "Basic",
    "Classic",
    "Vintage",
    "Modern",
    "Minimalist",
    "Streetwear",
    "Elegant",
  ];
  const materials = [
    "Cotton",
    "Linen",
    "Denim",
    "Silk",
    "Wool",
    "Polyester",
    "Organic Cotton",
  ];
  const productTypesByCategory = {
    "T-Shirts": [
      "Graphic T-Shirt",
      "Polo T-Shirt",
      "V-Neck T-Shirt",
      "Long-Sleeve Tee",
      "Tank Top",
    ],
    Shirts: ["Oxford Shirt", "Flannel Shirt", "Cuban Shirt", "Linen Shirt"],
    Jeans: [
      "Skinny Jeans",
      "Straight-Leg Jeans",
      "Bootcut Jeans",
      "Ripped Jeans",
      "Mom Jeans",
    ],
    Shorts: ["Cargo Shorts", "Denim Shorts", "Chino Shorts", "Bermuda Shorts"],
    Dresses: [
      "Summer Dress",
      "Evening Gown",
      "Cocktail Dress",
      "Maxi Dress",
      "Office Dress",
    ],
    Jackets: [
      "Denim Jacket",
      "Leather Jacket",
      "Bomber Jacket",
      "Blazer",
      "Windbreaker",
    ],
    Footwear: [
      "Leather Boots",
      "Sneakers",
      "Sandals",
      "Running Shoes",
      "Loafers",
    ],
    Accessories: [
      "Leather Belt",
      "Silk Scarf",
      "Beanie Hat",
      "Sunglasses",
      "Canvas Tote Bag",
    ],
  };

  // *** UPDATED SECTION ***
  // Sử dụng một danh sách các URL ảnh tĩnh để đảm bảo sự ổn định
  const fashionImageUrls = [
    "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1485031/pexels-photo-1485031.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1154861/pexels-photo-1154861.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1639729/pexels-photo-1639729.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1102797/pexels-photo-1102797.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
    "https://images.pexels.com/photos/2897529/pexels-photo-2897529.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1",
  ];

  // 4. Tạo dữ liệu sản phẩm (Products)
  const products = [];
  const numberOfProducts = 100; // Tăng số lượng sản phẩm

  for (let i = 0; i < numberOfProducts; i++) {
    const category = faker.helpers.arrayElement(createdCategories);
    const productType = faker.helpers.arrayElement(
      productTypesByCategory[category.name]
    );
    const adjective = faker.helpers.arrayElement(adjectives);
    const material = faker.helpers.arrayElement(materials);

    const productName = `${adjective} ${productType}`; // Ví dụ: "Vintage Bomber Jacket"
    const productDescription = `Introducing the ${productName}. A perfect blend of style and comfort. Crafted from high-quality ${material}. ${faker.lorem.paragraph(2)}`;

    products.push({
      name: productName,
      type: faker.helpers.arrayElement([
        "Slim Fit",
        "Regular Fit",
        "Loose Fit",
        "Oversized",
      ]),
      description: productDescription,
      price:
        Math.round(faker.number.int({ min: 250000, max: 3000000 }) / 1000) *
        1000, // Giá từ 250,000 đến 3,000,000 VND
      available: faker.datatype.boolean(0.9), // 90% sản phẩm có sẵn
      // Chọn ngẫu nhiên một URL từ danh sách đã định sẵn
      image_url: faker.helpers.arrayElement(fashionImageUrls),
      category_id: category.id,
      stock: faker.number.int({ min: 0, max: 200 }),
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
  const createdProducts = await knex("products")
    .insert(products)
    .returning("*");

  // 5. Tạo giỏ hàng (Carts)
  const carts = [];
  for (const user of createdUsers) {
    carts.push({
      user_id: user.id,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
  const createdCarts = await knex("carts").insert(carts).returning("*");

  // 6. Tạo các món trong giỏ hàng (Cart Items)
  const cartItems = [];
  for (const cart of createdCarts) {
    const numberOfItemsInCart = faker.number.int({ min: 1, max: 5 });
    const productsInCart = faker.helpers
      .shuffle(createdProducts)
      .slice(0, numberOfItemsInCart);

    for (const product of productsInCart) {
      if (
        !cartItems.some(
          (item) => item.cart_id === cart.id && item.product_id === product.id
        )
      ) {
        cartItems.push({
          cart_id: cart.id,
          product_id: product.id,
          quantity: faker.number.int({ min: 1, max: 3 }),
          price: product.price, // Lưu giá tại thời điểm thêm vào giỏ
          created_at: new Date(),
        });
      }
    }
  }
  if (cartItems.length > 0) {
    await knex("cart_items").insert(cartItems);
  }
};
