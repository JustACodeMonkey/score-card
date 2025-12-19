import { tv, VariantProps } from 'tailwind-variants';

export const scIconButtonRecipe = tv({
  slots: {
    button: [
      'flex items-center justify-center gap-2 p-1 rounded-full text-sm font-medium cursor-pointer',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      'transition-colors w-full outline-gray-300',
      'focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-300',
    ],
    icon: ['shrink-0'],
  },
  variants: {
    visual: {
      primary: {
        button: 'text-blue-600 hover:text-blue-700',
      },
      secondary: {
        button: 'text-emerald-600 hover:text-emerald-700',
      },
      danger: {
        button: 'text-rose-600 hover:text-rose-700',
      },
      ghost: {
        button: 'text-slate-500 hover:text-slate-700',
      },
    },
    size: {
      sm: {
        icon: 'w-4! h-4!',
      },
      md: {
        icon: 'w-6! h-6!',
      },
      lg: {
        icon: 'w-8! h-8!',
      },
    },
  },
  defaultVariants: {
    visual: 'primary',
    size: 'md',
  },
});

export type ScIconButtonRecipe = VariantProps<typeof scIconButtonRecipe>;
