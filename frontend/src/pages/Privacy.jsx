import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p className="text-sm text-gray-500">Last Updated: January 2025</p>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Introduction</h2>
              <p>
                TitleIQ ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
                how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.1 Account Information</h3>
              <p>When you create an account, we collect:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Email address</li>
                <li>Password (stored as a cryptographic hash, never in plaintext)</li>
                <li>Account creation date</li>
                <li>Subscription plan and billing status</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.2 Usage Data</h3>
              <p>We automatically collect information about your use of the Service:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Generation history (titles, descriptions, tags you've created)</li>
                <li>Video URLs you've analyzed (YouTube video IDs only, no private data)</li>
                <li>AI model provider preference (OpenAI, Groq, Grok, Gemini)</li>
                <li>Daily usage counts for quota enforcement</li>
                <li>Timestamps of generations and logins</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.3 Technical Information</h3>
              <p>We collect standard web analytics data:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>IP address (for rate limiting and abuse prevention)</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and features used</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.4 Payment Information</h3>
              <p>
                Payment processing is handled by Stripe. We do not store your credit card information on our servers.
                We receive only transaction confirmations, subscription status, and customer IDs from Stripe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
              <p>We use collected information for the following purposes:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li><strong>Service Delivery:</strong> To provide, maintain, and improve the title generation service</li>
                <li><strong>Account Management:</strong> To manage your account, process subscriptions, and enforce plan limits</li>
                <li><strong>Product Improvement:</strong> To analyze usage patterns and improve our AI algorithms</li>
                <li><strong>Communication:</strong> To send service updates, billing notifications, and marketing communications (opt-out available)</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats</li>
                <li><strong>Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Data Sharing and Disclosure</h2>
              <p>We do not sell your personal data. We may share data in the following circumstances:</p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.1 Service Providers</h3>
              <p>We share data with third-party providers who help us operate the Service:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>AI Providers:</strong> OpenAI, Groq, Anthropic, Google (for title generation)</li>
                <li><strong>Hosting:</strong> Infrastructure providers for server and database hosting</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.2 Aggregated Data</h3>
              <p>
                We may use anonymized, aggregated data for research, marketing, and product development. This data
                cannot be used to identify individual users. For example, we may analyze which title patterns achieve
                high engagement rates across all users to improve our recommendation algorithms.
              </p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-4">4.3 Legal Requirements</h3>
              <p>
                We may disclose your information if required by law, court order, or government request, or if we
                believe disclosure is necessary to protect our rights, your safety, or the safety of others.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">5. Data Retention</h2>
              <p>
                We retain your account data for as long as your account is active. If you delete your account, we will
                delete your personal information within 30 days, except where we are required to retain it for legal,
                accounting, or security purposes.
              </p>
              <p className="mt-2">
                Generation history and usage logs may be retained in anonymized form for algorithm training and
                service improvement purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Passwords are hashed using bcrypt with salt</li>
                <li>Data transmission is encrypted using TLS/SSL</li>
                <li>Access to production systems is restricted and audited</li>
                <li>Regular security updates and vulnerability scanning</li>
              </ul>
              <p className="mt-2">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we
                strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Your Rights and Choices</h2>
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails (service emails are required)</li>
                <li><strong>Data Portability:</strong> Export your generation history in machine-readable format</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, contact us through our support channels or account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">8. Cookies and Tracking</h2>
              <p>
                We use essential cookies to maintain your logged-in session. We do not use tracking cookies for
                advertising purposes. You can disable cookies in your browser settings, but this may affect your
                ability to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">9. Children's Privacy</h2>
              <p>
                The Service is not intended for children under 13 years of age. We do not knowingly collect personal
                information from children under 13. If you believe we have inadvertently collected such information,
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">10. International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries other than your country of residence.
                We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes by email
                or through the Service. Your continued use of the Service after such changes constitutes acceptance
                of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">12. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <p className="mt-2">
                <a
                  href="https://tightslice.com/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition"
                >
                  tightslice.com/contact
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Privacy;
