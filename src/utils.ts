import { fetchCached, getFromCache, putInCache } from "./idb"

async function getGaijinIDFromForumID(id: number) {
    const gaijinID = await getFromCache("id-map", id.toString());
    return gaijinID;
}

async function getGaijinIDFromLink(link: string) {
    const userData:any = await fetchCached("users", link);
    const gaijinID = userData['user']['custom_fields']['gaijin_id'];
    return gaijinID;
}

export async function getGaijinID(post: any) {
    let temp = post.querySelector('article').dataset['userId']
    console.log("temp " + temp);
    let forumID: number;
    if (temp)
        forumID = parseInt(temp);
    else {
        return;
    }
    let gaijinID = await getGaijinIDFromForumID(forumID);
    console.log("gaijinID " + gaijinID);
    if (gaijinID !== undefined) {
        return gaijinID;
    }
    else {
        const link = post?.querySelector("a.trigger-user-card")?.href + ".json";
        console.log(link);
        if (link === null)
            return;
        const id = await getGaijinIDFromLink(link);
        await putInCache("id-map", temp, id);
        return id;
    }
}