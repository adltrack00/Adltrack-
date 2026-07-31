import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ_DATA = [
  {
    q: "Who is ADLTrack designed for?",
    a: "ADLTrack is built for family caregivers, paid home health aides, care agencies, and healthcare providers — anyone involved in coordinating or delivering home-based care.",
  },
  {
    q: "How does ADLTrack help with Medicaid and Medicare?",
    a: "ADLTrack captures real-time, verifiable care data — including photos, vitals, and task logs — that can be used as documented proof of care needs for benefit qualification and accurate service reporting.",
  },
  {
    q: "Can family members track care from another city or country?",
    a: "Yes. ADLTrack gives family members real-time visibility into care updates, photos, and health reports from anywhere in the world — no physical presence required.",
  },
  {
    q: "How does ADLTrack reduce caregiver burnout?",
    a: "By bringing families into the care process digitally, ADLTrack reduces isolation, shares the emotional load, and ensures caregivers feel seen and supported — not alone.",
  },
  {
    q: "Is ADLTrack secure and private?",
    a: "Absolutely. All care data is encrypted, access-controlled, and shared only with the people you authorize. Your family's health information stays private and protected.",
  },
];

function CTAButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      className="bg-neutral-900 text-white font-semibold cursor-pointer border-none text-[0.95rem] transition-all duration-200 hover:-translate-y-0.5"
      style={{
        padding: "14px 32px",
        borderRadius: "12px",
        boxShadow: hovered
          ? "0 14px 30px rgba(0,0,0,0.4)"
          : "0 10px 20px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Get Started Today
    </button>
  );
}

export function CTAFAQFooterSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const toggle = (i) => {
    setActiveIndex(activeIndex === i ? null : i);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="bg-white text-neutral-900">

      {/* ── Main: CTA + FAQ ── */}
      <main className="py-20 max-[900px]:py-[60px]">
        <div className="max-w-[1360px] w-full mx-auto px-10">
          <div className="grid grid-cols-[1.6fr_1fr] gap-[30px] items-stretch max-[900px]:grid-cols-1 max-[900px]:gap-[60px]">

            {/* Left — Animated Gradient CTA card */}
            <div
              className="c5-animated-gradient rounded-[24px] py-20 px-10 text-white flex flex-col justify-center items-center text-center"
              style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
            >
              <h2
                className="font-bold leading-[1.1] mb-[15px]"
                style={{ fontSize: "3.5rem", letterSpacing: "-0.03em", fontFamily: "'Fustat','Inter',sans-serif" }}
              >
                Ready to Transform<br />Home Care?
              </h2>
              <p className="text-[0.9rem] mb-[30px] font-normal opacity-85">
                Real-time visibility. Verified care. Families connected.
              </p>
              <CTAButton />
            </div>

            {/* Right — FAQ accordion */}
            <div className="flex flex-col justify-center gap-3">
              {FAQ_DATA.map((item, i) => {
                const isActive = activeIndex === i;
                return (
                  <div
                    key={i}
                    onClick={() => toggle(i)}
                    className="bg-white border rounded-[10px] py-[18px] px-5 cursor-pointer transition-all duration-200 hover:border-[#eaeaea]"
                    style={{
                      borderColor: isActive ? "#eaeaea" : "#f0f0f0",
                      boxShadow: isActive
                        ? "0 4px 12px rgba(0,0,0,0.04)"
                        : "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div className="flex justify-between items-center font-semibold text-[0.95rem] text-neutral-900">
                      <span>{item.q}</span>
                      {isActive ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    {isActive && (
                      <p className="mt-3 text-[0.9rem] text-[#374151] leading-[1.6]">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white pt-20 pb-5 max-[900px]:pt-[60px]">
        <div className="max-w-[1360px] w-full mx-auto px-10">
          <div className="grid grid-cols-[2fr_1fr_1fr_2fr] gap-10 mb-[50px] max-[900px]:grid-cols-2 max-[480px]:grid-cols-1">

            {/* Logo + tagline */}
            <div>
              <img
                src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg"
                className="h-6 mb-[15px]"
                style={{ filter: "brightness(0)" }}
                alt="One Permit"
              />
              <p className="text-[0.85rem] text-[#4b5563] leading-[1.6] max-w-[220px]">
                The operating system for home care — connecting families, caregivers, and health systems in real time.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold mb-5 text-[0.95rem] text-neutral-900">Navigation</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["How It Works", "For Families", "For Caregivers", "Pricing"].map((l) => (
                  <li key={l} className="mb-3">
                    <a href="#" className="text-[#4b5563] no-underline text-[0.85rem] transition-colors duration-200 hover:text-neutral-900">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pages */}
            <div>
              <h4 className="font-semibold mb-5 text-[0.95rem] text-neutral-900">Pages</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Home", "Contact", "404"].map((l) => (
                  <li key={l} className="mb-3">
                    <a href="#" className="text-[#4b5563] no-underline text-[0.85rem] transition-colors duration-200 hover:text-neutral-900">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-5 text-[0.95rem] text-neutral-900">Newsletter</h4>
              <p className="text-[0.85rem] text-[#4b5563] mb-[15px]">
                Get care insights, product updates, and caregiver resources.
              </p>
              <div className="flex gap-[10px]">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="flex-grow border border-[#f0f0f0] bg-white outline-none transition-colors duration-200 focus:border-[#ccc] text-[0.9rem]"
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                  }}
                />
                <button
                  className="bg-neutral-900 text-white border-none font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 text-[0.9rem]"
                  style={{
                    padding: "12px 28px",
                    borderRadius: "10px",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.4)",
                  }}
                >
                  Subscribe
                </button>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="border-t border-[#f0f0f0] pt-[25px] pb-[10px] flex justify-between text-[0.85rem] text-[#4b5563] max-[480px]:flex-col max-[480px]:gap-[15px] max-[480px]:items-center">
            <span>All rights reserved. © 2025</span>
            <span>Designed by Peter Design</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default CTAFAQFooterSection;
