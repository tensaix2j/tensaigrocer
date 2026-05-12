import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { verifyToken } from "./jwt";

type TokenPayload = {
    userId?: string;
};

export async function getAuthenticatedUserId() {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return null;
    }

    const decoded = verifyToken(token) as TokenPayload;

    if (!decoded.userId || !ObjectId.isValid(decoded.userId)) {
        return null;
    }

    return new ObjectId(decoded.userId);
}

