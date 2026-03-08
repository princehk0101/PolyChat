import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    subtitle: 'For individuals and small teams',
    points: [
      'Up to 10 team members',
      'Basic translation preview',
      'Nuance alerts (limited)',
      'Community support',
    ],
    cta: 'Start Free',
    to: '/signup',
    featured: false,
  },
  {
    name: 'Team',
    price: '$29',
    subtitle: 'Per user / month',
    points: [
      'Unlimited teammates',
      'Advanced translation quality',
      'Nuance suggestions + rewrite',
      'Priority support',
    ],
    cta: 'Choose Team',
    to: '/dashboard',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    subtitle: 'For global organizations',
    points: [
      'Private deployment options',
      'SSO + policy controls',
      'Audit logs and compliance',
      'Dedicated success manager',
    ],
    cta: 'Contact Sales',
    to: '/about',
    featured: false,
  },
];

export default function Pricing() {
  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-10 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-700">Pricing</p>
        <h1 className="text-4xl md:text-5xl font-bold text-ink-950 mt-2">Simple plans for teams of any size</h1>
        <p className="text-ink-600 mt-4">
          Transparent plans designed for teams scaling multilingual collaboration across regions.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mt-10">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`surface-card p-6 flex flex-col ${plan.featured ? 'ring-2 ring-accent-500/40' : ''}`}
          >
            {plan.featured && (
              <span className="self-start px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-700 mb-3">
                Most Popular
              </span>
            )}
            <h3 className="text-2xl font-bold text-ink-950">{plan.name}</h3>
            <p className="text-4xl font-bold text-ink-950 mt-3">{plan.price}</p>
            <p className="text-sm text-ink-500 mt-1">{plan.subtitle}</p>

            <ul className="space-y-2 mt-6 flex-1">
              {plan.points.map((point) => (
                <li key={point} className="text-sm text-ink-600 flex items-start gap-2">
                  <Check className="w-4 h-4 text-accent-700 mt-0.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <Link to={plan.to} className="mt-6">
              <Button variant={plan.featured ? 'primary' : 'secondary'} className="w-full">
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
