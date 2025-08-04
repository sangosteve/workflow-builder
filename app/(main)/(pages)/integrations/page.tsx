"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import { useIntegrations } from "../../../../hooks/use-integrations";
import { Plug, Unplug } from "lucide-react";

const ALL_INTEGRATIONS = [
  {
    type: "INSTAGRAM",
    name: "Instagram",
    description:
      "Seamlessly connect your Instagram Business account to view, send, and automate direct messages, track engagement, and streamline your communication with followers from one unified platform.",
    icon: "/icons/instagram.svg",
  },
  {
    type: "WHATSAPP",
    name: "WhatsApp",
    description:
      "Integrate your WhatsApp Business account to send personalized messages, manage customer interactions in real time, and automate follow-ups and campaigns using powerful messaging workflows.",
    icon: "/icons/whatsapp.svg",
  },
  {
    type: "LINKEDIN",
    name: "LinkedIn",
    description:
      "Automate LinkedIn inbox responses, manage professional outreach campaigns, and track messaging performance to boost your networking, lead generation, and candidate engagement efforts.",
    icon: "/icons/linkedin.svg",
  },
  {
    type: "SLACK",
    name: "Slack",
    description:
      "Connect your Slack workspace to receive real-time updates, push call and message logs directly to channels, and keep your team aligned with centralized communication alerts and workflows.",
    icon: "/icons/slack.svg",
  },
  {
    type: "DISCORD",
    name: "Discord",
    description:
      "Integrate with your Discord server to send automated messages, respond to users across channels, and manage community interactions from within a collaborative and real-time environment.",
    icon: "/icons/discord.svg",
  },
  {
    type: "FACEBOOK",
    name: "Facebook",
    description:
      "Connect your Facebook Page to manage incoming messages, schedule posts, and automate customer support directly from your messaging dashboard, keeping your community engaged at all times.",
    icon: "/icons/facebook.svg",
  },
] as const;


export default function IntegrationsPage() {
    const { data, isLoading } = useIntegrations();
    const userIntegrations = data?.integrations ?? [];

    const integrations = ALL_INTEGRATIONS.map(integration => {
        const connectedIntegration = userIntegrations.find((i: { type: string; }) => i.type === integration.type);
        return {
            ...integration,
            connected: !!connectedIntegration,
            externalUserId: connectedIntegration?.externalUserId ?? null,
        };
    });

    const handleConnect = (integrationType: string) => {
        // Implement connection logic here
        console.log(`Connecting to ${integrationType}`);
         
        window.location.href = "/api/instagram/connect";
    
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-foreground">Integrations</h2>
                <p className="text-muted-foreground">
                    Connect your accounts to automate workflows and access your channels.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <p>Loading integrations...</p>
                ) : (integrations.map((integration, idx) => (
                    <Card key={idx} className="bg-white border border-gray-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Image src={integration.icon} alt={integration.name} className="h-8 w-8" width={32} height={32} />
                                <div>
                                    <CardTitle className="text-lg font-semibold">{integration.name}</CardTitle>
                                </div>
                            </div>
                            <CardDescription className="text-sm text-gray-600 mb-4">
                                {integration.description}
                            </CardDescription>
                            <Button 
                                onClick={() => handleConnect(integration.type)} 
                                variant="outline" 
                                className="w-32 justify-center"
                            >
                                {integration.connected ? <Unplug/> : <Plug/>}
                                {integration.connected ? "Disconnect" : "Connect"}
                            </Button>
                        </CardContent>
                    </Card>
                )))}
            </div>
        </div>
    )
}