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
        defaultCountry="US"
        international
        countryCallingCodeEditable={false}
        className={error ? 'error' : ''}
      />
      
      <style jsx global>{`
        .phone-input-wrapper .PhoneInput {
          display: flex;
          align-items: center;
        }
        
        .phone-input-wrapper .PhoneInputCountrySelect {
          background: #f9fafb;
          border: 1px solid ${error ? '#fca5a5' : '#d1d5db'};
          border-right: none;
          border-radius: 8px 0 0 8px;
          padding: 12px;
          margin-right: 0;
          color: #374151;
          font-size: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .phone-input-wrapper .PhoneInputCountrySelect:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .phone-input-wrapper .PhoneInputInput {
          padding: 12px 16px;
          border: 1px solid ${error ? '#fca5a5' : '#d1d5db'};
          border-left: none;
          border-radius: 0 8px 8px 0;
          background: #ffffff;
          color: #374151;
          font-size: 16px;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .phone-input-wrapper .PhoneInputInput:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .phone-input-wrapper .PhoneInputInput::placeholder {
          color: #9ca3af;
        }
        
        .phone-input-wrapper.error .PhoneInputCountrySelect,
        .phone-input-wrapper.error .PhoneInputInput {
          border-color: #fca5a5;
        }
        
        .phone-input-wrapper .PhoneInputCountrySelectArrow {
          width: 16px;
          height: 16px;
          margin-left: 8px;
          opacity: 0.6;
        }
        
        /* Disabled state */
        .phone-input-wrapper .PhoneInputInput:disabled,
        .phone-input-wrapper .PhoneInputCountrySelect:disabled {
          background-color: #f3f4f6;
          color: #6b7280;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}