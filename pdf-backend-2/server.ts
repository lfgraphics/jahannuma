import express from "express";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!);

const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

app.get("/pdf/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const range = req.headers.range;
        const client = await auth.getClient();
        const token = await client.getAccessToken();

        const driveRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
            {
                headers: {
                    Authorization: `Bearer ${token.token}`,
                    ...(range ? { Range: range } : {}),
                },
            }
        );

        if (!driveRes.ok && driveRes.status !== 206) {
            return res.status(driveRes.status).json({ error: driveRes.statusText });
        }

        res.set({
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/pdf",
            "Cache-Control": "public, max-age=86400",
            ...Object.fromEntries(driveRes.headers),
        });

        driveRes.body?.pipe(res);
    } catch (err) {
        console.error("Error in proxy:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
