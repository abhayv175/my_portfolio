"use server";

import React from "react";
import { Resend } from "resend";
import { validateString, isValidEmail, getErrorMessage } from "@/lib/utils";
import ContactFormEmail from "@/email/contact-form-email";

export const sendEmail = async (formData: FormData) => {
  // Honeypot trap: silently accept bot submissions without consuming email quota
  const website = formData.get("website");
  if (typeof website === "string" && website.trim().length > 0) {
    return {
      data: { id: "ignored" },
    };
  }

  const rawEmail = formData.get("senderEmail");
  const rawMessage = formData.get("message");

  if (!validateString(rawEmail, 500) || !isValidEmail(rawEmail)) {
    return {
      error: "Invalid sender email",
    };
  }
  if (!validateString(rawMessage, 5000)) {
    return {
      error: "Invalid message",
    };
  }

  const senderEmail = rawEmail.trim();
  const message = rawMessage.trim();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      error: "Email service is not configured",
    };
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: "abhayv175@gmail.com",
      subject: "Message from contact form",
      replyTo: senderEmail,
      react: React.createElement(ContactFormEmail, {
        message,
        senderEmail,
      }),
    });

    if (result.error) {
      return {
        error: getErrorMessage(result.error),
      };
    }

    return {
      data: result.data,
    };
  } catch (error: unknown) {
    return {
      error: getErrorMessage(error),
    };
  }
};
