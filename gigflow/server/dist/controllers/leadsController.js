"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportLeadsCSV = exports.deleteLead = exports.updateLead = exports.createLead = exports.getLead = exports.getLeads = void 0;
const express_validator_1 = require("express-validator");
const json2csv_1 = require("json2csv");
const Lead_1 = __importDefault(require("../models/Lead"));
const errorHandler_1 = require("../middleware/errorHandler");
const getLeads = async (req, res, next) => {
    try {
        const { status, source, search, sort = 'latest', page = 1, limit = 10, } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (source)
            filter.source = source;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const sortOrder = sort === 'oldest' ? 1 : -1;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * limitNum;
        const [leads, total] = await Promise.all([
            Lead_1.default.find(filter)
                .populate('createdBy', 'name email role')
                .sort({ createdAt: sortOrder })
                .skip(skip)
                .limit(limitNum),
            Lead_1.default.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            data: { leads },
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                hasNextPage: pageNum < Math.ceil(total / limitNum),
                hasPrevPage: pageNum > 1,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLeads = getLeads;
const getLead = async (req, res, next) => {
    try {
        const lead = await Lead_1.default.findById(req.params.id).populate('createdBy', 'name email role');
        if (!lead)
            return next((0, errorHandler_1.createError)('Lead not found', 404));
        res.status(200).json({ success: true, data: { lead } });
    }
    catch (error) {
        next(error);
    }
};
exports.getLead = getLead;
const createLead = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const lead = await Lead_1.default.create({ ...req.body, createdBy: req.user?.id });
        res.status(201).json({
            success: true,
            data: { lead },
            message: 'Lead created successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createLead = createLead;
const updateLead = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        const lead = await Lead_1.default.findById(req.params.id);
        if (!lead)
            return next((0, errorHandler_1.createError)('Lead not found', 404));
        // Sales users can only update their own leads
        if (req.user?.role === 'sales_user' && lead.createdBy.toString() !== req.user.id) {
            return next((0, errorHandler_1.createError)('Not authorized to update this lead', 403));
        }
        const updated = await Lead_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('createdBy', 'name email role');
        res.status(200).json({
            success: true,
            data: { lead: updated },
            message: 'Lead updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateLead = updateLead;
const deleteLead = async (req, res, next) => {
    try {
        const lead = await Lead_1.default.findById(req.params.id);
        if (!lead)
            return next((0, errorHandler_1.createError)('Lead not found', 404));
        // Only admin can delete
        if (req.user?.role !== 'admin') {
            return next((0, errorHandler_1.createError)('Only admins can delete leads', 403));
        }
        await Lead_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Lead deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteLead = deleteLead;
const exportLeadsCSV = async (req, res, next) => {
    try {
        const { status, source, search } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (source)
            filter.source = source;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const leads = await Lead_1.default.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        const fields = [
            { label: 'Name', value: 'name' },
            { label: 'Email', value: 'email' },
            { label: 'Status', value: 'status' },
            { label: 'Source', value: 'source' },
            { label: 'Created By', value: (row) => {
                    const cb = row.createdBy;
                    return cb?.name || 'N/A';
                } },
            { label: 'Created At', value: (row) => new Date(row.createdAt).toLocaleDateString()
            },
        ];
        const parser = new json2csv_1.Parser({ fields });
        const csv = parser.parse(leads.map(l => l.toObject()));
        res.header('Content-Type', 'text/csv');
        res.attachment('leads-export.csv');
        res.send(csv);
    }
    catch (error) {
        next(error);
    }
};
exports.exportLeadsCSV = exportLeadsCSV;
