import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Parser } from 'json2csv';
import Lead from '../models/Lead';
import { AuthRequest, LeadQuery, LeadStatus, LeadSource } from '../types';
import { createError } from '../middleware/errorHandler';

export const getLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = 'latest',
      page = 1,
      limit = 10,
    } = req.query as unknown as LeadQuery;

    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (source) filter.source = source;
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
      Lead.find(filter)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(filter),
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
  } catch (error) {
    next(error);
  }
};

export const getLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).populate('createdBy', 'name email role');
    if (!lead) return next(createError('Lead not found', 404));

    res.status(200).json({ success: true, data: { lead } });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const lead = await Lead.create({ ...req.body, createdBy: req.user?.id });
    res.status(201).json({
      success: true,
      data: { lead },
      message: 'Lead created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) return next(createError('Lead not found', 404));

    // Sales users can only update their own leads
    if (req.user?.role === 'sales_user' && lead.createdBy.toString() !== req.user.id) {
      return next(createError('Not authorized to update this lead', 403));
    }

    const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      data: { lead: updated },
      message: 'Lead updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return next(createError('Lead not found', 404));

    // Only admin can delete
    if (req.user?.role !== 'admin') {
      return next(createError('Only admins can delete leads', 403));
    }

    await Lead.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const exportLeadsCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, source, search } = req.query as {
      status?: LeadStatus;
      source?: LeadSource;
      search?: string;
    };

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Status', value: 'status' },
      { label: 'Source', value: 'source' },
      { label: 'Created By', value: (row: Record<string, unknown>) => {
        const cb = row.createdBy as { name?: string } | null;
        return cb?.name || 'N/A';
      }},
      { label: 'Created At', value: (row: Record<string, unknown>) =>
        new Date(row.createdAt as string).toLocaleDateString()
      },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(leads.map(l => l.toObject()));

    res.header('Content-Type', 'text/csv');
    res.attachment('leads-export.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
