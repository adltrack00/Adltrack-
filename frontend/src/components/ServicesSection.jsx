import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Palette, Code, Search, Layers, Megaphone, BarChart2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

/* ── Services data — colours pulled straight from CoreFeaturesSection ── */
const SERVICES = [
  {
    number: "001",
    title: "Family Caregivers",
    description:
      "Real-time care coordination tools that keep families informed, connected, and in control — no matter where life takes them.",
    icon: Palette,
    gradient: "radial-gradient(circle at 50% 0%, #FFB347 0%, #F9ED96 30%, #F4F8F9 62%, #F4F8F9 100%)",
    iconBg: "rgba(255,179,71,0.18)",
    iconColor: "#b45309",
  },
  {
    number: "002",
    title: "Home Health Aides",
    description:
      "A lightweight clinical system for paid caregivers — task tracking, photo uploads, vitals, and incident reports in seconds.",
    icon: Code,
    gradient: "radial-gradient(circle at 50% 0%, #E5A1F5 0%, #F8ACA0 30%, #F4F8F9 62%, #F4F8F9 100%)",
    iconBg: "rgba(229,161,245,0.20)",
    iconColor: "#9333ea",
  },
  {
    number: "003",
    title: "Healthcare Providers",
    description:
      "Structured care data and accurate timelines that give doctors better insights for diagnosis and treatment decisions.",
    icon: Search,
    gradient: "radial-gradient(circle at 50% 0%, #F9ED96 0%, #E5A1F5 30%, #F4F8F9 62%, #F4F8F9 100%)",
    iconBg: "rgba(249,237,150,0.30)",
    iconColor: "#7c3aed",
  },
  {
    number: "004",
    title: "Care Agencies",
    description:
      "Oversight, scheduling, and accountability tools that protect your agency and demonstrate the quality of every shift delivered.",
    icon: Layers,
    gradient: "radial-gradient(circle at 50% 0%, #93c5fd 0%, #c4b5fd 30%, #F4F8F9 62%, #F4F8F9 100%)",
    iconBg: "rgba(147,197,253,0.22)",
    iconColor: "#2563eb",
  },
  {
    number: "005",
    title: "Medicaid & Medicare",
    description:
      "Documented proof of care needs that helps families qualify for benefits and supports accurate reporting to reduce fraud.",
    icon: Megaphone,
    gradient: "radial-gradient(circle at 50% 0%, #F28482 0%, #FFB347 30%, #F4F8F9 62%, #F4F8F9 100%)",
    iconBg: "rgba(242,132,130,0.18)",
    iconColor: "#dc2626",
  },
  {
    number: "006",
    title: "Care Resource Discovery",
    description:
      "Real-time alerts about nearby care services, support programs, and resources — so caregivers can get help when they need it most.",
    icon: BarChart2,
    gradient: "radial-gradient(circle at 50% 0%, #B567C2 0%, #E5A1F5 30%, #F4F8F9 62%, #F4F8F9 100%)",
    iconBg: "rgba(181,103,194,0.18)",
    iconColor: "#7e22ce",
  },
];

/* ── Card animation ─────────────────────────────────────────────
   Mirrors the feel of the CoreFeatures cards: clean fade-up,
   no bounce — smooth ease-out. Stagger 80 ms between slides.    */
const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.50, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ── Individual card ────────────────────────────────────────────
   Visual DNA: #F4F8F9 base, radial bleed from top, border-radius
   20px, shadow 0 10px 30px -10px rgba(0,0,0,0.1) — exact match
   to .c1-card rules.                                             */
