import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'

export default function PrivacyPage() {
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
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-14">
        <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-white/35 text-sm mb-10">Last updated: June 2026</p>

        {[
          {
            title: '1. Information We Collect',
            body: `We collect the following information when you use AI Finance Tracker:\n\n• Account information: name, email address, password (hashed)\n• Financial data: income, expenses, budgets, savings goals you enter\n• Usage data: login times, features used, browser type\n• Google account data (if you sign in with Google): name, email, profile photo`,
          },
          {
            title: '2. How We Use Your Information',
            body: `We use your information to:\n\n• Provide and improve the Service\n• Generate AI-powered financial insights and predictions\n• Send budget alerts and notifications you request\n• Authenticate your account securely\n• Respond to support requests\n\nWe do NOT use your data for advertising or sell it to third parties.`,
          },
          {
            title: '3. Data Storage & Security',
            body: `Your data is stored in encrypted PostgreSQL databases hosted on Supabase (AWS ap-southeast-2 region). We use:\n\n• SSL/TLS encryption for all data in transit\n• Bcrypt hashing for passwords\n• JWT tokens for secure authentication\n• Regular security audits\n\nNo system is 100% secure. Use a strong password and keep it private.`,
          },
          {
            title: '4. Data Sharing',
            body: `We do not sell, trade, or share your personal data with third parties except:\n\n• Service providers: Supabase (database), Vercel (hosting), Firebase (Google auth) — bound by their privacy policies\n• Legal requirements: if required by law or court order\n• Account protection: to investigate fraud or security threats`,
          },
          {
            title: '5. Google Sign-In',
            body: `If you use "Sign in with Google", we receive your name, email, and profile photo from Google via Firebase Authentication. We do not access your Google Drive, Gmail, or any other Google services. Your Google data is governed by Google's Privacy Policy.`,
          },
          {
            title: '6. Cookies & Local Storage',
            body: `We use browser localStorage to store your authentication tokens (JWT). We do not use advertising cookies or tracking pixels. No third-party analytics (Google Analytics, Facebook Pixel, etc.) are used.`,
          },
          {
            title: '7. Your Rights',
            body: `You have the right to:\n\n• Access all data we hold about you\n• Export your financial data (PDF/Excel)\n• Correct inaccurate data via Profile settings\n• Delete your account and all associated data\n• Withdraw consent at any time\n\nContact jutthamid148@gmail.com to exercise these rights.`,
          },
          {
            title: '8. Data Retention',
            body: `We retain your data as long as your account is active. When you delete your account, your personal data is permanently deleted within 30 days. Aggregated, anonymized data may be retained for analytics.`,
          },
          {
            title: '9. Children\'s Privacy',
            body: `AI Finance Tracker is not intended for users under 13 years of age. We do not knowingly collect data from children. If you believe a child has provided us data, contact us immediately.`,
          },
          {
            title: '10. Changes to Privacy Policy',
            body: `We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification. Continued use after changes constitutes acceptance.`,
          },
          {
            title: '11. Contact Us',
            body: `For privacy concerns or data requests:\n\nEmail: jutthamid148@gmail.com\nAI Finance Tracker — Riphah International University, Faisalabad, Pakistan`,
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
          <Link to="/terms" className="hover:text-white/50">Terms of Service</Link>
        </div>
        <p>© 2026 AI Finance Tracker</p>
      </footer>
    </div>
  )
}
