import { tv, VariantProps } from 'tailwind-variants';

export const scButtonRecipe = tv({
  slots: {
    button: [
      'inline-flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium cursor-pointer',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      'transition-colors w-full outline-gray-300',
      'focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-gray-300',
    ],
    icon: ['shrink-0'],
  },
  variants: {
    visual: {
      primary: {
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
      },
      secondary: {
        button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      },
      danger: {
        button: 'bg-rose-600 hover:bg-rose-700 text-white',
      },
      ghost: {
        button:
          'bg-transparent text-slate-700 hover:text-slate-800 hover:bg-slate-100 border-transparent',
      },
    },
    size: {
      sm: {
        button: 'px-2 py-1 text-sm',
        icon: 'w-4! h-4!',
      },
      md: {
        button: 'px-3 py-2 text-base',
        icon: 'w-6! h-6!',
      },
      lg: {
        button: 'px-4 py-3 text-lg',
        icon: 'w-8! h-8!',
      },
    },
  },
  defaultVariants: {
    visual: 'primary',
    size: 'md',
  },
});

export type ScButtonRecipe = VariantProps<typeof scButtonRecipe>;
