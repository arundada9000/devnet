// src/types/express.d.ts

import * as express from "express";

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        // Add any other properties you expect in the user object
      };
    }
  }
}
