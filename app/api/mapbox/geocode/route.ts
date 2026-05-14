import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const token = process.env.MAPBOX_APIKEY;

    if (!token) {
        return NextResponse.json({ message: "Mapbox API key is not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address")?.trim();

    if (!address) {
        return NextResponse.json({ message: "Address is required" }, { status: 400 });
    }
    
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`);
    url.searchParams.set("access_token", token);
    url.searchParams.set("country", "SG");
    url.searchParams.set("limit", "1");

    console.log( "see", url );

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json({ message: data.message || "Unable to geocode address" }, { status: res.status });
    }

    const feature = data.features?.[0];

    if (!feature) {
        return NextResponse.json({ message: "Address not found" }, { status: 404 });
    }

    const [lng, lat] = feature.center;

    return NextResponse.json({
        lng,
        lat,
        placeName: feature.place_name,
    });
}
