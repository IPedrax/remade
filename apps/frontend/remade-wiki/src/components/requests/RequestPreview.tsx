import type { Original, Request } from "../../lib/schemas";
import RequestCard from "../catalog/RequestCard";
import RequestActions from "./RequestActions";
import RequestActivityProvider from "./RequestActivityProvider";

export default function RequestPreview({
	items,
}: {
	items: { request: Request; original: Original }[];
}) {
	return (
		<RequestActivityProvider>
			<div className="grid auto-rows-fr grid-cols-1 gap-[18px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
				{items.map(({ request, original }) => (
					<RequestCard
						actions={<RequestActions original={original.slug} />}
						key={original.slug}
						original={original}
						request={request}
					/>
				))}
			</div>
		</RequestActivityProvider>
	);
}
