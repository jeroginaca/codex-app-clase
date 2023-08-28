import TweetCard from "@/components/cards/TweetCard"
import Comment from "@/components/forms/Comment";
import { fetchTweetById } from "@/lib/actions/tweet.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async ({ params }:{ params: { id: string }}) => {
    if(!params.id) return null;

    const user = await currentUser();
    if(!user) return null;
    
    const userInfo = await fetchUser(user.id);
    if(!userInfo?.onboarded) redirect("/onboarding"); 

    const post = await fetchTweetById(params.id)

  return (
    <section className="relative">
        <div>
            <TweetCard 
              key={post._id}
              id={post._id}
              currentUserId={user?.id || ""}
              parentId={post.parentId}
              content={post.text}
              author={post.author}
              createdAt={post.createdAt}
              comments={post.children}
            />  
        </div>

        <div className="mt-7">
            
            <Comment 
                tweetId={post.id}
                currentUserImg={userInfo.image}
                currentUserId={JSON.stringify(userInfo._id)}
            />
        </div>

        <div className="mt-10">
            {post.children.map((childItem: any) => (
                <TweetCard 
                key={childItem._id}
                id={childItem._id}
                currentUserId={childItem?.id || ""}
                parentId={childItem.parentId}
                content={childItem.text}
                author={childItem.author}
                createdAt={childItem.createdAt}
                comments={childItem.children}
                isComment
              />  
            ))}
        </div>
    </section>
  )
}

export default Page