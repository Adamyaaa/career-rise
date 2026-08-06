"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users, GraduationCap, Building2, ArrowRight } from "lucide-react";
import { PageHeading } from "@/components/common/page-heading";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/services/admin.service";

export default function AdminDashboardPage() {
  const { data: users, isLoading: usersLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => adminService.listUsers() });
  const { data: courses } = useQuery({ queryKey: ["admin-courses"], queryFn: adminService.listCourses });
  const { data: cohorts } = useQuery({ queryKey: ["admin-cohorts"], queryFn: adminService.listCohorts });

  return (
    <>
      <PageHeading title="Admin dashboard" description="Platform overview." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {usersLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Users" value={String(users?.length ?? 0)} icon={Users} />
            <StatCard label="Courses" value={String(courses?.length ?? 0)} icon={GraduationCap} />
            <StatCard label="Cohorts" value={String(cohorts?.length ?? 0)} icon={Building2} />
          </>
        )}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recently added users</CardTitle>
          <CardDescription>Latest accounts across all roles.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {users?.slice(0, 5).map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={user.status} />
                <span className="text-xs text-muted-foreground">{user.role}</span>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" render={<Link href="/admin/users" />}>
            View all users <ArrowRight className="size-3.5" />
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
