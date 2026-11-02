import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { User, Product, Customer, Supplier, Employee, Sale, Purchase, Expense, Department, Activity } from './models/index.js';
async function seed() {
    await connectDB();
    await Promise.all([User.deleteMany(), Product.deleteMany(), Customer.deleteMany(), Supplier.deleteMany(), Employee.deleteMany(), Sale.deleteMany(), Purchase.deleteMany(), Expense.deleteMany(), Department.deleteMany(), Activity.deleteMany()]);
    await User.create({ name: 'BizFlow Admin', email: 'admin@bizflow.local', password: await bcrypt.hash('Admin@12345', 12), role: 'admin' });
    const products = await Product.insertMany([
        { name: 'Wireless Mouse', sku: 'ACC-001', category: 'Accessories', costPrice: 450, sellingPrice: 650, stock: 45, reorderLevel: 10, unit: 'pcs' },
        { name: 'Mechanical Keyboard', sku: 'ACC-002', category: 'Accessories', costPrice: 1800, sellingPrice: 2450, stock: 18, reorderLevel: 5, unit: 'pcs' },
        { name: 'USB-C Hub 7-in-1', sku: 'ACC-003', category: 'Accessories', costPrice: 1250, sellingPrice: 1790, stock: 4, reorderLevel: 8, unit: 'pcs' },
        { name: 'Office Chair', sku: 'FUR-001', category: 'Furniture', costPrice: 6500, sellingPrice: 8500, stock: 12, reorderLevel: 3, unit: 'pcs' },
        { name: 'A4 Paper Ream', sku: 'STA-001', category: 'Stationery', costPrice: 380, sellingPrice: 470, stock: 70, reorderLevel: 15, unit: 'ream' },
        { name: '27-inch Monitor', sku: 'ELC-001', category: 'Electronics', costPrice: 18500, sellingPrice: 22900, stock: 7, reorderLevel: 4, unit: 'pcs' }
    ]);
    const customers = await Customer.insertMany([{ name: 'Rahim Enterprise', email: 'rahim@example.com', phone: '+8801700000001', company: 'Rahim Enterprise', address: 'Mirpur, Dhaka' }, { name: 'Nexa Solutions', email: 'accounts@nexa.example', phone: '+8801700000002', company: 'Nexa Solutions', address: 'Banani, Dhaka' }, { name: 'Green Mart', phone: '+8801700000003', company: 'Green Mart', address: 'Uttara, Dhaka' }]);
    const suppliers = await Supplier.insertMany([{ name: 'Tech Distribution BD', phone: '+8801800000001', company: 'Tech Distribution BD', address: 'Dhaka' }, { name: 'Office Supply House', phone: '+8801800000002', company: 'Office Supply House', address: 'Chattogram' }]);
    await Employee.insertMany([{ name: 'Ayesha Karim', email: 'ayesha@bizflow.local', department: 'Operations', designation: 'Operations Manager', salary: 55000, status: 'active' }, { name: 'Tanvir Hasan', email: 'tanvir@bizflow.local', department: 'Sales', designation: 'Sales Executive', salary: 32000, status: 'active' }, { name: 'Nusrat Jahan', email: 'nusrat@bizflow.local', department: 'Finance', designation: 'Accountant', salary: 40000, status: 'active' }]);
    await Department.insertMany([{ name: 'Operations', description: 'Business operations and logistics' }, { name: 'Sales', description: 'Sales and customer relations' }, { name: 'Finance', description: 'Accounting and finance' }]);
    await Sale.insertMany([{ invoiceNo: 'INV-1001', customer: customers[0]._id, customerName: customers[0].name, items: [{ name: products[0].name, qty: 2, price: 650 }], subtotal: 1300, discount: 0, tax: 0, total: 1300, paidAmount: 1300, dueAmount: 0, saleDate: new Date() }, { invoiceNo: 'INV-1002', customer: customers[1]._id, customerName: customers[1].name, items: [{ name: products[1].name, qty: 1, price: 2450 }], subtotal: 2450, discount: 100, tax: 0, total: 2350, paidAmount: 1000, dueAmount: 1350, saleDate: new Date() }]);
    await Purchase.insertMany([{ purchaseNo: 'PUR-2001', supplier: suppliers[0]._id, supplierName: suppliers[0].name, items: [{ name: 'Wireless Mouse', qty: 20, price: 450 }], subtotal: 9000, total: 9000, paidAmount: 9000, dueAmount: 0, purchaseDate: new Date() }]);
    await Expense.insertMany([{ title: 'Office Rent', category: 'Rent', amount: 35000, paymentMethod: 'Bank Transfer', expenseDate: new Date() }, { title: 'Internet & Utilities', category: 'Utilities', amount: 6500, paymentMethod: 'Bank Transfer', expenseDate: new Date() }, { title: 'Courier & Delivery', category: 'Operations', amount: 2200, paymentMethod: 'Cash', expenseDate: new Date() }]);
    await Activity.insertMany([{ action: 'seeded', module: 'system', description: 'BizFlow sample workspace initialized', userName: 'System' }, { action: 'created', module: 'products', description: 'Sample inventory loaded', userName: 'System' }]);
    console.log('Seed completed. Login: admin@bizflow.local / Admin@12345');
    process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
