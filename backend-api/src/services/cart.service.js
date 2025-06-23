const knex = require('../config/db'); // Đảm bảo đường dẫn đúng đến file cấu hình Knex của bạn
const ApiError = require('../api-error'); // Import ApiError để ném lỗi nghiệp vụ

class CartService {
  constructor(knexInstance) {
    this.knex = knexInstance;
  }

  /**
   * Tạo giỏ hàng mới cho người dùng hoặc thêm/cập nhật các mục vào giỏ hàng hiện có.
   * Đồng thời kiểm tra sự tồn tại của sản phẩm và số lượng tồn kho.
   * @param {number} userId - ID của người dùng.
   * @param {Array<Object>} items - Mảng các đối tượng { product_id, quantity }.
   * @returns {Object} Giỏ hàng và các mục đã được thêm/cập nhật.
   */
  async createOrUpdateCart(userId, items) {
    // Bắt đầu một transaction để đảm bảo tính toàn vẹn dữ liệu
    return await this.knex.transaction(async trx => {
      let cart = await trx('carts').where({ user_id: userId }).first();

      if (!cart) {
        // Nếu người dùng chưa có giỏ hàng, tạo mới
        [cart] = await trx('carts').insert({ user_id: userId }).returning('*');
      }

      const cartId = cart.id;
      const results = [];

      for (const item of items) {
        const { product_id, quantity } = item;

        // 1. Kiểm tra sự tồn tại của sản phẩm và tồn kho
        const product = await trx('products').where({ id: product_id }).first();
        if (!product) {
          throw new ApiError(404, `Product with ID ${product_id} not found.`);
        }
        if (!product.available) { // Giả sử 'available' là boolean để kiểm tra còn hàng
          throw new ApiError(400, `Product '${product.name}' is not available.`);
        }

        const existingCartItem = await trx('cart_items')
          .where({ cart_id: cartId, product_id: product_id })
          .first();

        let finalQuantity = quantity;
        if (existingCartItem) {
          // Nếu sản phẩm đã có trong giỏ, cộng thêm số lượng
          finalQuantity += existingCartItem.quantity;
        }

        // 2. Kiểm tra số lượng yêu cầu so với tồn kho
        if (finalQuantity > product.stock) {
          throw new ApiError(400, `Not enough stock for product '${product.name}'. Available: ${product.stock}, Requested: ${finalQuantity}`);
        }

        if (existingCartItem) {
          // Cập nhật số lượng và giá (giá tại thời điểm cập nhật)
          const [updatedItem] = await trx('cart_items')
            .where({ cart_id: cartId, product_id: product_id })
            .update({
              quantity: finalQuantity,
              price: product.price, // Cập nhật giá sản phẩm hiện tại
              updated_at: new Date()
            })
            .returning('*');
          results.push(updatedItem);
        } else {
          // Thêm mới sản phẩm vào giỏ hàng
          const [newItem] = await trx('cart_items').insert({
            cart_id: cartId,
            product_id,
            quantity: finalQuantity,
            price: product.price, // Lưu giá sản phẩm tại thời điểm thêm vào giỏ
          }).returning('*');
          results.push(newItem);
        }
      }
      return { cart, items: results };
    });
  }

