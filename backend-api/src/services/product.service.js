// ct313hm02-project-DrStone113/backend-api/src/services/product.service.js
const knex = require('../config/db');

class ProductService {
  constructor(knexInstance) {
    this.knex = knexInstance;
  }

  // CREATE
  async createProduct(productData) {
    const [newProduct] = await this.knex('products').insert({
      type: productData.type,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock, 
      available: productData.available,
      image_url: productData.image_url,
      category_id: productData.category_id,
    }).returning('*');
    return newProduct;
  }

  // READ (Get all with filters and pagination)
  async getAllProducts(filters) {
    let query = this.knex('products')
      .select('products.*', 'categories.name as category_name') 
      .leftJoin('categories', 'products.category_id', 'categories.id'); 

    if (filters.type) {
      query = query.where('type', 'ilike', `%${filters.type}%`);
    }
    if (filters.name) {
      query = query.where('products.name', 'ilike', `%${filters.name}%`); 
    }
    if (filters.minPrice) {
      query = query.where('price', '>=', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.where('price', '<=', filters.maxPrice);
    }
    if (filters.available !== undefined) {
      query = query.where('available', filters.available);
    }
    if (filters.category_id) {
      query = query.where('category_id', filters.category_id);
    }

    const totalItems = await query.clone().count('* as count').first();
    const totalRecords = parseInt(totalItems.count, 10);

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const products = await query.offset(offset).limit(limit);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      products,
      totalItems: totalRecords,
      currentPage: page,
      totalPages,
      limit: limit,
    };
  }

  // READ (Get by ID)
  async getProductById(id) {
    return await this.knex('products')
      .select('products.*', 'categories.name as category_name')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.id', id)
      .first();
  }

  // UPDATE
  async updateProduct(id, updateData) {
    // updated_at is handled by DB trigger (update_timestamp)
    const [updatedProduct] = await this.knex('products')
      .where({ id: id })
      .update(updateData)
      .returning('*');
    return updatedProduct;
  }

  // DELETE
  async deleteProduct(id) {
    const deletedCount = await this.knex('products').where({ id: id }).del();
    return deletedCount > 0;
  }

  // DELETE ALL
  async deleteAllProducts() {
    await this.knex('products').del();
  }
}

module.exports = new ProductService(knex);