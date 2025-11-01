import { motion } from 'framer-motion'
import { Shield, Target } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import Typewriter from '../Typewriter'

export default function AboutSection() {
  return (
    <AnimatedSection id='about' backgroundColor='var(--brand-dark-gray)'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          <motion.div
            className='space-y-6'
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className='inline-flex items-center gap-2 px-4 py-2 rounded-full'
              style={{
                background: 'rgba(240, 185, 11, 0.1)',
                border: '1px solid rgba(240, 185, 11, 0.2)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Target
                className='w-4 h-4'
                style={{ color: 'var(--brand-yellow)' }}
              />
              <span
                className='text-sm font-semibold'
                style={{ color: 'var(--brand-yellow)' }}
              >
                关于 NOFX
              </span>
            </motion.div>

            <h2
              className='text-4xl font-bold'
              style={{ color: 'var(--brand-light-gray)' }}
            >
              什么是 NOFX？
            </h2>
            <p
              className='text-lg leading-relaxed'
              style={{ color: 'var(--text-secondary)' }}
            >
              NOFX 不是另一个交易机器人，而是 AI 交易的 'Linux' ——
              一个透明、可信任的开源 OS，提供统一的 '决策-风险-执行'
              层，支持所有资产类别。
            </p>
            <p
              className='text-lg leading-relaxed'
              style={{ color: 'var(--text-secondary)' }}
            >
              从加密市场起步（24/7、高波动性完美测试场），未来扩展到股票、期货、外汇。核心：开放架构、AI
              达尔文主义（多代理自竞争、策略进化）、CodeFi 飞轮（开发者 PR
              贡献获积分奖励）。
            </p>
            <motion.div
              className='flex items-center gap-3 pt-4'
              whileHover={{ x: 5 }}
            >
              <div
                className='w-12 h-12 rounded-full flex items-center justify-center'
                style={{ background: 'rgba(240, 185, 11, 0.1)' }}
              >
                <Shield
                  className='w-6 h-6'
                  style={{ color: 'var(--brand-yellow)' }}
                />
              </div>
              <div>
                <div
                  className='font-semibold'
                  style={{ color: 'var(--brand-light-gray)' }}
                >
                  你 100% 掌控
                </div>
                <div
                  className='text-sm'
                  style={{ color: 'var(--text-secondary)' }}
                >
                  完全掌控 AI 提示词和资金
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className='relative'>
            <div
              className='rounded-2xl p-8'
              style={{
                background: 'var(--brand-black)',
                border: '1px solid var(--panel-border)',
              }}
            >
              <Typewriter
                lines={[
                  '$ git clone https://github.com/tinkle-community/nofx.git',
                  '$ cd nofx',
                  '$ chmod +x start.sh',
                  '$ ./start.sh start --build',
                  ' 启动自动交易系统...',
                  ' API服务器启动在端口 8080',
                  ' Web 控制台 http://localhost:3000',
                ]}
                typingSpeed={70}
                lineDelay={900}
                className='text-sm font-mono'
                style={{
                  color: '#00FF41',
                  textShadow: '0 0 6px rgba(0,255,65,0.6)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

