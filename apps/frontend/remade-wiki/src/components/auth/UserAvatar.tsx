interface Props {
	name: string;
}

export default function UserAvatar({ name }: Props) {
	return (
		<span
			aria-hidden="true"
			className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-panel font-semibold"
		>
			{name.trim().slice(0, 1).toLocaleUpperCase()}
		</span>
	);
}
