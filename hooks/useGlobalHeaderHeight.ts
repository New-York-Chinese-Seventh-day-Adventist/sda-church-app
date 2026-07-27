import { getGlobalHeaderContentHeight } from '@/constants/Layout';
import { useTextSize } from '@/constants/TextSizeContext';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useGlobalHeaderHeight = () => {
  const { textScale } = useTextSize();
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return insets.top + getGlobalHeaderContentHeight(fontScale * textScale);
};
