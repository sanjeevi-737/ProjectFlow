import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../utils/helpers.js';
import { ApiError } from '../utils/apiResponse.js';
import { sendEmail } from '../emails/emailService.js';
import logger from '../utils/logger.js';

class AuthService {
  async register({ name, email, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateToken();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      await sendEmail({
        to: email,
        subject: 'Verify your email - ManagePD',
        template: 'emailVerification',
        data: {
          name,
          verificationLink: `${config.clientUrl}/verify-email?token=${verificationToken}`,
        },
      });
    } catch {
      logger.error(`Failed to send verification email to ${email}`);
    }

    return { user, verificationToken };
  }

  async verifyEmail(token) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return user;
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.isDeleted) {
      throw ApiError.unauthorized('Account has been deactivated');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw ApiError.forbidden('Please verify your email first');
    }

    const tokens = this.generateTokens(user._id);
    await this.storeRefreshToken(user, tokens.refreshToken);

    user.lastLogin = new Date();
    await user.save();

    return { user, ...tokens, isEmailVerified: user.isEmailVerified };
  }

  async logout(userId, refreshToken) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);
      await user.save();
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw ApiError.unauthorized('User not found');
      }

      const storedToken = user.refreshTokens.find((rt) => rt.token === refreshToken);
      if (!storedToken) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      if (storedToken.expiresAt < new Date()) {
        user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);
        await user.save();
        throw ApiError.unauthorized('Refresh token expired');
      }

      const tokens = this.generateTokens(user._id);
      user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);
      await this.storeRefreshToken(user, tokens.refreshToken);
      await user.save();

    return { user, ...tokens, isEmailVerified: user.isEmailVerified };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      return;
    }

    const resetToken = generateToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Reset your password - ManagePD',
      template: 'passwordReset',
      data: {
        name: user.name,
        resetLink: `${config.clientUrl}/reset-password?token=${resetToken}`,
      },
    });
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();
  }

  generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn,
    });

    const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(user, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    user.refreshTokens.push({
      token,
      expiresAt,
    });

    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();
  }
}

export default new AuthService();
