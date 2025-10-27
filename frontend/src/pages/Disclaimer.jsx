import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <h1 className="text-4xl font-bold text-white mb-6">Disclaimer</h1>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p className="text-sm text-gray-500">Last Updated: January 2025</p>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">1. No Affiliation with YouTube</h2>
              <p>
                TitleIQ is an independent service and is <strong>not affiliated with, endorsed by, or connected to
                YouTube, Google, Alphabet Inc., or any of their subsidiaries</strong>.
              </p>
              <p className="mt-2">
                YouTube is a trademark of Google LLC. We reference YouTube solely to describe the nature of our
                service, which helps content creators optimize titles for the YouTube platform.
              </p>
              <p className="mt-2">
                Use of TitleIQ does not grant you any special relationship with YouTube or guarantee favorable
                treatment by YouTube's algorithm.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">2. No Performance Guarantees</h2>
              <p>
                TitleIQ provides AI-generated title suggestions, SEO descriptions, and keyword tags designed to
                improve content discoverability and engagement. However, we make <strong>no guarantees or warranties</strong>
                regarding specific outcomes, including but not limited to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Increased video views, impressions, or reach</li>
                <li>Improved click-through rates (CTR)</li>
                <li>Higher search rankings on YouTube or Google</li>
                <li>Increased subscriber growth or engagement metrics</li>
                <li>Revenue generation or monetization improvements</li>
                <li>Viral success or algorithmic promotion</li>
              </ul>
              <p className="mt-2">
                Video performance depends on many factors beyond titles, including content quality, audience targeting,
                publishing schedule, thumbnail design, video length, engagement patterns, and YouTube's proprietary
                recommendation algorithms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Educational and Optimization Tool Only</h2>
              <p>
                TitleIQ is an <strong>educational and optimization tool</strong> designed to help content creators
                understand title psychology, hook patterns, and SEO best practices. It is not:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>A guarantee of YouTube algorithm success</li>
                <li>A replacement for quality content creation</li>
                <li>A manipulation or exploitation tool for platform algorithms</li>
                <li>Professional business, financial, or marketing advice</li>
              </ul>
              <p className="mt-2">
                You are solely responsible for the content you publish and the titles you choose to use. We recommend
                testing multiple title variations and analyzing your own analytics to determine what works best for
                your specific audience and niche.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">4. AI-Generated Content Limitations</h2>
              <p>
                TitleIQ uses artificial intelligence models from third-party providers (including but not limited to
                OpenAI, Anthropic, Google, and Groq) to generate title suggestions. AI-generated content may:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Contain errors, inaccuracies, or inappropriate suggestions</li>
                <li>Not perfectly match your brand voice or content style</li>
                <li>Require human review and editing before use</li>
                <li>Occasionally produce duplicate or similar suggestions</li>
              </ul>
              <p className="mt-2">
                You are responsible for reviewing, editing, and approving all AI-generated suggestions before using
                them in your content. Do not publish titles that violate YouTube's Community Guidelines, contain
                misleading information, or infringe on intellectual property rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">5. Compliance with Platform Policies</h2>
              <p>
                When using TitleIQ-generated titles, you remain solely responsible for compliance with:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>YouTube's Community Guidelines and Terms of Service</li>
                <li>YouTube's spam, deceptive practices, and scam policies</li>
                <li>YouTube's monetization policies (if applicable)</li>
                <li>Copyright, trademark, and intellectual property laws</li>
                <li>FTC disclosure requirements for sponsored content</li>
                <li>Any applicable local, national, or international regulations</li>
              </ul>
              <p className="mt-2">
                TitleIQ does not encourage or condone "clickbait" that violates platform policies. Our title
                suggestions are designed to be engaging and accurate representations of your content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Data Processing and Accuracy</h2>
              <p>
                TitleIQ analyzes video transcripts to generate title recommendations. The quality and relevance of
                our suggestions depend on the accuracy and completeness of the transcript data provided.
              </p>
              <p className="mt-2">
                We cannot guarantee:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Successful transcript extraction from all videos (some videos may lack captions or have technical restrictions)</li>
                <li>Perfect transcription accuracy (especially for videos with poor audio quality or heavy accents)</li>
                <li>Appropriate suggestions for all content types, languages, or niches</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">7. Third-Party Services</h2>
              <p>
                TitleIQ integrates with third-party services including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>YouTube (for transcript extraction)</li>
                <li>OpenAI, Anthropic, Google, and Groq (for AI generation)</li>
                <li>Stripe (for payment processing)</li>
              </ul>
              <p className="mt-2">
                We are not responsible for the availability, performance, accuracy, or policies of these third-party
                services. Service disruptions from these providers may affect TitleIQ's functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">8. No Professional Advice</h2>
              <p>
                TitleIQ is a software tool, not a professional advisory service. We do not provide:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Marketing consultation or strategy advice</li>
                <li>Business growth or monetization coaching</li>
                <li>Legal advice regarding content, copyright, or platform compliance</li>
                <li>Financial advice or investment recommendations</li>
              </ul>
              <p className="mt-2">
                For personalized YouTube growth coaching and strategy, visit our parent company
                <a
                  href="https://tightslice.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition ml-1"
                >
                  TightSlice
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">9. Results May Vary</h2>
              <p>
                Content creation success is influenced by numerous factors including content quality, consistency,
                niche selection, audience building, publishing frequency, community engagement, and market timing.
              </p>
              <p className="mt-2">
                What works for one creator may not work for another. Past performance of similar titles does not
                guarantee future results. Success on YouTube requires sustained effort, experimentation, and adaptation
                to changing platform algorithms and audience preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">10. Service Availability</h2>
              <p>
                We strive to maintain high service availability but do not guarantee uninterrupted access. The Service
                may be unavailable due to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Scheduled maintenance</li>
                <li>Technical failures or infrastructure issues</li>
                <li>Third-party service disruptions</li>
                <li>Force majeure events</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">11. Changes to Service</h2>
              <p>
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without
                prior notice. We may also update our AI models, algorithms, and feature sets to improve performance
                or comply with regulatory requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">12. Limitation of Liability</h2>
              <p>
                Use of TitleIQ is at your own risk. We are not liable for any damages, losses, or consequences arising
                from:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li>Use or inability to use the Service</li>
                <li>Loss of revenue, audience, or channel standing</li>
                <li>Actions taken based on AI-generated suggestions</li>
                <li>Violations of platform policies resulting from your content</li>
                <li>Data loss or security breaches</li>
              </ul>
            </section>

            <section className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h2 className="text-2xl font-semibold text-yellow-300 mb-3">Important Reminder</h2>
              <p className="text-yellow-100">
                <strong>TitleIQ is a tool, not a magic solution.</strong> Success on YouTube requires high-quality
                content, audience understanding, consistent effort, and adaptation to platform changes. Use our
                suggestions as a starting point, not a final answer. Always review and customize AI-generated titles
                to match your brand, audience, and content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">Questions?</h2>
              <p>
                If you have questions about this Disclaimer, please contact us at:
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

export default Disclaimer;
