import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import Post from "./Post";
import { getSubRedditPosts } from "@/api/posts";
import { useQuery } from "@tanstack/react-query";
import SkeletonPost from "./SkeletonPost";

interface SubRedditViewProps {
	subReddit: string;
	setSubReddits: React.Dispatch<React.SetStateAction<string[]>>;
}

interface PostData {
	id: string;
	title: string;
	author: string;
	created_utc: number;
	permalink: string;
}

const ErrorMessage = ({ message }: { message: string }) => (
	<div className="flex items-center justify-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
		<span>{message}</span>
	</div>
);

const SubReddit = React.forwardRef<HTMLDivElement, SubRedditViewProps>(
	(props, ref) => {
		const {
			data: subRedditData,
			error,
			isLoading,
			isRefetching,
			refetch,
		} = useQuery({
			queryKey: ["subreddit", props.subReddit],
			queryFn: () => getSubRedditPosts(props.subReddit),
		});

		const deleteSubReddit = () => {
			props.setSubReddits(prev => {
				const updatedSubReddits = prev.filter(sub => sub !== props.subReddit);
				localStorage.setItem("subReddits", JSON.stringify(updatedSubReddits));
				return updatedSubReddits;
			});
		};

		return (
			<div
				className="h-full w-1/4 shrink-0 snap-start p-2 rounded-md lg:w-1/3 md:1/2 sm:w-full transition-transform  duration-200 sm:p-0"
				ref={ref}
			>
				<div className="h-full p-2 rounded-lg border bg-card text-card-foreground shadow-sm bg-white flex flex-col dark:bg-zinc-950 dark:border-zinc-700">
					{/* header for the list */}
					<div className="flex justify-between p-2">
						<span className="self-center font-bold text-orange-600 ">
							r/{props.subReddit}
						</span>
						<DropdownMenu>
							<DropdownMenuTrigger className="focus:outline-none">
								<Button className="rounded-full h-10 w-10" variant={"ghost"}>
									<DotsVerticalIcon />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="font-primary relative right-10">
								<DropdownMenuItem onClick={() => refetch()}>
									Refresh
								</DropdownMenuItem>
								<DropdownMenuItem onClick={deleteSubReddit}>
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* list of posts */}
					<div className="flex-1 overflow-y-auto scrollbar-hide">
						<div className="grid grid-cols-1 gap-2">
							{(isLoading || isRefetching) &&
								Array.from({ length: 5 }).map((_, i) => (
									<SkeletonPost key={i} />
								))}

							{error && <ErrorMessage message={error.message} />}

							{subRedditData &&
								subRedditData.map((post: PostData) => (
									<Post
										key={post.id}
										title={post.title}
										author={post.author}
										timestamp={post.created_utc}
										url={post.permalink}
									/>
								))}
						</div>
					</div>
				</div>
			</div>
		);
	}
);

export default SubReddit;
