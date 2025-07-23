// app/onboarding/page.tsx
"use client";

import dynamic from "next/dynamic";

const OnboardingClient = dynamic(() => import("./OnboardingClient"), { ssr: false });

export default function Page() {
  return <OnboardingClient />;
}