  /**
   * Lấy tất cả các giỏ hàng với thông tin chi tiết sản phẩm.
   * Hỗ trợ phân trang và lọc theo user_id.
   * @param {Object} filters - Các bộ lọc (user_id, page, limit).
   * @returns {Object} Danh sách các giỏ hàng và thông tin phân trang.
   */
  async getAllCarts(filters) {
    let query = this.knex('carts')
      .select(
        'carts.id as cart_id',
        'carts.user_id',
        'carts.created_at as cart_created_at',
        'carts.updated_at as cart_updated_at',
        'cart_items.id as cart_item_id',
        'cart_items.product_id',
        'cart_items.quantity',
        'cart_items.price as item_price', // Giá của sản phẩm tại thời điểm thêm vào giỏ
        'products.name as product_name',
        'products.description as product_description',
        'products.price as current_product_price', // Giá hiện tại của sản phẩm
        'products.image_url as product_image_url',
        'products.available as product_available'
      )
      .join('cart_items', 'carts.id', 'cart_items.cart_id')
      .join('products', 'cart_items.product_id', 'products.id')
      .orderBy('carts.id') // Sắp xếp để gom nhóm dễ hơn nếu cần
      .orderBy('cart_items.id');

    if (filters.user_id) {
      query = query.where('carts.user_id', filters.user_id);
    }

    const totalItemsQuery = this.knex('carts');
    if (filters.user_id) {
      totalItemsQuery.where('carts.user_id', filters.user_id);
    }
    const totalRecordsResult = await totalItemsQuery.clone().count('* as count').first();
    const totalRecords = parseInt(totalRecordsResult.count, 10);

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const rawCarts = await query.offset(offset).limit(limit);

    // Xử lý dữ liệu thô để nhóm các mục giỏ hàng vào từng giỏ hàng
    const groupedCarts = rawCarts.reduce((acc, row) => {
      let cart = acc.find(c => c.id === row.cart_id);
      if (!cart) {
        cart = {
          id: row.cart_id,
          user_id: row.user_id,
          created_at: row.cart_created_at,
          updated_at: row.cart_updated_at,
          items: [],
        };
        acc.push(cart);
      }
      cart.items.push({
        id: row.cart_item_id,
        product_id: row.product_id,
        quantity: row.quantity,
        item_price: row.item_price,
        product_name: row.product_name,
        product_description: row.product_description,
        current_product_price: row.current_product_price,
        product_image_url: row.product_image_url,
        product_available: row.product_available,
      });
      return acc;
    }, []);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      carts: groupedCarts,
      totalItems: totalRecords,
      currentPage: page,
      totalPages,
      limit: limit,
    };
  }

  /**
   * Lấy giỏ hàng của một người dùng cụ thể.
   * @param {number} userId - ID của người dùng.
   * @returns {Object|null} Giỏ hàng của người dùng hoặc null nếu không tìm thấy.
   */
  async getCartByUserId(userId) {
    const cart = await this.knex('carts').where({ user_id: userId }).first();
    if (!cart) {
      return null;
    }

    const items = await this.knex('cart_items')
      .select(
        'cart_items.id as cart_item_id',
        'cart_items.product_id',
        'cart_items.quantity',
        'cart_items.price as item_price',
        'products.name as product_name',
        'products.description as product_description',
        'products.price as current_product_price',
        'products.image_url as product_image_url',
        'products.available as product_available'
      )
      .where({ cart_id: cart.id })
      .join('products', 'cart_items.product_id', 'products.id');

    return { ...cart, items };
  }

  /**
   * Lấy giỏ hàng theo ID giỏ hàng.
   * @param {number} cartId - ID của giỏ hàng.
   * @returns {Object|null} Giỏ hàng hoặc null nếu không tìm thấy.
   */
  async getCartById(cartId) {
    const cart = await this.knex('carts').where({ id: cartId }).first();
    if (!cart) {
      return null;
    }

    const items = await this.knex('cart_items')
      .select(
        'cart_items.id as cart_item_id',
        'cart_items.product_id',
        'cart_items.quantity',
        'cart_items.price as item_price',
        'products.name as product_name',
        'products.description as product_description',
        'products.price as current_product_price',
        'products.image_url as product_image_url',
        'products.available as product_available'
      )
      .where({ cart_id: cart.id })
      .join('products', 'cart_items.product_id', 'products.id');

    return { ...cart, items };
  }

  /**
   * Cập nhật số lượng của một mục cụ thể trong giỏ hàng.
   * @param {number} cartId - ID của giỏ hàng.
   * @param {number} productId - ID của sản phẩm.
   * @param {number} quantity - Số lượng mới.
   * @returns {Object|null} Mục giỏ hàng đã cập nhật hoặc null nếu không tìm thấy.
   */
  async updateCartItem(cartId, productId, quantity) {
    return await this.knex.transaction(async trx => {
      // 1. Lấy thông tin sản phẩm để kiểm tra tồn kho
      const product = await trx('products').where({ id: productId }).first();
      if (!product) {
        throw new ApiError(404, `Product with ID ${productId} not found.`);
      }
      if (!product.available) {
        throw new ApiError(400, `Product '${product.name}' is not available.`);
      }
      if (quantity > product.stock) {
        throw new ApiError(400, `Not enough stock for product '${product.name}'. Available: ${product.stock}, Requested: ${quantity}`);
      }

      // 2. Cập nhật mục trong giỏ hàng
      const [updatedItem] = await trx('cart_items')
        .where({ cart_id: cartId, product_id: productId })
        .update({
          quantity,
          price: product.price, // Cập nhật giá sản phẩm hiện tại khi số lượng thay đổi
          updated_at: new Date()
        })
        .returning('*');

      // 3. Cập nhật timestamp của giỏ hàng cha
      if (updatedItem) {
        await trx('carts').where({ id: cartId }).update({ updated_at: new Date() });
      }

      return updatedItem;
    });
  }

  /**
   * Xóa một mục khỏi giỏ hàng.
   * @param {number} cartId - ID của giỏ hàng.
   * @param {number} productId - ID của sản phẩm cần xóa.
   * @returns {boolean} True nếu xóa thành công, false nếu không tìm thấy.
   */
  async deleteCartItem(cartId, productId) {
    const deletedCount = await this.knex('cart_items')
      .where({ cart_id: cartId, product_id: productId })
      .del();
    // Cập nhật timestamp của giỏ hàng cha sau khi xóa mục
    if (deletedCount > 0) {
      await this.knex('carts').where({ id: cartId }).update({ updated_at: new Date() });
    }
    return deletedCount > 0;
  }

  /**
   * Xóa toàn bộ giỏ hàng và các mục của nó.
   * @param {number} cartId - ID của giỏ hàng cần xóa.
   * @returns {boolean} True nếu xóa thành công, false nếu không tìm thấy.
   */
  async deleteCart(cartId) {
    // Xóa các mục trong giỏ trước, sau đó xóa giỏ hàng
    return await this.knex.transaction(async trx => {
      await trx('cart_items').where({ cart_id: cartId }).del();
      const deletedCount = await trx('carts').where({ id: cartId }).del();
      return deletedCount > 0;
    });
  }

  /**
   * Xóa tất cả các giỏ hàng và các mục của chúng (thường chỉ dành cho mục đích phát triển/quản trị).
   * @returns {number} Số lượng giỏ hàng đã xóa.
   */
  async deleteAllCarts() {
    // Xóa tất cả các mục trong giỏ hàng trước
    await this.knex('cart_items').del();
    // Sau đó xóa tất cả các giỏ hàng
    const deletedCount = await this.knex('carts').del();
    return deletedCount;
  }
}

module.exports = new CartService(knex);
