
import { useEffect, useState } from 'react';
import {
  Download,
  Plus,
  Search,
  Trash2,
  Edit3,
  RefreshCw,
  X,
  Save
} from 'lucide-react';
import { api } from '../services/api';

const configs: Record<
  string,
  {
    title: string;
    subtitle: string;
    fields: {
      key: string;
      label: string;
      type?: string;
      required?: boolean;
      placeholder?: string;
    }[];
    columns: string[];
  }
> = {
  products: {
    title: 'Products & services',
    subtitle: 'Manage your catalog, pricing and stock levels.',
    fields: [
      { key: 'name', label: 'Product name', required: true },
      { key: 'sku', label: 'SKU', required: true },
      { key: 'category', label: 'Category' },
      { key: 'costPrice', label: 'Cost price', type: 'number' },
      { key: 'sellingPrice', label: 'Selling price', type: 'number' },
      { key: 'stock', label: 'Opening stock', type: 'number' },
      { key: 'reorderLevel', label: 'Reorder level', type: 'number' },
      { key: 'unit', label: 'Unit' }
    ],
    columns: ['name', 'sku', 'category', 'sellingPrice', 'stock']
  },

  customers: {
    title: 'Customers',
    subtitle: 'Build stronger relationships and keep customer records organized.',
    fields: [
      { key: 'name', label: 'Customer name', required: true },
      { key: 'company', label: 'Company' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' }
    ],
    columns: ['name', 'company', 'email', 'phone']
  },

  suppliers: {
    title: 'Suppliers',
    subtitle: 'Manage supplier information and purchasing relationships.',
    fields: [
      { key: 'name', label: 'Supplier name', required: true },
      { key: 'company', label: 'Company' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' }
    ],
    columns: ['name', 'company', 'email', 'phone']
  },

  sales: {
    title: 'Sales & orders',
    subtitle: 'Track customer orders, invoices and collected revenue.',
    fields: [
      { key: 'invoiceNo', label: 'Invoice number', required: true },
      { key: 'customerName', label: 'Customer', required: true },
      { key: 'total', label: 'Total amount', type: 'number', required: true },
      { key: 'paidAmount', label: 'Paid amount', type: 'number' },
      { key: 'dueAmount', label: 'Due amount', type: 'number' },
      { key: 'status', label: 'Status' }
    ],
    columns: ['invoiceNo', 'customerName', 'total', 'paidAmount', 'dueAmount', 'status']
  },

  purchases: {
    title: 'Purchase orders',
    subtitle: 'Track supplier purchases, costs and outstanding payments.',
    fields: [
      { key: 'purchaseNo', label: 'Purchase number', required: true },
      { key: 'supplierName', label: 'Supplier', required: true },
      { key: 'total', label: 'Total amount', type: 'number', required: true },
      { key: 'paidAmount', label: 'Paid amount', type: 'number' },
      { key: 'dueAmount', label: 'Due amount', type: 'number' },
      { key: 'status', label: 'Status' }
    ],
    columns: ['purchaseNo', 'supplierName', 'total', 'paidAmount', 'dueAmount', 'status']
  },

  expenses: {
    title: 'Expenses',
    subtitle: 'Monitor operating costs and keep spending accountable.',
    fields: [
      { key: 'title', label: 'Expense title', required: true },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount', type: 'number', required: true },
      { key: 'paymentMethod', label: 'Payment method' },
      { key: 'note', label: 'Notes' }
    ],
    columns: ['title', 'category', 'amount', 'paymentMethod', 'expenseDate']
  },

  employees: {
    title: 'Employees',
    subtitle: 'Manage employee profiles, departments and compensation.',
    fields: [
      { key: 'name', label: 'Full name', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone' },
      { key: 'department', label: 'Department' },
      { key: 'designation', label: 'Designation' },
      { key: 'salary', label: 'Monthly salary', type: 'number' }
    ],
    columns: ['name', 'designation', 'department', 'email', 'salary']
  },

  departments: {
    title: 'Departments',
    subtitle: 'Organize teams and business functions.',
    fields: [
      { key: 'name', label: 'Department name', required: true },
      { key: 'description', label: 'Description' },
      { key: 'manager', label: 'Department manager' }
    ],
    columns: ['name', 'description', 'manager']
  },

  invoices: {
    title: 'Invoices',
    subtitle: 'Manage billing documents and payment status.',
    fields: [
      { key: 'invoiceNo', label: 'Invoice number', required: true },
      { key: 'customerName', label: 'Customer', required: true },
      { key: 'amount', label: 'Amount', type: 'number', required: true },
      { key: 'status', label: 'Status' },
      { key: 'notes', label: 'Notes' }
    ],
    columns: ['invoiceNo', 'customerName', 'amount', 'issueDate', 'status']
  },

  activities: {
    title: 'Activity log',
    subtitle: 'An audit-friendly view of recent workspace events.',
    fields: [],
    columns: ['action', 'module', 'description', 'userName', 'createdAt']
  },

  settings: {
    title: 'Workspace settings',
    subtitle: 'Manage basic workspace configuration.',
    fields: [
      { key: 'key', label: 'Setting key', required: true },
      { key: 'value', label: 'Value', required: true }
    ],
    columns: ['key', 'value', 'updatedAt']
  }
};

const labels: Record<string, string> = {
  name: 'Name',
  title: 'Title',
  sku: 'SKU',
  category: 'Category',
  company: 'Company',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  sellingPrice: 'Sale price',
  costPrice: 'Cost price',
  stock: 'Stock',
  reorderLevel: 'Reorder at',
  unit: 'Unit',
  invoiceNo: 'Invoice',
  customerName: 'Customer',
  total: 'Total',
  paidAmount: 'Paid',
  dueAmount: 'Due',
  status: 'Status',
  purchaseNo: 'Purchase no.',
  supplierName: 'Supplier',
  amount: 'Amount',
  paymentMethod: 'Payment method',
  expenseDate: 'Date',
  designation: 'Designation',
  department: 'Department',
  salary: 'Salary',
  description: 'Description',
  manager: 'Manager',
  issueDate: 'Issued',
  action: 'Action',
  module: 'Module',
  userName: 'User',
  createdAt: 'Created',
  key: 'Key',
  value: 'Value'
};

const currency = (n: any) =>
  new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

export default function ModulePage({ module }: { module: string }) {
  const cfg = configs[module] || configs.products;

  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);

    api
      .get(`/${module}`, { params: { search, limit: 100 } })
      .then((r) => setItems(r.data.items))
      .catch((e) =>
        setError(e.response?.data?.message || 'Unable to load records')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [module, search]);

  const open = (item?: any) => {
    setEditing(item || null);

    const init: any = {};

    cfg.fields.forEach((f) => {
      init[f.key] = item?.[f.key] ?? '';
    });

    setForm(init);
    setError('');
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload: any = { ...form };

      cfg.fields.forEach((f) => {
        if (f.type === 'number') {
          payload[f.key] = Number(payload[f.key] || 0);
        }

        if (payload[f.key] === '') {
          delete payload[f.key];
        }
      });

      if (editing) {
        await api.patch(`/${module}/${editing._id}`, payload);
      } else {
        await api.post(`/${module}`, payload);
      }

      setModal(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Could not save record');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this record permanently?')) return;

    try {
      await api.delete(`/${module}/${id}`);
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  const exportCSV = () => {
    const rows = [
      cfg.columns.map((c) => labels[c] || c).join(','),
      ...items.map((i) =>
        cfg.columns
          .map((c) => `"${String(i[c] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
    ];

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = `bizflow-${module}.csv`;
    a.click();

    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">BUSINESS OPERATIONS</span>
          <h1>{cfg.title}</h1>
          <p>{cfg.subtitle}</p>
        </div>

        <div className="heading-actions">
          <button className="secondary-btn" onClick={exportCSV}>
            <Download size={15} /> Export CSV
          </button>

          {cfg.fields.length > 0 && (
            <button className="primary-btn" onClick={() => open()}>
              <Plus size={16} /> Add{' '}
              {module === 'products' ? 'product' : module.slice(0, -1) || 'record'}
            </button>
          )}
        </div>
      </div>

      <section className="panel module-panel">
        <div className="module-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${module}...`}
            />
          </div>

          <button className="icon-btn" onClick={load}>
            <RefreshCw size={16} />
          </button>

          <span className="record-count">{items.length} records</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {cfg.columns.map((c) => (
                  <th key={c}>{labels[c] || c}</th>
                ))}
                <th className="action-col">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={cfg.columns.length + 1} className="empty-cell">
                    Loading records...
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id}>
                    {cfg.columns.map((c) => (
                      <td key={c}>
                        {c.toLowerCase().includes('price') ||
                        ['total', 'amount', 'salary', 'paidAmount', 'dueAmount'].includes(c) ? (
                          currency(item[c])
                        ) : c === 'stock' ? (
                          <span
                            className={`stock-value ${
                              Number(item.stock) <= Number(item.reorderLevel)
                                ? 'stock-low'
                                : ''
                            }`}
                          >
                            {item[c]}
                          </span>
                        ) : c === 'status' ? (
                          <span className="pill pill-success">
                            {item[c] || 'Active'}
                          </span>
                        ) : ['createdAt', 'expenseDate', 'issueDate'].includes(c) ? (
                          item[c] ? new Date(item[c]).toLocaleDateString() : '—'
                        ) : (
                          <span
                            className={
                              ['name', 'title', 'invoiceNo', 'purchaseNo'].includes(c)
                                ? 'strong-cell'
                                : ''
                            }
                          >
                            {item[c] ?? '—'}
                          </span>
                        )}
                      </td>
                    ))}

                    <td>
                      <div className="row-actions">
                        <button title="Edit" onClick={() => open(item)}>
                          <Edit3 size={15} />
                        </button>

                        <button title="Delete" onClick={() => remove(item._id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && !items.length && (
                <tr>
                  <td colSpan={cfg.columns.length + 1} className="empty-cell">
                    No records found. Add your first record to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          Showing {items.length} records
          <span>Live data from MongoDB</span>
        </div>
      </section>

      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div className="modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">
                  {editing ? 'UPDATE RECORD' : 'NEW RECORD'}
                </span>
                <h2>
                  {editing ? 'Edit' : 'Add'} {cfg.title.replace(/s$/, '')}
                </h2>
              </div>

              <button className="icon-btn" onClick={() => setModal(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={save}>
              <div className="form-grid">
                {cfg.fields.map((f) => (
                  <label
                    className={f.type === 'textarea' ? 'wide' : ''}
                    key={f.key}
                  >
                    {f.label}
                    {f.required ? ' *' : ''}

                    {f.type === 'textarea' ? (
                      <textarea
                        value={form[f.key]}
                        onChange={(e) =>
                          setForm({ ...form, [f.key]: e.target.value })
                        }
                      />
                    ) : (
                      <input
                        type={f.type || 'text'}
                        required={f.required}
                        value={form[f.key]}
                        onChange={(e) =>
                          setForm({ ...form, [f.key]: e.target.value })
                        }
                        placeholder={
                          f.placeholder || `Enter ${f.label.toLowerCase()}`
                        }
                      />
                    )}
                  </label>
                ))}
              </div>

              {error && <div className="error-box">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>

                <button className="primary-btn" disabled={saving}>
                  <Save size={15} />
                  {saving ? 'Saving...' : 'Save record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
