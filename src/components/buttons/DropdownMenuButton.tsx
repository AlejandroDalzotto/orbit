import clsx from "clsx";

type Props = {
  icon: React.ReactNode;
  color: "neutral" | "red" | "yellow" | "green" | "blue";
  onClick: VoidFunction | (() => Promise<void>);
  text: string;
  disabled?: boolean;
};

export default function DropdownMenuButton({
  text,
  color,
  icon,
  disabled,
  onClick,
}: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "flex disabled:opacity-50 items-center not-disabled:hover:bg-neutral-900 w-full gap-x-2",
        { "text-red-400 not-disabled:hover:text-red-300": color === "red" },
        {
          "text-neutral-300 not-disabled:hover:text-white": color === "neutral",
        },
        {
          "text-yellow-400 not-disabled:hover:text-yellow-300":
            color === "yellow",
        },
        {
          "text-green-400 not-disabled:hover:text-green-300": color === "green",
        },
        { "text-blue-400 not-disabled:hover:text-blue-300": color === "blue" },
      )}
    >
      {icon}
      {text}
    </button>
  );
}
