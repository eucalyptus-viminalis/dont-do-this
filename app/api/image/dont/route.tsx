import { FC_EPOCH } from "@/farcaster/consts";
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const img = searchParams.get("img");
    const username = searchParams.get("username");
    const pfp = searchParams.get("pfp");
    const index = +searchParams.get("index")!;
    const total = +searchParams.get("total")!;
    const timestamp = +searchParams.get("timestamp")!;
    const hoursAgo = (Date.now() / 1000 - (FC_EPOCH + timestamp)) / 3600

    return new ImageResponse(
        (
            <div
                style={{
                    display: "flex",
                    fontSize: 40,
                    color: "black",
                    background: "white",
                    width: "100%",
                    height: "100%",
                    flexDirection: "column",
                    textAlign: "center",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {index != 0 ? (
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            fontSize: 80,
                            transform: "translateY(-50%) translateX(-50%)",
                        }}
                    >
                        🔗
                    </div>
                ) : null}
                {index != total - 1 ? (
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            right: 0,
                            fontSize: 80,
                            transform: "translateY(-50%) translateX(50%)",
                        }}
                    >
                        🔗
                    </div>
                ) : null}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        padding: "16px",
                        fontSize: 32,
                        display: "flex",
                        height: "100%",
                        flexDirection: "column",
                        // justifyContent: "space-between",
                    }}
                >
                    <img alt="avatar" width="128" src={`${pfp}`} style={{}} />
                    <p tw="border-2 border-black p-2">@{username}</p>
                    <span style={{color: "gray"}}>{hoursAgo.toFixed(0)}h ago</span>
                </div>
                <img
                    alt="img"
                    height="600"
                    src={`${img}`}
                    style={{
                        maxHeight: '600px',  // Set your desired maximum height
                        maxWidth: '800px',   // Set your desired maximum width
                        // borderRadius: 128,
                    }}
                />
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
