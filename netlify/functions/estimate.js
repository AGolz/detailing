/* Server-only integration seam. The browser never calls this endpoint in demo mode.
 * Before enabling: implement request validation, abuse protection, consent and delivery.
 * Keep all secrets in Netlify environment variables. Never copy them into site/.
 */
const response = (statusCode, error) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify({ sent: false, error })
});
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { ...response(405, 'method_not_allowed'), headers: { 'Content-Type': 'application/json', Allow: 'POST' } };
  // A configured token alone must never turn a demo into a live data submission.
  return response(503, 'estimate_delivery_not_connected');
};
// Future server adapter contract, not yet wired:
// validateRequest(payload) -> sanitized request, field errors
// uploadPhotos(files) -> private server-side object references (JPEG/PNG/WebP; 5 x 10 MB)
// notifyAdministrator(request, photoReferences) -> Telegram delivery receipt
// forwardToCrm(request, photoReferences) -> CRM / Google Sheets webhook receipt
// Return sent:true only after the required deliveries genuinely succeed.
