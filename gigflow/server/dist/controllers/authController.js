"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../middleware/errorHandler");
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};
const register = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { name, email, password, role } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return next((0, errorHandler_1.createError)('User already exists with this email', 409));
        }
        const user = await User_1.default.create({ name, email, password, role: role || 'sales_user' });
        const token = generateToken(user._id, user.role);
        res.status(201).json({
            success: true,
            data: { user, token },
            message: 'User registered successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return next((0, errorHandler_1.createError)('Invalid email or password', 401));
        }
        const token = generateToken(user._id, user.role);
        res.status(200).json({
            success: true,
            data: { user, token },
            message: 'Login successful',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user?.id);
        if (!user)
            return next((0, errorHandler_1.createError)('User not found', 404));
        res.status(200).json({ success: true, data: { user } });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
