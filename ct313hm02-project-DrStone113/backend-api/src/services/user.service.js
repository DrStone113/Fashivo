// backend-api/src/services/user.service.js
const knex = require('../config/db'); 
class UserService {
  constructor(knexInstance) {
    this.knex = knexInstance;
  }

  async createUser(userData) {
    
    const [newUser] = await this.knex('users')
      .insert({
        ...userData, // Insert toàn bộ userData trực tiếp        
      })
      .returning(['id', 'name', 'email', 'address', 'phone', 'role', 'avatar_url', 'created_at', 'updated_at']);
    return newUser;
  }

  async getAllUsers(filters = {}) {
    let query = this.knex('users');

    if (filters.role) {
      query = query.where('role', filters.role);
    }
    if (filters.email) {
      query = query.where('email', 'like', `%${filters.email}%`);
    }

    return query.select(
      'id',
      'name',
      'email',
      'address',
      'phone',
      'role',
      'avatar_url',
      'created_at',
      'updated_at'
    );
  }

  async getUserById(id) {
    const user = await this.knex('users')
      .select(
        'id',
        'name',
        'email',
        'address',
        'phone',
        'role',
        'avatar_url',
        'created_at',
        'updated_at'
      )
      .where('id', id)
      .first();
    return user;
  }

  async getUserByEmail(email) {
    const user = await this.knex('users')
      .where('email', email)
      .first();
    return user;
  }

  async updateUser(id, updatedData) {

    const [updatedUser] = await this.knex('users')
      .where('id', id)
      .update(updatedData) 
      .returning(
        [
          'id',
          'name',
          'email',
          'address',
          'phone',
          'role',
          'avatar_url',
          'created_at',
          'updated_at'
        ]
      );
    return updatedUser;
  }

  async deleteUser(id) {
    const deletedCount = await this.knex('users')
      .where('id', id)
      .del();
    return deletedCount;
  }
}

module.exports = new UserService(knex);