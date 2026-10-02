import type { ChangeEvent } from 'react';

export interface AddressParts {
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  country: string;
}

export const createEmptyAddressParts = (): AddressParts => ({
  streetAddress: '',
  ward: '',
  district: '',
  city: '',
  country: '',
});

export const createVietnamAddressParts = (): AddressParts => ({
  ...createEmptyAddressParts(),
  city: 'Ho Chi Minh City',
  country: 'Vietnam',
});

export const formatAddress = (parts: AddressParts) => [
  parts.streetAddress,
  parts.ward,
  parts.district,
  parts.city,
  parts.country,
].map((part) => part.trim()).filter(Boolean).join(', ');

export const addressPartsFromLegacy = (
  address: string,
  district = '',
  city = 'Ho Chi Minh City',
): AddressParts => {
  const parts = String(address || '').split(',').map((part) => part.trim()).filter(Boolean);
  const streetAddress = parts[0] || '';
  const detectedDistrict = district || parts.find((part) => /\b(district|quận|quan)\b/i.test(part)) || '';
  const ward = parts.find((part) => /\b(ward|phường|phuong)\b/i.test(part)) || '';
  const detectedCity = parts.find((part) => /ho chi minh|hcmc|\bhcm\b|hanoi|ha noi|da nang/i.test(part)) || city;
  const country = parts.find((part) => /\b(vietnam|viet nam)\b/i.test(part)) || 'Vietnam';
  return { streetAddress, ward, district: detectedDistrict, city: detectedCity, country };
};

interface AddressFieldsProps {
  value: AddressParts;
  onChange: (value: AddressParts) => void;
  requiredDistrict?: boolean;
  disabled?: boolean;
}

export const AddressFields = ({ value, onChange, requiredDistrict = false, disabled = false }: AddressFieldsProps) => {
  const update = (field: keyof AddressParts) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [field]: event.target.value });
  };

  const inputClass = 'mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 disabled:bg-gray-100';

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="block text-sm text-gray-700 sm:col-span-2">Street Address
        <input required disabled={disabled} maxLength={160} value={value.streetAddress} onChange={update('streetAddress')} className={inputClass} placeholder="House number and street" />
      </label>
      <label className="block text-sm text-gray-700">Ward / Neighborhood
        <input disabled={disabled} maxLength={100} value={value.ward} onChange={update('ward')} className={inputClass} placeholder="Optional" />
      </label>
      <label className="block text-sm text-gray-700">District / Area
        <input required={requiredDistrict} disabled={disabled} maxLength={100} value={value.district} onChange={update('district')} className={inputClass} placeholder={requiredDistrict ? 'e.g. District 7' : 'Optional'} />
      </label>
      <label className="block text-sm text-gray-700">City
        <input required disabled={disabled} maxLength={100} value={value.city} onChange={update('city')} className={inputClass} placeholder="City" />
      </label>
      <label className="block text-sm text-gray-700">Country
        <input required disabled={disabled} maxLength={100} value={value.country} onChange={update('country')} className={inputClass} placeholder="Country" />
      </label>
    </div>
  );
};
