import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export const COUNTRIES = [
  { code: 'LB', name: 'Lebanon',              dial: '+961', flag: '🇱🇧' },
  { code: 'SA', name: 'Saudi Arabia',          dial: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates',  dial: '+971', flag: '🇦🇪' },
  { code: 'KW', name: 'Kuwait',                dial: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar',                 dial: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain',               dial: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman',                  dial: '+968', flag: '🇴🇲' },
  { code: 'JO', name: 'Jordan',                dial: '+962', flag: '🇯🇴' },
  { code: 'SY', name: 'Syria',                 dial: '+963', flag: '🇸🇾' },
  { code: 'IQ', name: 'Iraq',                  dial: '+964', flag: '🇮🇶' },
  { code: 'PS', name: 'Palestine',             dial: '+970', flag: '🇵🇸' },
  { code: 'IL', name: 'Israel',                dial: '+972', flag: '🇮🇱' },
  { code: 'TR', name: 'Turkey',                dial: '+90',  flag: '🇹🇷' },
  { code: 'EG', name: 'Egypt',                 dial: '+20',  flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco',               dial: '+212', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia',               dial: '+216', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algeria',               dial: '+213', flag: '🇩🇿' },
  { code: 'LY', name: 'Libya',                 dial: '+218', flag: '🇱🇾' },
  { code: 'SD', name: 'Sudan',                 dial: '+249', flag: '🇸🇩' },
  { code: 'YE', name: 'Yemen',                 dial: '+967', flag: '🇾🇪' },
  { code: 'IR', name: 'Iran',                  dial: '+98',  flag: '🇮🇷' },
  { code: 'US', name: 'United States',         dial: '+1',   flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom',        dial: '+44',  flag: '🇬🇧' },
  { code: 'FR', name: 'France',                dial: '+33',  flag: '🇫🇷' },
  { code: 'DE', name: 'Germany',               dial: '+49',  flag: '🇩🇪' },
  { code: 'IT', name: 'Italy',                 dial: '+39',  flag: '🇮🇹' },
  { code: 'ES', name: 'Spain',                 dial: '+34',  flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal',              dial: '+351', flag: '🇵🇹' },
  { code: 'NL', name: 'Netherlands',           dial: '+31',  flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium',               dial: '+32',  flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland',           dial: '+41',  flag: '🇨🇭' },
  { code: 'AT', name: 'Austria',               dial: '+43',  flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden',                dial: '+46',  flag: '🇸🇪' },
  { code: 'NO', name: 'Norway',                dial: '+47',  flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark',               dial: '+45',  flag: '🇩🇰' },
  { code: 'FI', name: 'Finland',               dial: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland',                dial: '+48',  flag: '🇵🇱' },
  { code: 'RU', name: 'Russia',                dial: '+7',   flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine',               dial: '+380', flag: '🇺🇦' },
  { code: 'GR', name: 'Greece',                dial: '+30',  flag: '🇬🇷' },
  { code: 'CA', name: 'Canada',                dial: '+1',   flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico',                dial: '+52',  flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil',                dial: '+55',  flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina',             dial: '+54',  flag: '🇦🇷' },
  { code: 'AU', name: 'Australia',             dial: '+61',  flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand',           dial: '+64',  flag: '🇳🇿' },
  { code: 'IN', name: 'India',                 dial: '+91',  flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan',              dial: '+92',  flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh',            dial: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka',             dial: '+94',  flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal',                 dial: '+977', flag: '🇳🇵' },
  { code: 'PH', name: 'Philippines',           dial: '+63',  flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia',             dial: '+62',  flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia',              dial: '+60',  flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore',             dial: '+65',  flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand',              dial: '+66',  flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam',               dial: '+84',  flag: '🇻🇳' },
  { code: 'CN', name: 'China',                 dial: '+86',  flag: '🇨🇳' },
  { code: 'JP', name: 'Japan',                 dial: '+81',  flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea',           dial: '+82',  flag: '🇰🇷' },
  { code: 'NG', name: 'Nigeria',               dial: '+234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana',                 dial: '+233', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya',                 dial: '+254', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa',          dial: '+27',  flag: '🇿🇦' },
  { code: 'ET', name: 'Ethiopia',              dial: '+251', flag: '🇪🇹' },
];

function parseValue(val) {
  if (!val) return { dial: '+961', number: '' };
  // Try to match longest dial code first to avoid +1 matching +12
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (val.startsWith(c.dial + ' ')) return { dial: c.dial, number: val.slice(c.dial.length + 1) };
    if (val.startsWith(c.dial))       return { dial: c.dial, number: val.slice(c.dial.length) };
  }
  return { dial: '+961', number: val };
}

export default function PhoneInput({ value, onChange, placeholder = 'Phone number' }) {
  const parsed      = parseValue(value || '');
  const [dial, setDial]     = useState(parsed.dial);
  const [number, setNumber] = useState(parsed.number);
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const dropRef = useRef(null);

  // Sync when value changes externally (e.g. form reset)
  useEffect(() => {
    const p = parseValue(value || '');
    setDial(p.dial);
    setNumber(p.number);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const emit = (newDial, newNumber) => {
    onChange(newNumber ? `${newDial} ${newNumber}` : '');
  };

  const handleDialSelect = (newDial) => {
    setDial(newDial);
    setOpen(false);
    setSearch('');
    emit(newDial, number);
  };

  const handleNumberChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    setNumber(digits);
    emit(dial, digits);
  };

  const selected = COUNTRIES.find(c => c.dial === dial) || COUNTRIES[0];
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  );

  return (
    <div style={s.wrap} ref={dropRef}>
      {/* Country code trigger */}
      <button type="button" onClick={() => setOpen(v => !v)} style={s.trigger}>
        <span style={s.flag}>{selected.flag}</span>
        <span style={s.dialCode}>{selected.dial}</span>
        <ChevronDown size={13} color="var(--text-muted)" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      <div style={s.divider} />

      {/* Number input — digits only */}
      <input
        type="tel"
        inputMode="numeric"
        value={number}
        onChange={handleNumberChange}
        placeholder={placeholder}
        style={s.numberInput}
      />

      {/* Dropdown */}
      {open && (
        <div style={s.dropdown}>
          <div style={s.searchWrap}>
            <Search size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country…"
              style={s.searchInput}
              autoFocus
            />
          </div>
          <div style={s.list}>
            {filtered.length === 0 && <div style={s.empty}>No results</div>}
            {filtered.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleDialSelect(c.dial)}
                style={{ ...s.option, ...(c.dial === dial ? s.optionActive : {}) }}
              >
                <span style={s.optFlag}>{c.flag}</span>
                <span style={s.optName}>{c.name}</span>
                <span style={s.optDial}>{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'visible',
    height: '38px',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '0 8px 0 10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    height: '100%',
    flexShrink: 0,
  },
  flag: {
    fontSize: '16px',
    lineHeight: 1,
  },
  dialCode: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-body)',
    minWidth: '34px',
  },
  divider: {
    width: '1px',
    height: '60%',
    background: 'var(--border)',
    flexShrink: 0,
  },
  numberInput: {
    flex: 1,
    padding: '0 10px',
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-body)',
    height: '100%',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    zIndex: 1000,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-lg)',
    width: '260px',
    overflow: 'hidden',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderBottom: '1px solid var(--border)',
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-body)',
  },
  list: {
    maxHeight: '220px',
    overflowY: 'auto',
  },
  empty: {
    padding: '12px',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.1s',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
  },
  optionActive: {
    background: 'var(--bg-hover)',
  },
  optFlag: {
    fontSize: '15px',
    flexShrink: 0,
  },
  optName: {
    flex: 1,
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  optDial: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
};
