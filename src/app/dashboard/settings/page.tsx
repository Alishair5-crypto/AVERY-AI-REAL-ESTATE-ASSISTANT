import { getSettings } from "@/lib/demo/settings";
import { listAgents } from "@/lib/avery/tools";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, agents] = await Promise.all([getSettings(), listAgents()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Configure how Avery represents your business in this demo.</p>
      </div>
      <SettingsForm
        initial={{
          id: settings.id,
          businessName: settings.businessName,
          agentTeamName: settings.agentTeamName,
          serviceAreas: settings.serviceAreas as string[],
          assistantName: settings.assistantName,
          greeting: settings.greeting,
          tone: settings.tone,
          handoffEnabled: settings.handoffEnabled,
          followupEnabled: settings.followupEnabled,
          maxFollowupAttempts: settings.maxFollowupAttempts,
          followupDelayMinutes: settings.followupDelayMinutes,
        }}
        agents={agents}
      />
    </div>
  );
}
