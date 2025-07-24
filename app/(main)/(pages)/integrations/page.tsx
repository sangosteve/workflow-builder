"use client"

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import { useIntegrations } from "../../../../hooks/use-integrations";

type Integration = {
    name: string
    description: string
    icon: string
    connected: boolean
    features?: { name: string; description: string; enabled: boolean }[]
}

const ALL_INTEGRATIONS = [
    {
        type: "INSTAGRAM",
        name: "Instagram",
        description: "Connect your IG account to receive and send messages.",
        icon: "/icons/instagram.svg",
    },
    {
        type: "WHATSAPP",
        name: "WhatsApp",
        description: "Integrate with WhatsApp to automate and respond to messages.",
        icon: "/icons/whatsapp.svg",
    },
    {
        type: "LINKEDIN",
        name: "LinkedIn",
        description: "Automate and respond to messages from your LinkedIn inbox.",
        icon: "/icons/linkedin.svg",
    },
    {
        type: "SLACK",
        name: "Slack",
        description: "Send call and message logs to your Slack workspace.",
        icon: "/icons/slack.svg",
    },
    {
        type: "DISCORD",
        name: "Discord",
        description: "Integrate with Discord to send and receive messages in your server.",
        icon: "/icons/discord.svg",
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

    const handleInstagramConnect = () => {
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

            {isLoading ? (
                <p>Loading integrations...</p>
            ) : (integrations.map((integration, idx) => (
                <Card key={idx} className="bg-muted/10 border border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-4">
                            <Image src={integration.icon} alt={integration.name} className="h-8 w-8" width={24}
                                height={24} />
                            <div>
                                <CardTitle>{integration.name}</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    {integration.description}
                                </CardDescription>
                            </div>
                        </div>
                        <Button onClick={handleInstagramConnect} variant={integration.connected ? "secondary" : "default"}>
                            {integration.connected ? "Disconnect" : "Connect"}
                        </Button>
                    </CardHeader>
                </Card>
            )))}
        </div>
    )
}