import { motion } from 'framer-motion'
import AnimatedSection from './AnimatedSection'
import { CryptoFeatureCard } from '../CryptoFeatureCard'
import { Code, Cpu, Lock, Rocket } from 'lucide-react'

export default function FeaturesSection() {
  return (
    <AnimatedSection id='features'>
      <div className='max-w-7xl mx-auto'>
        <motion.div className='text-center mb-16' initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <motion.div
            className='inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6'
            style={{ background: 'rgba(240, 185, 11, 0.1)', border: '1px solid rgba(240, 185, 11, 0.2)' }}
            whileHover={{ scale: 1.05 }}
          >
            <Rocket className='w-4 h-4' style={{ color: 'var(--brand-yellow)' }} />
            <span className='text-sm font-semibold' style={{ color: 'var(--brand-yellow)' }}>
              核心功能
            </span>
          </motion.div>
          <h2 className='text-4xl font-bold mb-4' style={{ color: 'var(--brand-light-gray)' }}>
            为什么选择 NOFX？
          </h2>
          <p className='text-lg' style={{ color: 'var(--text-secondary)' }}>
            开源、透明、社区驱动的 AI 交易操作系统
          </p>
        </motion.div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto'>
          <CryptoFeatureCard
            icon={<Code className='w-8 h-8' />}
            title='100% 开源与自托管'
            description='你的框架，你的规则。非黑箱，支持自定义提示词和多模型。'
            features={['完全开源代码', '支持自托管部署', '自定义 AI 提示词', '多模型支持（DeepSeek、Qwen）']}
            delay={0}
          />
          <CryptoFeatureCard
            icon={<Cpu className='w-8 h-8' />}
            title='多代理智能竞争'
            description='AI 策略在沙盒中高速战斗，最优者生存，实现策略进化。'
            features={['多 AI 代理并行运行', '策略自动优化', '沙盒安全测试', '跨市场策略移植']}
            delay={0.1}
          />
          <CryptoFeatureCard
            icon={<Lock className='w-8 h-8' />}
            title='安全可靠交易'
            description='企业级安全保障，完全掌控你的资金和交易策略。'
            features={['本地私钥管理', 'API 权限精细控制', '实时风险监控', '交易日志审计']}
            delay={0.2}
          />
        </div>
      </div>
    </AnimatedSection>
  )
}

