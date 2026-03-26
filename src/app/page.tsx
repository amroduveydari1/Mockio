import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Download,
  Upload,
  Palette,
  MousePointer,
  ChevronDown,
  Check,
  Star,
  Layers,
  Globe,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { Button, Badge } from "@/components/ui";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Generate professional mockups in under 3 seconds. Our AI engine delivers instant, stunning results.",
  },
  {
    icon: Sparkles,
    title: "Premium Quality",
    description:
      "Photorealistic renders that elevate your brand. Perfect for pitches, portfolios, and presentations.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Enterprise-grade security. Your designs are encrypted and never shared without permission.",
  },
  {
    icon: Download,
    title: "4K Resolution",
    description:
      "Export in ultra-high resolution. Print-ready quality for billboards to business cards.",
  },
  {
    icon: Layers,
    title: "500+ Templates",
    description:
      "From business cards to billboards, t-shirts to tech devices. New templates added weekly.",
  },
  {
    icon: Globe,
    title: "Brand Consistency",
    description:
      "AI-powered color matching ensures your brand looks perfect on every surface and material.",
  },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "2.3s", label: "Avg. Generation" },
  { value: "500+", label: "Templates" },
  { value: "4K", label: "Max Resolution" },
];

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Logo",
    description:
      "Drag and drop your logo in any format. SVG, PNG, or JPG — we handle them all.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Choose a Template",
    description:
      "Browse 500+ premium mockups across categories. Business cards to billboards.",
  },
  {
    number: "03",
    icon: MousePointer,
    title: "Customize & Download",
    description:
      "Adjust positioning, add effects, then export in your preferred resolution.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for trying out Mockio",
    features: [
      "10 mockups per month",
      "720p resolution",
      "Basic templates",
      "Watermarked exports",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 19,
    period: "month",
    description: "For professionals and freelancers",
    features: [
      "Unlimited mockups",
      "4K resolution",
      "All 500+ templates",
      "No watermarks",
      "Priority support",
      "Commercial license",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: 29,
    period: "month",
    description: "For agencies and design teams",
    features: [
      "Everything in Pro",
      "5 team members",
      "Brand kit storage",
      "API access",
      "Custom templates",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "What file formats do you support?",
    answer:
      "We support SVG, PNG, JPG, and PDF files. For best results, we recommend uploading SVG or high-resolution PNG files with transparent backgrounds.",
  },
  {
    question: "Can I use the mockups commercially?",
    answer:
      "Yes! Pro and Team plans include a full commercial license. You can use your generated mockups for client work, marketing materials, and any commercial purpose.",
  },
  {
    question: "How does the AI positioning work?",
    answer:
      "Our AI automatically detects the best placement for your logo on each mockup, adjusting for perspective, lighting, and surface texture to create photorealistic results.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel your subscription at any time with no questions asked. Your access continues until the end of your billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 14-day money-back guarantee. If you're not satisfied with Mockio, contact us within 14 days for a full refund.",
  },
];

const testimonials = [
  {
    quote: "Mockio cut our mockup creation time by 90%. Absolutely game-changing for our agency.",
    author: "Sarah Chen",
    role: "Creative Director, Pixel Studio",
    avatar: "SC",
  },
  {
    quote: "The quality is indistinguishable from manual Photoshop work. Our clients are impressed every time.",
    author: "Marcus Williams",
    role: "Brand Designer",
    avatar: "MW",
  },
  {
    quote: "Finally, a mockup tool that actually delivers on its promises. Worth every penny.",
    author: "Elena Rodriguez",
    role: "Founder, BrandCraft",
    avatar: "ER",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-neutral-100 to-neutral-200/50 dark:from-neutral-900 dark:to-neutral-800/50 rounded-full blur-3xl opacity-60 animate-pulse-subtle" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-tl from-neutral-200 to-neutral-100/50 dark:from-neutral-800 dark:to-neutral-900/50 rounded-full blur-3xl opacity-40 animate-pulse-subtle delay-200" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neutral-50 dark:bg-neutral-900/30 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge
              variant="default"
              className="mb-8 animate-fade-in px-4 py-1.5 text-sm border border-neutral-200 dark:border-neutral-800"
            >
              <Sparkles size={14} className="mr-2" />
              Now with AI-powered positioning
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight animate-fade-in-up leading-[1.05]">
              <span className="text-neutral-900 dark:text-white">
                Your logo.
              </span>
              <br />
              <span className="gradient-text">
                Infinite possibilities.
              </span>
            </h1>

            <p className="mt-8 text-xl sm:text-2xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto animate-fade-in-up delay-100 leading-relaxed">
              Upload your logo and instantly generate hundreds of photorealistic
              brand mockups. No design skills required.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-4 shadow-lg shadow-neutral-900/10 dark:shadow-neutral-950/30">
                  Start Creating Free
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8 py-4"
                >
                  See How It Works
                  <ChevronDown size={20} />
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-neutral-500 animate-fade-in delay-300">
              No credit card required · 10 free mockups included
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 animate-fade-in-up delay-300">
            <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 p-6 sm:p-8 rounded-3xl bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur-sm">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative animate-fade-in-up delay-400">
            <div className="aspect-[16/9] max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-neutral-200/50 dark:shadow-neutral-950/50">
              {/* Grid of mockup previews */}
              <div className="absolute inset-0 grid grid-cols-3 gap-4 p-8">
                <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg animate-float delay-100 flex items-center justify-center">
                  <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">M</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-neutral-900 dark:bg-white border border-neutral-700 dark:border-neutral-200 shadow-lg animate-float delay-300 flex items-center justify-center">
                  <div className="w-20 h-12 bg-neutral-800 dark:bg-neutral-100 rounded flex items-center justify-center">
                    <span className="text-xl font-bold text-white dark:text-neutral-900">M</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg animate-float delay-500 flex items-center justify-center">
                  <div className="w-14 h-14 border-2 border-neutral-900 dark:border-white rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">M</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 border border-neutral-200 dark:border-neutral-600 shadow-lg animate-float delay-200 flex items-center justify-center">
                  <div className="w-24 h-8 bg-white dark:bg-neutral-900 rounded shadow flex items-center justify-center">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">Mockio</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 shadow-lg animate-float flex items-center justify-center row-span-2">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-neutral-900 dark:bg-white rounded-2xl shadow-xl flex items-center justify-center mb-3">
                      <span className="text-3xl font-bold text-white dark:text-neutral-900">M</span>
                    </div>
                    <p className="text-xs text-neutral-500">iPhone Mockup</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg animate-float delay-400 flex items-center justify-center">
                  <div className="w-20 h-14 bg-neutral-900 dark:bg-white rounded-sm flex items-center justify-center transform -rotate-3">
                    <span className="text-xl font-bold text-white dark:text-neutral-900">M</span>
                  </div>
                </div>
                <div className="col-span-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg animate-float delay-600 flex items-center justify-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-white dark:text-neutral-900">M</span>
                    </div>
                    <div className="h-8 w-px bg-neutral-300 dark:bg-neutral-600" />
                    <span className="text-lg font-semibold text-neutral-900 dark:text-white tracking-wide">MOCKIO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-4 top-1/4 hidden lg:block animate-slide-in-left delay-600">
              <div className="glass rounded-2xl px-4 py-3 border border-neutral-200 dark:border-neutral-800 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Check size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Mockup ready!</p>
                    <p className="text-xs text-neutral-500">2.3 seconds</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-1/4 hidden lg:block animate-slide-in-right delay-700">
              <div className="glass rounded-2xl px-4 py-3 border border-neutral-200 dark:border-neutral-800 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                    <Download size={20} className="text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">4K Export</p>
                    <p className="text-xs text-neutral-500">Print-ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-20 text-center animate-fade-in delay-500">
            <p className="text-sm text-neutral-500 mb-6">Trusted by 10,000+ designers and agencies</p>
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-40 grayscale">
              {["Stripe", "Notion", "Linear", "Vercel", "Figma"].map((brand) => (
                <span
                  key={brand}
                  className="text-xl font-semibold text-neutral-400 dark:text-neutral-600 hover:opacity-80 transition-opacity"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <Badge variant="default" className="mb-6">Features</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Everything you need to
              <br />
              <span className="text-neutral-400 dark:text-neutral-500">shine your brand</span>
            </h2>
            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
              Professional-grade tools that make mockup creation effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover-lift"
                >
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-900 dark:group-hover:bg-white transition-colors duration-300 mb-6">
                    <Icon
                      size={26}
                      className="text-neutral-700 dark:text-neutral-300 group-hover:text-white dark:group-hover:text-neutral-900 transition-colors duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <Badge variant="default" className="mb-6">How It Works</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Three steps to
              <br />
              <span className="text-neutral-400 dark:text-neutral-500">stunning mockups</span>
            </h2>
            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
              From upload to download in under a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-neutral-300 via-neutral-200 to-transparent dark:from-neutral-700 dark:via-neutral-800" />
                  )}
                  
                  <div className="text-center px-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-neutral-900 dark:bg-white mb-6 shadow-lg shadow-neutral-900/10 dark:shadow-neutral-950/30">
                      <Icon size={32} className="text-white dark:text-neutral-900" />
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-sm font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                        Step {step.number}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 py-4 shadow-lg shadow-neutral-900/10 dark:shadow-neutral-950/30">
                Try It Now — It&apos;s Free
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Before/After Showcase Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-neutral-950 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="default" className="mb-6 bg-neutral-800 text-neutral-300 border-neutral-700">From Logo to Brand</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              See the magic
              <br />
              <span className="text-neutral-500">in action</span>
            </h2>
            <p className="mt-6 text-lg text-neutral-400">
              One logo upload creates an entire brand identity in seconds.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Business Card", style: "col-span-1 row-span-1" },
              { label: "iPhone Screen", style: "col-span-1 row-span-2" },
              { label: "T-Shirt", style: "col-span-1 row-span-1" },
              { label: "Billboard", style: "col-span-1 row-span-1" },
              { label: "Letterhead", style: "col-span-1 row-span-1" },
              { label: "Packaging", style: "col-span-1 row-span-1" },
              { label: "Social Media", style: "col-span-1 row-span-1" },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`${item.style} rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800 p-6 flex flex-col justify-end hover-lift cursor-default group`}
              >
                <div className="flex-1 flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-neutral-400 group-hover:text-neutral-300 transition-colors">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="default" className="mb-6">Testimonials</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Loved by designers
              <br />
              <span className="text-neutral-400 dark:text-neutral-500">worldwide</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover-lift"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <blockquote className="text-lg text-neutral-700 dark:text-neutral-300 mb-8 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center">
                    <span className="text-xs font-bold text-white dark:text-neutral-900">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <Badge variant="default" className="mb-6">Pricing</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Simple, transparent
              <br />
              <span className="text-neutral-400 dark:text-neutral-500">pricing</span>
            </h2>
            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
              Start free, upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-3xl border ${
                  plan.highlighted
                    ? "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white shadow-2xl shadow-neutral-300/50 dark:shadow-neutral-950/50 scale-105"
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                } flex flex-col`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={`text-lg font-semibold ${
                      plan.highlighted
                        ? "text-white dark:text-neutral-900"
                        : "text-neutral-900 dark:text-white"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      plan.highlighted
                        ? "text-neutral-400 dark:text-neutral-600"
                        : "text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-5xl font-bold ${
                        plan.highlighted
                          ? "text-white dark:text-neutral-900"
                          : "text-neutral-900 dark:text-white"
                      }`}
                    >
                      ${plan.price}
                    </span>
                    <span
                      className={
                        plan.highlighted
                          ? "text-neutral-400 dark:text-neutral-600"
                          : "text-neutral-500"
                      }
                    >
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        size={18}
                        className={`mt-0.5 flex-shrink-0 ${
                          plan.highlighted
                            ? "text-green-400 dark:text-green-600"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          plan.highlighted
                            ? "text-neutral-300 dark:text-neutral-700"
                            : "text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup">
                  <Button
                    variant={plan.highlighted ? "secondary" : "outline"}
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                        : ""
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-6">FAQ</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Questions?
              <br />
              <span className="text-neutral-400 dark:text-neutral-500">We&apos;ve got answers</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <summary className="flex items-center justify-between font-semibold text-neutral-900 dark:text-white list-none">
                  {faq.question}
                  <ChevronDown
                    size={20}
                    className="text-neutral-500 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[2.5rem] bg-neutral-900 dark:bg-white p-12 lg:p-20 text-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-neutral-800 dark:bg-neutral-100 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-neutral-800 dark:bg-neutral-100 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="relative">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white dark:text-neutral-900 tracking-tight">
                Ready to elevate
                <br />
                your brand?
              </h2>
              <p className="mt-6 text-lg text-neutral-400 dark:text-neutral-600 max-w-xl mx-auto">
                Join 10,000+ designers creating professional mockups in seconds.
                Start free today.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 text-base px-8 py-4"
                  >
                    Get Started Free
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full sm:w-auto text-neutral-300 hover:text-white hover:bg-neutral-800 dark:text-neutral-600 dark:hover:text-neutral-900 dark:hover:bg-neutral-100 text-base px-8 py-4"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-500">
                No credit card required · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
