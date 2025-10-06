import { clerkClient, auth } from "@clerk/nextjs/server";
import type { LikesMetadata, LikesTableKey } from "@/lib/user-metadata-utils";

type usersMetadata = {
  likes?: LikesMetadata;
};

export async function getUserLikes(): Promise<LikesMetadata> {
  // Read likes from session claims (no backend hit)
  try {
    const { sessionClaims } = await auth();
    const likes = (sessionClaims?.metadata as usersMetadata).likes as LikesMetadata | undefined;
    return {
      books: Array.isArray(likes?.books) ? likes.books.map(String) : [],
      ashaar: Array.isArray(likes?.ashaar) ? likes.ashaar.map(String) : [],
      ghazlen: Array.isArray(likes?.ghazlen) ? likes.ghazlen.map(String) : [],
      nazmen: Array.isArray(likes?.nazmen) ? likes.nazmen.map(String) : [],
      rubai: Array.isArray(likes?.rubai) ? likes.rubai.map(String) : [],
    };
  } catch {
    // If auth/sessionClaims is unavailable for any reason, return empty likes
    return { books: [], ashaar: [], ghazlen: [], nazmen: [], rubai: [] };
  }
}

export async function setUserLikes(userId: string, likes: LikesMetadata): Promise<void> {
  const CAP = 500;
  const safe: LikesMetadata = {
    books: Array.isArray(likes?.books) ? likes.books.map(String).filter(Boolean).slice(-CAP) : [],
    ashaar: Array.isArray(likes?.ashaar) ? likes.ashaar.map(String).filter(Boolean).slice(-CAP) : [],
    ghazlen: Array.isArray(likes?.ghazlen) ? likes.ghazlen.map(String).filter(Boolean).slice(-CAP) : [],
    nazmen: Array.isArray(likes?.nazmen) ? likes.nazmen.map(String).filter(Boolean).slice(-CAP) : [],
    rubai: Array.isArray(likes?.rubai) ? likes.rubai.map(String).filter(Boolean).slice(-CAP) : [],
  };

  // Use the proper clerkClient method
  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { likes: safe },
  });
}

export async function toggleUserLike(userId: string, table: LikesTableKey, recordId: string) {
  const current = await getUserLikes();
  const set = new Set<string>(current[table] || []);
  let liked: boolean;
  if (set.has(recordId)) {
    set.delete(recordId);
    liked = false;
  } else {
    set.add(recordId);
    liked = true;
  }
  await setUserLikes(userId, { ...current, [table]: Array.from(set) });
  return { liked };
}