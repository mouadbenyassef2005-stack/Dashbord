"use client";

import { useState, type FormEvent } from "react";
import { projectTypes } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "w-full rounded-xl border border-line bg-bg px-4 py-3.5 text-sm text-fg placeholder:text-fg-faint outline-none transition-colors focus:border-accent";

const labelClasses = "mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-fg-faint";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  // Formular-Endpunkt ist bewusst nicht angebunden. Sobald ein Backend
  // (z. B. Formspree, Resend oder Supabase) feststeht, hier den Endpunkt
  // eintragen und den fetch-Aufruf unten aktivieren.
  const FORM_ENDPOINT = "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const formData = new FormData(event.currentTarget);

    try {
      if (FORM_ENDPOINT) {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Request failed");
      }
      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-bg-elevated/60 px-8 py-16 text-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 13L9 17L19 7"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="font-display text-xl font-semibold text-fg">
          Anfrage gesendet
        </h3>
        <p className="mt-2 max-w-sm text-sm text-fg-muted">
          Vielen Dank für Ihre Anfrage. Wir melden uns zeitnah bei Ihnen
          zurück.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-accent hover:underline"
        >
          Neue Anfrage senden
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClasses}>
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputClasses}
            placeholder="Ihr vollständiger Name"
          />
        </div>
        <div>
          <label htmlFor="unternehmen" className={labelClasses}>
            Unternehmen *
          </label>
          <input
            id="unternehmen"
            name="unternehmen"
            type="text"
            required
            autoComplete="organization"
            className={inputClasses}
            placeholder="Firmenname"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClasses}>
            E-Mail *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClasses}
            placeholder="name@unternehmen.de"
          />
        </div>
        <div>
          <label htmlFor="telefon" className={labelClasses}>
            Telefon
          </label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            autoComplete="tel"
            className={inputClasses}
            placeholder="Ihre Telefonnummer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="projektart" className={labelClasses}>
            Projektart *
          </label>
          <select
            id="projektart"
            name="projektart"
            required
            defaultValue=""
            className={`${inputClasses} appearance-none`}
          >
            <option value="" disabled>
              Bitte wählen
            </option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="standort" className={labelClasses}>
            Projektstandort
          </label>
          <input
            id="standort"
            name="standort"
            type="text"
            className={inputClasses}
            placeholder="z. B. Dortmund"
          />
        </div>
      </div>

      <div>
        <label htmlFor="nachricht" className={labelClasses}>
          Nachricht
        </label>
        <textarea
          id="nachricht"
          name="nachricht"
          rows={5}
          className={`${inputClasses} resize-none`}
          placeholder="Beschreiben Sie kurz Ihr Projekt oder Ihren Bedarf."
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">
          Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es
          erneut.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-semibold text-accent-ink transition-all duration-300 hover:bg-fg disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Wird gesendet…" : "Projekt anfragen"}
      </button>
    </form>
  );
}
