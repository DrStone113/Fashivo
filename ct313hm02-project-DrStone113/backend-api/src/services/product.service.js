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
            available: productData.available, 
            image_url: productData.image_url,
            
        }).returning('*'); 
        return newProduct;
    }

    // READ (Get all with filters)
    async getAllProducts(filters) {
        let query = this.knex('products');

        if (filters.name) {
            query = query.where('name', 'ilike', `%${filters.name}%`);
        }
        if (filters.type) {
            query = query.where('type', filters.type);
        }
        if (filters.minPrice) {
            query = query.where('price', '>=', parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
            query = query.where('price', '<=', parseFloat(filters.maxPrice));
        }
        if (filters.available !== undefined) {
             
            const availableBoolean = String(filters.available).toLowerCase() === 'true';
            query = query.where('available', availableBoolean);
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
        };
    }

    // READ (Get by ID)
    async getProductById(id) {
        
        return await this.knex('products').where({ id: id }).first();
    }

    // UPDATE
    async updateProduct(id, updateData) {
        
        updateData.updated_at = new Date();
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