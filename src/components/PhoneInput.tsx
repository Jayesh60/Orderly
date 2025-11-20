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
          display: flex !important;
          align-items: stretch !important;
          gap: 0 !important;
          width: 100% !important;
        }

        .phone-input-wrapper .PhoneInputCountrySelect {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          background: #ffffff !important;
          border: 2px solid ${error ? '#f87171' : '#e5e7eb'} !important;
          border-right: none !important;
          border-radius: 12px 0 0 12px !important;
          padding: 14px 12px !important;
          margin-right: 0 !important;
          color: #1f2937 !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
          min-width: 100px !important;
          max-width: 100px !important;
        }

        .phone-input-wrapper .PhoneInputCountrySelect:hover {
          background: #f9fafb !important;
          border-color: ${error ? '#f87171' : '#3b82f6'} !important;
        }

        .phone-input-wrapper .PhoneInputCountrySelect:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
          background: #ffffff !important;
          z-index: 10 !important;
        }

        .phone-input-wrapper .PhoneInputInput {
          flex: 1 !important;
          padding: 14px 18px !important;
          border: 2px solid ${error ? '#f87171' : '#e5e7eb'} !important;
          border-left: none !important;
          border-radius: 0 12px 12px 0 !important;
          background: #ffffff !important;
          color: #1f2937 !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          font-family: inherit !important;
          transition: all 0.2s ease !important;
        }

        .phone-input-wrapper .PhoneInputInput:hover {
          border-color: ${error ? '#f87171' : '#d1d5db'} !important;
        }

        .phone-input-wrapper .PhoneInputInput:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
          z-index: 1 !important;
        }

        .phone-input-wrapper .PhoneInputInput::placeholder {
          color: #9ca3af !important;
          font-weight: 400 !important;
        }

        .phone-input-wrapper.error .PhoneInputCountrySelect,
        .phone-input-wrapper.error .PhoneInputInput {
          border-color: #f87171 !important;
          background: #fef2f2 !important;
        }

        .phone-input-wrapper.error .PhoneInputInput:focus,
        .phone-input-wrapper.error .PhoneInputCountrySelect:focus {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15) !important;
          background: #ffffff !important;
        }

        .phone-input-wrapper .PhoneInputCountrySelectArrow {
          width: 12px !important;
          height: 12px !important;
          margin-left: 6px !important;
          opacity: 0.5 !important;
          transition: all 0.2s ease !important;
          color: #6b7280 !important;
          flex-shrink: 0 !important;
        }

        .phone-input-wrapper .PhoneInputCountrySelect:hover .PhoneInputCountrySelectArrow {
          opacity: 0.8 !important;
          color: #3b82f6 !important;
        }

        .phone-input-wrapper .PhoneInputCountryIcon {
          width: 32px !important;
          height: 24px !important;
          margin-right: 8px !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12) !important;
          border-radius: 4px !important;
          border: 1px solid rgba(0, 0, 0, 0.15) !important;
          object-fit: cover !important;
          display: inline-block !important;
          vertical-align: middle !important;
          flex-shrink: 0 !important;
          transition: all 0.2s ease !important;
        }

        .phone-input-wrapper .PhoneInputCountrySelect:focus .PhoneInputCountryIcon {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 2px 6px rgba(0, 0, 0, 0.12) !important;
          border-color: #3b82f6 !important;
        }

        .phone-input-wrapper .PhoneInputCountrySelect:hover .PhoneInputCountryIcon {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18) !important;
        }

        /* Dropdown menu styling */
        .phone-input-wrapper .PhoneInputCountry {
          position: relative !important;
          display: inline-flex !important;
          align-items: center !important;
        }

        .phone-input-wrapper select.PhoneInputCountrySelect option {
          padding: 10px 14px !important;
          font-size: 15px !important;
          background: #ffffff !important;
          color: #1f2937 !important;
        }

        /* Make the country icon wrapper align properly */
        .phone-input-wrapper .PhoneInputCountryIconImg {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
        }

        /* Disabled state */
        .phone-input-wrapper .PhoneInputInput:disabled,
        .phone-input-wrapper .PhoneInputCountrySelect:disabled {
          background: #f3f4f6 !important;
          color: #9ca3af !important;
          cursor: not-allowed !important;
          opacity: 0.6 !important;
        }

        .phone-input-wrapper .PhoneInputInput:disabled:hover,
        .phone-input-wrapper .PhoneInputCountrySelect:disabled:hover {
          border-color: #e5e7eb !important;
        }
      `}</style>
    </div>
  )
}