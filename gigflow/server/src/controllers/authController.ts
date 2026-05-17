import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { createError } from '../middleware/errorHandler';
import { UserRole } from '../types';

const generateToken = (id: string, role: UserRole): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError('User already exists with this email', 409));
    }

    const user = await User.create({ name, email, password, role: role || 'sales_user' });
    const token = generateToken(user._id as string, user.role);

    res.status(201).json({
      success: true,
      data: { user, token },
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(createError('Invalid email or password', 401));
    }

    const token = generateToken(user._id as string, user.role);

    res.status(200).json({
      success: true,
      data: { user, token },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request & { user?: { id: string; role: UserRole } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return next(createError('User not found', 404));

    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
