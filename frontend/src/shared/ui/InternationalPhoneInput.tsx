import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Phone, Search } from 'lucide-react';

export interface CountryDialOption {
  iso2: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

export const COUNTRY_DIAL_OPTIONS: CountryDialOption[] = [
  { iso2: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪', placeholder: '424-8486105' },
  { iso2: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸', placeholder: '213-373-4253' },
  { iso2: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', placeholder: '300 123 4567' },
  { iso2: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { iso2: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { iso2: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', placeholder: '9 11 2345-6789' },
  { iso2: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', placeholder: '9 8765 4321' },
  { iso2: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪', placeholder: '987 654 321' },
  { iso2: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨', placeholder: '99 123 4567' },
  { iso2: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦', placeholder: '6123-4567' },
  { iso2: 'DO', name: 'República Dominicana', dialCode: '+1809', flag: '🇩🇴', placeholder: '555-1234' },
  { iso2: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷', placeholder: '8312 3456' },
  { iso2: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾', placeholder: '94 231 234' },
  { iso2: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾', placeholder: '981 123456' },
  { iso2: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴', placeholder: '71234567' },
  { iso2: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹', placeholder: '5123 4567' },
  { iso2: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻', placeholder: '7012 3456' },
  { iso2: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳', placeholder: '9123-4567' },
  { iso2: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮', placeholder: '8123 4567' },
  { iso2: 'PR', name: 'Puerto Rico', dialCode: '+1787', flag: '🇵🇷', placeholder: '555-0123' },
  { iso2: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷', placeholder: '11 91234-5678' },
  { iso2: 'CA', name: 'Canadá', dialCode: '+1', flag: '🇨🇦', placeholder: '416-555-0199' },
  { iso2: 'GB', name: 'Reino Unido', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { iso2: 'IT', name: 'Italia', dialCode: '+39', flag: '🇮🇹', placeholder: '312 345 6789' },
  { iso2: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', placeholder: '912 345 678' },
  { iso2: 'DE', name: 'Alemania', dialCode: '+49', flag: '🇩🇪', placeholder: '1512 3456789' },
  { iso2: 'FR', name: 'Francia', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
];

function parseExistingPhone(rawPhone: string): {
  country: CountryDialOption;
  localNumber: string;
} {
  const trimmed = (rawPhone || '').trim();
  if (!trimmed) {
    return { country: COUNTRY_DIAL_OPTIONS[0], localNumber: '' };
  }

  const sortedByCodeLength = [...COUNTRY_DIAL_OPTIONS].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );

  for (const option of sortedByCodeLength) {
    if (trimmed.startsWith(option.dialCode)) {
      const rest = trimmed.slice(option.dialCode.length).trim();
      return { country: option, localNumber: rest };
    }
  }

  return { country: COUNTRY_DIAL_OPTIONS[0], localNumber: trimmed.replace(/^\+/, '') };
}

interface InternationalPhoneInputProps {
  value: string;
  onChange: (fullInternationalPhone: string) => void;
  required?: boolean;
  accent?: 'default' | 'emerald';
}

export const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  value,
  onChange,
  required = false,
  accent = 'default',
}) => {
  const initialParsed = useMemo(() => parseExistingPhone(value), []);
  const [selectedCountry, setSelectedCountry] = useState<CountryDialOption>(
    initialParsed.country
  );
  const [localDigits, setLocalDigits] = useState<string>(initialParsed.localNumber);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentCombined = localDigits.trim()
      ? `${selectedCountry.dialCode} ${localDigits.trim()}`
      : '';
    if (value && value !== currentCombined && value !== `${selectedCountry.dialCode}${localDigits.trim()}`) {
      const parsed = parseExistingPhone(value);
      setSelectedCountry(parsed.country);
      setLocalDigits(parsed.localNumber);
    } else if (!value && localDigits) {
      setLocalDigits('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRY_DIAL_OPTIONS;
    return COUNTRY_DIAL_OPTIONS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.toLowerCase().includes(q) ||
        c.iso2.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleCountrySelect = (country: CountryDialOption) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    const cleanLocal = localDigits.trim();
    onChange(cleanLocal ? `${country.dialCode} ${cleanLocal}` : '');
  };

  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = raw.replace(/[^\d\s()-]/g, '');
    setLocalDigits(sanitized);
    const clean = sanitized.trim();
    onChange(clean ? `${selectedCountry.dialCode} ${clean}` : '');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-stretch rounded-lg border border-slate-700 bg-slate-950 focus-within:border-amber-500 transition-colors">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-l-lg border-r border-slate-800 bg-slate-900/90 px-2.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-amber-300 cursor-pointer shrink-0 transition-colors"
          title={`País seleccionado: ${selectedCountry.name} (${selectedCountry.dialCode})`}
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="font-mono font-bold text-amber-400">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>

        <div className="relative flex-1 min-w-0">
          <Phone
            className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
              accent === 'emerald' ? 'text-emerald-500' : 'text-slate-500'
            }`}
          />
          <input
            type="tel"
            value={localDigits}
            onChange={handleLocalInputChange}
            placeholder={selectedCountry.placeholder}
            required={required}
            className={`w-full rounded-r-lg bg-transparent py-2 pl-8 pr-3 text-sm font-mono focus:outline-none ${
              accent === 'emerald' ? 'text-emerald-300' : 'text-white'
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/80 overflow-hidden animate-fade-in">
          <div className="border-b border-slate-800 p-2 bg-slate-950/90">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar país o código (ej. +58, Col...)"
                autoFocus
                className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1.5 pl-8 pr-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/60">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No se encontró ningún país con "{searchQuery}"
              </div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected =
                  country.iso2 === selectedCountry.iso2 &&
                  country.dialCode === selectedCountry.dialCode;
                return (
                  <button
                    key={`${country.iso2}-${country.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-300 font-bold'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base leading-none shrink-0">
                        {country.flag}
                      </span>
                      <span className="truncate">{country.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-amber-400">
                        {country.dialCode}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
