import { Navbar, Footer } from "@/components/layout";
import { PricingCard } from "@/components";
import { Check } from "lucide-react";

const pricingPlans = [
  {
    name: "Free",
    price: 0,
    period: "month",
    description: "Perfect for trying out Mockio",
    features: [
      "10 mockup generations",
      "Standard resolution (1080p)",
      "5 mockup categories",
      "Basic templates only",
      "Watermarked downloads",
    ],
    cta: "Get Started",
    href: "/signup",
  },
  {
    name: "Pro",
    price: 19,
    period: "month",
    description: "Best for freelancers and designers",
    features: [
      "Unlimited mockup generations",
      "4K resolution downloads",
      "All mockup categories",
      "Premium templates",
      "No watermarks",
      "Priority support",
      "Custom branding colors",
    ],
    highlighted: true,
    cta: "Start Free Trial",
    href: "/signup?plan=pro",
  },
  {
    name: "Enterprise",
    price: 29,
    period: "month",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "API access",
      "Custom templates",
      "White-label exports",
      "Dedicated support",
      "SSO authentication",
      "Analytics dashboard",
    ],
    cta: "Contact Sales",
    href: "/contact",
  },
];

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! Pro plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "Can I upgrade or downgrade later?",
    answer:
      "Absolutely. You can change your plan anytime from your account settings. Changes take effect immediately.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.",
  },
  {
    question: "What happens to my mockups if I downgrade?",
    answer:
      "All your previously generated mockups remain accessible. You just won't have access to premium features.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
            Choose the plan that works best for you. All plans include our core
            features.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan.name}
                name={plan.name}
                price={plan.price}
                period={plan.period}
                description={plan.description}
                features={plan.features}
                highlighted={plan.highlighted}
                cta={plan.cta}
                href={plan.href}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white text-center mb-12">
            Compare plans
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-4 px-6 text-left text-sm font-medium text-neutral-500">
                    Feature
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-neutral-500">
                    Free
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-neutral-900 dark:text-white">
                    Pro
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-neutral-500">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {[
                  { feature: "Mockup generations", free: "10/month", pro: "Unlimited", enterprise: "Unlimited" },
                  { feature: "Resolution", free: "1080p", pro: "4K", enterprise: "4K+" },
                  { feature: "Categories", free: "5", pro: "All", enterprise: "All + Custom" },
                  { feature: "Watermarks", free: true, pro: false, enterprise: false },
                  { feature: "Team members", free: "1", pro: "1", enterprise: "Unlimited" },
                  { feature: "API access", free: false, pro: false, enterprise: true },
                  { feature: "Support", free: "Community", pro: "Priority", enterprise: "Dedicated" },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="py-4 px-6 text-sm text-neutral-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
                      {typeof row.free === "boolean" ? (
                        row.free ? (
                          <Check size={18} className="inline text-green-600" />
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )
                      ) : (
                        row.free
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-neutral-900 dark:text-white font-medium">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <Check size={18} className="inline text-green-600" />
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )
                      ) : (
                        row.pro
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? (
                          <Check size={18} className="inline text-green-600" />
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )
                      ) : (
                        row.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white text-center mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
              >
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
