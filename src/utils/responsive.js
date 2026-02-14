import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export { wp, hp };

// Common responsive sizes
export const sizes = {
  // Width percentages
  full: wp('100%'),
  half: wp('50%'),
  quarter: wp('25%'),

  // Common padding/margins
  xs: wp('2%'),
  sm: wp('4%'),
  md: wp('6%'),
  lg: wp('8%'),
  xl: wp('12%'),

  // Font sizes
  fontXs: wp('3%'),
  fontSm: wp('3.5%'),
  fontMd: wp('4%'),
  fontLg: wp('5%'),
  fontXl: wp('6%'),

  // Heights
  inputHeight: hp('6%'),
  buttonHeight: hp('6%'),
  cardHeight: hp('15%'),
  headerHeight: hp('8%'),
};

// Colors
export const colors = {
  primary: '#4A90D9',
  primaryDark: '#357ABD',
  secondary: '#5CB85C',
  danger: '#D9534F',
  warning: '#F0AD4E',
  info: '#5BC0DE',
  light: '#F5F5F5',
  dark: '#333333',
  gray: '#777777',
  white: '#FFFFFF',
  black: '#000000',
  border: '#DDDDDD',
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  pending: '#F0AD4E',
  completed: '#5CB85C',
  unsynced: '#D9534F',
  cardPalette: [
    '#E3F2FD', // Light Blue
    '#F1F8E9', // Light Green
    '#FFF3E0', // Light Orange
    '#F3E5F5', // Light Purple
    '#E8F5E9', // Soft Green
    '#FCE4EC', // Light Pink
    '#E0F2F1', // Light Teal
    '#FFFDE7', // Light Yellow
    '#EFEBE9', // Light Brown
    '#ECEFF1', // Light Blue Gray
  ],
};
