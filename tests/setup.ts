// Jest setup for React Native & Expo testing

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({ side: 'to' }),
  Stack: Object.assign(
    (props: any) => {
      const React = require('react');
      return React.createElement('div', props, props.children);
    },
    {
      Screen: (props: any) => {
        const React = require('react');
        return React.createElement('div', props, null);
      },
    }
  ),
}));

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props: any) => React.createElement('div', props, props.children),
    Text: (props: any) => React.createElement('span', props, props.children),
    TextInput: (props: any) => React.createElement('input', props),
    FlatList: (props: any) => {
      return React.createElement(
        'div',
        null,
        props.data?.map((item: any, index: number) =>
          props.renderItem ? props.renderItem({ item, index }) : null
        )
      );
    },
    Switch: (props: any) => React.createElement('input', { type: 'checkbox', ...props }),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => style,
    },
    Platform: {
      OS: 'web',
      select: (obj: any) => obj.web || obj.default,
    },
    Pressable: (props: any) => React.createElement('button', props, props.children),
    ScrollView: (props: any) => React.createElement('div', props, props.children),
    SafeAreaView: (props: any) => React.createElement('div', props, props.children),
    Animated: {
      Value: class {
        val: number;
        constructor(v: number) { this.val = v; }
        interpolate() { return '0deg'; }
      },
      spring: () => ({
        start: (cb?: () => void) => cb?.(),
      }),
      View: (props: any) => React.createElement('div', props, props.children),
    },
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => React.createElement('svg', props, props.children),
    Svg: (props: any) => React.createElement('svg', props, props.children),
    Rect: (props: any) => React.createElement('rect', props, props.children),
    Circle: (props: any) => React.createElement('circle', props, props.children),
    Path: (props: any) => React.createElement('path', props, props.children),
    Text: (props: any) => React.createElement('text', props, props.children),
    G: (props: any) => React.createElement('g', props, props.children),
    Line: (props: any) => React.createElement('line', props, props.children),
  };
});
