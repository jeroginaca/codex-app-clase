import TweetCard from "@/components/cards/TweetCard";
import { fetchPosts } from "@/lib/actions/tweet.actions";
import { currentUser } from "@clerk/nextjs";

export default async function Home() {
  const result = await fetchPosts(1, 30);
  const user = await currentUser();

	console.log(result)

  return (
    <main>
       <h1 className="head-text text-left">Home</h1>

       <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">
            No tweets found
          </p>
        ) : (
          <>
          {result.posts.map((post) => (
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
          ))}
          </>
        )}
       </section>
    </main>
  )
}