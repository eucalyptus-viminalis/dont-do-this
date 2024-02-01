import { Cast } from "@/farcaster/cast";
import { FrameSignaturePacket } from "@/farcaster/frame-signature-packet";
import { frame200Response } from "@/farcaster/response";
import { USER_DATA_TYPE, UserData } from "@/farcaster/user";
import { NextRequest, NextResponse } from "next/server";

// Host
const HOST_URL = process.env["HOST"];

// Frame Contents
const title = "dont";
const frameVersion = "vNext";

// Farcaster API
const HUBBLE_URL = "https://nemes.farcaster.xyz:2281/v1";
const FID = 3

function TitleFrame()
{
    const buttonNames = ["dont refresh", "dont press"];
    const postUrl = HOST_URL + `/api/dont`;
    const frameImageUrl = HOST_URL + `/title.png`;
    return frame200Response(
        title,
        frameVersion,
        frameImageUrl,
        postUrl,
        buttonNames
    );
}

function NoCastsFrame()
{
    const buttonNames = ["dont refresh"];
    const postUrl = HOST_URL + `/api/dont?reset=true`;
    const frameImageUrl = HOST_URL + `/no-donts.png`;
    return frame200Response(
        title,
        frameVersion,
        frameImageUrl,
        postUrl,
        buttonNames
    );
}

// Handle GET
export function GET()
{
    return TitleFrame()
}

// Handle POST
export async function POST(req: NextRequest, res: NextResponse)
{
    // Query string
    const searchParams = req.nextUrl.searchParams;
    let indexString = searchParams.get("index");
    let reset = searchParams.get("reset")

    // JSON data
    const data: FrameSignaturePacket = await req.json()
    const btnIndex = data.untrustedData.buttonIndex;
    if (indexString == "0" && btnIndex == 1 || btnIndex == 1 && indexString == null || reset == "true") {
        return TitleFrame()
    }

    // Grab casts
    const castsRes = await fetch(
        `${HUBBLE_URL}/castsByFid?fid=${FID}&pageSize=500&reverse=1`
    );
    const { messages } = await castsRes.json();
    const casts: Cast[] = messages;

    // Filter replies for don't do this
    const filteredCasts = casts.filter(c=>c.data != undefined && c.data.castAddBody != undefined).filter(
        (c) => {
            if (c.data.castAddBody.text == "")
            {
                return false
            }
            const txt = c.data.castAddBody.text.toLowerCase()
            return txt.includes("dont do this") || txt.includes("don't do this")
        }
    );

    // If no casts found, return early
    if (filteredCasts.length == 0)
    {
        return NoCastsFrame()
    }

    // dont do this/s found
    const total = filteredCasts.length;

    // Get username and pfp
    const usernamePromise = fetch(
        `${HUBBLE_URL}/userDataByFid?fid=${FID}&user_data_type=${USER_DATA_TYPE.USERNAME}`
    );
    const pfpPromise = fetch(
        `${HUBBLE_URL}/userDataByFid?fid=${FID}&user_data_type=${USER_DATA_TYPE.PFP}`
    );
    const [usernameRes, pfpRes] = await Promise.all([usernamePromise, pfpPromise])
    const usernameData: UserData = await usernameRes.json();
    const username = usernameData.data.userDataBody.value;
    const pfpData: UserData = await pfpRes.json();
    const pfp = pfpData.data.userDataBody.value;

    // Select cast
    let index: number = 0
    if (!indexString) {
        index = 0;
    } else if (btnIndex == 2) {
        index = +indexString + 1;
    } else if (btnIndex == 1) {
        index = +indexString - 1;
    }
    const buttonNames = index != total - 1 ? ["dont back", "dont next"] : ["dont back"]
    const cast = filteredCasts[index];
    const timestamp = cast.data.timestamp
    const img = cast.data.castAddBody.embeds[0].url;
    const frameImageUrl =
        HOST_URL +
        `/api/image/dont?timestamp=${timestamp}&img=${img}&username=${username}&pfp=${pfp}&index=${index}&total=${total}&date=${Date.now()}`;
    const postUrl =
        HOST_URL +
        `/api/dont?index=${index}`;
    return frame200Response(title, frameVersion, frameImageUrl, postUrl, buttonNames)
}

