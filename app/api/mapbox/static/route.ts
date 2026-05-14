import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const token = process.env.MAPBOX_APIKEY;

    if (!token) {
        return NextResponse.json({ message: "Mapbox API key is not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const lng = Number(searchParams.get("lng"));
    const lat = Number(searchParams.get("lat"));

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        return NextResponse.json({ message: "Valid coordinates are required" }, { status: 400 });
    }

    const marker = `pin-s+f97316(${lng},${lat})`;
    const url = new URL(`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${marker}/${lng},${lat},15,0/900x640@2x`);
    url.searchParams.set("access_token", token);

    console.log( "checking", url );
    
    const res = await fetch(url);

    if (!res.ok) {
        return NextResponse.json({ message: "Unable to load map" }, { status: res.status });
    }

    const image = await res.arrayBuffer();

    return new NextResponse(image, {
        headers: {
            "Content-Type": res.headers.get("Content-Type") || "image/png",
            "Cache-Control": "public, max-age=300",
        },
    });
}
