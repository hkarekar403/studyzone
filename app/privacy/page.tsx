import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | StudyZone",
  description: "Privacy policy for StudyZone — free Class 4 maths practice platform for Indian students.",
  robots: { index: true, follow: true },
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 h-14 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-full flex items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🚀</span>
            <span className="font-heading text-xl font-bold text-blue-700">StudyZone</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto mt-8 mb-12 bg-white/60 rounded-2xl p-8">
          <h1 className="font-heading text-4xl font-bold text-blue-700 mb-1">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-1">Last updated: June 2026 (Version 1.1)</p>
          <p className="text-sm font-semibold text-blue-600 mb-8">We&apos;ve written this in plain English. No legal jargon.</p>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">1. What is StudyZone?</h2>
            <p className="text-gray-600 leading-relaxed">
              StudyZone is a free maths practice tool for Class 4 students. It was built by a parent, not a company.
              There is no business model, no advertising, and no data harvesting. This privacy policy exists because
              we believe you deserve to know exactly what happens when your child uses this site.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">2. What data do we collect?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Honestly — almost nothing. Here is everything:</p>

            <div className="flex flex-col gap-5">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="font-bold text-gray-800 mb-1">1. An anonymous visitor count</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We count how many people visit the site. This is a single number (e.g. &quot;1,247 students have practised here&quot;).
                  It has no names, no IPs, no personal details attached to it. It is stored in Upstash (a database service).
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="font-bold text-gray-800 mb-1">2. Your child&apos;s quiz session</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  When your child answers questions, their session (score, questions, answers) is stored only in their browser.
                  It is never sent to our servers. It disappears the moment they close the tab.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="font-bold text-gray-800 mb-1">3. Your display preferences</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  If your child switches to dark mode or mutes sound, that preference is saved in their browser&apos;s
                  localStorage. It never leaves their device.
                </p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="font-bold text-gray-800 mb-1">4. Server access logs (we don&apos;t control this)</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Every website in the world does this automatically. When someone visits studyzone.co.in, our hosting
                  provider Vercel records the visitor&apos;s IP address, the page visited, and the time. We do not access
                  these logs for any purpose. Vercel retains them per their own policy (typically 30 days). We cannot
                  delete them — they are held by Vercel, not us.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="font-bold text-gray-800 mb-1">5. Feedback form submissions (only if you submit feedback)</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  If a parent or teacher submits feedback via our feedback form, the message and optional name is emailed
                  to us via Resend (an email delivery service) and lands in our Gmail inbox. We read it, we may reply,
                  and we keep it for up to 12 months before deleting it. We do not share it with anyone.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">3. What we do NOT collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We want to be very clear about this:</p>
            <ul className="space-y-1.5">
              {[
                "We do not collect your child's name",
                "We do not collect your child's email address",
                "We do not collect your child's age or school",
                "We do not collect your child's location",
                "We do not use advertising cookies",
                "We do not track your child across websites",
                "We do not sell any data to anyone",
                "We do not have user accounts or profiles",
                "We do not use analytics tools like Google Analytics",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">4. Children&apos;s privacy</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              StudyZone is designed for children aged 9–10, used under a parent or teacher&apos;s supervision.
            </p>
            <p className="text-gray-600 leading-relaxed mb-3">
              During normal use — answering questions, viewing scores, downloading reports — your child&apos;s data never
              leaves their browser. Nothing is collected.
            </p>
            <p className="text-gray-600 leading-relaxed mb-3">
              Our feedback form is for parents and teachers only. It is clearly labelled. Children should not fill it in.
            </p>
            <p className="text-gray-600 leading-relaxed">
              In compliance with the{" "}
              <strong>India Digital Personal Data Protection Act 2023 (DPDP Act 2023)</strong> and the{" "}
              <strong>Children&apos;s Online Privacy Protection Act (COPPA, USA)</strong>, we do not knowingly collect
              personal information from children. If you believe your child has submitted personal information, email us
              at{" "}
              <a href="mailto:hkarekar01cloud@gmail.com" className="text-blue-600 hover:underline">
                hkarekar01cloud@gmail.com
              </a>{" "}
              and we will delete it from our inbox immediately.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">5. Third-party services we use</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              These are the external services that power StudyZone. Each has their own privacy policy:
            </p>
            <div className="flex flex-col gap-4">
              {[
                {
                  name: "Vercel (website hosting)",
                  desc: "Host our website and record server access logs",
                  url: "https://vercel.com/legal/privacy-policy",
                  label: "Vercel Privacy Policy",
                },
                {
                  name: "Upstash (visitor counter)",
                  desc: "Store our anonymous visitor count (one number)",
                  url: "https://upstash.com/trust/privacy.pdf",
                  label: "Upstash Privacy Policy",
                },
                {
                  name: "Resend (email delivery)",
                  desc: "Deliver feedback form submissions to our inbox. Only activated when someone submits feedback.",
                  url: "https://resend.com/legal/privacy-policy",
                  label: "Resend Privacy Policy",
                },
                {
                  name: "Google Fonts (typography)",
                  desc: "Serve the fonts used on this website. Google may log your IP address as part of this.",
                  url: "https://policies.google.com/privacy",
                  label: "Google Privacy Policy",
                },
              ].map((service) => (
                <div key={service.name} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="font-bold text-gray-800 mb-1">{service.name}</p>
                  <p className="text-gray-600 text-sm mb-2">What they do: {service.desc}</p>
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    {service.label} →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">6. AI crawlers and web indexing</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              StudyZone&apos;s content is publicly accessible and may be crawled and indexed by search engines (Google, Bing)
              and AI systems (ChatGPT, Perplexity, Claude, Gemini). This is standard for any public website. Our questions
              and content may be used in AI training datasets. We have no way to prevent this for publicly accessible content.
              If this concerns you, please email us at{" "}
              <a href="mailto:hkarekar01cloud@gmail.com" className="text-blue-600 hover:underline">
                hkarekar01cloud@gmail.com
              </a>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">7. Your rights under Indian law</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Under the India Digital Personal Data Protection Act 2023, you have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mb-4 ml-2">
              <li>Know what personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mb-3 font-semibold">What we can actually do when you contact us:</p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Feedback you sent us", action: "We will delete it from our inbox within 7 days of your request. Done." },
                { label: "Vercel server logs", action: "These are held by Vercel, not us. We cannot delete them directly. We will contact Vercel on your behalf and provide you with their response." },
                { label: "Upstash visitor count", action: "This is a single number with no individual records. There is nothing to delete." },
                { label: "Resend delivery logs", action: "Held by Resend. We will contact Resend on your behalf if requested." },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-sm">
                  <span className="font-bold text-gray-800">{item.label}: </span>
                  <span className="text-gray-600">{item.action}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-sm mt-4 italic">We will always be honest about what we can and cannot do.</p>
          </section>

          {/* Section 8 */}
          <section className="mb-4">
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-3">8. Contact us</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              For any privacy questions, data requests, or concerns about your child:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="font-bold text-blue-800 mb-1">
                Email:{" "}
                <a href="mailto:hkarekar01cloud@gmail.com" className="underline hover:no-underline">
                  hkarekar01cloud@gmail.com
                </a>
              </p>
              <p className="text-blue-700 text-sm mb-3">
                We are a small independent project — one person reads these emails. We will reply within 7 days.
              </p>
              <p className="text-blue-700 text-sm">
                If you are a school administrator evaluating this platform, we are happy to answer any questions you
                have about our data practices.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
