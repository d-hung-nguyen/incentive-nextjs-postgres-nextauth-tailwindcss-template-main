'use client';

import { useState } from 'react';

type Agency = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
};

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 – agent
  const [email, setEmail] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [tel, setTel] = useState('');

  // Step 2 – agency search/create
  const [zip, setZip] = useState('');
  const [streetQuery, setStreetQuery] = useState('');
  const [results, setResults] = useState<Agency[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);

  const [agencyName, setAgencyName] = useState('');
  const [agencyAddress, setAgencyAddress] = useState('');
  const [agencyCity, setAgencyCity] = useState('');
  const [agencyCountry, setAgencyCountry] = useState('Deutschland');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setError(null);
    setResults([]);
    setSelectedAgencyId(null);
    setCreatingNew(false);
    if (!zip) {
      setError('Bitte PLZ eingeben.');
      return;
    }
    const u = new URL('/api/agencies/search', window.location.origin);
    u.searchParams.set('zip', zip);
    if (streetQuery && streetQuery.length >= 2)
      u.searchParams.set('q', streetQuery);
    const res = await fetch(u.toString());
    if (!res.ok) {
      setError('Suche fehlgeschlagen.');
      return;
    }
    const data = await res.json();
    setResults(data);
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const payload: any = {
      p_email: email,
      p_first_name: first,
      p_last_name: last,
      p_telephone: tel
    };

    if (selectedAgencyId && !creatingNew) {
      payload.p_agency_id = selectedAgencyId;
    } else {
      payload.p_agency_name = agencyName;
      payload.p_zip_code = zip;
      payload.p_address = agencyAddress;
      payload.p_city = agencyCity;
      payload.p_country = agencyCountry;
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setSubmitting(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err?.error ?? 'Registrierung fehlgeschlagen.');
      return;
    }

    const data = await res.json();
    setMessage('Danke! Antrag eingegangen. Status: pending.');
    // Optionally route to a confirmation page, clear form, etc.
  }

  const canNext = email && first && last; // simple demo validation

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Agent Registration</h1>

      {step === 1 && (
        <section className="space-y-4 rounded-xl border p-4">
          <h2 className="font-medium">Personal Info</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span>Email *</span>
              <input
                className="rounded border p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>First name *</span>
              <input
                className="rounded border p-2"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Last name *</span>
              <input
                className="rounded border p-2"
                value={last}
                onChange={(e) => setLast(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span>Telephone</span>
              <input
                className="rounded border p-2"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              System fields are hidden; status/role set by approver.
            </span>
            <button
              disabled={!canNext}
              onClick={() => setStep(2)}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4 rounded-xl border p-4">
          <h2 className="font-medium">Agency</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span>ZIP *</span>
              <input
                className="rounded border p-2"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span>Street (search)</span>
              <input
                className="rounded border p-2"
                placeholder="min. 2 chars"
                value={streetQuery}
                onChange={(e) => setStreetQuery(e.target.value)}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={search}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Search
            </button>
            <button
              onClick={() => {
                setCreatingNew(true);
                setSelectedAgencyId(null);
              }}
              className="rounded border px-4 py-2"
            >
              Create new
            </button>
          </div>

          {results.length > 0 && !creatingNew && (
            <ul className="divide-y rounded border">
              {results.map((a) => (
                <li key={a.id} className="flex items-center gap-3 p-3">
                  <input
                    type="radio"
                    name="agency"
                    onChange={() => setSelectedAgencyId(a.id)}
                    checked={selectedAgencyId === a.id}
                  />
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-sm text-gray-600">
                      {a.address}, {a.city} • {a.country}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {creatingNew && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span>Agency name *</span>
                <input
                  className="rounded border p-2"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span>Address *</span>
                <input
                  className="rounded border p-2"
                  value={agencyAddress}
                  onChange={(e) => setAgencyAddress(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>City *</span>
                <input
                  className="rounded border p-2"
                  value={agencyCity}
                  onChange={(e) => setAgencyCity(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>Country *</span>
                <input
                  className="rounded border p-2"
                  value={agencyCountry}
                  onChange={(e) => setAgencyCountry(e.target.value)}
                />
              </label>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded border px-4 py-2"
            >
              Back
            </button>
            <button
              onClick={submit}
              disabled={
                submitting ||
                (!selectedAgencyId && !creatingNew) ||
                (creatingNew &&
                  !(agencyName && agencyAddress && agencyCity && agencyCountry))
              }
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            On approval, status/role are updated by admins.
          </p>
        </section>
      )}
    </div>
  );
}
