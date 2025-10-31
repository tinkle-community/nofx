import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';

interface HeaderProps {
  simple?: boolean; // For login/register pages
}

export function Header({ simple = false }: HeaderProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <header className="glass sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img src="/icons/nofx.svg?v=2" alt="NOFX" className="h-10 w-auto" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#EAECEF' }}>
                {t('appTitle', language)}
              </h1>
              {!simple && (
                <p className="text-xs mono" style={{ color: '#848E9C' }}>
                  {t('subtitle', language)}
                </p>
              )}
            </div>
          </div>
          
          {/* Right - Language Toggle (always show) */}
          <div className="flex gap-1 rounded p-1" style={{ background: '#1E2329' }}>
            <button
              onClick={() => setLanguage('zh')}
              className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
              style={language === 'zh'
                ? { background: '#F0B90B', color: '#000' }
                : { background: 'transparent', color: '#848E9C' }
              }
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
              style={language === 'en'
                ? { background: '#F0B90B', color: '#000' }
                : { background: 'transparent', color: '#848E9C' }
              }
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}