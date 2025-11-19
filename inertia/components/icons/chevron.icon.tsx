import { SVGProps } from "react";

export default function ChevronIcon({ ...prosp }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...prosp}
      viewBox="0 0 12 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.75 0.75L5.75 5.75L0.75 0.75"
        stroke="#333936"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
