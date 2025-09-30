import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		fontFamily: {
      'mono': ["new-science-mono", 'system-ui', 'sans-serif'],
    },
		colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'white': '#F9F5F7',
      'black': '#12020A',
      'gray': '#BEBABC',
      'gray-medium': '#DDDBDC',
      'gray-pale': '#EEECED',
      'accent': '#E71D80',
      's1': '#FDE824',
      's2': '#B8CE32',
      's3': '#7DBA57',
      's4': '#4CB278',
      's5': '#1DA388',
      's6': '#228A8D',
      's7': '#2F708E',
      's8': '#39578D',
      's9': '#453782',
      'jerry': '#5FA8D3',
      'george': '#EB6447',
      'elaine': '#FBBA3A',
      'kramer': '#83C8C3',
      'acquaintances': '#B3478B',
      'family': '#835330',
      'other': '#5443B0',
    },
		extend: {}
	},

	plugins: [typography]
} satisfies Config;
