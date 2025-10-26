import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="font-heading text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Turn Views Into Clicks
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            AI-powered YouTube title optimization. Generate 10 high-CTR title options
            from any video transcript in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app" className="btn-primary text-lg px-8 py-4">
              Try Builder Mode (No Login)
            </Link>
            <Link to="/register" className="btn-secondary text-lg px-8 py-4">
              Sign Up Free
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-heading text-4xl font-bold text-center mb-12 text-primary">
          Why TitleIQ?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <BenefitCard
            icon="⚡"
            title="Lightning Fast"
            description="Generate 10 optimized titles in under 10 seconds. No more writer's block."
          />
          <BenefitCard
            icon="🎯"
            title="Data-Driven"
            description="Built on proven psychological triggers and CTR optimization formulas."
          />
          <BenefitCard
            icon="🔒"
            title="Privacy First"
            description="Your API keys are encrypted. Your data stays yours. No tracking."
          />
          <BenefitCard
            icon="🆓"
            title="Free to Start"
            description="Built-in free AI analysis. Optionally use your own API key for premium results."
          />
          <BenefitCard
            icon="📱"
            title="Mobile Optimized"
            description="Titles are optimized for mobile viewers with front-loaded power words."
          />
          <BenefitCard
            icon="🎨"
            title="Beautiful UX"
            description="Futuristic interface with smooth animations. Built for creators."
          />
        </div>
      </section>

      {/* Example Output Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-heading text-4xl font-bold text-center mb-12 text-primary">
          Example Output
        </h2>
        <div className="card max-w-4xl mx-auto">
          <p className="text-gray-400 mb-6 text-sm">
            Input: "How to optimize YouTube videos for maximum reach and engagement..."
          </p>
          <div className="space-y-3">
            {[
              "YouTube Algorithm EXPOSED: This ONE Trick Changed Everything",
              "I Grew to 100K Subs Using This Video Optimization Secret",
              "Most Creators Get This WRONG (Fix in 5 Minutes)",
              "YouTube's Hidden Ranking Factor Nobody Talks About",
              "How to 10X Your Views Without Changing Your Content",
            ].map((title, i) => (
              <div
                key={i}
                className="p-4 bg-dark border border-gray-700 rounded-lg hover:border-primary transition-colors"
              >
                <span className="text-gray-300">{title}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-dark border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Description:</p>
            <p className="text-gray-300">
              Discover the exact YouTube optimization strategy that top creators use
              to 10X their views. This proven method takes just 5 minutes and works
              for any niche. Stop guessing and start growing today.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-heading text-4xl font-bold text-center mb-12 text-primary">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <FAQItem
            question="Is TitleIQ really free?"
            answer="Yes! TitleIQ uses a free AI service by default. You can also add your own OpenAI or Claude API key for premium results, but it's completely optional."
          />
          <FAQItem
            question="Do I need to create an account?"
            answer="No! You can use Builder Mode without logging in. Create an account if you want to save your API key and access premium features."
          />
          <FAQItem
            question="What if YouTube doesn't have a transcript?"
            answer="No problem! Just paste the transcript manually or use any spoken-word content. TitleIQ works with any text input."
          />
          <FAQItem
            question="How are the titles generated?"
            answer="TitleIQ analyzes your transcript to extract core themes, emotional hooks, and stakes. It then applies proven title formulas (Shock+Outcome, Status Flip, Villain/Expose, etc.) while optimizing for psychological triggers and mobile viewing."
          />
          <FAQItem
            question="Is my API key safe?"
            answer="Yes. API keys are encrypted using military-grade AES-256 encryption before being stored. They're never displayed in the UI and only you can access them."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="card max-w-2xl mx-auto"
        >
          <h2 className="font-heading text-4xl font-bold mb-6">
            Ready to Boost Your CTR?
          </h2>
          <p className="text-gray-300 mb-8">
            Join thousands of creators optimizing their YouTube titles with AI.
          </p>
          <Link to="/app" className="btn-primary text-lg px-8 py-4 inline-block">
            Start Generating Titles Now →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; 2025 TitleIQ. Built for creators, by creators.</p>
        </div>
      </footer>
    </div>
  );
}

function BenefitCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card text-center"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-heading text-xl font-bold mb-2 text-primary">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}

function FAQItem({ question, answer }) {
  return (
    <details className="card group">
      <summary className="font-semibold text-lg cursor-pointer text-primary group-open:mb-4">
        {question}
      </summary>
      <p className="text-gray-400">{answer}</p>
    </details>
  );
}
