import { SVGProps } from "react";

export default function ToggleIcon({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3.20001 18.4H20.8Z" fill="black" fill-opacity="0.55" />
      <path
        d="M3.20001 5.59998H20.8M3.20001 12H20.8M3.20001 18.4H20.8"
        stroke="black"
        stroke-opacity="0.55"
        stroke-width="2"
        stroke-miterlimit="10"
        stroke-linecap="round"
      />
    </svg>
  );
}
