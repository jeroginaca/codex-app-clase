import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { fetchUser } from "@/lib/actions/user.actions";
import PostTweet from "@/components/forms/PostTweet";

const Page = async () => {
    const user = await currentUser();

    if(!user) return null;

    const userInfo = await fetchUser(user.id);

    if(!userInfo?.onboarded) redirect("/onboarding");

    return (
        <>
            <h1 className="head-text">Create Tweet</h1>
        
            <PostTweet userId={userInfo._id}/>
        </>
    )
  }
  
  export default Page