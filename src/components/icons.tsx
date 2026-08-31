import type { SVGProps } from "react";

export function NimbusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2.5a7.5 7.5 0 0 1 7.5 7.5c0 2.5-1.3 4.8-3.3 6.2" />
      <path d="M17.5 20a4.5 4.5 0 1 1-9 0" />
      <path d="M12 2.5a7.5 7.5 0 0 0-7.5 7.5c0 2.5 1.3 4.8 3.3 6.2" />
      <path d="M6.5 20a4.5 4.5 0 1 0 9 0" />
    </svg>
  );
}
