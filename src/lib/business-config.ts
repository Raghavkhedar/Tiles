import { BusinessInfo } from './invoice-generator';

// Business configuration - Update these with your actual business details
export const businessConfig: BusinessInfo = {
  name: "TileManager Pro",
  address: "123 Business Street, Commercial Area, Your City - 123456",
  phone: "+91 98765 43210",
  email: "info@tilemanagerpro.com",
  gst_number: "27ABCDE1234F1Z5", // Replace with your actual GST number
  pan_number: "ABCDE1234F", // Replace with your actual PAN number
  logo_url: "/logo.png" // Optional: Add your logo path
};

// You can also make this configurable through your settings page
export const getBusinessConfig = (): BusinessInfo => {
  // Later you can fetch this from your database/settings
  return businessConfig;
}; 