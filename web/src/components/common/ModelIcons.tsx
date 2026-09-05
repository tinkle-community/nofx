interface IconProps {
  width?: number
  height?: number
  className?: string
}

// AI model colors for fallback display
const MODEL_COLORS: Record<string, string> = {
  deepseek: '#4A90E2',
  qwen: '#9B59B6',
  claude: '#D97757',
  kimi: '#6366F1',
  gemini: '#4285F4',
  grok: '#000000',
  openai: '#10A37F',
  minimax: '#E45735',
  claw402: '#7C3AED',
  atlascloud: '#2563EB',
  zhipu: '#3859F3',
}

// Returns the icon for an AI model
export const getModelIcon = (modelType: string, props: IconProps = {}) => {
  // Supports full ID or type name
  const type = modelType.includes('_') ? modelType.split('_').pop() : modelType

  let iconPath: string | null = null

  switch (type) {
    case 'deepseek':
      iconPath = '/icons/deepseek.svg'
      break
    case 'qwen':
      iconPath = '/icons/qwen.svg'
      break
    case 'claude':
      iconPath = '/icons/claude.svg'
      break
    case 'kimi':
      iconPath = '/icons/kimi.svg'
      break
    case 'gemini':
      iconPath = '/icons/gemini.svg'
      break
    case 'grok':
      iconPath = '/icons/grok.svg'
      break
    case 'openai':
      iconPath = '/icons/openai.svg'
      break
    case 'minimax':
      iconPath = '/icons/minimax.svg'
      break
    case 'claw402':
      iconPath = '/icons/claw402.png'
      break
    default:
      return null
  }

  return (
    <img
      src={iconPath}
      alt={`${type} icon`}
      width={props.width || 24}
      height={props.height || 24}
      className={props.className}
    />
  )
}

// Returns the model color (fallback for when there is no icon)
export const getModelColor = (modelType: string): string => {
  const type = modelType.includes('_') ? modelType.split('_').pop() : modelType
  return MODEL_COLORS[type || ''] || '#E0483B'
}
