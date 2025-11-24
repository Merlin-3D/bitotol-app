import classNames from "classnames";

type BadgeType =
  | "teal"
  | "info"
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "secondary"
  | "stone";

type BadgeProps = {
  text: string;
  type: BadgeType;
};
const badges = {
  teal: ["bg-teal-200 text-teal-800"],
  primary: ["bg-blue-200 text-blue-800"],
  info: ["bg-indigo-200 text-indigo-800"],
  success: ["bg-green-200 text-green-800"],
  danger: ["bg-red-200 text-red-800"],
  warning: ["bg-yellow-200 text-yellow-800"],
  secondary: ["bg-gray-200 text-gray-800"],
  stone: ["text-gray-400 border"],
};
export default function Badge({ text, type }: BadgeProps) {
  return (
    <div
      className={classNames(
        badges[type],
        "line-clamp-1 lg:text-[11px] xl:text-[11px] 2xl:text-[12px] px-3 rounded-full font-semibold"
      )}
      style={{ paddingTop: "0.1em", paddingBottom: "0.1rem" }}
    >
      {text}
    </div>
  );
}
