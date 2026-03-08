import React from 'react';
import { Languages, ShieldCheck, Sparkles, Clock3, UsersRound, Workflow } from 'lucide-react';
import Button from '../components/UI/Button';
import { Link } from 'react-router-dom';

const featureCards = [
  {
    icon: Languages,
    title: 'Live Translation Engine',
    desc: 'Messages are converted into each user preferred language with low latency.',
  },
  {
    icon: Sparkles,
    title: 'Cultural Nuance Detection',
    desc: 'Potentially harsh or ambiguous phrasing is highlighted with safer alternatives.',
  },
  {
    icon: Workflow,
    title: 'Context-Aware Flow',
    desc: 'Thread context keeps follow-up replies clear even across different languages.',
  },
  {
    icon: Clock3,
    title: 'Async + Sync Friendly',
    desc: 'Designed for both real-time meetings and async handoff across time zones.',
  },
  {
    icon: UsersRound,
    title: 'Team Profiles',
    desc: 'Language and region preferences improve translation quality per teammate.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Ready',
    desc: 'Built to support secure deployments and policy control once backend is integrated.',
  },
];

export default function Features() {
  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-10 max-w-7xl mx-auto">
      <div className="animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-700">Features</p>
        <h1 className="text-4xl md:text-5xl font-bold text-ink-950 mt-2">Everything needed for global team chat</h1>
        <p className="text-ink-600 mt-4 max-w-3xl leading-relaxed">
          Explore the complete user flow from onboarding to multilingual conversations.
          Designed to communicate product value clearly in stakeholder presentations.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {featureCards.map((item) => (
          <div
            key={item.title}
            className="surface-card p-5"
          >
            <div className="w-11 h-11 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center">
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className="mt-4 font-bold text-xl text-ink-950">{item.title}</h3>
            <p className="text-sm text-ink-600 mt-2 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="surface-card p-6 md:p-8 mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink-950">Ready to show the full product flow?</h2>
          <p className="text-ink-600 mt-1">Open the live dashboard and present the complete chat experience.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard">
            <Button>Open Dashboard</Button>
          </Link>
          <Link to="/signup">
            <Button variant="secondary">Try Onboarding</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
