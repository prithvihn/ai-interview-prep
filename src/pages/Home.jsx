import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SignInButton, UserButton, useAuth } from '@clerk/clerk-react'
import Navbar from '../components/Navbar'
import VerbixBackground from '../components/VerbixBackground'
import { clerkAppearance } from '../utils/clerkAppearance'

const ROLES = [
  'Software Engineer', 'Product Manager', 'Business Analyst',
  'Data Analyst', 'Marketing Specialist', 'UX Designer',
  'Customer Success', 'Sales Representative',
]

const STEPS = [
  {
    num: '01',
    title: 'Upload your resume',
    desc: 'Paste a job description or upload your resume. We generate interview questions tailored to the role.',
    icon: '📄',
  },
  {
    num: '02',
    title: 'Practice answering',
    desc: 'Answer questions with your voice or keyboard. Simulate a real interview environment in your browser.',
    icon: '🎙️',
  },
  {
    num: '03',
    title: 'Get AI coaching',
    desc: 'Receive instant feedback, a score, and a sample answer based on proven frameworks like STAR.',
    icon: '✨',
  },
]

const TESTIMONIALS = [
  { name: 'Priya Mehta', role: 'Software Engineer', text: 'One of the generated questions came up in my actual interview. I was so prepared!' },
  { name: 'Carlos Rivera', role: 'Product Manager', text: 'The AI feedback is surprisingly detailed. Helped me fix my rambling habit.' },
  { name: 'Aisha Thompson', role: 'Data Analyst', text: 'I used it the night before my interview and landed the job. Highly recommend.' },
]

export default function Home() {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useAuth()

  return (
    <div className="min-h-screen bg-bg text-white relative overflow-hidden">
      {/* WebGL animated background — landing page only */}
      <VerbixBackground />

      {/* Nav */}
      <Navbar />

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-medium px-3.5 py-1.5 rounded-full mb-6 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Powered by AI · Browser-native · Free to start
        </div>

        <h1 className="font-display text-5xl md:text-[68px] font-extrabold leading-[1.05] tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '60ms' }}>
          Ace your next<br />
          <span className="text-accent">job interview</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '120ms' }}>
          Practice with AI-generated questions tailored to your role. Get instant feedback and coaching — all in your browser.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '180ms' }}>
          {isLoaded && isSignedIn ? (
            <button onClick={() => navigate('/upload')} className="btn-primary text-sm px-7 py-3.5">
              Go to Dashboard
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="btn-primary text-sm px-7 py-3.5">
                Start practicing free →
              </button>
            </SignInButton>
          )}
          <button onClick={() => navigate('/progress')} className="btn-secondary text-sm px-7 py-3.5">
            View my progress
          </button>
        </div>

        <p className="text-muted text-xs mt-4 animate-fade-up" style={{ animationDelay: '240ms' }}>
          No credit card · No signup required · Works in Chrome & Edge
        </p>

        {isLoaded && isSignedIn && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-surface border border-border px-3 py-2">
            <span className="text-xs text-muted">Signed in as</span>
            <UserButton appearance={clerkAppearance} afterSignOutUrl="/" />
          </div>
        )}
      </section>

      {/* Quick start roles */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        <p className="text-center text-xs text-muted uppercase tracking-widest font-semibold mb-5">
          Practice for any role
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => navigate(`/upload?role=${encodeURIComponent(role)}`)}
              className="text-sm px-4 py-2 rounded-xl bg-surface border border-border text-gray-300 hover:border-accent/40 hover:text-white transition-all"
            >
              {role}
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-border">
        <p className="section-label text-center mb-2">How it works</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
          Three steps to interview confidence
        </h2>

        <div className="grid md:grid-cols-3 gap-6 stagger">
          {STEPS.map((step) => (
            <div key={step.num} className="card hover:border-accent/20 transition-colors group animate-fade-up">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{step.icon}</span>
                <span className="font-mono text-xs text-muted">{step.num}</span>
              </div>
              <h3 className="font-display font-bold text-base mb-2 group-hover:text-accent transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 border-t border-border">
        <p className="section-label text-center mb-2">Success stories</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
          Trusted by job seekers
        </h2>

        <div className="grid md:grid-cols-3 gap-5 stagger">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card animate-fade-up">
              <p className="text-sm text-gray-300 leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xs font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-[10px] text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 py-20 text-center border-t border-border">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Ready to ace your interview?
        </h2>
        <p className="text-muted mb-8 text-sm">
          Start a free practice session right now — no account needed.
        </p>
        <button onClick={() => navigate('/upload')} className="btn-primary text-sm px-8 py-4">
          Start free interview practice →
        </button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-6 text-center">
        <p className="text-xs text-subtle">
          © {new Date().getFullYear()} InterviewPrep AI · Built with React, Web Speech API & Vite
        </p>
      </footer>
    </div>
  )
}
