import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <h1 className="text-4xl font-bold text-white mb-6">Terms of Service</h1>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p className="text-sm text-gray-500">Last Updated: January 2025</p>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using TitleIQ ("the Service"), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. Description of Service</h2>
              <p>
                TitleIQ provides AI-powered YouTube title generation and optimization suggestions. The Service
                uses multiple AI models to analyze video transcripts and generate title recommendations, SEO descriptions,
                and keyword tags designed to improve content discoverability and click-through rates.
              </p>
              <p className="mt-2">
                TitleIQ provides suggestions and guidance only. We do not guarantee specific performance outcomes,
                ranking improvements, CTR increases, or revenue generation from using our recommendations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. User Responsibilities</h2>
              <p>By using TitleIQ, you agree to:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
                <li>Not attempt to circumvent usage limits, rate limits, or plan restrictions</li>
                <li>Not reverse engineer, decompile, or attempt to extract source code from the Service</li>
                <li>Not use automated systems (bots, scrapers) to access the Service beyond normal browser usage</li>
                <li>Not resell, redistribute, or sublicense access to the Service without written permission</li>
                <li>Not use the Service to generate content that violates YouTube's Community Guidelines or Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Account Security</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to
                notify us immediately of any unauthorized use of your account. We are not liable for any loss or
                damage arising from your failure to protect your account information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">5. Billing and Subscriptions</h2>
              <p>
                Paid subscriptions are billed through Stripe on a recurring monthly basis. By subscribing to a paid plan,
                you authorize us to charge your payment method for the subscription fee each billing cycle.
              </p>
              <p className="mt-2">
                You may cancel your subscription at any time through your account settings or by contacting support.
                Cancellations take effect at the end of the current billing period. We do not provide refunds for
                partial billing periods.
              </p>
              <p className="mt-2">
                We reserve the right to modify pricing for our services at any time. Price changes will be communicated
                to existing subscribers at least 30 days in advance and will take effect at the next billing cycle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Usage Limits and Fair Use</h2>
              <p>
                Each subscription plan includes daily generation limits as specified on our Pricing page. These limits
                are designed to ensure fair access to the Service for all users and to manage infrastructure costs.
              </p>
              <p className="mt-2">
                We reserve the right to suspend or terminate accounts that exhibit abusive usage patterns, including
                but not limited to: attempting to circumvent rate limits, using automated systems to exceed quotas,
                or sharing account access with multiple users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Intellectual Property</h2>
              <p>
                The TitleIQ platform, including its design, code, algorithms, and branding, is owned by TightSlice
                and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="mt-2">
                You retain ownership of the titles, descriptions, and tags generated through the Service. However,
                by using the Service, you grant us a non-exclusive, royalty-free license to use anonymized,
                aggregated data from your generations to improve our algorithms and train our models.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">8. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
                INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                OR NON-INFRINGEMENT.
              </p>
              <p className="mt-2">
                We do not warrant that the Service will be uninterrupted, error-free, or secure. We do not
                guarantee any specific results from using the Service, including but not limited to increased
                views, engagement, or revenue.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, TITLEIQ AND TIGHTSLICE SHALL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
                REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, OR OTHER INTANGIBLE
                LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">10. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of material changes
                via email or through the Service. Your continued use of the Service after such modifications
                constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">11. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at any time for violation of these Terms,
                abusive behavior, or for any other reason at our sole discretion. Upon termination, your access to
                the Service and any data associated with your account may be deleted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in
                which TightSlice operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">13. Contact</h2>
              <p>
                If you have questions about these Terms, please contact us at:
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

export default Terms;
