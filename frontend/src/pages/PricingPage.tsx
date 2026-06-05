import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Check, X, Zap, Crown, ArrowRight, Wallet,
  Brain, FileText, Target, TrendingUp, Shield,
  BarChart2, Bell, Users,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const FREE_FEATURES = [
  { text: 'Up to 50 transactions/month', ok: true },
  { text: 'Income & Expense tracking', ok: true },
  { text: 'Basic budget (3 categories)', ok: true },
  { text: '1 Savings goal', ok: true },
  { text: 'Basic dashboard charts', ok: true },
  { text: 'Email notifications', ok: true },
  { text: 'Unlimited transactions', ok: false },
  { text: 'AI Insights & predictions', ok: false },
  { text: 'Advanced reports & export', ok: false },
  { text: 'Unlimited budgets', ok: false },
  { text: 'PDF/Excel export', ok: false },
  { text: 'Priority support', ok: false },
]

const PRO_FEATURES = [
  { text: 'Unlimited transactions', ok: true },
  { text: 'Income & Expense tracking', ok: true },
  { text: 'Unlimited budgets', ok: true },
  { text: 'Unlimited savings goals', ok: true },
  { text: 'Advanced dashboard charts', ok: true },
  { text: 'Smart notifications', ok: true },
  { text: 'Full AI Insights & predictions', ok: true },
  { text: 'ML-powered forecasting', ok: true },
  { text: 'PDF & Excel export', ok: true },
  { text: 'Monthly financial reports', ok: true },
  { text: 'Financial health score', ok: true },
  { text: 'Priority support', ok: true },
]

const STATS = [
  { icon: Users,     value: '500+',  label: 'Active Users' },
  { icon: TrendingUp, value: '₨2M+', label: 'Tracked Income' },
  { icon: Target,    value: '98%',   label: 'User Satisfaction' },
  { icon: Shield,    value: '100%',  label: 'Data Security' },
]

const FAQ = [
  { q: 'Can I upgrade anytime?', a: 'Yes — contact admin to upgrade your account to Pro instantly.' },
  { q: 'Is my data safe?', a: 'Yes. All data is stored securely in encrypted PostgreSQL database. We never sell your data.' },
  { q: 'What payment methods?', a: 'JazzCash, EasyPaisa, and bank transfer accepted for Pakistan users.' },
  { q: 'Can I cancel Pro?', a: 'Yes, you can downgrade to Free at any time. Your data stays intact.' },
  { q: 'Is there a free trial?', a: 'Free plan is available forever. No credit card required.' },
]

