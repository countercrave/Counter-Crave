"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SiteSearch({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) {
      router.push("/search/");
      return;
    }
    router.push(`/search/?q=${encodeURIComponent(value)}`);
  }

  return (
    <form
      className={compact ? "site-search site-search-compact" : "site-search"}
      role="search"
      onSubmit={onSubmit}
    >
      <label className="sr-only" htmlFor="site-search-input">
        Search CounterCrave guides
      </label>
      <input
        id="site-search-input"
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search air fryers, blenders…"
        autoComplete="off"
      />
      <button type="submit">Search</button>
    </form>
  );
}
