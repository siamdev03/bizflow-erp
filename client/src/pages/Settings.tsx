
import { useEffect, useState } from 'react';
import {
  Database,
  ShieldCheck,
  SlidersHorizontal,
  Building2,
  CheckCircle2,
  MapPin,
  Wallet,
  Image,
  FileText,
  Loader2
} from 'lucide-react';

import { api } from '../services/api';

interface Workspace {
  name: string;
  legalName: string;
  businessType: string;
  industry: string;
  email: string;
  phone: string;
  website: string;

  country: string;
  division: string;
  district: string;
  address: string;
  postalCode: string;

  tradeLicense: string;
  tin: string;
  bin: string;

  currency: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  taxMode: string;

  timezone: string;
  dateFormat: string;

  logoUrl: string;
  invoiceFooter: string;
}

const initialWorkspace: Workspace = {
  name: '',
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

export default function Settings() {
  const [workspace, setWorkspace] =
    useState<Workspace>(initialWorkspace);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const updateField = (
    field: keyof Workspace,
    value: string
  ) => {
    setWorkspace(previous => ({
      ...previous,
      [field]: value
    }));

    setSaved(false);
    setError('');
  };

  // LOAD COMPANY PROFILE
  useEffect(() => {
    let active = true;

    const loadWorkspace = async () => {
      try {
        setLoading(true);

        const { data } = await api.get('/workspace');

        if (active) {
          setWorkspace({
            ...initialWorkspace,
            ...data.workspace
          });
        }
      } catch (err: any) {
        if (active) {
          setError(
            err.response?.data?.message ||
            'Unable to load company profile.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadWorkspace();

    return () => {
      active = false;
    };
  }, []);

  // SAVE COMPANY PROFILE
  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    if (workspace.name.trim().length < 2) {
      setError('Company name must contain at least 2 characters.');
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setError('');

      const payload = {
        ...workspace,
        name: workspace.name.trim()
      };

      const { data } = await api.patch(
        '/workspace',
        payload
      );

      const updatedWorkspace = {
        ...initialWorkspace,
        ...data.workspace
      };

      setWorkspace(updatedWorkspace);

      localStorage.setItem(
        'bizflow_workspace',
        updatedWorkspace.name
      );

      window.dispatchEvent(
        new CustomEvent('bizflow:workspace-updated', {
          detail: {
            name: updatedWorkspace.name
          }
        })
      );

      setSaved(true);

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Unable to save company profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  const inputField = (
    label: string,
    field: keyof Workspace,
    placeholder = '',
    type = 'text'
  ) => (
    <label className="company-field">
      <span>{label}</span>

      <input
        type={type}
        value={workspace[field]}
        onChange={event =>
          updateField(field, event.target.value)
        }
        placeholder={placeholder}
        disabled={loading || saving}
      />
    </label>
  );

  const selectField = (
    label: string,
    field: keyof Workspace,
    options: { label: string; value: string }[]
  ) => (
    <label className="company-field">
      <span>{label}</span>

      <select
        value={workspace[field]}
        onChange={event =>
          updateField(field, event.target.value)
        }
        disabled={loading || saving}
      >
        {options.map(option => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            COMPANY MANAGEMENT
          </span>

          <h1>Company Settings</h1>

          <p>
            Manage your organization profile and business preferences.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="panel settings-card">
          <Loader2 className="spin" size={22} />
          Loading company profile...
        </div>
      ) : (
        <form onSubmit={save}>
          <div className="settings-grid">

            {/* BASIC COMPANY INFORMATION */}

            <section className="panel settings-card">
              <div className="settings-title">
                <Building2 />

                <div>
                  <h3>Organization Profile</h3>
                  <p>
                    Basic information about your company.
                  </p>
                </div>
              </div>

              {inputField(
                'Company Name *',
                'name',
                'Enter company name'
              )}

              {inputField(
                'Legal Name',
                'legalName',
                'Registered legal name'
              )}

              {selectField(
                'Business Type',
                'businessType',
                [
                  { label: 'Trading', value: 'trading' },
                  { label: 'IT / Software', value: 'it' },
                  { label: 'Manufacturing', value: 'manufacturing' },
                  { label: 'Retail', value: 'retail' },
                  { label: 'Wholesale', value: 'wholesale' },
                  { label: 'Other', value: 'other' }
                ]
              )}

              {inputField(
                'Industry',
                'industry',
                'e.g. Information Technology'
              )}
            </section>

            {/* CONTACT INFORMATION */}

            <section className="panel settings-card">
              <div className="settings-title">
                <FileText />

                <div>
                  <h3>Contact Information</h3>
                  <p>
                    Company communication details.
                  </p>
                </div>
              </div>

              {inputField(
                'Company Email',
                'email',
                'company@example.com',
                'email'
              )}

              {inputField(
                'Phone Number',
                'phone',
                '+8801XXXXXXXXX'
              )}

              {inputField(
                'Website',
                'website',
                'https://example.com'
              )}
            </section>

            {/* ADDRESS INFORMATION */}

            <section className="panel settings-card">
              <div className="settings-title">
                <MapPin />

                <div>
                  <h3>Business Address</h3>
                  <p>
                    Registered company address.
                  </p>
                </div>
              </div>

              {inputField(
                'Country',
                'country',
                'Bangladesh'
              )}

              {inputField(
                'Division',
                'division',
                'Dhaka'
              )}

              {inputField(
                'District',
                'district',
                'Dhaka'
              )}

              {inputField(
                'Full Address',
                'address',
                'Street, Area, City'
              )}

              {inputField(
                'Postal Code',
                'postalCode',
                '1216'
              )}
            </section>

            {/* REGISTRATION INFORMATION */}

            <section className="panel settings-card">
              <div className="settings-title">
                <ShieldCheck />

                <div>
                  <h3>Registration Information</h3>
                  <p>
                    Business legal registration details.
                  </p>
                </div>
              </div>

              {inputField(
                'Trade License Number',
                'tradeLicense',
                'Enter trade license number'
              )}

              {inputField(
                'TIN Number',
                'tin',
                'Enter TIN number'
              )}

              {inputField(
                'BIN / VAT Number',
                'bin',
                'Enter BIN number'
              )}
            </section>

            {/* FINANCIAL SETTINGS */}

            <section className="panel settings-card">
              <div className="settings-title">
                <Wallet />

                <div>
                  <h3>Financial Settings</h3>
                  <p>
                    Configure business accounting preferences.
                  </p>
                </div>
              </div>

              {selectField(
                'Currency',
                'currency',
                [
                  { label: 'BDT (৳)', value: 'BDT' },
                  { label: 'USD ($)', value: 'USD' },
                  { label: 'INR (₹)', value: 'INR' },
                  { label: 'EUR (€)', value: 'EUR' },
                  { label: 'GBP (£)', value: 'GBP' }
                ]
              )}

              {inputField(
                'Fiscal Year Start (MM-DD)',
                'fiscalYearStart',
                '07-01'
              )}

              {inputField(
                'Fiscal Year End (MM-DD)',
                'fiscalYearEnd',
                '06-30'
              )}

              {selectField(
                'Tax Mode',
                'taxMode',
                [
                  { label: 'No Tax', value: 'none' },
                  { label: 'Tax Inclusive', value: 'inclusive' },
                  { label: 'Tax Exclusive', value: 'exclusive' }
                ]
              )}
            </section>

            {/* REGIONAL SETTINGS */}

            <section className="panel settings-card">
              <div className="settings-title">
                <SlidersHorizontal />

                <div>
                  <h3>Regional Preferences</h3>
                  <p>
                    Timezone and date display settings.
                  </p>
                </div>
              </div>

              {selectField(
                'Timezone',
                'timezone',
                [
                  { label: 'Asia/Dhaka', value: 'Asia/Dhaka' },
                  { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
                  { label: 'UTC', value: 'UTC' }
                ]
              )}

              {selectField(
                'Date Format',
                'dateFormat',
                [
                  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
                  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
                  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
                ]
              )}
            </section>

            {/* BRANDING */}

            <section className="panel settings-card">
              <div className="settings-title">
                <Image />

                <div>
                  <h3>Company Branding</h3>
                  <p>
                    Logo and invoice presentation.
                  </p>
                </div>
              </div>

              {inputField(
                'Company Logo URL',
                'logoUrl',
                'https://example.com/logo.png'
              )}

              {inputField(
                'Invoice Footer',
                'invoiceFooter',
                'Thank you for your business.'
              )}

              {workspace.logoUrl && (
                <img
                  src={workspace.logoUrl}
                  alt="Company logo preview"
                  style={{
                    maxWidth: 130,
                    maxHeight: 90,
                    objectFit: 'contain',
                    marginTop: 12
                  }}
                />
              )}
            </section>

            {/* DATABASE INFORMATION */}

            <section className="panel settings-card">
              <div className="settings-title">
                <Database />

                <div>
                  <h3>Database Connection</h3>
                  <p>
                    BizFlow primary database.
                  </p>
                </div>
              </div>

              <div className="connection-row">
                <span>Database</span>
                <b>MongoDB</b>
              </div>

              <div className="connection-row">
                <span>Connection</span>
                <b>Configured via server/.env</b>
              </div>
            </section>

          </div>

          {/* SAVE ACTION */}

          <section className="panel settings-card company-save-panel">
            <div>
              <h3>Save Company Profile</h3>
              <p>
                Save all company information to MongoDB.
              </p>
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={saving || loading}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Saving...
                </>
              ) : (
                'Save Company Profile'
              )}
            </button>

            {saved && (
              <span className="saved-message">
                <CheckCircle2 size={15} />
                Company profile saved successfully.
              </span>
            )}

            {error && (
              <p style={{ color: '#dc2626', marginTop: 12 }}>
                {error}
              </p>
            )}
          </section>
        </form>
      )}

      {/* EXISTING ENVIRONMENT INFORMATION */}

      <div className="settings-grid" style={{ marginTop: 20 }}>
        <section className="panel settings-card">
          <div className="settings-title">
            <SlidersHorizontal />

            <div>
              <h3>Environment</h3>
              <p>Local development configuration.</p>
            </div>
          </div>

          <div className="connection-row">
            <span>Frontend</span>
            <b>Vite · localhost:5173</b>
          </div>

          <div className="connection-row">
            <span>Backend API</span>
            <b>Express · localhost:4000</b>
          </div>

          <div className="connection-row">
            <span>Database</span>
            <b>MongoDB · bizflow_erp</b>
          </div>
        </section>
      </div>
    </>
  );
}
