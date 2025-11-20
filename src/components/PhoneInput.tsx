'use client'

import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

interface PhoneInputWrapperProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

export default function PhoneInputWrapper({ 
  value, 
  onChange, 
  placeholder = "Enter phone number",
  disabled = false,
  error = false
}: PhoneInputWrapperProps) {
  return (
    <div className={`phone-input-wrapper ${error ? 'error' : ''}`}>
      <PhoneInput
        value={value}
        onChange={(value) => onChange(value || '')}
        placeholder={placeholder}
        disabled={disabled}
        defaultCountry="IN"
        international
        countryCallingCodeEditable={false}
        className={error ? 'error' : ''}
      />
      
      <style jsx global>{`
        .phone-input-wrapper {
          position: relative;
        }

        .phone-input-wrapper .PhoneInput {
          display: flex;
          align-items: stretch;
          gap: 0;
          width: 100%;
        }

        .phone-input-wrapper .PhoneInputCountrySelect {
          background: linear-gradient(to bottom, #ffffff, #f9fafb);
          border: 2px solid ${error ? '#f87171' : '#e5e7eb'};
          border-right: none;
          border-radius: 12px 0 0 12px;
          padding: 14px 12px;
          margin-right: 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.2s ease;
          cursor: pointer;
          min-width: 80px;
        }

        .phone-input-wrapper .PhoneInputCountrySelect:hover {
          background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
          border-color: ${error ? '#f87171' : '#d1d5db'};
        }

        .phone-input-wrapper .PhoneInputCountrySelect:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
          background: #ffffff;
          z-index: 1;
        }

        .phone-input-wrapper .PhoneInputInput {
          flex: 1;
          padding: 14px 18px;
          border: 2px solid ${error ? '#f87171' : '#e5e7eb'};
          border-left: none;
          border-radius: 0 12px 12px 0;
          background: #ffffff;
          color: #1f2937;
          font-size: 16px;
          font-weight: 500;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .phone-input-wrapper .PhoneInputInput:hover {
          border-color: ${error ? '#f87171' : '#d1d5db'};
        }

        .phone-input-wrapper .PhoneInputInput:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
          z-index: 1;
        }

        .phone-input-wrapper .PhoneInputInput::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .phone-input-wrapper.error .PhoneInputCountrySelect,
        .phone-input-wrapper.error .PhoneInputInput {
          border-color: #f87171;
          background: #fef2f2;
        }

        .phone-input-wrapper.error .PhoneInputInput:focus,
        .phone-input-wrapper.error .PhoneInputCountrySelect:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
          background: #ffffff;
        }

        .phone-input-wrapper .PhoneInputCountrySelectArrow {
          width: 12px;
          height: 12px;
          margin-left: 6px;
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .phone-input-wrapper .PhoneInputCountrySelect:hover .PhoneInputCountrySelectArrow {
          opacity: 0.8;
        }

        .phone-input-wrapper .PhoneInputCountryIcon {
          width: 24px;
          height: 24px;
          margin-right: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }

        /* Disabled state */
        .phone-input-wrapper .PhoneInputInput:disabled,
        .phone-input-wrapper .PhoneInputCountrySelect:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .phone-input-wrapper .PhoneInputInput:disabled:hover,
        .phone-input-wrapper .PhoneInputCountrySelect:disabled:hover {
          border-color: #e5e7eb;
        }
      `}</style>
    </div>
  )
}