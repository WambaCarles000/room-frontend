"use client";

import PhoneInput from "react-phone-number-input";
import labels from "react-phone-number-input/locale/fr.json";

export default function PhoneNumberField({
  id,
  name = "phone",
  value,
  onChange,
  placeholder = "Numéro de téléphone",
  disabled = false,
}) {
  return (
    <PhoneInput
      id={id}
      name={name}
      defaultCountry="CM"
      labels={labels}
      international
      countryCallingCodeEditable={false}
      value={value || undefined}
      onChange={(phoneNumber) => onChange(phoneNumber || "")}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="tel"
    />
  );
}