import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function LoginModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className='relative max-w-md w-full rounded-2xl p-8'
        style={{ background: 'var(--brand-dark-gray)', border: '1px solid rgba(240, 185, 11, 0.2)' }}
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button onClick={onClose} className='absolute top-4 right-4' style={{ color: 'var(--text-secondary)' }} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
          <X className='w-6 h-6' />
        </motion.button>
        <h2 className='text-2xl font-bold mb-6' style={{ color: 'var(--brand-light-gray)' }}>
          访问 NOFX 平台
        </h2>
        <p className='text-sm mb-6' style={{ color: 'var(--text-secondary)' }}>
          请选择登录或注册以访问完整的 AI 交易平台
        </p>
        <div className='space-y-3'>
          <motion.button
            onClick={() => {
              window.history.pushState({}, '', '/login')
              window.dispatchEvent(new PopStateEvent('popstate'))
              onClose()
            }}
            className='block w-full px-6 py-3 rounded-lg font-semibold text-center'
            style={{ background: 'var(--brand-yellow)', color: 'var(--brand-black)' }}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(240, 185, 11, 0.4)' }}
            whileTap={{ scale: 0.95 }}
          >
            登录
          </motion.button>
          <motion.button
            onClick={() => {
              window.history.pushState({}, '', '/register')
              window.dispatchEvent(new PopStateEvent('popstate'))
              onClose()
            }}
            className='block w-full px-6 py-3 rounded-lg font-semibold text-center'
            style={{ background: 'var(--brand-dark-gray)', color: 'var(--brand-light-gray)', border: '1px solid rgba(240, 185, 11, 0.2)' }}
            whileHover={{ scale: 1.05, borderColor: 'var(--brand-yellow)' }}
            whileTap={{ scale: 0.95 }}
          >
            注册新账号
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

