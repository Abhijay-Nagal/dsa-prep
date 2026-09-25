import type { Metadata } from "next";
import { COMPANIES, COMPANY_MAP } from "@/lib/data/companies";
import View from "./view";

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = COMPANY_MAP[slug];
  return c
    ? { title: `${c.name} interview prep`, description: `${c.name} DSA sheet, round structure and readiness score. ${c.bar}` }
    : { title: "Company" };
}

export default function Page() {
  return <View />;
}