function ServiceCard({ service, index }) {
  const Icon = service.icon;
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      style={{
        background:   service.gradient,
        borderRadius: 20,
        height:       340,
        display:      "flex",
        flexDirection:"column",
        justifyContent:"flex-end",
        position:     "relative",
        overflow:     "hidden",
        textAlign:    "left",
        boxShadow:    "0 10px 30px -10px rgba(0,0,0,0.10)",
        cursor:       "default",
      }}
    >
      {/* Icon pill — sits in the top-left, same placement as c1 visuals */}
      <div style={{
        position: "absolute", top: 28, left: 24,
        width: 48, height: 48, borderRadius: 12,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}>
        <Icon size={22} color={service.iconColor} strokeWidth={1.8} />
      </div>

      {/* Service number — top-right, mono, same muted style as c1-badge */}
      <span style={{
        position: "absolute", top: 32, right: 24,
        fontFamily: "'Inter', sans-serif",
        fontSize: 11, fontWeight: 600,
        color: "rgba(0,0,0,0.52)",
        letterSpacing: "0.10em",
        fontVariantNumeric: "tabular-nums",
      }}>
        ( {service.number} )
      </span>

      {/* Bottom text — matches .c1-card h3 sizing + padding */}
      <div style={{ padding: "0 24px 24px" }}>
        <h3 style={{
          fontFamily:    "'Fustat', 'Inter', sans-serif",
          fontSize:      "1.15rem",
          fontWeight:    700,
          color:         "#0f172a",
          letterSpacing: "-0.02em",
          marginBottom:  8,
        }}>
          {service.title}
        </h3>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize:   "0.875rem",
          color:      "#1e293b",
          lineHeight: 1.6,
          margin:     0,
        }}>
          {service.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Section ────────────────────────────────────────────────────
   Same white background + centred 1100px container as
   CoreFeaturesSection / CTAFAQFooterSection.                     */
export function ServicesSection() {
  const ref      = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.12 });

  return (
    <section
      id="services-section"
      ref={ref}
      style={{
        background: "#ffffff",
        fontFamily: "'Inter', sans-serif",
        padding:    "80px 40px",
        display:    "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 1360, width: "100%" }}>

        {/* ── Header — matches CoreFeaturesSection header rhythm ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.50, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", marginBottom: 50 }}
        >
          {/* Badge — gradient text identical to .c1-badge */}
          <p style={{
            display:       "inline-block",
            fontSize:      "0.75rem",
            fontWeight:    600,
            textTransform: "uppercase",
            letterSpacing: "1px",
            background:    "linear-gradient(90deg, #F5C344, #F28482, #B567C2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip: "text",
            color:          "transparent",
            marginBottom:   16,
          }}>
            Who We Serve
          </p>

          <h2 style={{
            fontSize:      "2.75rem",
            fontWeight:    700,
            color:         "#0f172a",
            letterSpacing: "-0.03em",
            lineHeight:    1.1,
            marginBottom:  12,
          }}>
            Care for Everyone.
          </h2>

          <p style={{
            fontSize:   "1.125rem",
            color:      "#374151",
            lineHeight: 1.5,
            marginBottom: 0,
          }}>
            ADLTrack connects every person in the care ecosystem —<br />
            families, caregivers, providers, and government systems.
          </p>
        </motion.div>

        {/* ── Carousel ── */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Carousel
            opts={{ align: "start", loop: true }}
            style={{ position: "relative" }}
          >
            <CarouselContent style={{ marginLeft: -16 }}>
              {SERVICES.map((service, i) => (
                <CarouselItem
                  key={service.number}
                  style={{ paddingLeft: 16 }}
                  className="basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <ServiceCard service={service} index={i} />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Nav arrows — anchored below the track */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginTop: 28,
            }}>
              <CarouselPrevious
                className="static translate-x-0 translate-y-0"
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#F4F8F9",
                  border: "1px solid rgba(0,0,0,0.10)",
                  color: "#1e293b",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              />
              <CarouselNext
                className="static translate-x-0 translate-y-0"
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#0f172a",
                  border: "1px solid #0f172a",
                  color: "#ffffff",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                }}
              />
            </div>
          </Carousel>
        </motion.div>

      </div>
    </section>
  );
}

export default ServicesSection;
