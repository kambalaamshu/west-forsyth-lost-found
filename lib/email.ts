import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface MatchedItem {
  id: number
  title: string
  description: string | null
  category: string
  color: string | null
  location: string
  date_found: string
  image_url: string | null
}

export interface SendMatchNotificationParams {
  toEmail: string
  searcherName?: string
  lostItemDescription: string
  matchedItem: MatchedItem
  confidenceScore: number
  claimUrl: string
}

/**
 * Send an email notification when a potential match is found
 */
export async function sendMatchNotification(params: SendMatchNotificationParams): Promise<boolean> {
  const { toEmail, searcherName, lostItemDescription, matchedItem, confidenceScore, claimUrl } = params

  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid not configured. Email not sent.')
    return false
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'wfhslostandfound@forsyth.k12.ga.us'

  // Format date
  const dateFound = new Date(matchedItem.date_found).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Build image HTML if available
  const imageHtml = matchedItem.image_url
    ? `<img src="${matchedItem.image_url}" alt="${matchedItem.title}" style="max-width: 300px; border-radius: 8px; margin: 16px 0;" />`
    : ''

  // Build email HTML
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potential Match Found</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #002147 0%, #006633 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">West Forsyth Lost & Found</h1>
              <p style="color: #FFD700; margin: 10px 0 0 0; font-size: 14px;">Helping Wolverines find their way back home</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #002147; margin: 0 0 20px 0; font-size: 22px;">
                We Found a Potential Match!
              </h2>

              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${searcherName ? `Hi ${searcherName},` : 'Hello,'}<br><br>
                Great news! Based on your search for "<strong>${lostItemDescription}</strong>", we found an item in our database that might be yours.
              </p>

              <!-- Match confidence -->
              <div style="background-color: #e8f5e9; border-left: 4px solid #006633; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #006633; font-weight: 600;">
                  Match Confidence: ${confidenceScore}%
                </p>
              </div>

              <!-- Item details card -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #002147; margin: 0 0 15px 0; font-size: 18px;">
                  ${matchedItem.title}
                </h3>

                ${imageHtml}

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">
                      <strong>Category:</strong>
                    </td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;">
                      ${matchedItem.category}
                    </td>
                  </tr>
                  ${matchedItem.color ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">
                      <strong>Color:</strong>
                    </td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;">
                      ${matchedItem.color}
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">
                      <strong>Found at:</strong>
                    </td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;">
                      ${matchedItem.location}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">
                      <strong>Date found:</strong>
                    </td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;">
                      ${dateFound}
                    </td>
                  </tr>
                  ${matchedItem.description ? `
                  <tr>
                    <td colspan="2" style="padding: 12px 0; color: #333; font-size: 14px;">
                      <strong style="color: #666;">Description:</strong><br>
                      ${matchedItem.description}
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${claimUrl}" style="display: inline-block; background-color: #FFD700; color: #002147; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Claim This Item
                </a>
              </div>

              <!-- Instructions -->
              <div style="background-color: #fff3cd; border-left: 4px solid #FFD700; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 14px;">Next Steps:</h4>
                <ol style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.8;">
                  <li>Click the button above to submit a claim</li>
                  <li>Provide proof of ownership (describe unique features)</li>
                  <li>Visit the Lost & Found office (front office) to pick up your item</li>
                </ol>
              </div>

              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                If this isn't your item, you can ignore this email or continue searching our database at
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://lostfound.westforsyth.edu'}/search" style="color: #006633;">our website</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #002147; padding: 25px 30px; text-align: center;">
              <p style="color: #ccc; font-size: 12px; margin: 0 0 10px 0;">
                West Forsyth High School Lost & Found
              </p>
              <p style="color: #888; font-size: 12px; margin: 0;">
                Front Office | 770-888-3470
              </p>
              <p style="color: #FFD700; font-size: 12px; margin: 10px 0 0 0;">
                Go Wolverines!
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  // Plain text version
  const textContent = `
West Forsyth Lost & Found - Potential Match Found!

${searcherName ? `Hi ${searcherName},` : 'Hello,'}

Great news! Based on your search for "${lostItemDescription}", we found an item that might be yours.

Match Confidence: ${confidenceScore}%

ITEM DETAILS:
- Title: ${matchedItem.title}
- Category: ${matchedItem.category}
${matchedItem.color ? `- Color: ${matchedItem.color}` : ''}
- Found at: ${matchedItem.location}
- Date found: ${dateFound}
${matchedItem.description ? `- Description: ${matchedItem.description}` : ''}

CLAIM THIS ITEM:
${claimUrl}

NEXT STEPS:
1. Click the link above to submit a claim
2. Provide proof of ownership (describe unique features)
3. Visit the Lost & Found office (front office) to pick up your item

If this isn't your item, you can ignore this email.

---
West Forsyth High School Lost & Found
Front Office | 770-888-3470
Go Wolverines!
  `

  const msg = {
    to: toEmail,
    from: {
      email: fromEmail,
      name: 'West Forsyth Lost & Found'
    },
    subject: `Potential Match Found - ${matchedItem.title}`,
    text: textContent,
    html: htmlContent
  }

  try {
    await sgMail.send(msg)
    console.log(`Match notification sent to ${toEmail} for item ${matchedItem.id}`)
    return true
  } catch (error) {
    console.error('SendGrid error:', error)
    return false
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.SENDGRID_API_KEY
}
