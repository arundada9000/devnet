import { Request, Response } from "express";
import twilio from "twilio";
import axios from "axios";
import Report from "../models/reportModel";
import { parseSmsReport, analyzeDisasterImage } from "../services/aiService";
import { sendPushToAll } from "./pushController";

const MessagingResponse = twilio.twiml.MessagingResponse;

export const handleIncomingSms = async (req: Request, res: Response) => {
  const { Body, From, MediaUrl0 } = req.body;
  const twiml = new MessagingResponse();

  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingReport = await Report.findOne({
      reportedByPhone: From,
      status: { $ne: "solved" },
      createdAt: { $gte: twentyFourHoursAgo }
    }).sort({ createdAt: -1 });

    if (existingReport) {
      existingReport.smsThread = existingReport.smsThread || [];
      existingReport.smsThread.push({ message: Body, receivedAt: new Date() });
      
      if (MediaUrl0 && !existingReport.imageUrl) {
        existingReport.imageUrl = MediaUrl0;
        const imageAnalysis = await analyzeDisasterImage(MediaUrl0, existingReport.type);
        if (imageAnalysis) {
          existingReport.aiAnalysis = imageAnalysis;
        }
      }

      await existingReport.save();
      twiml.message("Update received. Your additional information has been added to your existing report. - Sajilo Sahayata");
      
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(twiml.toString());
      return;
    }

    const aiData = await parseSmsReport(Body);

    let type = "other";
    let description = Body;
    let rawDescription = Body;
    let localGovName = "Unknown SMS Location";

    if (aiData) {
      type = aiData.type || "other";
      description = aiData.description || Body;
      rawDescription = aiData.rawDescription || Body;
      if (aiData.locationName) {
        localGovName = aiData.locationName;
      }
    }

    let finalLng = 85.3240;
    let finalLat = 27.7172;

    if (localGovName !== "Unknown SMS Location") {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(localGovName + ", Nepal")}&format=json&limit=1`;
        const geoRes = await axios.get(url, { headers: { "User-Agent": "SajiloSahayata/1.0" } });
        if (geoRes.data && geoRes.data.length > 0) {
          finalLat = parseFloat(geoRes.data[0].lat);
          finalLng = parseFloat(geoRes.data[0].lon);
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    }

    let aiAnalysis = undefined;
    if (MediaUrl0) {
      const imageAnalysis = await analyzeDisasterImage(MediaUrl0, type);
      if (imageAnalysis) {
        aiAnalysis = imageAnalysis;
      }
    }

    const report = new Report({
      type,
      description,
      rawDescription,
      imageUrl: MediaUrl0,
      aiAnalysis,
      location: { type: "Point", coordinates: [finalLng, finalLat] },
      localGovName,
      status: "pending",
      reportedByPhone: From,
    });

    await report.save();

    const title = `SMS Alert: ${type.toUpperCase()}`;
    const pushBody = `A ${type} has been reported via SMS near ${localGovName}.`;
    const url = `/dashboard/map?focusId=${report.id}&lat=${finalLat}&lng=${finalLng}&title=${encodeURIComponent("SMS Report: " + type)}&type=${type}`;
    
    await sendPushToAll(title, pushBody, url).catch((e) => console.error("Push failed:", e));

    twiml.message("Emergency reported successfully. Help is on the way. - Sajilo Sahayata");
  } catch (err) {
    console.error("Failed to process SMS:", err);
    twiml.message("Failed to process emergency report. Please call 100 if this is an urgent crisis.");
  }

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
};

export const replyToSmsReport = async (req: Request, res: Response) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      res.status(400).json({ message: "Phone and message are required" });
      return;
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    const response = await client.messages.create({
      body: message,
      messagingServiceSid,
      to: phone,
    });

    res.status(200).json({ message: "Reply sent successfully", sid: response.sid });
  } catch (error: any) {
    console.error("Failed to send SMS reply:", error);
    res.status(500).json({ message: "Failed to send SMS reply", error: error.message });
  }
};
