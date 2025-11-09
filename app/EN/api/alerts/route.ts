import { NextResponse } from 'next/server';
import { BASE_IDS } from '../../../../src/lib/airtable/airtable-constants';

const AIRTABLE_BASE_ID = BASE_IDS.ALERTS;
const AIRTABLE_TABLE_NAME = 'alert ad';

export async function GET() {
  try {
    const apiToken = process.env.NEXT_PUBLIC_Api_Token;

    if (!apiToken) {
      console.error('NEXT_PUBLIC_Api_Token is not set');
      return NextResponse.json(
        { success: false, error: 'API token not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Airtable API error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch from Airtable' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter and validate records
    const alerts = data.records
      .map((record: any) => {
        // Handle Airtable attachment field for photo
        let imageUrl = '';
        if (record.fields.photo && Array.isArray(record.fields.photo) && record.fields.photo.length > 0) {
          imageUrl = record.fields.photo[0].url;
        }

        return {
          id: record.id,
          url: record.fields.url || null,
          image: imageUrl,
          showTill: record.fields.showTill || '',
          title: record.fields.title || record.fields.url || '' // Use url as title if no title field
        };
      })
      .filter((alert: any) => {
        // Only include alerts with valid image and showTill
        const hasValidImage = alert.image && alert.image.trim() !== '';
        const hasValidDate = alert.showTill && alert.showTill.trim() !== '';

        if (!hasValidImage) {
          console.warn('Filtering out alert with missing image:', alert.id);
        }
        if (!hasValidDate) {
          console.warn('Filtering out alert with missing showTill:', alert.id);
        }

        return hasValidImage && hasValidDate;
      });

    console.log(`Returning ${alerts.length} valid alerts out of ${data.records.length} total records`);

    return NextResponse.json({
      success: true,
      alerts: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, image, showTill, title } = body;

    // Validation
    if (!image || image.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Image URL is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (!showTill || showTill.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'ShowTill date is required and cannot be empty' },
        { status: 400 }
      );
    }

    const apiToken = process.env.NEXT_PUBLIC_Api_Token;

    if (!apiToken) {
      console.error('NEXT_PUBLIC_Api_Token is not set');
      return NextResponse.json(
        { success: false, error: 'API token not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({
        //   fields: {
        //     url: url || title || '', // Use title as url if no url provided
        //     photo: [{ url: image }], // Airtable attachment format
        //     showTill,
        //   }
        // }),
      }
    );

    if (!response.ok) {
      console.error('Airtable API error:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: 'Failed to create alert in Airtable', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Alert created successfully',
      id: data.id
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}