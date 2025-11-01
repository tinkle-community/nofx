import { motion } from 'framer-motion'
import AnimatedSection from './AnimatedSection'

function TestimonialCard({ quote, author, delay }: any) {
  return (
    <motion.div
      className='p-6 rounded-xl'
      style={{ background: 'var(--brand-dark-gray)', border: '1px solid rgba(240, 185, 11, 0.1)' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
    >
      <p className='text-lg mb-4' style={{ color: 'var(--brand-light-gray)' }}>
        "{quote}"
      </p>
      <div className='flex items-center gap-2'>
        <div className='w-8 h-8 rounded-full' style={{ background: 'var(--binance-yellow)' }} />
        <span className='text-sm font-semibold' style={{ color: 'var(--text-secondary)' }}>
          {author}
        </span>
      </div>
    </motion.div>
  )
}

export default function CommunitySection() {
  const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } }
  return (
    <AnimatedSection>
      <div className='max-w-7xl mx-auto'>
        <motion.div className='grid md:grid-cols-3 gap-6' variants={staggerContainer} initial='initial' whileInView='animate' viewport={{ once: true }}>
          <TestimonialCard quote='跑了一晚上 NOFX，开源的 AI 自动交易，太有意思了，一晚上赚了 6% 收益！' author='@DIYgod' delay={0} />
          <TestimonialCard quote='所有成功人士都在用 NOFX。IYKYK。' author='@SexyMichill' delay={0.1} />
          <TestimonialCard quote='NOFX 复兴了传奇 Alpha Arena，AI 驱动的加密期货战场。' author='@hqmank' delay={0.2} />
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

