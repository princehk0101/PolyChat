import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Bot, Globe2 } from 'lucide-react';
import Button from '../components/UI/Button';

const pillars = [
  {
    icon: HeartHandshake,
    title: 'Human-first communication',
    desc: 'We focus on reducing misunderstandings between cultures, not just literal translation.',
  },
  {
    icon: Bot,
    title: 'AI-assisted clarity',
    desc: 'Nuance detection helps teams choose wording that is respectful and context-aware.',
  },
  {
    icon: Globe2,
    title: 'Global by default',
    desc: 'Built for hybrid teams where colleagues collaborate from different regions and time zones.',
  },
];

export default function About() {
  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-10 max-w-7xl mx-auto">
      <section className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-700">About</p>
          <h1 className="text-4xl md:text-5xl font-bold text-ink-950 mt-2">Built for multilingual, modern teams</h1>
          <p className="text-ink-600 mt-4 leading-relaxed">
            PolyChat helps teams communicate confidently when language and culture differ.
            The experience brings together onboarding, team chat, and language-aware collaboration
            in one cohesive product flow.
          </p>
          <div className="mt-6 flex gap-2">
            <Link to="/dashboard">
              <Button>Open Workspace</Button>
            </Link>
            <Link to="/features">
              <Button variant="secondary">Explore Features</Button>
            </Link>
          </div>
        </div>

        <div className="surface-card p-3">
          <img
            src="https://images.unsplash.com/photo-1522071901873-411886a10004?auto=format&fit=crop&w=1400&q=80"
            alt="Global team discussion"
            className="w-full h-[240px] sm:h-[320px] lg:h-[360px] object-cover rounded-2xl"
          />
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4 mt-10">
        {pillars.map((pillar) => (
          <div
            key={pillar.title}
            className="surface-card p-5 animate-fade-up"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center">
              <pillar.icon className="w-5 h-5" />
            </div>
            <h3 className="mt-3 text-xl font-bold text-ink-950">{pillar.title}</h3>
            <p className="text-sm text-ink-600 mt-2 leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
