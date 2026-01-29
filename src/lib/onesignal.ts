import OneSignal from "react-onesignal";

// OneSignal App ID - This is a public identifier (safe to include in code)
const ONESIGNAL_APP_ID = "c40f393d-a89b-4cbe-b1c0-64cf7aa0cbc1";

let isInitialized = false;

export const initOneSignal = async () => {
  if (isInitialized) return;
  
  // Only initialize in production or preview (not localhost without HTTPS)
  if (typeof window === "undefined") return;
  
  try {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      welcomeNotification: {
        title: "Bienvenue chez MM Tacos ! 🌮",
        message: "Vous recevrez nos meilleures offres et promos exclusives.",
      },
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: "push",
              autoPrompt: true,
              text: {
                actionMessage: "Recevez nos offres exclusives et promos !",
                acceptButton: "Oui, je veux !",
                cancelButton: "Plus tard"
              },
              delay: {
                pageViews: 1,
                timeDelay: 10
              }
            }
          ]
        }
      }
    });
    
    isInitialized = true;
    console.log("OneSignal initialized successfully");
  } catch (error) {
    console.error("OneSignal initialization error:", error);
  }
};

// Function to manually trigger the subscription prompt
export const showSubscriptionPrompt = async () => {
  try {
    await OneSignal.Slidedown.promptPush();
  } catch (error) {
    console.error("Error showing subscription prompt:", error);
  }
};

// Function to check if user is subscribed
export const isSubscribed = async (): Promise<boolean> => {
  try {
    return await OneSignal.User.PushSubscription.optedIn;
  } catch {
    return false;
  }
};