export default function PricingPage() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen" style={{ background: '#060d18' }}>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/5 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(6,13,24,0.95)', backdropFilter: 'blur(20px)' }}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Wallet size={15} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">AI Finance Tracker</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="btn-primary text-sm py-2 px-4">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started Free</Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-16">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass border border-primary/20 rounded-full px-4 py-1.5 mb-5">
            <Zap size={12} className="text-primary" />
            <span className="text-xs text-white/60">Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Choose Your <span className="text-gradient">Plan</span>
          </h1>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Start free forever. Upgrade to Pro when you need the full power of AI finance management.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">

          {/* Free */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="card border border-white/8 relative flex flex-col">
            <div className="mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center mb-3">
                <Wallet size={18} className="text-white/60" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Free</h2>
              <p className="text-white/40 text-sm">Perfect to get started</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-black text-white">₨0</span>
                <span className="text-white/40 text-sm mb-1.5">/month</span>
              </div>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  {f.ok
                    ? <Check size={14} className="text-success flex-shrink-0" />
                    : <X size={14} className="text-white/20 flex-shrink-0" />}
                  <span className={f.ok ? 'text-white/70' : 'text-white/25'}>{f.text}</span>
                </li>
              ))}
            </ul>
            {user ? (
              <div className="py-3 text-center rounded-xl border border-white/10 text-white/40 text-sm font-medium">
                {user.is_pro ? 'Your previous plan' : '✓ Your current plan'}
              </div>
            ) : (
              <Link to="/register"
                className="block text-center py-3 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all text-sm font-semibold">
                Get Started Free
              </Link>
            )}
          </motion.div>

          {/* Pro */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="relative flex flex-col rounded-2xl p-6 border border-primary/40 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)' }}>
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                <Crown size={9} /> POPULAR
              </span>
            </div>
            <div className="mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 shadow-lg shadow-primary/30">
                <Crown size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Pro</h2>
              <p className="text-white/50 text-sm">For serious finance management</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-black text-white">₨999</span>
                <span className="text-white/40 text-sm mb-1.5">/month</span>
              </div>
              <p className="text-white/30 text-xs mt-1">~$3.5 USD • Cancel anytime</p>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <Check size={14} className="text-primary flex-shrink-0" />
                  <span className="text-white/80">{f.text}</span>
                </li>
              ))}
            </ul>
            {user?.is_pro ? (
              <div className="py-3 text-center rounded-xl border border-primary/40 text-primary text-sm font-semibold">
                ✓ Your current plan
              </div>
            ) : (
              <a href="mailto:jutthamid148@gmail.com?subject=Pro Upgrade Request&body=Hi, I want to upgrade to Pro plan. My email: "
                className="block text-center py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2">
                Upgrade to Pro <ArrowRight size={14} />
              </a>
            )}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {STATS.map((s, i) => (
            <div key={i} className="card text-center">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-2">
                <s.icon size={16} className="text-primary" />
              </div>
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-white/35 text-xs">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Feature comparison */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card mb-16">
          <h2 className="font-bold text-lg text-white mb-6 text-center">What's Included</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Brain, title: 'AI Insights', desc: 'ML-powered spending predictions, financial health score, and personalized recommendations', pro: true },
              { icon: BarChart2, title: 'Advanced Reports', desc: 'Monthly PDF & Excel reports, 6-month trend charts, category breakdowns', pro: true },
              { icon: Bell, title: 'Smart Alerts', desc: 'Budget exceeded alerts, savings goal notifications, and spending warnings', pro: false },
              { icon: Target, title: 'Savings Goals', desc: 'Track multiple savings goals with progress visualization', pro: false },
              { icon: FileText, title: 'Export Data', desc: 'Export all your financial data to PDF or Excel anytime', pro: true },
              { icon: Shield, title: 'Secure & Private', desc: 'Bank-level encryption, your data is never sold or shared', pro: false },
            ].map((feat, i) => (
              <div key={i} className="glass p-4 rounded-xl border border-white/6">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${feat.pro ? 'bg-primary/15' : 'bg-white/8'}`}>
                    <feat.icon size={13} className={feat.pro ? 'text-primary' : 'text-white/50'} />
                  </div>
                  <span className="font-semibold text-sm text-white">{feat.title}</span>
                  {feat.pro && <span className="ml-auto text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">PRO</span>}
                </div>
                <p className="text-white/35 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-16">
          <h2 className="font-bold text-lg text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map((faq, i) => (
              <div key={i} className="card border border-white/6">
                <p className="font-semibold text-sm text-white mb-1">{faq.q}</p>
                <p className="text-white/45 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="text-center rounded-2xl p-10 border border-primary/20 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))' }}>
          <Crown size={32} className="text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Ready to take control of your finances?</h2>
          <p className="text-white/45 mb-6 text-sm">Join hundreds of users managing their money smarter with AI</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary px-8 py-3 text-sm font-semibold">
              Start Free Today
            </Link>
            <a href="mailto:jutthamid148@gmail.com?subject=Pro Upgrade"
              className="btn-secondary px-8 py-3 text-sm font-semibold flex items-center gap-2 justify-center">
              <Crown size={14} /> Upgrade to Pro
            </a>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-white/25 text-xs">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/" className="hover:text-white/50 transition-colors">Home</Link>
          <Link to="/pricing" className="hover:text-white/50 transition-colors">Pricing</Link>
          <Link to="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
        </div>
        <p className="mt-3">© 2026 AI Finance Tracker. Built for Riphah International University FYP.</p>
      </footer>
    </div>
  )
}
