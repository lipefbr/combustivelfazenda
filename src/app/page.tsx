import { db } from "@/lib/db";
import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Problems, Features, HowItWorks } from "@/components/landing/sections";
import { AppDemo } from "@/components/landing/app-demo";
import { ReportsPreview, Segments } from "@/components/landing/reports-segments";
import { Plans } from "@/components/landing/plans";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer, WhatsAppButton } from "@/components/landing/footer";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // Busca dados para a landing (planos, depoimentos, configurações)
  const [plans, testimonials, settings] = await Promise.all([
    db.plan.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    db.testimonial.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    db.platformSetting.findMany(),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  return (
    <main className="min-h-screen bg-background">
      <LandingHeader />
      <Hero />
      <Problems />
      <Features />
      <HowItWorks />
      <AppDemo />
      <ReportsPreview />
      <Segments />
      <Plans plans={plans} />
      <Testimonials items={testimonials} />
      <FAQ />
      <FinalCTA />
      <Footer
        whatsapp={settingsMap.contact_whatsapp}
        email={settingsMap.contact_email}
        instagram={settingsMap.social_instagram}
        facebook={settingsMap.social_facebook}
        linkedin={settingsMap.social_linkedin}
      />
      <WhatsAppButton phone={settingsMap.contact_whatsapp} />
    </main>
  );
}
