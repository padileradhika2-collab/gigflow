"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const leadsController_1 = require("../controllers/leadsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes are protected
router.use(auth_1.protect);
const leadValidation = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Please enter a valid email'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['New', 'Contacted', 'Qualified', 'Lost'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('source')
        .isIn(['Website', 'Instagram', 'Referral'])
        .withMessage('Invalid source'),
];
router.get('/export/csv', leadsController_1.exportLeadsCSV);
router.get('/', leadsController_1.getLeads);
router.get('/:id', leadsController_1.getLead);
router.post('/', leadValidation, leadsController_1.createLead);
router.put('/:id', leadValidation, leadsController_1.updateLead);
router.delete('/:id', auth_1.adminOnly, leadsController_1.deleteLead);
exports.default = router;
