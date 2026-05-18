"use client";

import { useEffect } from "react";

export default function SaraswatiPage() {
  useEffect(() => {
    const cursor = document.getElementById("cursor");
    const ring = document.getElementById("cursor-ring");

    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;

    const moveCursor = (e) => {
      mx = e.clientX;
      my = e.clientY;

      if (cursor) {
        cursor.style.left = `${mx}px`;
        cursor.style.top = `${my}px`;
      }
    };

    document.addEventListener("mousemove", moveCursor);

    function animateRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;

      if (ring) {
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
      }

      requestAnimationFrame(animateRing);
    }

    animateRing();

    return () => {
      document.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  return (
    <main className="bg-[#FAF6EE] text-[#1A1040] overflow-x-hidden relative">

      {/* CURSOR */}
      <div
        id="cursor"
        className="fixed w-[10px] h-[10px] bg-[#E8642A] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
      />

      <div
        id="cursor-ring"
        className="fixed w-9 h-9 border border-[#E8642A] rounded-full pointer-events-none z-[9998] opacity-60 -translate-x-1/2 -translate-y-1/2"
      />

      {/* HERO */}
      <section className="min-h-screen grid lg:grid-cols-2 gap-16 items-center px-[5vw] pt-32 pb-20 relative overflow-hidden">

        {/* LEFT */}
        <div>
          <div className="uppercase tracking-[0.2em] text-[0.7rem] text-[#E8642A] flex items-center gap-3 mb-6">
            <div className="w-7 h-[1.5px] bg-[#E8642A]" />
            Intelligent EduTech Platform
          </div>

          <h1 className="font-serif text-[clamp(3rem,6vw,5.5rem)] leading-none font-light text-[#1A1040] mb-8">
            <em className="italic text-[#E8642A]">Wisdom-Led</em>
            <br />
            <strong className="font-bold block">Learning for</strong>
            India&apos;s Future
          </h1>

          <p className="text-[#4A3F6B] leading-8 text-lg max-w-xl mb-10">
            SWAIS SARASWATI fuses adaptive AI with India&apos;s skilling
            mission — personalising every learning journey, automating
            operations, and predicting student outcomes at scale.
          </p>

          <div className="flex gap-4 flex-wrap">
            <button className="bg-[#E8642A] text-white px-8 py-4 text-sm tracking-wide hover:bg-[#1A1040] transition-all">
              Request a Demo →
            </button>

            <button className="border border-[#1A1040] px-8 py-4 text-sm hover:bg-[#1A1040] hover:text-white transition-all">
              Explore Platform
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative hidden lg:flex items-center justify-center">

          {/* Rings */}
          <div className="absolute w-[340px] h-[340px] border border-[#e9cfc1] rounded-full animate-spin-slow" />

          <div className="absolute w-[260px] h-[260px] border border-[#e9cfc1] rounded-full animate-spin-reverse" />

          <div className="absolute w-[180px] h-[180px] border border-[#e9cfc1] rounded-full animate-spin-slow" />

          {/* CARD */}
          <div className="bg-white border border-[#f3d9cd] shadow-2xl p-10 w-[340px] rounded-md relative z-10 animate-float">

            <div className="uppercase tracking-[0.18em] text-[0.62rem] text-[#C9954C] mb-4">
              Live Dashboard · Batch 2026-A
            </div>

            <h3 className="font-serif text-3xl text-[#1A1040] mb-6">
              Student Progress Overview
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6">

              <div className="bg-[#FAF6EE] p-4 text-center rounded">
                <div className="font-serif text-3xl text-[#E8642A]">
                  94%
                </div>
                <div className="text-[0.65rem] text-[#8A7FAA] mt-1">
                  Completion
                </div>
              </div>

              <div className="bg-[#FAF6EE] p-4 text-center rounded">
                <div className="font-serif text-3xl text-[#E8642A]">
                  87
                </div>
                <div className="text-[0.65rem] text-[#8A7FAA] mt-1">
                  Avg. Score
                </div>
              </div>

              <div className="bg-[#FAF6EE] p-4 text-center rounded">
                <div className="font-serif text-3xl text-[#E8642A]">
                  4.8★
                </div>
                <div className="text-[0.65rem] text-[#8A7FAA] mt-1">
                  Rating
                </div>
              </div>
            </div>

            {/* Bars */}
            {[
              ["Digital Literacy", "91%"],
              ["Soft Skills", "78%"],
              ["Industry Readiness", "84%"],
            ].map(([label, value], i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between text-sm text-[#4A3F6B] mb-2">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>

                <div className="h-[5px] bg-[#F5EDD8] rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E8642A] to-[#F4A261]"
                    style={{ width: value }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-[#1A1040] py-5 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-flex gap-16 uppercase tracking-[0.14em] text-[0.72rem] text-white/60">
          {[
            "Adaptive Learning",
            "PMKVY Aligned",
            "Predictive Analytics",
            "Skill India Digital",
            "Automated Operations",
            "NCVET Compliant",
            "Multilingual Content",
            "RPL Ready",
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-4">
              {item}
              <span className="text-[#E8642A]">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ================= PLATFORM / PILLARS SECTION ================= */}

      <section
  id="pillars"
  className="bg-[#FAF6EE] py-24 px-6 md:px-16"
>
  <div className="max-w-7xl mx-auto">

    {/* Header */}
    <div className="text-center max-w-3xl mx-auto mb-16">

      <div className="flex items-center justify-center gap-3 text-[#E8642A] uppercase tracking-[0.25em] text-xs mb-4">
        <div className="w-6 h-[1px] bg-[#E8642A]" />
        Platform Pillars
      </div>

      <h2 className="font-serif text-4xl md:text-5xl text-[#1A1040] leading-tight">
        Three forces that{" "}
        <span className="italic text-[#E8642A]">
          transform
        </span>{" "}
        skilling
      </h2>

    </div>

    {/* Cards */}
    <div className="grid md:grid-cols-3 gap-8">

      {/* Card 1 */}
      <div className="relative bg-white rounded-2xl p-10 overflow-hidden border border-orange-100 hover:bg-[#FFF3EC] transition duration-300">

        {/* Big Number */}
        <div className="absolute top-2 right-6 text-[90px] font-bold text-[#E8642A]/5 font-serif leading-none">
          01
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-lg bg-[#FFF3EC] flex items-center justify-center text-2xl mb-6">
          🧠
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl text-[#1A1040] mb-4">
          Adaptive Learning Engine
        </h3>

        {/* Paragraph */}
        <p className="text-[#4A3F6B] leading-7 text-sm">
          Dynamically adjusts content difficulty,
          delivery format, and pacing to each learner's
          unique cognitive profile — ensuring no student
          is left behind.
        </p>
      </div>

      {/* Card 2 */}
      <div className="relative bg-white rounded-2xl p-10 overflow-hidden border border-orange-100 hover:bg-[#FFF3EC] transition duration-300">

        {/* Big Number */}
        <div className="absolute top-2 right-6 text-[90px] font-bold text-[#E8642A]/5 font-serif leading-none">
          02
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-lg bg-[#FFF3EC] flex items-center justify-center text-2xl mb-6">
          ⚙️
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl text-[#1A1040] mb-4">
          Operational Automation
        </h3>

        {/* Paragraph */}
        <p className="text-[#4A3F6B] leading-7 text-sm">
          From enrolment and attendance to certification
          and compliance reporting — SARASWATI automates
          the end-to-end training lifecycle so trainers
          focus on teaching.
        </p>
      </div>

      {/* Card 3 */}
      <div className="relative bg-white rounded-2xl p-10 overflow-hidden border border-orange-100 hover:bg-[#FFF3EC] transition duration-300">

        {/* Big Number */}
        <div className="absolute top-2 right-6 text-[90px] font-bold text-[#E8642A]/5 font-serif leading-none">
          03
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-lg bg-[#FFF3EC] flex items-center justify-center text-2xl mb-6">
          📊
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl text-[#1A1040] mb-4">
          Predictive Student Analytics
        </h3>

        {/* Paragraph */}
        <p className="text-[#4A3F6B] leading-7 text-sm">
          AI models surface at-risk learners before
          dropout happens, recommend interventions
          in real-time, and forecast placement success
          with measurable precision.
        </p>
      </div>

    </div>
  </div>
      </section>
      {/* FEATURES */}
      <section id="features" className="py-24 px-[5vw] bg-[#FAF6EE]">

        <div className="max-w-3xl mb-16">
          <div className="uppercase tracking-[0.22em] text-[0.68rem] text-[#E8642A] mb-3 flex items-center gap-3">
            <div className="w-5 h-[1.5px] bg-[#E8642A]" />
            Platform Features
          </div>

          <h2 className="font-serif text-5xl font-light text-[#1A1040] leading-tight">
            Built for <em className="text-[#E8642A]">India&apos;s</em>{" "}
            skilling reality
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {[
            {
              tag: "Content",
              title: "Multilingual & Vernacular Support",
              desc:
                "Courses available in 10+ Indian languages including Hindi, Tamil, Telugu, Bengali, and Marathi — breaking language barriers for first-generation learners across Tier 2 and Tier 3 cities.",
            },
            {
              tag: "Compliance",
              title: "PMKVY & NSDC Integration",
              desc:
                "Native connectors to PMKVY 4.0 guidelines, NAPS, and the Skill India Digital portal ensure seamless batch reporting, assessment uploads, and government fund disbursement tracking.",
            },
            /*{
              tag: "Mobility",
              title: "Offline-First Mobile App",
              desc:
                "Works fully offline on low-end Android devices; content syncs when connectivity is restored — purpose-built for learners in remote, low-bandwidth locations.",
            },*/
            {
              tag: "Analytics",
              title: "Centre-Level Command Dashboard",
              desc:
                "Training centre managers get a real-time view of batch health, trainer performance, compliance deadlines, and placement pipeline — all in a single unified interface.",
            },
            {
              tag: "Assessment",
              title: "Proctored Online Examination",
              desc:
                "AI-proctored assessments with facial recognition and browser lockdown ensure integrity for NCVET and SSC assessments without the cost of on-site invigilators.",
            },
            {
              tag: "Placement",
              title: "Employer-Linked Talent Pool",
              desc:
                "Graduated learner profiles flow automatically into a curated talent marketplace — matched to employer requirements by skill score, sector, and geography.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white p-10 rounded-2xl shadow-sm hover:bg-[#FFF3EC] hover:shadow-md transition-all duration-300"
            >
              <span className="inline-block text-[0.6rem] uppercase tracking-[0.14em] text-[#2D7D6F] bg-[#eef7f5] px-3 py-1 rounded-sm mb-4">
                {card.tag}
              </span>

              <h3 className="font-serif text-3xl text-[#1A1040] mb-4">
                {card.title}
              </h3>

              <p className="text-[#4A3F6B] leading-7 text-sm">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#1A1040] py-24 px-[5vw] text-white">

        <div className="uppercase tracking-[0.22em] text-[0.68rem] text-[#F4A261] mb-4 flex items-center gap-3">
          <div className="w-5 h-[1.5px] bg-[#F4A261]" />
          How It Works
        </div>

        <h2 className="font-serif text-5xl font-light leading-tight mb-16">
          From enrolment to <em className="text-[#E8642A]">employment</em>
        </h2>

        <div className="grid lg:grid-cols-2 gap-20">

          <div className="space-y-10">

            {[
              {
                num: "1",
                title: "Smart Onboarding & Profiling",
                desc:
                  "AI-driven diagnostic assessments map each learner's current skills, language preference, and learning style.",
              },
              {
                num: "2",
                title: "Adaptive Content Delivery",
                desc:
                  "NSQF-aligned curriculum delivered via bite-sized modules, video, and interactive tasks.",
              },
              {
                num: "3",
                title: "Continuous Assessment & Alerts",
                desc:
                  "Formative quizzes and behavioural signals feed the predictive model.",
              },
              {
                num: "4",
                title: "Certification & Placement Linkage",
                desc:
                  "NCVET-compliant certificates auto-generated on completion.",
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-6 border-b border-white/10 pb-8">

                <div className="w-10 h-10 rounded-full border border-[#E8642A] flex items-center justify-center text-[#F4A261]">
                  {step.num}
                </div>

                <div>
                  <h4 className="text-xl mb-3">{step.title}</h4>

                  <p className="text-white/60 leading-7 text-sm">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* PANEL */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-10">

            <div className="uppercase tracking-[0.18em] text-[0.68rem] text-[#E8C07A] mb-8">
              Platform Intelligence · Live Metrics
            </div>

            <div className="space-y-6">

              {[
                ["Engagement Rate", "92%"],
                ["Completion Rate", "87%"],
                ["Assessment Pass", "84%"],
                ["Placement Rate", "76%"],
                ["Trainer Efficiency", "90%"],
              ].map(([label, val], i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>{label}</span>
                    <span>{val}</span>
                  </div>

                  <div className="h-1 bg-white/10 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#E8642A] to-[#F4A261]"
                      style={{ width: val }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOR WHOM SECTION ================= */}

      <section id="audience" className="bg-white py-24 px-6 md:px-16">
  <div className="max-w-7xl mx-auto">

    {/* Heading */}
    <div className="text-center max-w-3xl mx-auto mb-16">
      <div className="flex items-center justify-center gap-3 text-[#E8642A] uppercase tracking-[0.25em] text-xs mb-4">
        <div className="w-6 h-[1px] bg-[#E8642A]" />
        Who It's For
      </div>

      <h2 className="font-serif text-4xl md:text-5xl text-[#1A1040] leading-tight">
        Designed for every{" "}
        <span className="italic text-[#E8642A]">stakeholder</span> in skilling
      </h2>
    </div>

    {/* Cards */}
    <div className="grid md:grid-cols-3 gap-8">

      {/* Card 1 */}
      <div className="border border-orange-100 rounded-xl p-10 text-center hover:shadow-2xl hover:-translate-y-2 transition duration-300 bg-white">
        <div className="text-5xl mb-6">🏫</div>

        <h3 className="font-serif text-2xl text-[#1A1040] mb-4">
          Training Partners & VTPs
        </h3>

        <p className="text-[#4A3F6B] leading-7 text-sm">
          Manage batches, trainers, and compliance with zero friction.
          Reduce admin overhead by up to 60%.
        </p>

        <ul className="mt-6 space-y-3 text-sm text-[#2D7D6F]">
          <li>✓ Batch lifecycle management</li>
          <li>✓ PMKVY reporting automation</li>
          <li>✓ Trainer performance analytics</li>
          <li>✓ Certificate management</li>
        </ul>
      </div>

      {/* Card 2 */}
      <div className="border border-orange-100 rounded-xl p-10 text-center hover:shadow-2xl hover:-translate-y-2 transition duration-300 bg-white">
        <div className="text-5xl mb-6">🎓</div>

        <h3 className="font-serif text-2xl text-[#1A1040] mb-4">
          Learners & Aspirants
        </h3>

        <p className="text-[#4A3F6B] leading-7 text-sm">
          Learn at your own pace, in your own language,
          with a path personalised to your goals and readiness.
        </p>

        <ul className="mt-6 space-y-3 text-sm text-[#2D7D6F]">
          <li>✓ Personalised learning roadmap</li>
          <li>✓ Offline mobile access</li>
          <li>✓ Skill certificates & badges</li>
          <li>✓ Placement assistance</li>
        </ul>
      </div>

      {/* Card 3 */}
      <div className="border border-orange-100 rounded-xl p-10 text-center hover:shadow-2xl hover:-translate-y-2 transition duration-300 bg-white">
        <div className="text-5xl mb-6">🏛️</div>

        <h3 className="font-serif text-2xl text-[#1A1040] mb-4">
          Government & SSCs
        </h3>

        <p className="text-[#4A3F6B] leading-7 text-sm">
          Monitor skilling outcomes across states, validate compliance,
          and link fund flows to real results.
        </p>

        <ul className="mt-6 space-y-3 text-sm text-[#2D7D6F]">
          <li>✓ State-level outcome dashboards</li>
          <li>✓ NCVET & SSC alignment</li>
          <li>✓ Fund disbursement tracking</li>
          <li>✓ Quality audit trails</li>
        </ul>
      </div>

    </div>
  </div>
      </section>

      {/* ================= GET STARTED SECTION ================= */}

      <section
  id="cta"
  className="relative bg-[#F5EDD8] py-28 px-6 md:px-16 overflow-hidden text-center"
>

  {/* Background Text */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <h1 className="text-[18vw] font-bold text-[#E8642A]/5 font-serif">
      सरस्वती
    </h1>
  </div>

  <div className="relative z-10 max-w-4xl mx-auto">

    {/* Eyebrow */}
    <div className="flex items-center justify-center gap-3 text-[#E8642A] uppercase tracking-[0.25em] text-xs mb-6">
      <div className="w-6 h-[1px] bg-[#E8642A]" />
      Get Started
    </div>

    {/* Heading */}
    <h2 className="font-serif text-4xl md:text-6xl text-[#1A1040] leading-tight mb-6">
      Ready to build{" "}
      <span className="italic text-[#E8642A]">India's</span>
      <br />
      most capable workforce?
    </h2>

    {/* Paragraph */}
    <p className="max-w-2xl mx-auto text-[#4A3F6B] text-lg leading-8 mb-10">
      Partner with SWAIS SARASWATI and bring intelligent,
      scalable skilling to your learners, centres,
      and programmes.
    </p>

    {/* Buttons */}
    <div className="flex flex-wrap justify-center gap-5">

      <a
        href="mailto:murty.varanasi@swais.in"
        className="bg-[#E8642A] hover:bg-[#1A1040] text-white px-8 py-4 rounded-md text-sm tracking-wide transition duration-300"
      >
        Request a Demo →
      </a>

      <button className="border border-[#1A1040] hover:bg-[#1A1040] hover:text-white text-[#1A1040] px-8 py-4 rounded-md text-sm tracking-wide transition duration-300">
        Download Brochure
      </button>

    </div>
  </div>
      </section>

      {/* ANIMATIONS */}
      <style jsx global>{`
        body {
          cursor: none;
        }

        .animate-spin-slow {
          animation: spin 30s linear infinite;
        }

        .animate-spin-reverse {
          animation: spinReverse 22s linear infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-marquee {
          animation: marquee 20s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinReverse {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }

          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </main>
  );
}