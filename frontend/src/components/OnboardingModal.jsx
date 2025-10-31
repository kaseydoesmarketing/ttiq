import { motion, AnimatePresence } from 'framer-motion';
import OnboardingWizard from './OnboardingWizard';

export default function OnboardingModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="relative bg-transparent rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[60] text-white/70 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <OnboardingWizard relaunch={true} onComplete={onClose} onSkip={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
