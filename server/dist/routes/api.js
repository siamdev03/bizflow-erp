import { Router } from 'express';
import { z } from 'zod';
import { protect, allowRoles } from '../middleware/auth.js';
import { Product, Customer, Supplier, Sale, Purchase, Expense, Employee, Department, Invoice, Activity, Setting } from '../models/index.js';
const router = Router();
router.use(protect);
// ==========================================
// MODULE MODELS
// ==========================================
const modules = {
    products: Product,
    customers: Customer,
    suppliers: Supplier,
    sales: Sale,
    purchases: Purchase,
    expenses: Expense,
    employees: Employee,
    departments: Department,
    invoices: Invoice,
    activities: Activity
};
// ==========================================
// COMPANY / WORKSPACE PROFILE
// IMPORTANT: Keep these routes BEFORE /:module
// ==========================================
const defaultWorkspaceProfile = {
    name: 'Azlan IT',
    legalName: '',
    businessType: 'trading',
    industry: '',
    email: '',
    phone: '',
    website: '',
    country: 'Bangladesh',
    division: '',
    district: '',
    address: '',
    postalCode: '',
    tradeLicense: '',
    tin: '',
    bin: '',
    currency: 'BDT',
    fiscalYearStart: '07-01',
    fiscalYearEnd: '06-30',
    taxMode: 'none',
    timezone: 'Asia/Dhaka',
    dateFormat: 'DD/MM/YYYY',
    logoUrl: '',
    invoiceFooter: 'Thank you for your business.'
};
// GET complete company profile
router.get('/workspace', async (_req, res, next) => {
    try {
        const setting = await Setting.findOne({
            key: 'workspace_profile'
        });
        const workspace = {
            ...defaultWorkspaceProfile,
            ...(setting?.value || {})
        };
        res.json({ workspace });
    }
    catch (error) {
        next(error);
    }
});
// UPDATE company profile (Admin / Manager only)
router.patch('/workspace', allowRoles('admin', 'manager'), async (req, res, next) => {
    try {
        const workspaceSchema = z.object({
            name: z.string().trim().min(2).max(120).optional(),
            legalName: z.string().trim().max(150).optional(),
            businessType: z.string().trim().max(80).optional(),
            industry: z.string().trim().max(100).optional(),
            email: z.union([
                z.string().trim().email(),
                z.literal('')
            ]).optional(),
            phone: z.string().trim().max(30).optional(),
            website: z.string().trim().max(200).optional(),
            country: z.string().trim().max(80).optional(),
            division: z.string().trim().max(80).optional(),
            district: z.string().trim().max(80).optional(),
            address: z.string().trim().max(300).optional(),
            postalCode: z.string().trim().max(20).optional(),
            tradeLicense: z.string().trim().max(100).optional(),
            tin: z.string().trim().max(100).optional(),
            bin: z.string().trim().max(100).optional(),
            currency: z.enum([
                'BDT',
                'USD',
                'INR',
                'EUR',
                'GBP'
            ]).optional(),
            fiscalYearStart: z.string()
                .regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
                .optional(),
            fiscalYearEnd: z.string()
                .regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
                .optional(),
            taxMode: z.enum([
                'none',
                'inclusive',
                'exclusive'
            ]).optional(),
            timezone: z.string().trim().max(80).optional(),
            dateFormat: z.enum([
                'DD/MM/YYYY',
                'MM/DD/YYYY',
                'YYYY-MM-DD'
            ]).optional(),
            logoUrl: z.string().trim().max(1000).optional(),
            invoiceFooter: z.string().trim().max(500).optional()
        }).strict();
        const body = workspaceSchema.parse(req.body);
        if (Object.keys(body).length === 0) {
            return res.status(400).json({
                message: 'Please provide at least one field to update.'
            });
        }
        const existingSetting = await Setting.findOne({
            key: 'workspace_profile'
        });
        const currentProfile = {
            ...defaultWorkspaceProfile,
            ...(existingSetting?.value || {})
        };
        // Preserve existing fields when only some fields are updated.
        const updatedProfile = {
            ...currentProfile,
            ...body
        };
        const setting = await Setting.findOneAndUpdate({
            key: 'workspace_profile'
        }, {
            $set: {
                value: updatedProfile
            }
        }, {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
        });
        await Activity.create({
            action: 'updated',
            module: 'settings',
            description: 'Company profile updated',
            userName: req.user.name
        });
        res.json({
            message: 'Company profile updated successfully.',
            workspace: {
                ...defaultWorkspaceProfile,
                ...(setting?.value || updatedProfile)
            }
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Invalid company profile information.',
                errors: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }
        next(error);
    }
});
// ==========================================
// DASHBOARD
// ==========================================
router.get('/dashboard', async (_req, res, next) => {
    try {
        const [products, customers, suppliers, sales, purchases, expenses, employees, lowStock, recentSales, recentActivities] = await Promise.all([
            Product.countDocuments(),
            Customer.countDocuments(),
            Supplier.countDocuments(),
            Sale.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' },
                        paid: { $sum: '$paidAmount' },
                        due: { $sum: '$dueAmount' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            Purchase.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            Expense.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]),
            Employee.countDocuments(),
            Product.countDocuments({
                $expr: {
                    $lte: ['$stock', '$reorderLevel']
                }
            }),
            Sale.find()
                .sort({ createdAt: -1 })
                .limit(5),
            Activity.find()
                .sort({ createdAt: -1 })
                .limit(8)
        ]);
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthly = await Sale.aggregate([
            {
                $match: {
                    saleDate: {
                        $gte: monthStart
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dayOfMonth: '$saleDate'
                    },
                    sales: {
                        $sum: '$total'
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);
        res.json({
            stats: {
                products,
                customers,
                suppliers,
                employees,
                sales: sales[0] || {
                    total: 0,
                    paid: 0,
                    due: 0,
                    count: 0
                },
                purchases: purchases[0] || {
                    total: 0,
                    count: 0
                },
                expenses: expenses[0]?.total || 0,
                lowStock
            },
            monthly,
            recentSales,
            recentActivities
        });
    }
    catch (error) {
        next(error);
    }
});
// ==========================================
// REPORTS SUMMARY
// ==========================================
router.get('/reports/summary', async (_req, res, next) => {
    try {
        const [sales, purchases, expenses, stock] = await Promise.all([
            Sale.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            Purchase.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            Expense.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]),
            Product.aggregate([
                {
                    $group: {
                        _id: null,
                        units: { $sum: '$stock' },
                        value: {
                            $sum: {
                                $multiply: [
                                    '$stock',
                                    '$costPrice'
                                ]
                            }
                        }
                    }
                }
            ])
        ]);
        res.json({
            sales: sales[0] || {
                total: 0,
                count: 0
            },
            purchases: purchases[0] || {
                total: 0,
                count: 0
            },
            expenses: expenses[0]?.total || 0,
            inventory: stock[0] || {
                units: 0,
                value: 0
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// ==========================================
// GET MODULE RECORDS
// ==========================================
router.get('/:module', async (req, res, next) => {
    try {
        const Model = modules[req.params.module];
        if (!Model) {
            return res.status(404).json({
                message: 'Unknown module'
            });
        }
        const q = String(req.query.search || '');
        let filter = {};
        if (q) {
            const fields = [
                'name',
                'title',
                'sku',
                'email',
                'phone',
                'invoiceNo',
                'purchaseNo',
                'customerName',
                'supplierName',
                'company',
                'department'
            ];
            filter = {
                $or: fields.map(field => ({
                    [field]: {
                        $regex: q,
                        $options: 'i'
                    }
                }))
            };
        }
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const [items, total] = await Promise.all([
            Model.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Model.countDocuments(filter)
        ]);
        res.json({
            items,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        next(error);
    }
});
// ==========================================
// CREATE MODULE RECORD
// ==========================================
router.post('/:module', async (req, res, next) => {
    try {
        const Model = modules[req.params.module];
        if (!Model) {
            return res.status(404).json({
                message: 'Unknown module'
            });
        }
        if (req.params.module === 'activities' &&
            req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Admin only'
            });
        }
        const item = await Model.create(req.body);
        await Activity.create({
            action: 'created',
            module: req.params.module,
            description: `Created ${req.params.module} record`,
            userName: req.user.name
        });
        res.status(201).json({
            item
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'A record with this unique value already exists'
            });
        }
        next(error);
    }
});
// ==========================================
// UPDATE MODULE RECORD
// ==========================================
router.patch('/:module/:id', async (req, res, next) => {
    try {
        const Model = modules[req.params.module];
        if (!Model) {
            return res.status(404).json({
                message: 'Unknown module'
            });
        }
        const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!item) {
            return res.status(404).json({
                message: 'Record not found'
            });
        }
        await Activity.create({
            action: 'updated',
            module: req.params.module,
            description: `Updated ${req.params.module} record`,
            userName: req.user.name
        });
        res.json({
            item
        });
    }
    catch (error) {
        next(error);
    }
});
// ==========================================
// DELETE MODULE RECORD
// ==========================================
router.delete('/:module/:id', allowRoles('admin', 'manager'), async (req, res, next) => {
    try {
        const Model = modules[req.params.module];
        if (!Model) {
            return res.status(404).json({
                message: 'Unknown module'
            });
        }
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({
                message: 'Record not found'
            });
        }
        res.json({
            message: 'Record deleted'
        });
    }
    catch (error) {
        next(error);
    }
});
// ==========================================
// SALES CHECKOUT
// ==========================================
router.post('/sales/checkout', async (req, res, next) => {
    try {
        const body = z.object({
            customerName: z.string().min(1),
            items: z.array(z.object({
                productId: z.string(),
                name: z.string(),
                qty: z.number().positive(),
                price: z.number().nonnegative()
            })).min(1),
            discount: z.number().min(0).default(0),
            tax: z.number().min(0).default(0),
            paidAmount: z.number().min(0).default(0)
        }).parse(req.body);
        let subtotal = 0;
        for (const item of body.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({
                    message: `Product ${item.name} not found`
                });
            }
            if (product.stock < item.qty) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}`
                });
            }
            subtotal += item.qty * item.price;
        }
        const total = Math.max(0, subtotal - body.discount + body.tax);
        if (body.paidAmount > total) {
            return res.status(400).json({
                message: 'Paid amount cannot exceed invoice total'
            });
        }
        const sale = await Sale.create({
            invoiceNo: `INV-${Date.now()}`,
            customerName: body.customerName,
            items: body.items,
            subtotal,
            discount: body.discount,
            tax: body.tax,
            total,
            paidAmount: body.paidAmount,
            dueAmount: Math.max(0, total - body.paidAmount)
        });
        for (const item of body.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: {
                    stock: -item.qty
                }
            });
        }
        await Activity.create({
            action: 'checkout',
            module: 'sales',
            description: `Created invoice ${sale.invoiceNo}`,
            userName: req.user.name
        });
        res.status(201).json({
            item: sale
        });
    }
    catch (error) {
        next(error);
    }
});
// ==========================================
// INVENTORY ADJUSTMENT
// ==========================================
router.post('/inventory/adjust', async (req, res, next) => {
    try {
        const body = z.object({
            productId: z.string(),
            quantity: z.number().int(),
            reason: z.string().min(3)
        }).parse(req.body);
        const product = await Product.findById(body.productId);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        if (product.stock + body.quantity < 0) {
            return res.status(400).json({
                message: 'Stock cannot be negative'
            });
        }
        product.stock += body.quantity;
        await product.save();
        await Activity.create({
            action: 'adjusted',
            module: 'inventory',
            description: `${product.name}: ${body.quantity > 0 ? '+' : ''}${body.quantity} (${body.reason})`,
            userName: req.user.name
        });
        res.json({
            item: product
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
