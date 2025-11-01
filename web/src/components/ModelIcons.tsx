
interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

// 获取AI模型图标的函数
export const getModelIcon = (modelType: string, props: IconProps = {}) => {
  // 支持完整ID或类型名
  const type = modelType.includes('_') ? modelType.split('_').pop() : modelType;
  
  let iconPath: string | null = null;
  
  switch (type) {
    case 'deepseek':
      iconPath = '/icons/deepseek.svg';
      break;
    case 'qwen':
      iconPath = '/icons/qwen.svg';
      break;
    default:
      return null;
  }

  return (
    <img
      src={iconPath}
      alt={`${type} icon`}
      width={props.width || 24}
      height={props.height || 24}
      className={props.className}
      style={{ borderRadius: '50%' }}
    />
  );
};