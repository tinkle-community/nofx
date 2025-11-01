import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function HeaderBar({ onLoginClick }: { onLoginClick: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className='fixed top-0 w-full z-50 header-bar'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <div className='flex items-center gap-3'>
            <img src='/images/logo.png' alt='NOFX Logo' className='w-8 h-8' />
            <span className='text-xl font-bold' style={{ color: 'var(--brand-yellow)' }}>
              NOFX
            </span>
            <span className='text-sm hidden sm:block' style={{ color: 'var(--text-secondary)' }}>
              Agentic Trading OS
            </span>
          </div>

          {/* Desktop Menu */}
          <div className='hidden md:flex items-center gap-6'>
            {['功能', '如何运作', 'GitHub', '社区'].map((item) => (
              <a
                key={item}
                href={
                  item === 'GitHub'
                    ? 'https://github.com/tinkle-community/nofx'
                    : item === '社区'
                    ? 'https://t.me/nofx_dev_community'
                    : `#${item === '功能' ? 'features' : 'how-it-works'}`
                }
                target={item === 'GitHub' || item === '社区' ? '_blank' : undefined}
                rel={item === 'GitHub' || item === '社区' ? 'noopener noreferrer' : undefined}
                className='text-sm transition-colors relative group'
                style={{ color: 'var(--brand-light-gray)' }}
              >
                {item}
                <span
                  className='absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300'
                  style={{ background: 'var(--brand-yellow)' }}
                />
              </a>
            ))}
            <button
              onClick={onLoginClick}
              className='px-4 py-2 rounded font-semibold text-sm'
              style={{ background: 'var(--brand-yellow)', color: 'var(--brand-black)' }}
            >
              登录 / 注册
            </button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='md:hidden'
            style={{ color: 'var(--brand-light-gray)' }}
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={mobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className='md:hidden overflow-hidden'
        style={{ background: 'var(--brand-dark-gray)', borderTop: '1px solid rgba(240, 185, 11, 0.1)' }}
      >
        <div className='px-4 py-4 space-y-3'>
          {['功能', '如何运作', 'GitHub', '社区'].map((item) => (
            <a key={item} href={`#${item}`} className='block text-sm py-2' style={{ color: 'var(--brand-light-gray)' }}>
              {item}
            </a>
          ))}
          <button
            onClick={() => {
              onLoginClick()
              setMobileMenuOpen(false)
            }}
            className='w-full px-4 py-2 rounded font-semibold text-sm mt-2'
            style={{ background: 'var(--brand-yellow)', color: 'var(--brand-black)' }}
          >
            登录 / 注册
          </button>
        </div>
      </motion.div>
    </nav>
  )
}

