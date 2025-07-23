// app/terms/layout.tsx

import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ja from "@/locales/ja.json";

export const metadata = {
  title: ja.meta.title,
  description: ja.meta.description,
};

export default function TermsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer locale="ja" messages={ja.footer} />
    </>
  );
}