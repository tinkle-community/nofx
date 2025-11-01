import { motion } from 'framer-motion'
import AnimatedSection from './AnimatedSection'

function StepCard({ number, title, description, delay }: any) {
  return (
    <motion.div className='flex gap-6 items-start' initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay }} whileHover={{ x: 10 }}>
      <motion.div
        className='flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl'
        style={{ background: 'var(--binance-yellow)', color: 'var(--brand-black)' }}
        whileHover={{ scale: 1.2, rotate: 360 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {number}
      </motion.div>
      <div>
        <h3 className='text-2xl font-semibold mb-2' style={{ color: 'var(--brand-light-gray)' }}>
          {title}
        </h3>
        <p className='text-lg leading-relaxed' style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>
    </motion.div>
  )
}

export default function HowItWorksSection() {
  return (
    <AnimatedSection id='how-it-works' backgroundColor='var(--brand-dark-gray)'>
      <div className='max-w-7xl mx-auto'>
        <motion.div className='text-center mb-16' initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className='text-4xl font-bold mb-4' style={{ color: 'var(--brand-light-gray)' }}>
            如何开始使用 NOFX
          </h2>
          <p className='text-lg' style={{ color: 'var(--text-secondary)' }}>
            四个简单步骤，开启 AI 自动交易之旅
          </p>
        </motion.div>

        <div className='space-y-8'>
          {[
            { number: 1, title: '拉取 GitHub 仓库', description: 'git clone https://github.com/tinkle-community/nofx 并切换到 dev 分支测试新功能。' },
            { number: 2, title: '配置环境', description: '前端设置交易所 API（如 Binance、Hyperliquid）、AI 模型和自定义提示词。' },
            { number: 3, title: '部署与运行', description: '一键 Docker 部署，启动 AI 代理。注意：高风险市场，仅用闲钱测试。' },
            { number: 4, title: '优化与贡献', description: '监控交易，提交 PR 改进框架。加入 Telegram 分享策略。' },
          ].map((step, index) => (
            <StepCard key={step.number} {...step} delay={index * 0.1} />
          ))}
        </div>

        <motion.div
          className='mt-12 p-6 rounded-xl flex items-start gap-4'
          style={{ background: 'rgba(246, 70, 93, 0.1)', border: '1px solid rgba(246, 70, 93, 0.3)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
        >
          <div className='w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0' style={{ background: 'rgba(246, 70, 93, 0.2)', color: '#F6465D' }}>
            <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z'/><line x1='12' x2='12' y1='9' y2='13'/><line x1='12' x2='12.01' y1='17' y2='17'/></svg>
          </div>
          <div>
            <div className='font-semibold mb-2' style={{ color: '#F6465D' }}>
              重要风险提示
            </div>
            <p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
              dev 分支不稳定，勿用无法承受损失的资金。NOFX 非托管，无官方策略。交易有风险，投资需谨慎。
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}
