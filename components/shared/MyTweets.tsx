import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import TweetCard from "../cards/TweetCard";

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}

const MyTweets = async ({ currentUserId, accountId, accountType}: Props) => {

    let result = await fetchUserPosts(accountId);

    if(!result) redirect("/")

    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.tweets.map((tweet: any) => (
                <TweetCard 
                    key={tweet._id}
                    id={tweet._id}
                    currentUserId={currentUserId}
                    parentId={tweet.parentId}
                    content={tweet.text}
                    author={
                        accountType === "User"
                          ? { name: result.name, image: result.image, id: result.id} : { name: tweet.author.name, image: tweet.author.image, id: tweet.author.id }
                        }
                    createdAt={tweet.createdAt}
                    comments={tweet.children}
            />  
            ))}
        </section>
      )
}

export default MyTweets