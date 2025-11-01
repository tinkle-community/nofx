import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function HeroSection() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
  }
  const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } }

  return (
    <section className='relative pt-32 pb-20 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* Left Content */}
          <motion.div className='space-y-6 relative z-10' style={{ opacity, scale }} initial='initial' animate='animate' variants={staggerContainer}>
            <motion.div variants={fadeInUp}>
              <motion.div
                className='inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6'
                style={{ background: 'rgba(240, 185, 11, 0.1)', border: '1px solid rgba(240, 185, 11, 0.2)' }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(240, 185, 11, 0.2)' }}
              >
                <Sparkles className='w-4 h-4' style={{ color: 'var(--brand-yellow)' }} />
                <span className='text-sm font-semibold' style={{ color: 'var(--brand-yellow)' }}>
                  3 天内 2.5K+ GitHub Stars
                </span>
              </motion.div>
            </motion.div>

            <h1 className='text-5xl lg:text-7xl font-bold leading-tight' style={{ color: 'var(--brand-light-gray)' }}>
              Read the Market.
              <br />
              <span style={{ color: 'var(--brand-yellow)' }}>Write the Trade.</span>
            </h1>

            <motion.p className='text-xl leading-relaxed' style={{ color: 'var(--text-secondary)' }} variants={fadeInUp}>
              NOFX 是 AI 交易的未来标准——一个开放、社区驱动的代理式交易操作系统。支持 Binance、Aster DEX 等交易所，
              自托管、多代理竞争，让 AI 为你自动决策、执行和优化交易。
            </motion.p>

            <div className='flex items-center gap-3 flex-wrap'>
              <motion.a href='https://github.com/tinkle-community/nofx' target='_blank' rel='noopener noreferrer' whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
                <img
                  src='https://img.shields.io/github/stars/tinkle-community/nofx?style=for-the-badge&logo=github&logoColor=white&color=F0B90B&labelColor=1E2329'
                  alt='GitHub Stars'
                  className='h-7'
                />
              </motion.a>
              <motion.a href='https://github.com/tinkle-community/nofx/network/members' target='_blank' rel='noopener noreferrer' whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
                <img
                  src='https://img.shields.io/github/forks/tinkle-community/nofx?style=for-the-badge&logo=github&logoColor=white&color=F0B90B&labelColor=1E2329'
                  alt='GitHub Forks'
                  className='h-7'
                />
              </motion.a>
              <motion.a href='https://github.com/tinkle-community/nofx/graphs/contributors' target='_blank' rel='noopener noreferrer' whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
                <img
                  src='https://img.shields.io/github/contributors/tinkle-community/nofx?style=for-the-badge&logo=github&logoColor=white&color=F0B90B&labelColor=1E2329'
                  alt='GitHub Contributors'
                  className='h-7'
                />
              </motion.a>
            </div>

            <motion.p className='text-xs pt-4' style={{ color: 'var(--text-tertiary)' }} variants={fadeInUp}>
              由 Aster DEX 和 Binance 提供支持，Amber.ac 战略投资。
            </motion.p>
          </motion.div>

          {/* Right Visual */}
          <motion.img src='/images/main.png' alt='NOFX Platform' className='w-full opacity-90' whileHover={{ scale: 1.05, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }} />
        </div>
      </div>
    </section>
  )
}

