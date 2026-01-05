import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg bg-gray-50 px-4 py-2 text-base text-gray-900 placeholder-gray-400 " +
          "border border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 " +
          "hover:border-blue-300 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
