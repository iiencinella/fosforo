import type { APIRoute } from "astro";
import { handleContactGet, handleContactPost } from "@/lib/contact-api";

export const POST: APIRoute = async ({ request }) => handleContactPost(request);

export const GET: APIRoute = () => handleContactGet();

export const prerender = false;
