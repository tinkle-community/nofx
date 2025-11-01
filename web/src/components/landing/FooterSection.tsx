import { useLanguage } from '../../contexts/LanguageContext'
import { t } from '../../i18n/translations'

export default function FooterSection() {
  const { language } = useLanguage()
  return (
    <footer style={{ borderTop: '1px solid #2B3139', background: '#181A20' }}>
      <div className='max-w-[1200px] mx-auto px-6 py-10'>
        {/* Brand */}
        <div className='flex items-center gap-3 mb-8'>
          <img src='/images/logo.png' alt='NOFX Logo' className='w-8 h-8' />
          <div>
            <div className='text-lg font-bold' style={{ color: '#EAECEF' }}>
              NOFX
            </div>
            <div className='text-xs' style={{ color: '#848E9C' }}>
              AI 交易的未来标准
            </div>
          </div>
        </div>

        {/* Multi-link columns */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-8'>
          <div>
            <h3
              className='text-sm font-semibold mb-3'
              style={{ color: '#EAECEF' }}
            >
              链接
            </h3>
            <ul className='space-y-2 text-sm' style={{ color: '#848E9C' }}>
              <li>
                <a
                  className='hover:text-[#F0B90B]'
                  href='https://github.com/tinkle-community/nofx'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  className='hover:text-[#F0B90B]'
                  href='https://t.me/nofx_dev_community'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  className='hover:text-[#F0B90B]'
                  href='https://x.com/nofx_ai'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  X (Twitter)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className='text-sm font-semibold mb-3'
              style={{ color: '#EAECEF' }}
            >
              资源
            </h3>
            <ul className='space-y-2 text-sm' style={{ color: '#848E9C' }}>
              <li>
                <a
                  className='hover:text-[#F0B90B]'
                  href='https://github.com/tinkle-community/nofx/blob/main/README.md'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  文档
                </a>
              </li>
              <li>
                <a
                  className='hover:text-[#F0B90B]'
                  href='https://github.com/tinkle-community/nofx/issues'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Issues
                </a>
              </li>
              <li>
                <a
                  className='hover:text-[#F0B90B]'
                  href='https://github.com/tinkle-community/nofx/pulls'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Pull Requests
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className='text-sm font-semibold mb-3'
              style={{ color: '#EAECEF' }}
            >
              支持方
            </h3>
            <ul className='space-y-2 text-sm' style={{ color: '#848E9C' }}>
              <li>
                <a
                  className='hover:text-[#F0B90B]'
                  href='https://asterdex.com/'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Aster DEX
                </a>
              </li>
              <li>
                <a
                  className='hover:text-[#F0B90B]'
                  href='https://www.binance.com/'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Binance
                </a>
              </li>
              <li>
                <a
                  className='hover:text-[#F0B90B]'
                  href='https://hyperliquid.xyz/'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Hyperliquid
                </a>
              </li>
              <li>
                <a
                  className='hover:text-[#F0B90B]'
                  href='https://amber.ac/'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Amber.ac <span className='opacity-70'>(战略投资)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom note (kept subtle) */}
        <div
          className='pt-6 mt-8 text-center text-xs'
          style={{ color: '#5E6673', borderTop: '1px solid #2B3139' }}
        >
          <p>{t('footerTitle', language)}</p>
          <p className='mt-1'>{t('footerWarning', language)}</p>
        </div>
      </div>
    </footer>
  )
}
