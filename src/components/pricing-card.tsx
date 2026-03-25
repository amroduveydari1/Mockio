import { Check } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PricingCardProps {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  href?: string;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  highlighted = false,
  cta,
  href = "/signup",
}: PricingCardProps) {
  return (
    <Card
      variant="bordered"
      className={cn(
        "relative p-8 flex flex-col",
        highlighted &&
          "border-2 border-neutral-900 dark:border-white shadow-xl shadow-neutral-200/50 dark:shadow-neutral-950/50"
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {name}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          {description}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-neutral-900 dark:text-white">
            ${price}
          </span>
          <span className="text-neutral-500">/{period}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check
              size={18}
              className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link href={href}>
        <Button
          variant={highlighted ? "primary" : "outline"}
          className="w-full"
          size="lg"
        >
          {cta}
        </Button>
      </Link>
    </Card>
  );
}
