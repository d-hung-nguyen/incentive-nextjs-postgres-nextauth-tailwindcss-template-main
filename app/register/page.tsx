'use client';

import { useState } from 'react';

type Agency = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
};

// Success Modal Component
function SuccessModal({
  isOpen,
  onClose,
  message
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
          Registration Successful!
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="rounded bg-black px-6 py-2 text-white hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  // Personal Info
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [telephone, setTelephone] = useState('');

  // Agency Info
  const [agencyName, setAgencyName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [zipCode, setZipCode] = useState('');

  // State management
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [matchingAgencies, setMatchingAgencies] = useState<Agency[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const [useNewAgency, setUseNewAgency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const canSubmit =
    email &&
    firstName &&
    lastName &&
    agencyName &&
    address &&
    city &&
    country &&
    zipCode;

  async function handleInitialSubmit() {
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      // Check for matching agencies
      const params = new URLSearchParams({
        zip: zipCode.trim(),
        q: address.trim()
      });

      const response = await fetch(`/api/register/check?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        if (data.agencies && data.agencies.length > 0) {
          // Found matching agencies - show confirmation step
          setMatchingAgencies(data.agencies);
          setStep('confirmation');
        } else {
          // No matches - proceed with new agency
          setUseNewAgency(true);
          await submitRegistration();
        }
      } else {
        setError('Failed to check agencies');
      }
    } catch (err) {
      setError('Failed to check agencies');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitRegistration() {
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        agent: {
          email,
          first_name: firstName,
          last_name: lastName,
          telephone
        },
        ...(selectedAgencyId
          ? { existingAgencyId: selectedAgencyId }
          : {
              agency: {
                name: agencyName,
                address,
                city,
                country,
                zip_code: zipCode
              }
            })
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        // Show success modal instead of inline message
        setSuccessMessage(
          result.message ||
            'Registration successful! Your application will be reviewed by our team.'
        );
        setShowSuccessModal(true);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleModalClose() {
    setShowSuccessModal(false);
    setSuccessMessage('');
    // Reset form after successful submission
    resetForm();
  }

  function resetForm() {
    setEmail('');
    setFirstName('');
    setLastName('');
    setTelephone('');
    setAgencyName('');
    setAddress('');
    setCity('');
    setCountry('');
    setZipCode('');
    setStep('form');
    setMatchingAgencies([]);
    setSelectedAgencyId(null);
    setUseNewAgency(false);
    setError(null);
  }

  function handleBackToForm() {
    setStep('form');
    setMatchingAgencies([]);
    setSelectedAgencyId(null);
    setUseNewAgency(false);
    setError(null);
  }

  if (step === 'confirmation') {
    return (
      <>
        <div className="mx-auto max-w-2xl p-6 space-y-6">
          <h1 className="text-2xl font-semibold">Agency Match Found</h1>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-blue-800 mb-4">
              We found {matchingAgencies.length} existing{' '}
              {matchingAgencies.length === 1 ? 'agency' : 'agencies'} in our
              system that match your location. You can join an existing agency
              or continue with creating a new one.
            </p>
          </div>

          <section className="space-y-4 rounded-xl border p-4">
            <h2 className="font-medium">Matching Agencies</h2>
            <div className="space-y-2">
              {matchingAgencies.map((agency) => (
                <label
                  key={agency.id}
                  className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="agency"
                    value={agency.id}
                    onChange={(e) => {
                      setSelectedAgencyId(e.target.value);
                      setUseNewAgency(false);
                    }}
                    checked={selectedAgencyId === agency.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{agency.name}</div>
                    <div className="text-sm text-gray-600">
                      {agency.address}, {agency.city}, {agency.country}{' '}
                      {agency.zipCode}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="border-t pt-4">
              <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="agency"
                  value="new"
                  onChange={() => {
                    setUseNewAgency(true);
                    setSelectedAgencyId(null);
                  }}
                  checked={useNewAgency}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">Create New Agency</div>
                  <div className="text-sm text-gray-600">
                    Continue with: {agencyName} at {address}, {city}
                  </div>
                </div>
              </label>
            </div>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToForm}
              className="rounded border px-4 py-2 hover:bg-gray-50"
            >
              Back to Form
            </button>
            <button
              onClick={submitRegistration}
              disabled={submitting || (!selectedAgencyId && !useNewAgency)}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 hover:bg-gray-800"
            >
              {submitting ? 'Submitting...' : 'Complete Registration'}
            </button>
          </div>
        </div>

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleModalClose}
          message={successMessage}
        />
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-2xl p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Agent Registration</h1>

        <section className="space-y-4 rounded-xl border p-4">
          <h2 className="font-medium">Personal Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span>Email *</span>
              <input
                type="email"
                className="rounded border p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>First Name *</span>
              <input
                className="rounded border p-2"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Last Name *</span>
              <input
                className="rounded border p-2"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span>Telephone</span>
              <input
                type="tel"
                className="rounded border p-2"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border p-4">
          <h2 className="font-medium">Agency Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span>Agency Name *</span>
              <input
                className="rounded border p-2"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Travel Agency Inc."
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span>Street Address *</span>
              <input
                className="rounded border p-2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>City *</span>
              <input
                className="rounded border p-2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New York"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>ZIP Code *</span>
              <input
                className="rounded border p-2"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="10001"
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span>Country *</span>
              <input
                className="rounded border p-2"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United States"
              />
            </label>
          </div>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            onClick={handleInitialSubmit}
            disabled={!canSubmit || submitting}
            className="rounded bg-black px-6 py-2 text-white disabled:opacity-50 hover:bg-gray-800"
          >
            {submitting ? 'Checking...' : 'Submit Registration'}
          </button>
        </div>

        <p className="text-xs text-gray-500">
          * Required fields. Your registration will be reviewed by our team for
          approval.
        </p>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        message={successMessage}
      />
    </>
  );
}
