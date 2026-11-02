import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({ name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true }, password: { type: String, required: true, select: false }, role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' }, active: { type: Boolean, default: true } }, { timestamps: true });
export const User = mongoose.model('User', userSchema);
const baseOptions = { timestamps: true, strict: false };
function makeModel(name, fields) {
    return mongoose.models[name] || mongoose.model(name, new Schema(fields, baseOptions));
}
export const Product = makeModel('Product', { name: { type: String, required: true }, sku: { type: String, required: true, unique: true }, category: String, description: String, costPrice: { type: Number, default: 0 }, sellingPrice: { type: Number, default: 0 }, stock: { type: Number, default: 0 }, reorderLevel: { type: Number, default: 5 }, unit: { type: String, default: 'pcs' }, status: { type: String, default: 'active' } });
export const Customer = makeModel('Customer', { name: { type: String, required: true }, email: String, phone: String, company: String, address: String, openingBalance: { type: Number, default: 0 }, status: { type: String, default: 'active' } });
export const Supplier = makeModel('Supplier', { name: { type: String, required: true }, email: String, phone: String, company: String, address: String, status: { type: String, default: 'active' } });
export const Sale = makeModel('Sale', { invoiceNo: { type: String, required: true, unique: true }, customer: { type: Schema.Types.ObjectId, ref: 'Customer' }, customerName: String, items: [Schema.Types.Mixed], subtotal: Number, discount: Number, tax: Number, total: Number, paidAmount: Number, dueAmount: Number, status: { type: String, default: 'completed' }, saleDate: { type: Date, default: Date.now } });
export const Purchase = makeModel('Purchase', { purchaseNo: { type: String, required: true, unique: true }, supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' }, supplierName: String, items: [Schema.Types.Mixed], subtotal: Number, total: Number, paidAmount: Number, dueAmount: Number, status: { type: String, default: 'received' }, purchaseDate: { type: Date, default: Date.now } });
export const Expense = makeModel('Expense', { title: { type: String, required: true }, category: String, amount: { type: Number, required: true }, paymentMethod: String, note: String, expenseDate: { type: Date, default: Date.now } });
export const Employee = makeModel('Employee', { name: { type: String, required: true }, email: String, phone: String, department: String, designation: String, salary: { type: Number, default: 0 }, joiningDate: Date, status: { type: String, default: 'active' } });
export const Department = makeModel('Department', { name: { type: String, required: true, unique: true }, description: String, manager: String });
export const Invoice = makeModel('Invoice', { invoiceNo: String, customerName: String, issueDate: Date, dueDate: Date, amount: Number, status: { type: String, default: 'unpaid' }, notes: String });
export const Activity = makeModel('Activity', { action: String, module: String, description: String, userName: String });
export const Setting = makeModel('Setting', { key: { type: String, unique: true }, value: Schema.Types.Mixed });
