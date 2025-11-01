import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import HeaderBar from '../components/landing/HeaderBar'
import HeroSection from '../components/landing/HeroSection'
import AboutSection from '../components/landing/AboutSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import CommunitySection from '../components/landing/CommunitySection'
import AnimatedSection from '../components/landing/AnimatedSection'
import LoginModal from '../components/landing/LoginModal'
import FooterSection from '../components/landing/FooterSection'

export function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  return (
    <div className='min-h-screen overflow-hidden' style={{ background: 'var(--brand-black)', color: 'var(--brand-light-gray)' }}>
      <HeaderBar onLoginClick={() => setShowLoginModal(true)} />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CommunitySection />

      {/* CTA */}
      <AnimatedSection backgroundColor='var(--panel-bg)'>
        <div className='max-w-4xl mx-auto text-center'>
          <motion.h2 className='text-5xl font-bold mb-6' style={{ color: 'var(--brand-light-gray)' }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            准备好定义 AI 交易的未来吗？
          </motion.h2>
          <motion.p className='text-xl mb-12' style={{ color: 'var(--text-secondary)' }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            从加密市场起步，扩展到 TradFi。NOFX 是 AgentFi 的基础架构。
          </motion.p>
          <div className='flex flex-wrap justify-center gap-4'>
            <motion.button onClick={() => setShowLoginModal(true)} className='flex items-center gap-2 px-10 py-4 rounded-lg font-semibold text-lg' style={{ background: 'var(--brand-yellow)', color: 'var(--brand-black)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              立即开始
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight className='w-5 h-5' />
              </motion.div>
            </motion.button>
            <motion.a href='https://github.com/tinkle-community/nofx/tree/dev' target='_blank' rel='noopener noreferrer' className='flex items-center gap-2 px-10 py-4 rounded-lg font-semibold text-lg' style={{ background: 'var(--brand-dark-gray)', color: 'var(--brand-light-gray)', border: '1px solid rgba(240, 185, 11, 0.2)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              查看源码
            </motion.a>
          </div>
        </div>
      </AnimatedSection>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      <FooterSection />
    </div>
  )
}
