import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.1em] transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-expo focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-40 active:translate-y-px [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "overflow-hidden bg-cyan text-ink hover:bg-white hover:shadow-[0_0_0_1px_rgb(var(--cyan)/0.5),0_8px_32px_-8px_rgb(var(--cyan)/0.55)]",
        secondary: "border border-line-strong bg-ink-1/60 text-fg hover:border-cyan/60 hover:bg-ink-2 hover:text-white",
        ghost: "text-fg-muted hover:bg-ink-2 hover:text-fg",
        danger: "border border-alert/40 text-alert hover:bg-alert/10 hover:border-alert",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-xs",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(button({ variant, size }), className)} {...props}>
        {asChild ? (
          children
        ) : (
          <>
            {variant === "primary" && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 ease-expo group-hover/btn:translate-x-[400%]"
              />
            )}
            <span className="relative inline-flex items-center gap-2">{children}</span>
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
export { button as buttonVariants };
