import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Languages, Sparkles, MessagesSquare, Globe2, ArrowRight } from 'lucide-react';
import Button from '../components/UI/Button';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    icon: Languages,
    title: 'Instant Translation',
    text: 'Messages are translated in real time to each teammate preferred language.',
  },
  {
    icon: Sparkles,
    title: 'Nuance Guard',
    text: 'Tone-sensitive suggestions prevent unintended friction across cultures.',
  },
  {
    icon: MessagesSquare,
    title: 'Team Collaboration',
    text: 'Purpose-built for hybrid teams working across time zones and countries.',
  },
];

const stats = [
  { value: '20+', label: 'Supported Languages' },
  { value: '<300ms', label: 'Translation latency target' },
  { value: '24/7', label: 'Distributed collaboration flow' },
];

export default function LandingPage() {
  const container = useRef();

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-badge', { y: -20, opacity: 0, duration: 0.6 })
      .from('.hero-title', { y: 50, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.4')
      .from('.hero-desc', { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
      .from('.hero-buttons', { y: 20, opacity: 0, duration: 0.6 }, '-=0.6')
      .from('.hero-stats', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
      .from('.hero-image', { x: 50, opacity: 0, duration: 1 }, '-=0.8');

    gsap.from('.feature-card', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.features-grid',
        start: 'top 80%',
      }
    });
  }, { scope: container });

  return (
    <div ref={container} className="px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-10 overflow-hidden">
      <section className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center max-w-7xl mx-auto">
        <div>
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-100 text-accent-700 text-xs font-semibold mb-5">
            <Globe2 className="w-3.5 h-3.5" />
            Multilingual chat for global teams
          </div>

          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold text-ink-950 leading-tight">
            Collaborate globally.
            <br />
            Communicate naturally.
          </h1>
          <p className="hero-desc mt-5 text-ink-600 text-base sm:text-lg max-w-xl leading-relaxed">
            PolyChat is a modern real-time chat platform with auto-translation and cultural nuance
            detection. Share context clearly, regardless of language.
          </p>

          <div className="hero-buttons mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard">
              <Button className="px-6 py-3 text-sm sm:text-base w-full sm:w-auto">
                Open Workspace
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="secondary" className="px-6 py-3 text-sm sm:text-base inline-flex items-center gap-2 w-full sm:w-auto justify-center">
                Explore Features
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="hero-stats grid sm:grid-cols-3 gap-3 mt-8">
            {stats.map((item) => (
              <div key={item.label} className="surface-card px-4 py-3">
                <p className="text-xl font-bold text-ink-950">{item.value}</p>
                <p className="text-xs text-ink-500 uppercase tracking-wide mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-image surface-card p-3 sm:p-4">
          <div className="rounded-2xl overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
              alt="Global team collaborating"
              className="w-full h-[280px] sm:h-[360px] lg:h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/10 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 surface-card px-4 py-3">
              <p className="text-xs text-ink-600">Live translation preview</p>
              <p className="font-semibold text-ink-950 mt-1">
                "Can we finalize this by Friday?" {'->'} "Kya hum ise Friday tak finalize kar sakte hain?"
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="features-grid max-w-7xl mx-auto mt-10 grid md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="feature-card surface-card p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center">
              <card.icon className="w-5 h-5" />
            </div>
            <h3 className="mt-3 font-bold text-lg text-ink-950">{card.title}</h3>
            <p className="mt-1 text-sm text-ink-600 leading-relaxed">{card.text}</p>
          </div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto mt-10 surface-card p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-700">How it works</p>
        <div className="grid md:grid-cols-3 gap-5 mt-4">
          <div>
            <p className="text-sm text-ink-500">Step 1</p>
            <h3 className="text-xl font-bold text-ink-950 mt-1">Create profile</h3>
            <p className="text-sm text-ink-600 mt-2">Set language and region preferences for translation quality.</p>
          </div>
          <div>
            <p className="text-sm text-ink-500">Step 2</p>
            <h3 className="text-xl font-bold text-ink-950 mt-1">Start team chats</h3>
            <p className="text-sm text-ink-600 mt-2">Search teammates and begin real-time multilingual conversations.</p>
          </div>
          <div>
            <p className="text-sm text-ink-500">Step 3</p>
            <h3 className="text-xl font-bold text-ink-950 mt-1">Improve clarity</h3>
            <p className="text-sm text-ink-600 mt-2">Use nuance alerts to refine phrasing before misunderstandings happen.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
