"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { FormField } from "@/components/common/form-field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// MOCK — no /admin/settings endpoint in the approved API contract; UI is here to
// demonstrate the shape (platform config, notification defaults) ahead of that module.
export default function AdminSettingsPage() {
  const [notifyEvidence, setNotifyEvidence] = useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] = useState(true);

  return (
    <>
      <PageHeading title="Settings" description="Platform-wide configuration." />

      <div className="flex max-w-xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General</CardTitle>
            <CardDescription>Basic platform information.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField label="Platform name" htmlFor="platform-name">
              <Input id="platform-name" defaultValue="Career Rise" />
            </FormField>
            <FormField label="Support email" htmlFor="support-email">
              <Input id="support-email" type="email" defaultValue="hello@careerrise.app" />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification defaults</CardTitle>
            <CardDescription>Applies to new users unless they opt out.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Checkbox id="notify-evidence" checked={notifyEvidence} onCheckedChange={(v) => setNotifyEvidence(!!v)} />
              <Label htmlFor="notify-evidence" className="text-sm font-normal">
                Notify students when evidence is reviewed
              </Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="notify-announcements"
                checked={notifyAnnouncements}
                onCheckedChange={(v) => setNotifyAnnouncements(!!v)}
              />
              <Label htmlFor="notify-announcements" className="text-sm font-normal">
                Notify students on new cohort announcements
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => toast.success("Settings saved")}>
              <Save className="size-4" />
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
