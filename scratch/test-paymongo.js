const axios = require('axios');
const fs = require('fs');
const path = require('path');

function getSecretKey() {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/PAYMONGO_SECRET_KEY=(sk_test_[a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  } catch (err) {
    return null;
  }
}

async function testPayMongo() {
  const secretKey = getSecretKey();

  if (!secretKey) {
    console.error('❌ ERROR: PAYMONGO_SECRET_KEY not found in .env.local!');
    console.log('Siguraduhin na nilagay mo na ang key mo dyan.');
    return;
  }

  console.log('Testing PayMongo API with key:', secretKey.substring(0, 15) + '...');

  try {
    const response = await axios.post(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        data: {
          attributes: {
            line_items: [
              {
                currency: 'PHP',
                amount: 10000,
                description: 'Test Payment',
                name: 'Test Product',
                quantity: 1
              }
            ],
            payment_method_types: ['gcash', 'paymaya', 'card'],
            success_url: 'http://localhost:3000',
            cancel_url: 'http://localhost:3000'
          }
        }
      },
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`
        }
      }
    );

    console.log('\n✅ SUCCESS! PayMongo API is working.');
    console.log('Checkout URL:', response.data.data.attributes.checkout_url);
    console.log('\nSubukan mong i-open ang URL sa taas para makita ang GCash payment page.');
  } catch (error) {
    console.error('\n❌ FAILED:');
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testPayMongo();

