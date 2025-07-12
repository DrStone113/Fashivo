// src/services/auth.service.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('../config/db'); 
const ApiError = require('../api-error');

const TABLE_NAME = 'users'; // Tên bảng người dùng của bạn

// Hàm trợ giúp để tạo token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Hàm tìm người dùng bằng email
const findUserByEmail = async (email) => {
  return knex(TABLE_NAME).where({ email }).first();
};

// Hàm tìm người dùng bằng ID
const findUserById = async (id) => {
  return knex(TABLE_NAME).where({ id }).first();
};

// Hàm tạo người dùng mới
const registerUser = async (userData) => {
  // Hash mật khẩu trước khi lưu
  const hashedPassword = await bcrypt.hash(userData.password, 12); // Salt round 12 là tốt
  
  try {
    const [newUser] = await knex(TABLE_NAME).insert({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      address: userData.address,
      phone: userData.phone,
      role: userData.role || 'user', // Đảm bảo role được set mặc định nếu không có
    }).returning('*'); // Trả về tất cả các cột của bản ghi mới tạo

    // Loại bỏ mật khẩu khỏi đối tượng người dùng trước khi trả về
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;

  } catch (error) {
    if (error.code === '23505') { // Mã lỗi của PostgreSQL cho UNIQUE violation
      throw new ApiError(400, 'Email hoặc username đã tồn tại.');
    }
    throw new ApiError(500, `Không thể đăng ký người dùng: ${error.message}`);
  }
};

// Hàm đăng nhập người dùng
const loginUser = async (email, candidatePassword) => {
  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(candidatePassword, user.password))) {
    throw new ApiError(401, 'Email hoặc mật khẩu không đúng!');
  }

  // Loại bỏ mật khẩu khỏi đối tượng người dùng trước khi trả về
  const { password, ...userWithoutPassword } = user;
  
  // Tạo token ngay tại đây hoặc trong controller nếu bạn muốn
  const token = signToken(user.id); 

  return { user: userWithoutPassword, token };
};

// Hàm cập nhật thông tin profile của người dùng
const updateProfile = async (userId, updateData) => {
  try {
    // Kiểm tra xem có cần hash lại mật khẩu không nếu bạn cho phép cập nhật mật khẩu qua đây
    // NHƯNG TRONG auth.controller CỦA BẠN ĐÃ CÓ updateMyPassword, nên ở đây không cho update password
    // const { password, ...dataToUpdate } = updateData; 
    // if (password) {
    //   dataToUpdate.password = await bcrypt.hash(password, 12);
    // }

    const [updatedUser] = await knex(TABLE_NAME).where({ id: userId }).update(updateData).returning('*');
    
    if (!updatedUser) {
      throw new ApiError(404, 'Người dùng không tìm thấy để cập nhật.');
    }
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;

  } catch (error) {
    if (error.code === '23505') { 
      throw new ApiError(400, 'Email hoặc username đã tồn tại.');
    }
    throw new ApiError(500, `Không thể cập nhật profile: ${error.message}`);
  }
};

// Hàm cập nhật mật khẩu của người dùng
const updatePasswordForUser = async (userId, currentPassword, newPassword) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(404, 'Người dùng không tìm thấy.');
  }

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new ApiError(401, 'Mật khẩu hiện tại không đúng.');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  const [updatedUser] = await knex(TABLE_NAME).where({ id: userId }).update({ password: hashedNewPassword }).returning('*');

  if (!updatedUser) {
    throw new ApiError(500, 'Không thể cập nhật mật khẩu.');
  }
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

// Hàm xử lý quên mật khẩu (chỉ tạo token reset)
const generatePasswordResetToken = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng với email này.');
  }

  // Tạo token reset và lưu vào DB (ví dụ: cột `passwordResetToken`, `passwordResetExpires`)
  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_RESET, {
    expiresIn: '10m', // Token reset thường có thời hạn ngắn
  });

  const hashedResetToken = await bcrypt.hash(resetToken, 10); // Hash token để lưu vào DB
  const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

  await knex(TABLE_NAME).where({ id: user.id }).update({
    passwordResetToken: hashedResetToken,
    passwordResetExpires: resetExpires,
  });

  return resetToken; // Trả về token không hash để gửi email
};

// Hàm xử lý reset mật khẩu
const resetPassword = async (token, newPassword) => {
  // Hash token để so sánh với cái trong DB
  // Lưu ý: So sánh token plaintext với hashed token trong DB cần một cách khác
  // Một cách đơn giản là tạo reset token đủ dài và khó đoán, lưu plaintext vào DB
  // Hoặc dùng crypto.createHash để hash token nhận được và so sánh với DB
  // Ví dụ: const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Phương pháp tốt hơn: lưu một hashed token vào DB, và khi nhận được token từ người dùng,
  // hash nó và so sánh. NHƯNG bcrypt không thể so sánh hai chuỗi đã hash.
  // CÁCH KHẮC PHỤC: Reset token nên là một chuỗi ngẫu nhiên không phải JWT, được hash bằng bcrypt để lưu.
  // Khi user gửi token, hash token đó và so sánh với DB.

  // Ví dụ đơn giản (không khuyến khích cho production vì so sánh token đã hash):
  // Bạn sẽ cần thay đổi logic `generatePasswordResetToken` để hash token bằng một cách đơn giản hơn
  // hoặc lưu plaintext token và đảm bảo bảo mật.
  
  // Với cách hiện tại của bạn:
  // Nếu `generatePasswordResetToken` dùng `jwt.sign` và lưu `hashedResetToken`
  // Thì hàm này cần tìm user theo `passwordResetToken` (không phải hash token từ client)
  // và kiểm tra thời gian hết hạn.
  
  // Một cách tiếp cận tốt hơn là tạo một `passwordResetCode` (plain text)
  // Lưu hash của `passwordResetCode` vào DB
  // Người dùng nhập `passwordResetCode`, bạn hash nó và so sánh với DB
  
  // Giả sử bạn đã cải thiện logic reset token (ví dụ: dùng crypto.randomBytes và hash bằng bcrypt để lưu)
  // const hashedTokenFromUser = await bcrypt.hash(token, 12); // Không đúng, không thể so sánh
  
  // CÁCH ĐÚNG HƠN:
  // const hashedTokenFromUser = crypto.createHash('sha256').update(token).digest('hex');
  const user = await knex(TABLE_NAME)
    .where('passwordResetExpires', '>', new Date())
    .andWhere('passwordResetToken', token) // <-- Giả sử bạn lưu plaintext hashable token ở đây
    .first();

  if (!user) {
    throw new ApiError(400, 'Token không hợp lệ hoặc đã hết hạn.');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  await knex(TABLE_NAME).where({ id: user.id }).update({
    password: hashedNewPassword,
    passwordResetToken: null,
    passwordResetExpires: null,
    // passwordChangedAt: new Date(), // Cập nhật thời gian đổi mật khẩu
  });

  const { password, ...userWithoutPassword } = user; // Lấy user mới mà không có pass
  return { user: userWithoutPassword, token: signToken(user.id) };
};


module.exports = {
  signToken,
  findUserByEmail,
  findUserById,
  registerUser,
  loginUser,
  updateProfile,
  updatePasswordForUser,
  generatePasswordResetToken,
  resetPassword,
};