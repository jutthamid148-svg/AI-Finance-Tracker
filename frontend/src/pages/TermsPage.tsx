import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#060d18' }}>
      <header className="sticky top-0 z-40 border-b border-white/5 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(6,13,24,0.95)', backdropFilter: 'blur(20px)' }}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Wallet size={15} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">AI Finance Tracker</span>
        </Link>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-14">
        <h1 className="text-3xl font-black text-white mb-2">Terms of Service</h1>
        <p className="text-white/35 text-sm mb-10">Last updated: June 2026</p>

        {[
          {
            title: '1. Acceptance of Terms',
            body: `By accessing or using AI Finance Tracker ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all users, including Free and Pro plan subscribers.`,
          },
          {
            title: '2. Description of Service',
            body: `AI Finance Tracker is a personal finance management web application that provides income/expense tracking, budget management, savings goals, and AI-powered financial insights. The Service is provided as-is for personal, non-commercial use.`,
          },
          {
            title: '3. User Accounts',
            body: `You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration. You are responsible for all activity that occurs under your account. Notify us immediately of any unauthorized use at jutthamid148@gmail.com.`,
          },
          {
            title: '4. Free and Pro Plans',
            body: `The Free plan provides basic features at no cost. The Pro plan (₨999/month) provides full access to all features including AI Insights, unlimited transactions, and export functionality. Subscription fees are non-refundable unless required by applicable law. We reserve the right to change pricing with 30 days notice.`,
          },
          {
            title: '5. Acceptable Use',
            body: `You agree not to: (a) use the Service for any illegal purpose; (b) attempt to gain unauthorized access to the Service; (c) upload malicious code; (d) share your account with others; (e) reverse engineer or copy the Service. Violation may result in immediate account termination.`,
          },
          {
            title: '6. Data and Privacy',
            body: `Your financial data belongs to you. We store data securely in encrypted databases. We do not sell, share, or monetize your personal financial data. See our Privacy Policy for full details on data handling.`,
          },
          {
            title: '7. AI Insights Disclaimer',
            body: `AI-generated insights and financial predictions are for informational purposes only and do not constitute professional financial advice. Always consult a qualified financial advisor before making major financial decisions. Predictions may not be accurate.`,
          },
          {
            title: '8. Limitation of Liability',
            body: `AI Finance Tracker is not liable for any financial losses, data loss, or damages resulting from use of the Service. The Service is provided "as is" without warranty of any kind. Use at your own risk.`,
          },
          {
            title: '9. Termination',
            body: `We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from Profile settings. Upon termination, your data will be deleted within 30 days.`,
          },
          {
            title: '10. Changes to Terms',
            body: `We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance. We will notify users of significant changes via email or in-app notification.`,
          },
          {
            title: '11. Contact',
            body: `For questions about these Terms, contact us at: jutthamid148@gmail.com\n\nAI Finance Tracker — Riphah International University, Faisalabad, Pakistan`,
          },
        ].map((section, i) => (
          <div key={i} className="mb-7">
            <h2 className="font-bold text-white text-base mb-2">{section.title}</h2>
            <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{section.body}</p>
          </div>
        ))}
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-white/25 text-xs">
        <div className="flex items-center justify-center gap-4 flex-wrap mb-2">
          <Link to="/" className="hover:text-white/50">Home</Link>
          <Link to="/pricing" className="hover:text-white/50">Pricing</Link>
          <Link to="/privacy" className="hover:text-white/50">Privacy Policy</Link>
        </div>
        <p>© 2026 AI Finance Tracker</p>
      </footer>
    </div>
  )
}
